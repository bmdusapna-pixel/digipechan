import expressAsyncHandler from "express-async-handler";
import { Request, Response } from "express";
import { ApiResponse } from "../../config/ApiResponse";
import { AGORA_APP_ID, AGORA_APP_CERT } from "../../secrets";
import {
  RtcTokenBuilder,
  RtcRole,
  RtmTokenBuilder,
  RtmRole,
} from "agora-access-token";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { QRModel } from "../../models/qr-flow/qrModel";
import { User } from "../../models/auth/user";
import { push } from "../../config/push";

export const generateToken = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const channelName = String(req.query.channel) || "demo-channel";
    const uid = req.data?.userId;
    const { qrId, userName } = req.body;

    if (!uid) {
      return ApiResponse(
        res,
        400,
        "User ID missing in token payload",
        false,
        null,
        "Authentication Error"
      );
    }

    const expirationInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationInSeconds;
    const rtcToken = RtcTokenBuilder.buildTokenWithUid(
      AGORA_APP_ID,
      AGORA_APP_CERT,
      channelName,
      uid,
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    );
    const rtmToken = RtmTokenBuilder.buildToken(
      AGORA_APP_ID,
      AGORA_APP_CERT,
      uid.toString(),
      RtmRole.Rtm_User,
      privilegeExpiredTs
    );

    let notificationSent = false;

    try {
      if (qrId) {
        const qr = await QRModel.findById(qrId)
          .populate({ path: "createdFor", select: "deviceTokens" })
          .lean();

        if (qr?.createdFor?._id) {
          const owner = await User.findById(qr.createdFor._id)
            .select("deviceTokens")
            .lean();
          const tokens = owner?.deviceTokens || [];

          if (tokens.length > 0) {
            await push.notifyMany(
              tokens,
              "Incoming Video Call 📞",
              `You have an incoming video call from ${userName || "a user"}`,
              {
                qrId: String(qr._id),
                roomId: channelName,
                userName: userName || "",
              }
            );
            notificationSent = true;
          }
        }
      }
    } catch (err) {
      console.error("Push notification error in generateToken:", err);
    }

    const data = {
      rtcToken,
      rtmToken,
      uid,
      channelName,
      notificationSent,
    };

    return ApiResponse(res, 200, "Token created successfully", true, data);
  }
);
