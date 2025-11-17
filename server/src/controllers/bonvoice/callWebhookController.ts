import { Request, Response } from "express";
import { QRModel } from "../../models/qr-flow/qrModel";

export const callWebhook = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const did = req.body.did as string;
    const from = req.body.from as string;

    if (!did || !from) {
      res.status(400).json({
        status: "0",
        message: "Missing 'did' or 'from' parameter",
      });
      return;
    }

    const now = new Date();
    const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);

    // Helper to normalize phone numbers
    const normalize = (num: string): string => {
      if (!num) return "";
      return num.replace(/\s+/g, "").replace(/^\+91/, "");
    };

    // STEP 1: SELF-CALL PRE-CHECK BEFORE UPDATING ANYTHING
    // FIND IF 'from' MATCHES ANY OWNER NUMBER
    const ownerQR = await QRModel.findOne();

    const owner = await QRModel.findOne({
      mobileNumber: { $exists: true },
    });

    const isOwner = await QRModel.findOne({
      mobileNumber: { $exists: true },
    });

    // Actually use direct match:
    const ownerQRMatch = await QRModel.findOne({
      mobileNumber: new RegExp(normalize(from) + "$"), // matches ending digits
    });

    if (ownerQRMatch) {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

      const qrList = await QRModel.find({
        mobileNumber: new RegExp(normalize(from) + "$"), // match all QR for this owner
      });

      for (const item of qrList) {
        if (!item.callLogs?.length) continue;

        const lastLog = item.callLogs[item.callLogs.length - 1];

        if (lastLog.time >= oneHourAgo) {
          res.json({
            status: "1",
            destination: lastLog.from, // return the caller number
          });
          return;
        }
      }
    }

    const qr = await QRModel.findOneAndUpdate(
      {
        callLogs: {
          $elemMatch: {
            time: { $gte: thirtySecondsAgo, $lte: now },
            connected: false,
          },
        },
      },
      { $set: { "callLogs.$.connected": true, "callLogs.$.from": from } },
      { new: true }
    );

    const formatPhoneNumber = (phone: string): string => {
      // Remove all spaces and the '+91' country code if it exists
      let formattedPhone = phone.replace(/\s+/g, "");

      if (formattedPhone.startsWith("+91")) {
        formattedPhone = formattedPhone.substring(3); // Remove the '+91'
      }

      // Ensure the number has 10 digits (if it's longer, cut it to the first 10 digits)
      return formattedPhone.length > 10
        ? formattedPhone.substring(0, 10)
        : formattedPhone;
    };

    if (qr && qr.mobileNumber) {
      const phoneNumber = formatPhoneNumber(qr.mobileNumber);
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
      const phoneNumber = formatPhoneNumber(lastConnectedQR.mobileNumber);
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
