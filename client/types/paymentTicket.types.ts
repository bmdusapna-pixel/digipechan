export interface IPaymentTicket {
  _id?: string;
  ticketId: string;
  salespersonId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  qrIds: string[];
  bundleId: string;
  bundleInfo?: {
    bundleId: string;
    qrTypeName: string;
    qrTypeDescription: string;
    pricePerQr: number | null;
    qrCount: number;
  };
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
  paymentProof?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ICreatePaymentTicketRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  qrIds: string[];
  bundleId: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
  paymentProof?: string;
}

export interface IUpdatePaymentTicketStatusRequest {
  status: 'APPROVED' | 'REJECTED';
  adminNotes?: string;
}

export interface IPaymentTicketWithDetails extends IPaymentTicket {
  salesperson?: {
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  qrDetails?: Array<{
    _id: string;
    serialNumber: string;
    qrTypeId: {
      qrName: string;
      qrDescription: string;
    };
  }>;
  approvedByUser?: {
    firstName: string;
    lastName: string;
  };
  bundleInfo?: {
    bundleId: string;
    qrTypeName: string;
    qrTypeDescription: string;
    pricePerQr: number | null;
    qrCount: number;
  };
}
