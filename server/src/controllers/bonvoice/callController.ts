import { Response } from "express";
import expressAsyncHandler from "express-async-handler";
import axios from "axios";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { BonvoiceCredential } from "../../models/bonvoice/bonvoiceCredentialModel";
import { User } from "../../models/auth/user";
import { QRModel } from "../../models/qr-flow/qrModel";
import { ApiResponse } from "../../config/ApiResponse";
import { v4 as uuidv4 } from "uuid";

const normalizeAndValidatePhone = (phone: string): string | null => {
  if (!phone) return null;
  const cleaned = phone.replace(/\s+/g, "");
  const regex = /^(\+91)?[0-9]{10}$/;
  return regex.test(cleaned) ? cleaned : null;
};

export const startAutoCallBridge = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const bonvoice = await BonvoiceCredential.findOne().sort({
        createdAt: 1,
      });
      if (!bonvoice) {
        return ApiResponse(
          res,
          404,
          "No Bonvoice credentials found.",
          false,
          null,
          "Missing Bonvoice credentials"
        );
      }

      const user = await User.findById(req.data?.userId);
      if (!user || !user.phoneNumber) {
        return ApiResponse(
          res,
          404,
          "User or phone number not found.",
          false,
          null,
          "Missing user phone number"
        );
      }

      const userPhone = normalizeAndValidatePhone(user.phoneNumber);
      if (!userPhone) {
        return ApiResponse(
          res,
          400,
          "Invalid user phone number format. Must be +91XXXXXXXXXX or XXXXXXXXXX.",
          false,
          null,
          "Invalid phone number"
        );
      }

      const { qrId } = req.body;
      if (!qrId) {
        return ApiResponse(
          res,
          400,
          "qrId is required in request body.",
          false,
          null,
          "Validation Error"
        );
      }

      const qr = await QRModel.findById(qrId);
      if (!qr || !qr.mobileNumber) {
        return ApiResponse(
          res,
          404,
          "QR record or mobile number not found.",
          false,
          null,
          "Missing QR data"
        );
      }

      const qrPhone = normalizeAndValidatePhone(qr.mobileNumber);
      if (!qrPhone) {
        return ApiResponse(
          res,
          400,
          "Invalid QR mobile number format. Must be +91XXXXXXXXXX or XXXXXXXXXX.",
          false,
          null,
          "Invalid phone number"
        );
      }

      const eventID = uuidv4();
      const payload = {
        autocallType: "3",
        destination: userPhone,
        ringStrategy: "ringall",
        legACallerID: bonvoice.did,
        legAChannelID: "1",
        legADialAttempts: "1",
        legBDestination: qrPhone,
        legBCallerID: bonvoice.did,
        legBChannelID: "1",
        legBDialAttempts: "1",
        eventID,
      };

      const response = await axios.post(
        "https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/",
        payload,
        {
          headers: {
            Authorization: `${bonvoice.token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const { responseCode, responseDescription, responseType } = response.data;

      if (responseCode !== 200 || responseType?.toLowerCase() !== "success") {
        return ApiResponse(
          res,
          400,
          "Bonvoice API did not return success.",
          false,
          response.data,
          responseDescription || "Invalid Bonvoice response"
        );
      }

      return ApiResponse(
        res,
        200,
        "Auto call bridging initiated successfully.",
        true,
        {
          userPhone,
          qrPhone,
          eventID,
          bonvoiceResponse: response.data,
        }
      );
    } catch (error: any) {
      console.error("Bonvoice call bridge error:", error.message);
      return ApiResponse(
        res,
        500,
        "Failed to initiate auto call bridge.",
        false,
        null,
        error.message || "Internal Server Error"
      );
    }
  }
);
