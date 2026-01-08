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

    console.log("🌐 API Request:", {
        method,
        url: requestUrl,
        hasBody: method !== "GET",
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...extraHeaders,
        }
    });

    const response = await fetch(requestUrl, {
        method,
        ...(method !== "GET" && { body: isFormData ? (data as FormData) : JSON.stringify(data) }),
        headers: {
            ...(isFormData ? {} : { "Content-Type": "application/json" }),
            ...extraHeaders,
        },
        credentials: "include",
    });

    console.log("📡 API Response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
    });

    if (response.status === 401 && !isAuthRequest) {
        toast.error("Your session has expired. Please login again.");
        window.location.href = SITE_MAP.LOGIN;
        return null;
    }

    let responseBody: Response;
    try {
        responseBody = await response.json();
    } catch (error) {
        console.error("Failed to parse response as JSON:", error);
        toast.error(`HTTP Error: ${response.status} - Unable to parse server response`);
        throw Error(`HTTP ${response.status}: Unable to parse server response`);
    }

    if (!response.ok || !responseBody.SUCCESS) {
        const errorMessage = responseBody.MESSAGE || responseBody.ERROR || `HTTP Error: ${response.status}`;
        console.error("API Error:", {
            status: response.status,
            message: errorMessage,
            error: responseBody.ERROR,
            success: responseBody.SUCCESS,
            fullResponse: responseBody
        });
        toast.error(errorMessage);
        throw Error(errorMessage);
    }

    return responseBody.DATA as T;
};