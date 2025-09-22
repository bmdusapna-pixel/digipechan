import { SITE_MAP } from "../constants/siteMap";
import { toast } from "sonner";
type RequestParams = Record<string, string | number | boolean | undefined>;
import { API_ENDPOINTS } from "../constants/apiEndpoints";
import useAuthStore from "@/store/authStore";

export interface Response {
    SUCCESS: boolean;
    MESSAGE: string;
    DATA?: unknown;
    ERROR?: string;
}
export interface ApiResponse<T> {
    data: T;
    error?: string;
    success: boolean;
}
export const apiRequest = async <T>(
    method: string,
    url: string,
    data: unknown = {},
    params: RequestParams = {},
    extraHeaders: Record<string, string> = {}
): Promise<T | null> => {
    const skipBearer =
        url.includes(API_ENDPOINTS.login) ||
        url.includes(API_ENDPOINTS.salespersonLogin) ||
        url.includes(API_ENDPOINTS.sign_up) ||
        url.includes(API_ENDPOINTS.forgot_password) ||
        url.includes(API_ENDPOINTS.reset_password);

    const state = useAuthStore.getState();
    const accessToken = state.user?.accessToken;
    if (!skipBearer && accessToken) {
        extraHeaders = { ...extraHeaders, Authorization: `Bearer ${accessToken}` };
    }

    const isAuthRequest =
        url.includes(API_ENDPOINTS.login) ||
        url.includes(API_ENDPOINTS.salespersonLogin) ||
        url.includes(API_ENDPOINTS.sign_up) ||
        url.includes(API_ENDPOINTS.forgot_password) ||
        url.includes(API_ENDPOINTS.reset_password);

    const isFormData = data instanceof FormData;

    const queryString = new URLSearchParams(
        Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
    ).toString();

    const requestUrl = queryString ? `${url}?${queryString}` : url;

    const response = await fetch(requestUrl, {
        method,
        ...(method !== "GET" && { body: isFormData ? (data as FormData) : JSON.stringify(data) }),
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...extraHeaders,
        },
        credentials: "include",
    });

    if (response.status === 401 && !isAuthRequest) {
        toast.error("Your session has expired. Please login again.");
        window.location.href = SITE_MAP.LOGIN;
        return null;
    }

    const responseBody: Response = await response.json();

    if (!response.ok || !responseBody.SUCCESS) {
        toast.error(responseBody.MESSAGE || responseBody.ERROR || `HTTP Error: ${response.status}`);
        throw Error("Something wend wrong.");
    }

    return responseBody.DATA as T;
};