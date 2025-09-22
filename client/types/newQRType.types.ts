import { DeliveryType, qrFormatType } from "@/common/constants/enum";

export interface IBaseProfession {
  name: string;
  logoUrl: string;
}

export interface QRTagQuestion {
  id: string;
  text: string;
  category: string;
}

export enum QRTagType {
  CAR_TAG = "CAR_TAG",
  BIKE_TAG = "BIKE_TAG",
  PET_TAG = "PET_TAG",
  BAG_TAG = "BAG_TAG",
  TRAVEL_LUGGAGE_TAG = "TRAVEL_LUGGAGE_TAG",
  GADGET_TAG = "GADGET_TAG",
  DOCUMENT_TAG = "DOCUMENT_TAG",
  CHILD_TAG = "CHILD_TAG",
  ELDERLY_TAG = "ELDERLY_TAG",
  PROPERTY_TAG = "PROPERTY_TAG",
  BUSINESS_TAG = "BUSINESS_TAG",
  VEHICLE_TAG = "VEHICLE_TAG",
  EMERGENCY_TAG = "EMERGENCY_TAG",
  PERSONAL_ITEM_TAG = "PERSONAL_ITEM_TAG",
  MEDICAL_TAG = "MEDICAL_TAG",
  SECURITY_TAG = "SECURITY_TAG",
  DELIVERY_TAG = "DELIVERY_TAG",
  EVENT_TAG = "EVENT_TAG",
  CONTACT_TAG = "CONTACT_TAG",
}

export interface INewQRType extends Document {
  _id: string;
  qrName: string;
  qrDescription: string;
  qrUseCases: string[];
  originalPrice: number;
  discountedPrice: number;
  includeGST?: boolean;
  professionBased?: boolean;
  professionsAllowed?: IBaseProfession[];
  qrBackgroundImage?: string;
  qrIcon?: string;
  productImage?: string;
  qrFormatType?: qrFormatType;
  pdfTemplate?: string;
  deliveryType?: DeliveryType[];
  stockCount: number;
  tagType?: QRTagType;
  questions?: QRTagQuestion[];
}
