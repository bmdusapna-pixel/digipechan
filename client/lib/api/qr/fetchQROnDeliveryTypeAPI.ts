import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { DeliveryType } from "@/common/constants/enum";
import { apiRequest } from "@/common/utils/apiClient";
import { INewQRType } from "@/types/newQRType.types";

export const fetchQROnDeliveryTypeAPI = async (data: { deliveryType: DeliveryType }): Promise<INewQRType[]> => {
    try {
        const res = await apiRequest<INewQRType[]>(API_METHODS.POST, API_ENDPOINTS.fetch_qrs_on_delivery_type, data);
        return res ?? [];
    } catch (error) {
        console.error("Error in fetching QRs:", error);
        return [];
    }
};
