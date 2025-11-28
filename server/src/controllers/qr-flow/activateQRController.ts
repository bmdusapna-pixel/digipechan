import expressAsyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { Response } from "express";
import { QRModel } from "../../models/qr-flow/qrModel";
import { ApiResponse } from "../../config/ApiResponse";
import { QRStatus } from "../../config/constants";
import { PaymentTransaction } from "../../models/transaction/paymentTransaction";
import {
  IQRUpdateSchema,
  qrUpdateSchema,
} from "../../validators/qr-flow/qrSchema";

export const checkQRValidity = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { serialNumber } = req.body;
    const QR = await QRModel.findOne({ serialNumber: serialNumber });
    if (!QR)
      return ApiResponse(
        res,
        400,
        "No QR found with this serial number",
        false,
        null
      );

    if (
      QR.qrStatus === QRStatus.PENDING_PAYMENT ||
      QR.qrStatus === QRStatus.REJECTED
    )
      return ApiResponse(res, 200, "The QR is not yet activated.", true, {
        qrStatus: QR.qrStatus,
      });

    const transactionId = QR?.transactionId;

    const transaction = await PaymentTransaction.findById(transactionId);

    if (!transaction)
      return ApiResponse(
        res,
        200,
        "No Valid Transaction found for this one!",
        true,
        {
          qrStatus: QR.qrStatus,
        }
      );

    return ApiResponse(res, 200, "QR Information fetched successfully", true, {
      qrInfo: QR,
      transaction: transaction,
    });
  }
);

export const updateQRPermissions = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const qrId =
        (req.params?.qrId as string) || (req.query.qrId as string) ||
        (req.body?.qrId as string);

      if (!qrId || !mongoose.Types.ObjectId.isValid(qrId)) {
        return ApiResponse(res, 400, "Invalid or missing qrId", false, null);
      }

      const qr = await QRModel.findById(qrId);
      if (!qr) {
        return ApiResponse(res, 404, "QR not found", false, null);
      }

      const allowed = [
        "textMessagesAllowed",
        "voiceCallsAllowed",
        "videoCallsAllowed",
      ];

      const body = req.body || {};
      const fieldsToUpdate = allowed.filter((f) =>
        Object.prototype.hasOwnProperty.call(body, f)
      );

      const update: any = {};

      if (fieldsToUpdate.length === 0) {
        // No specific fields provided: apply global toggle
        const anyTrue =
          Boolean(qr.textMessagesAllowed) ||
          Boolean(qr.voiceCallsAllowed) ||
          Boolean(qr.videoCallsAllowed);

        const newVal = !anyTrue; // if any true -> newVal false, else true

        update.textMessagesAllowed = newVal;
        update.voiceCallsAllowed = newVal;
        update.videoCallsAllowed = newVal;
      } else {
        // Only update provided fields. For those fields, if any is currently true -> set all provided to false, else set all provided to true
        const anyProvidedTrue = fieldsToUpdate.some((f) => Boolean((qr as any)[f]));
        const newVal = !anyProvidedTrue;
        for (const f of fieldsToUpdate) update[f] = newVal;
      }

      const updated = await QRModel.findByIdAndUpdate(
        qrId,
        { $set: update },
        { new: true }
      );

      return ApiResponse(res, 200, "QR permissions updated", true, updated);
    } catch (err: any) {
      console.error("Error in updateQRPermissions:", err);
      return ApiResponse(res, 500, "Failed to update QR permissions", false, null, err?.message);
    }
  }
);

export const updateQRBySerialNumberHandler = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const qrInfo: IQRUpdateSchema = req.body;

    const validation = qrUpdateSchema.safeParse(qrInfo);
    console.log("Validation Error : ", validation.error);
    if (!validation.success)
      return ApiResponse(res, 400, "Error occurred in validation", false, null);

    const { serialNumber, ...updateData } = validation.data;

    // Check if QR exists and get current status
    const existingQR = await QRModel.findOne({ serialNumber });
    if (!existingQR) {
      return ApiResponse(
        res,
        404,
        "QR with given serial number not found.",
        false,
        null
      );
    }

    // Prevent activation of QRs in PENDING_PAYMENT or REJECTED status
    if (
      (existingQR.qrStatus === QRStatus.PENDING_PAYMENT ||
        existingQR.qrStatus === QRStatus.REJECTED) &&
      updateData.qrStatus === QRStatus.ACTIVE
    ) {
      return ApiResponse(
        res,
        403,
        existingQR.qrStatus === QRStatus.PENDING_PAYMENT
          ? "Cannot activate QR while payment is pending approval."
          : "Cannot activate QR that has been rejected. Payment is required.",
        false,
        null
      );
    }

    const updatedQR = await QRModel.findOneAndUpdate(
      { serialNumber },
      {
        $set: {
          createdFor: req.data?.userId,
          ...updateData,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return ApiResponse(res, 200, "QR updated successfully.", true, updatedQR);
  }
);


