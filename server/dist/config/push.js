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
exports.push = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
function initAdmin() {
    if (firebase_admin_1.default.apps.length > 0) {
        return firebase_admin_1.default.app();
    }
    if (!process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT_BASE64 is missing");
    }
    console.log("FIREBASE_SERVICE_ACCOUNT_BASE64 length:", process.env.FIREBASE_SERVICE_ACCOUNT_BASE64.length);
    let serviceAccount;
    try {
        serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf-8"));
    }
    catch (err) {
        console.error("Failed to parse Firebase service account:", err);
        throw new Error("Invalid FIREBASE_SERVICE_ACCOUNT_BASE64 JSON");
    }
    return firebase_admin_1.default.initializeApp({
        credential: firebase_admin_1.default.credential.cert(serviceAccount),
    });
}
initAdmin();
exports.push = {
    notifyMany: (tokens_1, title_1, body_1, ...args_1) => __awaiter(void 0, [tokens_1, title_1, body_1, ...args_1], void 0, function* (tokens, title, body, data = {}) {
        if (!(tokens === null || tokens === void 0 ? void 0 : tokens.length)) {
            console.warn("No tokens provided for push notification.");
            return;
        }
        const payloadData = Object.assign(Object.assign({}, data), { timestamp: new Date().toISOString() });
        try {
            const res = yield firebase_admin_1.default.messaging().sendEachForMulticast({
                tokens,
                notification: { title, body },
                data: payloadData,
            });
            console.log("FCM result:", {
                successCount: res.successCount,
                failureCount: res.failureCount,
            });
            const failedTokens = [];
            res.responses.forEach((r, i) => {
                var _a, _b;
                if (!r.success) {
                    const token = tokens[i];
                    const errCode = (_a = r.error) === null || _a === void 0 ? void 0 : _a.code;
                    console.error("❌ FCM error for token:", token, {
                        code: errCode,
                        message: (_b = r.error) === null || _b === void 0 ? void 0 : _b.message,
                    });
                    // 🔴 Handle invalid or expired tokens
                    if (errCode === "messaging/invalid-argument" ||
                        errCode === "messaging/registration-token-not-registered") {
                        failedTokens.push(token);
                        // 👉 Here you should remove token from DB
                        // Example (if you have a User collection):
                        // await User.updateMany(
                        //   { deviceTokens: token },
                        //   { $pull: { deviceTokens: token } }
                        // );
                        console.log(`🗑️ Removed invalid FCM token: ${token}`);
                    }
                }
            });
            return Object.assign(Object.assign({}, res), { failedTokens });
        }
        catch (err) {
            console.error("Unexpected error while sending push:", {
                code: err.code,
                message: err.message,
                stack: err.stack,
            });
            throw err;
        }
    }),
};
