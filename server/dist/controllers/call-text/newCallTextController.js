"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokenForOwner = exports.generateToken = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const ApiResponse_1 = require("../../config/ApiResponse");
const secrets_1 = require("../../secrets");
const agora_access_token_1 = require("agora-access-token");
const qrModel_1 = require("../../models/qr-flow/qrModel");
const user_1 = require("../../models/auth/user");
const push_1 = require("../../config/push");
exports.generateToken = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const channelName = String(req.query.channel) || "demo-channel";
    const uid = Math.floor(Math.random() * 1000000).toString();
    const { qrId, userName, mediaType } = req.body;
    const expirationInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationInSeconds;
    const rtcToken = agora_access_token_1.RtcTokenBuilder.buildTokenWithAccount(secrets_1.AGORA_APP_ID, secrets_1.AGORA_APP_CERT, channelName, uid, agora_access_token_1.RtcRole.PUBLISHER, privilegeExpiredTs);
    const rtmToken = agora_access_token_1.RtmTokenBuilder.buildToken(secrets_1.AGORA_APP_ID, secrets_1.AGORA_APP_CERT, uid.toString(), agora_access_token_1.RtmRole.Rtm_User, privilegeExpiredTs);
    let notificationSent = false;
    try {
        if (qrId) {
            const qr = yield qrModel_1.QRModel.findById(qrId)
                .populate({ path: "createdFor", select: "deviceTokens" })
                .lean();
            if ((_a = qr === null || qr === void 0 ? void 0 : qr.createdFor) === null || _a === void 0 ? void 0 : _a._id) {
                const owner = yield user_1.User.findById(qr.createdFor._id)
                    .select("deviceTokens")
                    .lean();
                const tokens = (owner === null || owner === void 0 ? void 0 : owner.deviceTokens) || [];
                if (tokens.length > 0) {
                    yield push_1.push.notifyMany(tokens, "Incoming Video Call 📞", `You have an incoming video call from ${userName || "a user"}`, {
                        qrId: String(qr._id),
                        roomId: channelName,
                        callerName: userName || "",
                        type: mediaType,
                        rtmToken: rtmToken,
                        rtcToken: rtcToken,
                    });
                    notificationSent = true;
                }
            }
        }
    }
    catch (err) {
        console.error("Push notification error in generateToken:", err);
    }
    const data = {
        rtcToken,
        rtmToken,
        uid,
        channelName,
        notificationSent,
    };
    return (0, ApiResponse_1.ApiResponse)(res, 200, "Token created successfully", true, data);
}));
exports.generateTokenForOwner = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const channelName = String(req.query.channel) || "owner-channel";
    const uid = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
    if (!uid) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "User ID missing in token payload", false, null, "Authentication Error");
    }
    const expirationInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationInSeconds;
    const rtcToken = agora_access_token_1.RtcTokenBuilder.buildTokenWithAccount(secrets_1.AGORA_APP_ID, secrets_1.AGORA_APP_CERT, channelName, uid, agora_access_token_1.RtcRole.PUBLISHER, privilegeExpiredTs);
    const rtmToken = agora_access_token_1.RtmTokenBuilder.buildToken(secrets_1.AGORA_APP_ID, secrets_1.AGORA_APP_CERT, uid.toString(), agora_access_token_1.RtmRole.Rtm_User, privilegeExpiredTs);
    const data = {
        rtcToken,
        rtmToken,
        uid,
        channelName,
    };
    return (0, ApiResponse_1.ApiResponse)(res, 200, "Owner token created successfully", true, data);
}));
