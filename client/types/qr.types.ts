import { DeliveryType, QRStatus } from "@/common/constants/enum";

export interface IAddress {
    houseNumber?: string;
    locality?: string;
    nearByAreaName?: string;
    pincode?: string;
    city?: string;
    state?: string;
    country?: string;
}

export interface IQR extends Document {
    qrTypeId: string;
    serialNumber: string;
    customerName?: string;
    mobileNumber?: string;
    altMobileNumber?: string;
    email?: string;
    address?: IAddress;
    vehicleNumber?: string;
    gstNumber?: string;
    createdBy?: string;
    createdFor?: string;
    deliveryType?: DeliveryType;
    qrStatus: QRStatus;
    shippingDetails?: IAddress;
    visibleInfoFields?: string[];
    transactionId?: string;
    qrUrl: string;
    qrRawData: string;
    textMessagesAllowed?: boolean;
    voiceCallsAllowed?: boolean;
    videoCallsAllowed?: boolean;
    questions?: Array<{
        id: string;
        text: string;
        category: string;
    }>;
}
