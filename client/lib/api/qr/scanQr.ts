import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { apiRequest } from "@/common/utils/apiClient";
import { IQR } from "@/types/qr.types";

export interface QRScanResponse {
    qr: {
        _id: string;
        serialNumber: string;
        qrTypeId: {
            _id: string;
            qrName: string;
            tagType?: string;
            questions?: Array<{
                id: string;
                text: string;
                category: string;
            }>;
        };
        qrStatus: string;
        customerName?: string;
        altMobileNumber?: string;
        email?: string;
        vehicleNumber?: string;
        mobileNumber?: string;
        textMessagesAllowed?: boolean;
        voiceCallsAllowed?: boolean;
        videoCallsAllowed?: boolean;
        createdFor?: {
            _id: string;
            firstName: string;
            lastName: string;
            mobileNumber?: string;
        };
        visibleData?: any;
        createdByAvatar?: any;
        questions?: Array<{
            id: string;
            text: string;
            category: string;
        }>;
    };
    notificationSent: boolean;
    latitude?: number;
    longitude?: number;
    reviewStats?: any;
}

export const scanQR = async (qrId: string, latitude?: number, longitude?: number): Promise<QRScanResponse> => {
    try {
        const params = new URLSearchParams();
        if (latitude !== undefined) params.append('latitude', latitude.toString());
        if (longitude !== undefined) params.append('longitude', longitude.toString());
        
        const url = `${API_ENDPOINTS.scanQR(qrId)}${params.toString() ? `?${params.toString()}` : ''}`;
        const res = await apiRequest<QRScanResponse>(API_METHODS.GET, url);
        return res;
    } catch (error) {
        console.error("Error scanning QR code", error);
        throw error;
    }
};

// Keep the old function for backward compatibility
export const updateQR = async (qrId: string) => {
    try {
        const res = await apiRequest<Partial<IQR>>(API_METHODS.GET, API_ENDPOINTS.scanQR(qrId));
        return res;
    } catch (error) {
        console.error("Error in the check qr validation", error);
        throw error;
    }
};
