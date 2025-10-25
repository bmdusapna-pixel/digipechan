import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { QRModel } from "../../models/qr-flow/qrModel";
import { User } from "../../models/auth/user";
import { push } from "../../config/push";
import { ApiResponse } from "../../config/ApiResponse";

export const sendQuestionNotificationHandler = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { qrId } = req.params;
    const { question } = req.body;

    if (!question || typeof question !== "object") {
      return ApiResponse(res, 400, "A question object is required", false);
    }

    try {
      const qr = await QRModel.findById(qrId)
        .populate({
          path: "createdFor",
          select: "deviceTokens firstName lastName",
        })
        .lean();

      if (!qr) {
        return ApiResponse(res, 404, "QR not found", false);
      }

      const owner = qr.createdFor as any;
      const tokens = owner?.deviceTokens || [];

      if (tokens.length === 0) {
        return ApiResponse(
          res,
          200,
          "No device tokens found for the QR owner",
          true
        );
      }

      await push.notifyMany(
        tokens,
        "QR Issue Reported",
        `Someone reported an issue on your QR: "${question.text}"`,
        {
          qrId,
          id: question.id,
          text: question.text,
          category: question.category,
        }
      );

      return ApiResponse(
        res,
        200,
        "Question notification sent successfully",
        true,
        {
          ownerName: owner ? `${owner.firstName} ${owner.lastName}` : null,
          questionId: question.id || null,
          questionText: question.text || null,
        }
      );
    } catch (err) {
      console.error("Error sending question notification:", err);
      return ApiResponse(res, 500, "Failed to send notification", false);
    }
  }
);
