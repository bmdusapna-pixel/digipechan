import mongoose from 'mongoose';
import {
  COLLECTION_NAMES,
  DeliveryType,
  PaymentTransactionStatus,
} from '../../config/constants';
import { IPaymentTransaction } from '../../types/paymentTransaction.types';

const transactionSchema = new mongoose.Schema<IPaymentTransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        qrTypeId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: COLLECTION_NAMES.QR_TYPES_META_DATA,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        qrId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: COLLECTION_NAMES.GENERATED_QRS,
          required: false,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USER,
    },
    createdFor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USER,
    },
    salespersonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.SALESMAN,
      required: false,
    },
    shippingAddress: {
      houseNumber: String,
      locality: String,
      nearByAreaName: String,
      pincode: String,
      city: String,
      state: String,
      country: String,
    },
    deliveryType: {
      type: String,
      enum: Object.values(DeliveryType),
    },
    amount: Number,
    status: {
      type: String,
      enum: Object.values(PaymentTransactionStatus),
      default: PaymentTransactionStatus.INITIATED,
    },
  },
  { timestamps: true },
);

export const PaymentTransaction = mongoose.model(
  COLLECTION_NAMES.PAYMENT_HISTORY,
  transactionSchema,
);
