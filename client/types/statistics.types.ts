import z from "zod";
export type DailyRangedRevenueType = {
  dailyRevenueData: {
    date: Date;
    dailyRevenue: number;
  }[];
  accumulatedRevenue: number;
};

export type QRTypePerformanceType = {
  totalGenerated: number;
  activeCount: number;
  inactiveCount: number;
  qrTypeId: string;
  qrName: string;
};

export type StatusCountType = {
  qrStatus: "ACTIVE" | "INACTIVE";
  count: number;
};

export type DeliveryTypeResultType = {
  count: number;
  deliveryType: DeliveryType;
};

export type SalesPersonDataType = {
  totalGenerated: number;
  activeCount: number;
  inactiveCount: number;
  userId: string;
  name: string;
  email: string;
};

export type GeneralStatisticsType = {
  qrTypePerformance: QRTypePerformanceType[];
  statusCounts: StatusCountType[];
  deliveryTypeResult: DeliveryTypeResultType[];
  salesPersonData: SalesPersonDataType[];
};

export type DateRangeType = {
  startDateStr: string;
  endDateStr: string;
};

export type PeriodicRevenueType = {
  [dateRange: string]: number;
};

export type OrderData = {
  serialNumber: string;
  qrStatus: QRStatus;
  orderStatus: OrderStatus;
  vehicleNumber?: string;
  qrId: string;
  transactionID: string;
  deliveryType: DeliveryType;
  orderDate: string;
  paymentStatus: PaymentTransactionStatus;
  customerName?: string;
  phoneNumber?: string;
};

export type UpdateOrderData = Partial<OrderData>;

export enum DeliveryType {
  ETAG = "ETAG",
  PHYSICAL_SHIP = "PHYSICAL_SHIP",
  BULK_GENERATION = "BULK_GENERATION",
}

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
  SUCCESS = "SUCCESS",
}

export enum OrderStatus {
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  DISPATCHED = "DISPATCHED",
}
export const serialNumberSchema = z.string().regex(/^[A-Z]{4}\d+-\d{10}$/, {
  message:
    "Serial number must start with 'DIGI' + any digits + '-' followed by 10 digits",
});

export const vehicleNumberSchema = z
  .string()
  .regex(/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/, {
    message: "Vehicle number must be in format 'XX00XX0000' without spaces",
  });
export const mobileNumberSchema = z.string().regex(/^\+\d{1,3}\s\d{10}$/, {
  message: "Mobile number must be in format '+<country-code> 1234567890'",
});
export const dateSchema = z
  .string()
  .regex(/^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/, {
    message: "Date must be in DD/MM/YYYY format.",
  });

export const OrderManagementSchema = z.object({
  serialNumber: serialNumberSchema,
  qrStatus: z.nativeEnum(QRStatus).optional(),
  orderStatus: z.nativeEnum(OrderStatus).optional(),
  vehicleNumber: vehicleNumberSchema.optional(),
  qrId: z.string().min(1, { message: "QR ID is required" }),
  transactionID: z.string().min(1, { message: "Transaction ID is required" }),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
  orderDate: dateSchema.optional(),
  paymentStatus: z.nativeEnum(PaymentTransactionStatus).optional(),
  customerName: z.string().optional(),
  phoneNumber: mobileNumberSchema.optional(),
});
