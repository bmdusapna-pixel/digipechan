import { Request, Response } from "express";
import { QRModel } from "../../models/qr-flow/qrModel";

export const callWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const did = req.query.did as string;
    const from = req.query.from as string;

    if (!did || !from) {
      res.status(400).json({
        status: "0",
        message: "Missing 'did' or 'from' parameter",
      });
      return;
    }

    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);

    const qr = await QRModel.findOneAndUpdate(
      {
        callLogs: {
          $elemMatch: {
            time: { $gte: thirtySecondsAgo, $lte: now },
            connected: false,
          },
        },
      },
      { $set: { "callLogs.$.connected": true } },
      { new: true }
    );

    if (qr && qr.mobileNumber) {
      const phoneNumber = qr.mobileNumber.replace(/\s+/g, "");
      res.json({
        status: "1",
        destination: phoneNumber,
      });
      return;
    }

    const lastConnectedQR = await QRModel.findOne({
      callLogs: { $elemMatch: { connected: true } },
    }).sort({ updatedAt: -1 });

    if (lastConnectedQR && lastConnectedQR.mobileNumber) {
      const phoneNumber = lastConnectedQR.mobileNumber.replace(/\s+/g, "");
      res.json({
        status: "1",
        destination: phoneNumber,
      });
      return;
    }

    res.json({
      status: "0",
      message: "No active or previous connected QR found",
    });
  } catch (error) {
    console.error("Error in callWebhook:", error);
    res.status(500).json({
      status: "0",
      message: "Internal Server Error",
    });
  }
};
