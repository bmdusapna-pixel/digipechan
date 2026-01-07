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
Object.defineProperty(exports, "__esModule", { value: true });
exports.callWebhook = void 0;
const qrModel_1 = require("../../models/qr-flow/qrModel");
/**
 * Webhook handler for QR code voice call routing
 *
 * Priority Order:
 * 1. Suffix match (if provided) - highest priority
 * 2. Self-call check (owner calling back within 1 hour)
 * 3. Active call update (call within last 30 seconds)
 * 4. Last connected QR fallback
 */
const callWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { did, from, user_input: suffix } = req.body;
        // Validate required parameters
        if (!did || !from) {
            res.status(400).json({
                status: "0",
                message: "Missing 'did' or 'from' parameter",
            });
            return;
        }
        const now = new Date();
        const thirtySecondsAgo = new Date(now.getTime() - 30 * 1000);
        const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        // Helper functions
        const normalizePhone = (num) => {
            if (!num)
                return "";
            return num.replace(/\s+/g, "").replace(/^\+91/, "");
        };
        const formatPhoneNumber = (phone) => {
            const cleaned = phone.replace(/\s+/g, "");
            const without91 = cleaned.startsWith("+91")
                ? cleaned.substring(3)
                : cleaned;
            return without91.substring(0, 10);
        };
        const logCall = (qr, connected) => __awaiter(void 0, void 0, void 0, function* () {
            if (!qr.callLogs)
                qr.callLogs = [];
            qr.callLogs.push({ time: now, connected, from });
            yield qr.save();
        });
        // ========================================
        // PRIORITY 1: SUFFIX MATCH
        // ========================================
        if (suffix) {
            const suffixQR = yield qrModel_1.QRModel.findOne({
                serialNumber: new RegExp(`${suffix}$`),
                voiceCallsAllowed: true,
            });
            if (suffixQR) {
                yield logCall(suffixQR, true);
                if (suffixQR.mobileNumber) {
                    res.json({
                        status: "1",
                        destination: formatPhoneNumber(suffixQR.mobileNumber),
                        message: "returned_via_suffix_match",
                    });
                    return;
                }
                res.json({ status: "0", message: "suffix_matched_no_mobile" });
                return;
            }
            res.json({ status: "0", message: "no_qr_with_suffix" });
            return;
        }
        // ========================================
        // PRIORITY 2: SELF-CALL CHECK (Owner callback)
        // ========================================
        const normalizedFrom = normalizePhone(from);
        const ownerQR = yield qrModel_1.QRModel.findOne({
            mobileNumber: new RegExp(`${normalizedFrom}$`),
            voiceCallsAllowed: true,
        });
        if (ownerQR) {
            // Find all QRs owned by this number
            const ownerQRs = yield qrModel_1.QRModel.find({
                mobileNumber: new RegExp(`${normalizedFrom}$`),
                voiceCallsAllowed: true,
            });
            // Check if any QR has received a call in the last hour
            for (const qr of ownerQRs) {
                if (!((_a = qr.callLogs) === null || _a === void 0 ? void 0 : _a.length))
                    continue;
                const lastLog = qr.callLogs[qr.callLogs.length - 1];
                if (lastLog.time >= oneHourAgo && lastLog.from) {
                    res.json({
                        status: "1",
                        destination: formatPhoneNumber(lastLog.from),
                        message: "returned_via_owner_recent_call",
                    });
                    return;
                }
            }
        }
        // ========================================
        // PRIORITY 3: ACTIVE CALL UPDATE
        // ========================================
        const activeQR = yield qrModel_1.QRModel.findOneAndUpdate({
            callLogs: {
                $elemMatch: {
                    time: { $gte: thirtySecondsAgo, $lte: now },
                    connected: false,
                },
            },
            voiceCallsAllowed: true,
        }, {
            $set: {
                "callLogs.$.connected": true,
                "callLogs.$.from": from
            }
        }, { new: true });
        if (activeQR === null || activeQR === void 0 ? void 0 : activeQR.mobileNumber) {
            res.json({
                status: "1",
                destination: formatPhoneNumber(activeQR.mobileNumber),
                message: "returned_via_active_call_update",
            });
            return;
        }
        // ========================================
        // PRIORITY 4: LAST CONNECTED FALLBACK
        // ========================================
        const lastConnectedQR = yield qrModel_1.QRModel.findOne({
            callLogs: { $elemMatch: { connected: true, from: { $exists: true } } },
            voiceCallsAllowed: true,
        }).sort({ updatedAt: -1 });
        if (lastConnectedQR === null || lastConnectedQR === void 0 ? void 0 : lastConnectedQR.mobileNumber) {
            res.json({
                status: "1",
                destination: formatPhoneNumber(lastConnectedQR.mobileNumber),
                message: "returned_via_last_connected",
            });
            return;
        }
        // ========================================
        // NO MATCH FOUND
        // ========================================
        res.json({
            status: "0",
            message: "No active or previous connected QR found",
        });
    }
    catch (error) {
        console.error("Error in callWebhook:", error);
        res.status(500).json({
            status: "0",
            message: "Internal Server Error",
        });
    }
});
exports.callWebhook = callWebhook;
