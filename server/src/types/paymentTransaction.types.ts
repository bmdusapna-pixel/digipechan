import { Schema } from 'inspector';
import { DeliveryType, PaymentTransactionStatus } from '../config/constants';
import mongoose from 'mongoose';

export interface IPaymentTransaction {
  _id?: mongoose.Types.ObjectId;
  transactionId: string;
  items: {
    qrTypeId: mongoose.Types.ObjectId;
    quantity: number;
    qrId?: mongoose.Types.ObjectId; // existing QR when salesman sells from bundle
  }[];
  deliveryType: DeliveryType;
  createdBy?: mongoose.Types.ObjectId;
  createdFor?: mongoose.Types.ObjectId;
  salespersonId?: mongoose.Types.ObjectId;
  shippingAddress?: {
    houseNumber?: string;
    locality?: string;
    nearByAreaName?: string;
    pincode?: string;
    city?: string;
    state?: string;
    country?: string;
  };
  amount: number;
  status: PaymentTransactionStatus;
  createdAt?: Date; 
  updatedAt?: Date; 
};
