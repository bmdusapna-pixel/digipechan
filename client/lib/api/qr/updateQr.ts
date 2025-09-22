import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { apiRequest } from "@/common/utils/apiClient";
import { IQR } from "@/types/qr.types";

export const updateQR = async (data: Partial<IQR>) => {
    try {
        const res = await apiRequest<IQR>(API_METHODS.POST, API_ENDPOINTS.updateQR, data);
        return res;
    } catch (error) {
        console.error("Error in the check qr validation", error);
        throw error;
    }
};
