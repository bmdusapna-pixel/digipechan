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
exports.sendQuestionNotificationHandler = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const qrModel_1 = require("../../models/qr-flow/qrModel");
const push_1 = require("../../config/push");
const ApiResponse_1 = require("../../config/ApiResponse");
exports.sendQuestionNotificationHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrId } = req.params;
    const { question } = req.body;
    if (!question || typeof question !== "object") {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "A question object is required", false);
    }
    try {
        const qr = yield qrModel_1.QRModel.findById(qrId)
            .populate({
            path: "createdFor",
            select: "deviceTokens firstName lastName",
        })
            .lean();
        if (!qr) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "QR not found", false);
        }
        const owner = qr.createdFor;
        const tokens = (owner === null || owner === void 0 ? void 0 : owner.deviceTokens) || [];
        if (tokens.length === 0) {
            return (0, ApiResponse_1.ApiResponse)(res, 200, "No device tokens found for the QR owner", true);
        }
        yield push_1.push.notifyMany(tokens, "QR Issue Reported", `Someone reported an issue on your QR: "${question.text}"`, {
            qrId,
            id: question.id,
            text: question.text,
            category: question.category,
        });
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Question notification sent successfully", true, {
            ownerName: owner ? `${owner.firstName} ${owner.lastName}` : null,
            questionId: question.id || null,
            questionText: question.text || null,
        });
    }
    catch (err) {
        console.error("Error sending question notification:", err);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to send notification", false);
    }
}));
