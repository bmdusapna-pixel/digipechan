import { DeliveryType } from "cloudinary";
import mongoose from "mongoose";
import { OrderStatus, QRStatus } from "../config/constants";

export interface IAddress {
  houseNumber?: string;
  locality?: string;
  nearByAreaName?: string;
  pincode?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface IReview {
  _id?: mongoose.Types.ObjectId;
  name: string;
  review: string;
  rating?: number;
  timestamp?: Date;
}
interface ICallLog {
  time: Date;
  connected: boolean;
  from?: string;
}

export interface IQR extends Document {
  qrTypeId: mongoose.Types.ObjectId;
  serialNumber: string;
  customerName?: string;
  mobileNumber?: string;
  altMobileNumber?: string;
  email?: string;
  address?: IAddress;
  vehicleNumber?: string;
  gstNumber?: string;
  createdBy?: mongoose.Types.ObjectId;
  createdFor?: mongoose.Types.ObjectId;
  soldBySalesperson?: mongoose.Types.ObjectId;
  deliveryType?: DeliveryType;
  orderStatus?: OrderStatus;
  qrStatus: QRStatus;
  shippingDetails?: IAddress;
  visibleInfoFields?: string[];
  transactionId?: string;
  qrUrl: string;
  qrRawData: string;
  textMessagesAllowed?: boolean;
  voiceCallsAllowed?: boolean;
  videoCallsAllowed?: boolean;
  qrWithTemplate?: string;
  bundleId?: string;
  price?: number;
  isSold?: boolean;
  reviews?: IReview[];
  callLogs?: ICallLog[];
  tagType?: string;
  questions?: Array<{
    id: string;
    text: string;
    category: string;
  }>;
}
