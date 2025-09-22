import mongoose, { Schema, Document } from "mongoose";
import { COLLECTION_NAMES } from "../../config/constants";
import { UserRoles } from "../../enums/enums";

export interface ISalesman extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  altMobileNumber?: string;
  password: string;
  roles: UserRoles[];
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpiry?: Date;
  resetPasswordToken?: string;
  resetPasswordTokenExpiry?: Date;
  assignedBundles: mongoose.Types.ObjectId[];
  totalQRsSold: number;
  digitalWalletCoins: number;
  deviceTokens: string[];
  isActive: boolean;
  territory?: string;
  managerAssigned?: mongoose.Types.ObjectId;
  // added by Mongoose when timestamps: true
  createdAt: Date;
  updatedAt: Date;
}

const salesmanSchema = new Schema<ISalesman>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    altMobileNumber: {
      type: String,
    },
    password: {
      type: String,
      required: true,
      minlength: 4,
    },
    roles: {
      type: [String],
      enum: Object.values(UserRoles),
      default: [UserRoles.SALESPERSON],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpiry: {
      type: Date,
    },
    resetPasswordToken: {
      type: String,
    },
    resetPasswordTokenExpiry: {
      type: Date,
    },
    assignedBundles: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bundle",
      },
    ],
    totalQRsSold: {
      type: Number,
      default: 0,
    },
    digitalWalletCoins: {
      type: Number,
      default: 0,
    },
    deviceTokens: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    territory: {
      type: String,
    },
    managerAssigned: {
      type: Schema.Types.ObjectId,
      ref: COLLECTION_NAMES.USER,
    },
  },
  {
    timestamps: true,
  }
);

export const Salesman = mongoose.model<ISalesman>(
  COLLECTION_NAMES.SALESMAN,
  salesmanSchema
);
