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
exports.setCallLog = void 0;
const qrModel_1 = require("../../models/qr-flow/qrModel");
const ApiResponse_1 = require("../../config/ApiResponse");
const bonvoiceCredentialModel_1 = require("../../models/bonvoice/bonvoiceCredentialModel");
const setCallLog = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { qrId } = req.body;
        if (!qrId) {
            (0, ApiResponse_1.ApiResponse)(res, 400, "qrId is required.", false, null, "Validation Error");
            return;
        }
        const qr = yield qrModel_1.QRModel.findById(qrId).populate("createdFor", "_id");
        if (!qr) {
            (0, ApiResponse_1.ApiResponse)(res, 404, "QR not found.", false, null, "Not Found");
            return;
        }
        if (!Array.isArray(qr.callLogs)) {
            qr.callLogs = [];
        }
        qr.callLogs.push({
            time: new Date(),
            connected: false,
        });
        yield qr.save();
        const bonvoiceCredential = yield bonvoiceCredentialModel_1.BonvoiceCredential.findOne();
        if (!bonvoiceCredential) {
            (0, ApiResponse_1.ApiResponse)(res, 404, "Bonvoice credentials not found.", false, null, "Not Found");
            return;
        }
        (0, ApiResponse_1.ApiResponse)(res, 200, "Call has been initiated successfully.", true, {
            createdFor: qr.createdFor,
            qrId: qr._id,
            did: bonvoiceCredential.did,
            lastCall: ((_a = qr.callLogs) === null || _a === void 0 ? void 0 : _a[qr.callLogs.length - 1]) || null,
        });
    }
    catch (error) {
        console.error("Error in setCallLog:", error);
        (0, ApiResponse_1.ApiResponse)(res, 500, "Internal Server Error.", false, null, "Server Error");
    }
});
exports.setCallLog = setCallLog;
