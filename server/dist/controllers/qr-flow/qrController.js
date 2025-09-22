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
exports.updateQRPermissionsByUserHandler = exports.fetchTypesOfQRBasedOnDelivery = exports.fetchGeneratedQRsByUser = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const newQRTypeModel_1 = require("../../models/qr-flow/newQRTypeModel");
const ApiResponse_1 = require("../../config/ApiResponse");
const qrModel_1 = require("../../models/qr-flow/qrModel");
const qrSchema_1 = require("../../validators/qr-flow/qrSchema");
exports.fetchGeneratedQRsByUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, createdFor } = req.query;
    if (!createdFor) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "createdFor is required", false, null);
    }
    try {
        const filter = { createdFor };
        if (userId)
            filter.createdBy = userId;
        const qrs = yield qrModel_1.QRModel.find(filter).select("_id serialNumber qrTypeId qrStatus qrUrl createdBy createdFor");
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Generated QRs fetched successfully", true, qrs);
    }
    catch (error) {
        console.error("Error fetching generated QRs:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch QRs", false, null);
    }
}));
exports.fetchTypesOfQRBasedOnDelivery = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { deliveryType } = req.body;
    if (!deliveryType) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "deliveryType is required", false, null);
    }
    const qrTypes = yield newQRTypeModel_1.QRMetaData.find({
        deliveryType: { $in: [deliveryType] },
    }).select("_id qrName qrDescription qrUseCases productImage originalPrice discountedPrice includeGST stockCount deliveryType");
    return (0, ApiResponse_1.ApiResponse)(res, 200, "QR Types fetched successfully", true, qrTypes);
}));
// Bulk update permission flags for all QRs of a specific user (createdFor = userId)
exports.updateQRPermissionsByUserHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const payload = req.body;
    const validation = qrSchema_1.qrPermissionsUpdateByUserSchema.safeParse(payload);
    if (!validation.success) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "Invalid payload for user-level permissions update", false, null);
    }
    const _d = validation.data, { userId } = _d, updateData = __rest(_d, ["userId"]);
    const result = yield qrModel_1.QRModel.updateMany({ createdFor: userId }, { $set: Object.assign({}, updateData) }, { upsert: false });
    return (0, ApiResponse_1.ApiResponse)(res, 200, "Permissions updated for all QRs of the user", true, {
        matchedCount: (_a = result.matchedCount) !== null && _a !== void 0 ? _a : undefined,
        modifiedCount: (_b = result.modifiedCount) !== null && _b !== void 0 ? _b : undefined,
        acknowledged: (_c = result.acknowledged) !== null && _c !== void 0 ? _c : undefined,
    });
}));
