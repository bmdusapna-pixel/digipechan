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

export const generateToken = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const channelName = String(req.query.channel) || "demo-channel";
    const uid = req.data?.userId;

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
    const data = {
      rtcToken,
      rtmToken,
      uid,
    };
    return ApiResponse(res, 200, "Token created successfully", true, data);
  }
);
