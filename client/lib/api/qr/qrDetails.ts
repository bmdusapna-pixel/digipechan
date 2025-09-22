import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { QRStatus } from "@/common/constants/enum";
import { apiRequest } from "@/common/utils/apiClient";
import { IQR } from "@/types/qr.types";

export const qrDetails = async (qrId: string) => {
    try {
        const res = await apiRequest<{
            visibleData: IQR;
            qrStatus: QRStatus;
        }>(API_METHODS.GET, API_ENDPOINTS.fetchQRDetails(qrId));
        return res as {
            visibleData: IQR;
            qrStatus: QRStatus;
        };
    } catch (error) {
        console.error("Error in the check qr validation", error);
        throw error;
    }
};
