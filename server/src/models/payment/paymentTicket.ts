import mongoose, { Schema, Document } from 'mongoose';
import { COLLECTION_NAMES } from '../../config/constants';

export interface IPaymentTicket extends Document {
  ticketId: string;
  salespersonId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  qrIds: mongoose.Types.ObjectId[];
  bundleId: string;
  amount: number;
  paymentMethod: 'CASH' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
  paymentProof?: string; // URL to uploaded proof
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  adminNotes?: string;
  approvedBy?: mongoose.Types.ObjectId;
  approvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const paymentTicketSchema = new Schema<IPaymentTicket>(
  {
    ticketId: {
      type: String,
      required: true,
      unique: true,
    },
    salespersonId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.SALESMAN,
      required: true,
    },
    customerName: {
      type: String,
      required: true,
    },
    customerPhone: {
      type: String,
      required: true,
    },
    customerEmail: {
      type: String,
    },
    qrIds: [{
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.GENERATED_QRS,
      required: true,
    }],
    bundleId: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'UPI', 'BANK_TRANSFER', 'CHEQUE'],
      required: true,
    },
    paymentProof: {
      type: String, // URL to uploaded file
    },
    status: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING',
    },
    adminNotes: {
      type: String,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USER,
    },
    approvedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

export const PaymentTicket = mongoose.model<IPaymentTicket>(
  COLLECTION_NAMES.PAYMENT_TICKETS,
  paymentTicketSchema,
);
