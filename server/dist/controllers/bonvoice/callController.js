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
exports.startAutoCallBridge = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const axios_1 = __importDefault(require("axios"));
const bonvoiceCredentialModel_1 = require("../../models/bonvoice/bonvoiceCredentialModel");
const user_1 = require("../../models/auth/user");
const qrModel_1 = require("../../models/qr-flow/qrModel");
const ApiResponse_1 = require("../../config/ApiResponse");
const uuid_1 = require("uuid");
const normalizeAndValidatePhone = (phone) => {
    if (!phone)
        return null;
    const cleaned = phone.replace(/\s+/g, "");
    const regex = /^(\+91)?[0-9]{10}$/;
    return regex.test(cleaned) ? cleaned : null;
};
exports.startAutoCallBridge = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const bonvoice = yield bonvoiceCredentialModel_1.BonvoiceCredential.findOne().sort({
            createdAt: 1,
        });
        if (!bonvoice) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "No Bonvoice credentials found.", false, null, "Missing Bonvoice credentials");
        }
        const user = yield user_1.User.findById((_a = req.data) === null || _a === void 0 ? void 0 : _a.userId);
        if (!user || !user.phoneNumber) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "User or phone number not found.", false, null, "Missing user phone number");
        }
        const userPhone = normalizeAndValidatePhone(user.phoneNumber);
        if (!userPhone) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Invalid user phone number format. Must be +91XXXXXXXXXX or XXXXXXXXXX.", false, null, "Invalid phone number");
        }
        const { qrId } = req.body;
        if (!qrId) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "qrId is required in request body.", false, null, "Validation Error");
        }
        const qr = yield qrModel_1.QRModel.findById(qrId);
        if (!qr || !qr.mobileNumber) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "QR record or mobile number not found.", false, null, "Missing QR data");
        }
        const qrPhone = normalizeAndValidatePhone(qr.mobileNumber);
        if (!qrPhone) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Invalid QR mobile number format. Must be +91XXXXXXXXXX or XXXXXXXXXX.", false, null, "Invalid phone number");
        }
        const eventID = (0, uuid_1.v4)();
        const payload = {
            autocallType: "3",
            destination: userPhone,
            ringStrategy: "ringall",
            legACallerID: bonvoice.did,
            legAChannelID: "1",
            legADialAttempts: "1",
            legBDestination: qrPhone,
            legBCallerID: bonvoice.did,
            legBChannelID: "1",
            legBDialAttempts: "1",
            eventID,
        };
        const response = yield axios_1.default.post("https://backend.pbx.bonvoice.com/autoDialManagement/autoCallBridging/", payload, {
            headers: {
                Authorization: `${bonvoice.token}`,
                "Content-Type": "application/json",
            },
        });
        const { responseCode, responseDescription, responseType } = response.data;
        if (responseCode !== 200 || (responseType === null || responseType === void 0 ? void 0 : responseType.toLowerCase()) !== "success") {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Bonvoice API did not return success.", false, response.data, responseDescription || "Invalid Bonvoice response");
        }
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Auto call bridging initiated successfully.", true, {
            userPhone,
            qrPhone,
            eventID,
            bonvoiceResponse: response.data,
        });
    }
    catch (error) {
        console.error("Bonvoice call bridge error:", error.message);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to initiate auto call bridge.", false, null, error.message || "Internal Server Error");
    }
}));
