export enum UserRoles {
    ADMIN = "ADMIN",
    BASIC_USER = "BASIC_USER",
    SALESPERSON = "SALES_PERSON",
}

export const allowedFileTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg", "application/pdf"];

export enum qrFormatType {
    SQUARE = "SQUARE",
    ROUND = "ROUND",
    STICKER = "STICKER",
}

export enum DeliveryType {
    ETAG = "ETAG",
    PHYSICAL_SHIP = "PHYSICAL_SHIP",
}

export const deliveryTypeLabels: Record<DeliveryType, string> = {
    [DeliveryType.ETAG]: "E-Tag",
    [DeliveryType.PHYSICAL_SHIP]: "Physical Shipping",
};

export enum QRStatus {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE",
    PENDING_PAYMENT = "PENDING_PAYMENT",
    REJECTED = "REJECTED",
}

export enum PaymentTransactionStatus {
    INITIATED = "INITIATED",
    PAID = "PAID",
    FAILED = "FAILED",
}

// Profession enum -- Not Finalized
export enum ProfessionType {
    DOCTOR = "DOCTOR",
    LAWYER = "LAWYER",
}
