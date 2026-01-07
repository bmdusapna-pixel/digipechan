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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQRBySerialNumberHandler = exports.updateQRPermissions = exports.checkQRValidity = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const mongoose_1 = __importDefault(require("mongoose"));
const qrModel_1 = require("../../models/qr-flow/qrModel");
const ApiResponse_1 = require("../../config/ApiResponse");
const constants_1 = require("../../config/constants");
const paymentTransaction_1 = require("../../models/transaction/paymentTransaction");
const qrSchema_1 = require("../../validators/qr-flow/qrSchema");
exports.checkQRValidity = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { serialNumber } = req.body;
    const QR = yield qrModel_1.QRModel.findOne({ serialNumber: serialNumber });
    if (!QR)
        return (0, ApiResponse_1.ApiResponse)(res, 400, "No QR found with this serial number", false, null);
    if (QR.qrStatus === constants_1.QRStatus.PENDING_PAYMENT ||
        QR.qrStatus === constants_1.QRStatus.REJECTED)
        return (0, ApiResponse_1.ApiResponse)(res, 200, "The QR is not yet activated.", true, {
            qrStatus: QR.qrStatus,
        });
    const transactionId = QR === null || QR === void 0 ? void 0 : QR.transactionId;
    const transaction = yield paymentTransaction_1.PaymentTransaction.findById(transactionId);
    if (!transaction)
        return (0, ApiResponse_1.ApiResponse)(res, 200, "No Valid Transaction found for this one!", true, {
            qrStatus: QR.qrStatus,
        });
    return (0, ApiResponse_1.ApiResponse)(res, 200, "QR Information fetched successfully", true, {
        qrInfo: QR,
        transaction: transaction,
    });
}));
exports.updateQRPermissions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const qrId = ((_a = req.params) === null || _a === void 0 ? void 0 : _a.qrId) || req.query.qrId ||
            ((_b = req.body) === null || _b === void 0 ? void 0 : _b.qrId);
        if (!qrId || !mongoose_1.default.Types.ObjectId.isValid(qrId)) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Invalid or missing qrId", false, null);
        }
        const qr = yield qrModel_1.QRModel.findById(qrId);
        if (!qr) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "QR not found", false, null);
        }
        const allowed = [
            "textMessagesAllowed",
            "voiceCallsAllowed",
            "videoCallsAllowed",
        ];
        const body = req.body || {};
        const fieldsToUpdate = allowed.filter((f) => Object.prototype.hasOwnProperty.call(body, f));
        const update = {};
        if (fieldsToUpdate.length === 0) {
            // No specific fields provided: apply global toggle
            const anyTrue = Boolean(qr.textMessagesAllowed) ||
                Boolean(qr.voiceCallsAllowed) ||
                Boolean(qr.videoCallsAllowed);
            const newVal = !anyTrue; // if any true -> newVal false, else true
            update.textMessagesAllowed = newVal;
            update.voiceCallsAllowed = newVal;
            update.videoCallsAllowed = newVal;
        }
        else {
            // Only update provided fields. For those fields, if any is currently true -> set all provided to false, else set all provided to true
            const anyProvidedTrue = fieldsToUpdate.some((f) => Boolean(qr[f]));
            const newVal = !anyProvidedTrue;
            for (const f of fieldsToUpdate)
                update[f] = newVal;
        }
        const updated = yield qrModel_1.QRModel.findByIdAndUpdate(qrId, { $set: update }, { new: true });
        return (0, ApiResponse_1.ApiResponse)(res, 200, "QR permissions updated", true, updated);
    }
    catch (err) {
        console.error("Error in updateQRPermissions:", err);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to update QR permissions", false, null, err === null || err === void 0 ? void 0 : err.message);
    }
}));
exports.updateQRBySerialNumberHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const qrInfo = req.body;
    const validation = qrSchema_1.qrUpdateSchema.safeParse(qrInfo);
    console.log("Validation Error : ", validation.error);
    if (!validation.success)
        return (0, ApiResponse_1.ApiResponse)(res, 400, "Error occurred in validation", false, null);
    const _b = validation.data, { serialNumber } = _b, updateData = __rest(_b, ["serialNumber"]);
    // Check if QR exists and get current status
    const existingQR = yield qrModel_1.QRModel.findOne({ serialNumber });
    if (!existingQR) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, "QR with given serial number not found.", false, null);
    }
    // Prevent activation of QRs in PENDING_PAYMENT or REJECTED status
    if ((existingQR.qrStatus === constants_1.QRStatus.PENDING_PAYMENT ||
        existingQR.qrStatus === constants_1.QRStatus.REJECTED) &&
        updateData.qrStatus === constants_1.QRStatus.ACTIVE) {
        return (0, ApiResponse_1.ApiResponse)(res, 403, existingQR.qrStatus === constants_1.QRStatus.PENDING_PAYMENT
            ? "Cannot activate QR while payment is pending approval."
            : "Cannot activate QR that has been rejected. Payment is required.", false, null);
    }
    const updatedQR = yield qrModel_1.QRModel.findOneAndUpdate({ serialNumber }, {
        $set: Object.assign({ createdFor: (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId }, updateData),
    }, {
        new: true,
        runValidators: true,
    });
    return (0, ApiResponse_1.ApiResponse)(res, 200, "QR updated successfully.", true, updatedQR);
}));
