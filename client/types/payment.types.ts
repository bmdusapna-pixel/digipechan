import { DeliveryType, PaymentTransactionStatus } from "@/common/constants/enum";

export interface IPaymentTransaction {
    _id?: string;
    transactionId?: string;
    items: {
        qrTypeId: string;
        quantity: number;
        qrId?: string;
        _id?: string;
    }[];
    deliveryType: DeliveryType;
    createdBy?: string;
    createdFor?: string;
    shippingAddress?: {
        houseNumber?: string;
        locality?: string;
        nearByAreaName?: string;
        pincode?: string;
        city?: string;
        state?: string;
        country?: string;
    };
    amount?: number;
    qrId?: string;
    paymentStatus?: PaymentTransactionStatus;
}
