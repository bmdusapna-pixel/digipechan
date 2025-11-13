import { Request, Response } from "express";
import { QRModel } from "../../models/qr-flow/qrModel";
import { ApiResponse } from "../../config/ApiResponse";
import { BonvoiceCredential } from "../../models/bonvoice/bonvoiceCredentialModel";

export const setCallLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { qrId } = req.body;

    if (!qrId) {
      ApiResponse(
        res,
        400,
        "qrId is required.",
        false,
        null,
        "Validation Error"
      );
      return;
    }

    const qr = await QRModel.findById(qrId).populate("createdFor", "_id");

    if (!qr) {
      ApiResponse(res, 404, "QR not found.", false, null, "Not Found");
      return;
    }

    if (!Array.isArray(qr.callLogs)) {
      qr.callLogs = [];
    }

    qr.callLogs.push({
      time: new Date(),
      connected: false,
    });

    await qr.save();

    const bonvoiceCredential = await BonvoiceCredential.findOne();

    if (!bonvoiceCredential) {
      ApiResponse(
        res,
        404,
        "Bonvoice credentials not found.",
        false,
        null,
        "Not Found"
      );
      return;
    }

    ApiResponse(res, 200, "Call has been initiated successfully.", true, {
      createdFor: qr.createdFor,
      qrId: qr._id,
      did: bonvoiceCredential.did,
      lastCall: qr.callLogs?.[qr.callLogs.length - 1] || null,
    });
  } catch (error) {
    console.error("Error in setCallLog:", error);
    ApiResponse(
      res,
      500,
      "Internal Server Error.",
      false,
      null,
      "Server Error"
    );
  }
};
