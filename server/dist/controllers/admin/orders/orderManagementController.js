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
exports.getBundleQRs = exports.downloadSharedBundle = exports.generateShareLink = exports.downloadBundleQRs = exports.assignBundleToSalesperson = exports.getBundles = exports.bulkGenerateQRs = exports.updateOrderInformation = exports.getAllOrderInformation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ApiResponse_1 = require("../../../config/ApiResponse");
const constants_1 = require("../../../config/constants");
const qrModel_1 = require("../../../models/qr-flow/qrModel");
const paymentTransaction_1 = require("../../../models/transaction/paymentTransaction");
const bundleModel_1 = require("../../../models/qr-flow/bundleModel");
const salesman_1 = require("../../../models/auth/salesman");
const pdfGenerator_1 = require("../../../utils/pdfGenerator");
const crypto_1 = __importDefault(require("crypto"));
const secrets_1 = require("../../../secrets");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const newQRTypeModel_1 = require("../../../models/qr-flow/newQRTypeModel");
const qrcode_1 = __importDefault(require("qrcode"));
const uploadToCloudinary_1 = require("../../../config/uploadToCloudinary");
const generateSerialNumber_1 = require("../../../utils/generateSerialNumber");
const getAllOrderInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10 } = req.body;
        const pageNumber = parseInt(page);
        const pageSize = parseInt(limit);
        const skip = (pageNumber - 1) * pageSize;
        const searchRegex = new RegExp(search, "i");
        const searchCondition = search
            ? {
                $or: [
                    { serialNumber: { $regex: searchRegex } },
                    { customerName: { $regex: searchRegex } },
                    { mobileNumber: { $regex: searchRegex } },
                ],
            }
            : {};
        const qrData = yield qrModel_1.QRModel.aggregate([
            { $match: searchCondition },
            {
                $lookup: {
                    from: constants_1.COLLECTION_NAMES.PAYMENT_HISTORY,
                    localField: "transactionId",
                    foreignField: "_id",
                    as: "transaction",
                },
            },
            {
                $unwind: {
                    path: "$transaction",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $project: {
                    qrId: "$_id",
                    _id: 0,
                    transactionID: "$transaction.transactionId",
                    deliveryType: "$deliveryType",
                    serialNumber: 1,
                    customerName: 1,
                    phoneNumber: "$mobileNumber",
                    orderDate: {
                        $dateToString: {
                            format: "%d/%m/%Y",
                            date: "$createdAt",
                        },
                    },
                    orderStatus: 1,
                    paymentStatus: "$transaction.status",
                    qrStatus: 1,
                    vehicleNumber: 1,
                    gstNumber: 1,
                },
            },
            { $sort: { createdDate: -1 } },
            { $skip: skip },
            { $limit: pageSize },
        ]);
        const totalCount = yield qrModel_1.QRModel.countDocuments(searchCondition);
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Information fetched successfully", true, {
            total: totalCount,
            page: pageNumber,
            pageSize,
            data: qrData,
        });
    }
    catch (error) {
        console.error("Error fetching order info:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed fetching information", false, error);
    }
});
exports.getAllOrderInformation = getAllOrderInformation;
const updateOrderInformation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { qrId } = _a, updateFields = __rest(_a, ["qrId"]);
        if (!qrId || !mongoose_1.default.Types.ObjectId.isValid(qrId)) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Invalid or missing QR Id", false);
        }
        if (updateFields.paymentStatus) {
            const qr = yield qrModel_1.QRModel.findById(qrId).select("transactionId").lean();
            if (qr === null || qr === void 0 ? void 0 : qr.transactionId) {
                console.log("Payment ID : ", qr.transactionId);
                const transaction = yield paymentTransaction_1.PaymentTransaction.findByIdAndUpdate(qr.transactionId, { status: updateFields.paymentStatus }, { new: true });
                if (!transaction) {
                    return (0, ApiResponse_1.ApiResponse)(res, 404, "Transaction not found", false);
                }
            }
        }
        const updatedDoc = yield qrModel_1.QRModel.findByIdAndUpdate(qrId, { $set: updateFields }, { new: true });
        if (!updatedDoc) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "QR document not found", false);
        }
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Order information updated successfully", true, updatedDoc);
    }
    catch (error) {
        console.error("Error updating order info:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to update order information", false, error);
    }
});
exports.updateOrderInformation = updateOrderInformation;
exports.bulkGenerateQRs = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const getNextBundleId = () => __awaiter(void 0, void 0, void 0, function* () {
        const lastBundle = yield bundleModel_1.Bundle.findOne({})
            .sort({ createdAt: -1 }) // get the latest bundle
            .lean();
        let nextNumber = 1;
        if (lastBundle === null || lastBundle === void 0 ? void 0 : lastBundle.bundleId) {
            const match = lastBundle.bundleId.match(/DIGI(\d+)/);
            if (match)
                nextNumber = parseInt(match[1], 10) + 1;
        }
        return `DIGI${nextNumber}`;
    });
    const { quantity, price, qrTypeId, tagType, questions } = req.body;
    if (!quantity || !qrTypeId || price === undefined) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "Missing required fields: quantity, price, qrTypeId", false, null);
    }
    const num = parseInt(quantity);
    const unitPrice = parseFloat(price);
    if (isNaN(num) || num <= 0 || num > 100) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "Invalid quantity (must be 1-100)", false, null);
    }
    if (isNaN(unitPrice) || unitPrice <= 0) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "Invalid price (must be greater than 0)", false, null);
    }
    const qrType = yield newQRTypeModel_1.QRMetaData.findById(qrTypeId);
    if (!qrType) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, "QR Type not found", false, null);
    }
    // Update QR type with tag type and questions if provided
    if (tagType || questions) {
        const updateData = {};
        if (tagType)
            updateData.tagType = tagType;
        if (questions && questions.length > 0)
            updateData.questions = questions;
        yield newQRTypeModel_1.QRMetaData.findByIdAndUpdate(qrTypeId, updateData);
    }
    const adminId = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
    const frontendUrl = secrets_1.NODE_ENV === "dev"
        ? secrets_1.FRONTEND_BASE_URL_DEV
        : secrets_1.FRONTEND_BASE_URL_PROD_DOMAIN;
    const generatedQRs = [];
    // Generate unique bundle ID
    const bundleId = yield getNextBundleId();
    for (let i = 0; i < num; i++) {
        const qrId = new mongoose_1.default.Types.ObjectId();
        const qrRawData = `${frontendUrl}/qr/scan/${qrId.toString()}`;
        const qrBuffer = yield qrcode_1.default.toBuffer(qrRawData, { type: "png" });
        const cloudinaryResult = yield (0, uploadToCloudinary_1.uploadToCloudinary)(qrBuffer, "qr_codes/", "image");
        const serialNumber = (0, generateSerialNumber_1.generateRandomSerialNumber)(bundleId);
        const qr = yield qrModel_1.QRModel.create({
            _id: qrId,
            qrTypeId,
            serialNumber,
            createdBy: adminId,
            createdFor: null, // For later assignment
            deliveryType: null, // Will be set when assigned to salesperson
            shippingDetails: null,
            transactionId: null,
            qrRawData,
            qrUrl: cloudinaryResult.secure_url,
            orderStatus: null, // Will be set when assigned
            qrStatus: constants_1.QRStatus.INACTIVE,
            bundleId: bundleId, // Add bundle ID to QR
            price: unitPrice,
            questions: questions || [], // Add questions to each QR
        });
        generatedQRs.push(qr);
    }
    // Create bundle record
    const bundle = yield bundleModel_1.Bundle.create({
        bundleId,
        qrTypeId,
        qrCount: num,
        createdBy: adminId,
        qrIds: generatedQRs.map((qr) => qr._id),
        status: "UNASSIGNED",
        pricePerQr: unitPrice,
    });
    return (0, ApiResponse_1.ApiResponse)(res, 200, `Successfully generated bundle with ${num} QR codes`, true, { bundleId, qrIds: generatedQRs.map((qr) => qr._id) });
}));
exports.getBundles = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bundles = yield bundleModel_1.Bundle.find({})
            .populate("qrTypeId", "qrName qrDescription")
            .populate("createdBy", "firstName lastName email")
            .populate({
            path: "assignmentHistory.salesperson",
            select: "firstName lastName email phoneNumber isVerified",
        })
            .populate({
            path: "assignedTo",
            select: "firstName lastName email phoneNumber isVerified",
        })
            .select("bundleId qrTypeId qrCount createdBy status createdAt assignmentHistory")
            .sort({ createdAt: -1 });
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Bundles fetched successfully", true, bundles);
    }
    catch (error) {
        console.error("Error fetching bundles:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch bundles", false, null);
    }
}));
exports.assignBundleToSalesperson = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bundleId, salespersonId, deliveryType } = req.body;
        if (!bundleId || !salespersonId || !deliveryType) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Missing required fields: bundleId, salespersonId, deliveryType", false, null);
        }
        // Update bundle
        const updatedBundle = yield bundleModel_1.Bundle.findOneAndUpdate({ bundleId }, {
            assignedTo: salespersonId,
            deliveryType,
            status: "ASSIGNED",
        }, { new: true });
        if (!updatedBundle) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "Bundle not found", false, null);
        }
        // Update all QRs in the bundle - set createdBy to salesperson, but keep createdFor null until sold
        yield qrModel_1.QRModel.updateMany({ bundleId }, {
            deliveryType,
            orderStatus: deliveryType === "ETAG" ? "DELIVERED" : "SHIPPED",
        });
        // Add bundle to salesman's assigned bundles
        yield salesman_1.Salesman.findByIdAndUpdate(salespersonId, {
            $addToSet: { assignedBundles: updatedBundle._id },
        });
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Bundle assigned to salesperson successfully", true, updatedBundle);
    }
    catch (error) {
        console.error("Error assigning bundle:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to assign bundle", false, null);
    }
}));
exports.downloadBundleQRs = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    const { bundleId } = req.params;
    if (!bundleId) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "Bundle ID is required", false, null);
    }
    const bundle = yield bundleModel_1.Bundle.findOne({ bundleId })
        .populate("qrTypeId")
        .populate({ path: "qrIds", select: "serialNumber qrUrl createdAt" })
        .populate("createdBy", "firstName lastName")
        .lean();
    if (!bundle) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, "Bundle not found", false, null);
    }
    // Permission check
    const isAdmin = ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role) === "ADMIN" ||
        ((_b = req === null || req === void 0 ? void 0 : req.data) === null || _b === void 0 ? void 0 : _b.role) === "ADMIN";
    const requesterId = ((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.id) || ((_d = req === null || req === void 0 ? void 0 : req.data) === null || _d === void 0 ? void 0 : _d.userId);
    const createdById = (_g = (_f = (_e = bundle === null || bundle === void 0 ? void 0 : bundle.createdBy) === null || _e === void 0 ? void 0 : _e._id) === null || _f === void 0 ? void 0 : _f.toString) === null || _g === void 0 ? void 0 : _g.call(_f);
    if (!isAdmin && createdById && requesterId && createdById !== requesterId) {
        return (0, ApiResponse_1.ApiResponse)(res, 403, "Access denied", false, null);
    }
    if (!bundle.qrTypeId) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, "QR type not found", false, null);
    }
    if (!bundle.qrIds || bundle.qrIds.length === 0) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, "No QRs found in bundle", false, null);
    }
    const pdfBuffer = yield (0, pdfGenerator_1.generateBundlePDF)(bundle);
    const fileName = `bundle_${bundleId}_qrs.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
}));
// Admin: Generate share link (auth required)
exports.generateShareLink = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bundleId } = req.params;
    const bundle = yield bundleModel_1.Bundle.findOne({ bundleId });
    if (!bundle) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, "Bundle not found", false, null);
    }
    const token = crypto_1.default.randomBytes(24).toString("hex");
    bundle.shareToken = token;
    bundle.shareTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    yield bundle.save();
    const shareUrl = `${secrets_1.BACKEND_PROD_URL}/api/admin/share/bundles/${token}`;
    return (0, ApiResponse_1.ApiResponse)(res, 200, "Share link generated", true, { shareUrl });
}));
// Public: Download via share link (no auth)
exports.downloadSharedBundle = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const bundle = yield bundleModel_1.Bundle.findOne({
        shareToken: token,
        shareTokenExpiresAt: { $gt: new Date() },
    })
        .populate("qrTypeId")
        .populate({ path: "qrIds", select: "serialNumber qrUrl createdAt" })
        .populate("createdBy", "firstName lastName")
        .lean();
    if (!bundle) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, "Invalid or expired share link", false, null);
    }
    const pdfBuffer = yield (0, pdfGenerator_1.generateBundlePDF)(bundle);
    const fileName = `bundle_${bundle.bundleId}_qrs.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
}));
// Get QRs in a specific bundle for salesman
exports.getBundleQRs = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { bundleId } = req.params;
        // Verify bundle belongs to this salesman
        const bundle = yield bundleModel_1.Bundle.findOne({
            bundleId,
        }).populate("qrTypeId", "qrName");
        if (!bundle) {
            return (0, ApiResponse_1.ApiResponse)(res, 403, "Bundle not found or not assigned to you", false, null);
        }
        const qrs = yield qrModel_1.QRModel.find({ bundleId })
            .populate("qrTypeId", "qrName qrDescription")
            .select("_id serialNumber qrTypeId qrStatus qrUrl createdAt createdFor price isSold soldBySalesperson")
            .sort({ createdAt: -1 });
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Bundle QRs fetched successfully", true, {
            bundle: {
                bundleId: bundle.bundleId,
                qrCount: bundle.qrCount,
                qrTypeName: bundle === null || bundle === void 0 ? void 0 : bundle.qrTypeId,
                deliveryType: bundle.deliveryType,
                pricePerQr: (_a = bundle === null || bundle === void 0 ? void 0 : bundle.pricePerQr) !== null && _a !== void 0 ? _a : null,
            },
            qrs,
        });
    }
    catch (error) {
        console.error("Error fetching bundle QRs:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch bundle QRs", false, null);
    }
}));
