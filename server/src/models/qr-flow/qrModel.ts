import mongoose, { Schema } from "mongoose";
import { IAddress, IQR as BaseIQR, IReview } from "../../types/newQR.types";
import {
  COLLECTION_NAMES,
  DeliveryType,
  OrderStatus,
  QRStatus,
} from "../../config/constants";

const addressSchema = new Schema<IAddress>(
  {
    houseNumber: String,
    locality: String,
    nearByAreaName: String,
    pincode: String,
    city: String,
    state: String,
    country: String,
  },
  { _id: false }
);

const reviewSchema = new Schema<IReview>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    review: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

type IQR = BaseIQR & { price?: number; reviews?: IReview[] };

const qrSchema = new Schema<IQR>(
  {
    qrTypeId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.QR_TYPES_META_DATA,
      required: true,
    },
    serialNumber: {
      type: String,
      match: /^[A-Z]{4}\d+-\d{10}$/,
    },
    customerName: {
      type: String,
    },
    mobileNumber: {
      type: String,
      match: /^\+\d{1,3}\s\d{10}$/,
    },
    altMobileNumber: {
      type: String,
      match: /^\+\d{1,3}\s\d{10}$/,
    },
    email: {
      type: String,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    address: addressSchema,
    vehicleNumber: {
      type: String,
      match: /^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/,
    },
    gstNumber: {
      type: String,
      match: /^[0-3][0-9][A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$/,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USER,
    },
    createdFor: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USER,
    },
    // Sales tracking: optional reference to the salesperson who sold/assigned this QR
    soldBySalesperson: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.SALESMAN,
      default: null,
    },
    deliveryType: {
      type: String,
      enum: Object.values(DeliveryType),
    },
    orderStatus: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.SHIPPED,
    },
    qrStatus: {
      type: String,
      enum: Object.values(QRStatus),
      default: QRStatus.INACTIVE,
    },
    shippingDetails: addressSchema,
    visibleInfoFields: {
      type: [String],
      default: [],
    },
    transactionId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.PAYMENT_HISTORY,
    },
    qrUrl: {
      type: String,
    },
    qrRawData: {
      type: String,
    },
    textMessagesAllowed: {
      type: Boolean,
      default: false,
    },
    voiceCallsAllowed: {
      type: Boolean,
      default: false,
    },
    videoCallsAllowed: {
      type: Boolean,
      default: false,
    },
    bundleId: {
      type: String,
      default: null,
    },
    price: {
      type: Number,
      default: null,
    },
    isSold: {
      type: Boolean,
      default: false,
    },
    reviews: {
      type: [reviewSchema],
      default: [],
    },
    tagType: {
      type: String,
      required: false,
    },
    questions: {
      type: [
        {
          id: String,
          text: String,
          category: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const QRModel = mongoose.model<IQR>(
  COLLECTION_NAMES.GENERATED_QRS,
  qrSchema
);
