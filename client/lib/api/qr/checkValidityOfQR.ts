import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { QRStatus } from "@/common/constants/enum";
import { apiRequest } from "@/common/utils/apiClient";
import { IPaymentTransaction } from "@/types/payment.types";
import { IQR } from "@/types/qr.types";

export const checkValidity = async (data: { serialNumber: string }) => {
    try {
        const res = await apiRequest<
            | {
                  qrInfo: IQR;
                  transaction: IPaymentTransaction;
              }
            | { qrStatus: QRStatus }
        >(API_METHODS.POST, API_ENDPOINTS.checkValidatity, data);
        return res as
            | {
                  qrInfo: IQR;
                  transaction: IPaymentTransaction;
              }
            | { qrStatus: QRStatus };
    } catch (error) {
        console.error("Error in the check qr validation", error);
        throw error;
    }
};
