import mongoose, { Schema, Document } from "mongoose";
import { COLLECTION_NAMES } from "../../config/constants";

export interface IBundle extends Document {
  bundleId: string;
  qrTypeId: mongoose.Types.ObjectId;
  qrCount: number;
  shareToken: string;
  shareTokenExpiresAt: Date;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId | null;
  assignmentHistory: {
    salesperson: mongoose.Types.ObjectId;
    assignedAt: Date;
  }[];
  deliveryType: string | null;
  status: "UNASSIGNED" | "ASSIGNED";
  qrIds: mongoose.Types.ObjectId[];
  pricePerQr?: number;
  createdAt: Date;
  updatedAt: Date;
}

const bundleSchema = new Schema<IBundle>(
  {
    bundleId: {
      type: String,
      required: true,
      unique: true,
    },
    qrTypeId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.QR_TYPES_META_DATA,
      required: true,
    },
    qrCount: {
      type: Number,
      required: true,
    },
    shareToken: {
      type: String,
      default: null,
    },
    shareTokenExpiresAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USER,
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.SALESMAN,
      default: null,
    },
    assignmentHistory: [
      {
        salesperson: {
          type: Schema.Types.ObjectId,
          ref: COLLECTION_NAMES.SALESMAN,
          required: true,
        },
        assignedAt: { type: Date, default: Date.now },
      },
    ],
    deliveryType: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["UNASSIGNED", "ASSIGNED"],
      default: "UNASSIGNED",
    },
    qrIds: [
      {
        type: Schema.Types.ObjectId,
        ref: COLLECTION_NAMES.GENERATED_QRS,
      },
    ],
    pricePerQr: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Bundle = mongoose.model<IBundle>(
  COLLECTION_NAMES.BUNDLE,
  bundleSchema
);
