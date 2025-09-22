import { z } from 'zod';
import {
  addressSchema,
  emailSchema,
  gstNumberSchema,
  mobileNumberSchema,
  objectIdSchema,
  serialNumberSchema,
  vehicleNumberSchema,
} from './common';
import { DeliveryType, QRStatus } from '@/common/constants/enum';
import { VehicleType } from '@/types/qr';

export const qrSchema = z.object({
  qrTypeId: objectIdSchema,
  serialNumber: serialNumberSchema,
  customerName: z.string().optional(),
  mobileNumber: mobileNumberSchema.optional(),
  altMobileNumber: mobileNumberSchema.optional(),
  email: emailSchema.optional(),
  address: addressSchema.optional(),
  vehicleNumber: vehicleNumberSchema.optional(),
  gstNumber: gstNumberSchema.optional(),
  createdBy: objectIdSchema.optional(),
  createdFor: objectIdSchema.optional(),
  deliveryType: z.nativeEnum(DeliveryType).optional(),
  qrStatus: z.nativeEnum(QRStatus).default(QRStatus.INACTIVE),
  shippingDetails: addressSchema.optional(),
  visibleInfoFields: z.array(z.string()).optional(),
});

export const qrUpdateSchema = z.object({
  serialNumber: serialNumberSchema,
  customerName: z.string(),
  mobileNumber: mobileNumberSchema,
  altMobileNumber: mobileNumberSchema.optional(),
  email: emailSchema,
  address: addressSchema.optional(),
  vehicleNumber: vehicleNumberSchema.optional(),
  gstNumber: gstNumberSchema.optional(),
  visibleInfoFields: z.array(z.string()).optional(),
  qrStatus: z.nativeEnum(QRStatus),
  textMessagesAllowed: z.boolean(),
  voiceCallsAllowed: z.boolean(),
  videoCallsAllowed: z.boolean(),
});

export type IQRSchema = z.infer<typeof qrSchema>;
export type IQRUpdateSchema = z.infer<typeof qrUpdateSchema>;

// -------------------- SCRAP ------------------------------
export const offlineShipQRFormSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    phoneNumber: z.string().regex(/^[0-9]\d{9}$/, { message: "Enter a valid 10-digit phone number" }),
    altPhoneNumber: z.string().regex(/^[0-9]\d{9}$/, { message: "Enter a valid 10-digit alternate phone number" }),
    email: z.string().email({ message: "Enter a valid email address" }),
    houseNumber: z.coerce
        .number({ invalid_type_error: "House number must be a number" })
        .min(1, { message: "House number is required" }),
    locality: z.string().min(1, { message: "Locality is required" }),
    nearByArea: z.string().min(1, { message: "Nearby area is required" }),
    zipCode: z.coerce
        .number({ invalid_type_error: "Zip code must be a number" })
        .min(100000, { message: "Enter a valid 6-digit zip code" })
        .max(999999, { message: "Enter a valid 6-digit zip code" }),
    state: z.string().min(1, { message: "State is required" }),
    city: z.string().min(1, { message: "City is required" }),
    vehicleNumber: z
        .string()
        .regex(/^[A-Z]{2}\d{2}[A-Z]{2}\d{4}$/, { message: "Enter a valid vehicle number (e.g., MH12AB1234)" }),
    gstNumber: z.string({ message: "GST number is required" }),
});

export const eTagFormSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    phoneNumber: z.string().regex(/^[0-9]\d{9}$/, { message: "Enter a valid 10-digit phone number" }),
    email: z.string().email({ message: "Enter a valid email address" }),
    vehicleType: z.nativeEnum(VehicleType, {
        errorMap: () => ({ message: "Vehicle type shold be Car/Bike." }),
    }),
});

export type IOfflineShipFormSchema = z.infer<typeof offlineShipQRFormSchema>;
export type IEtagFormSchema = z.infer<typeof eTagFormSchema>;
