"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.downloadBundleQRs = exports.assignBundleToSalesperson = exports.getBundles = exports.bulkGenerateQRs = exports.updateOrderInformation = exports.getAllOrderInformation = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ApiResponse_1 = require("../../../config/ApiResponse");
const constants_1 = require("../../../config/constants");
const qrModel_1 = require("../../../models/qr-flow/qrModel");
const paymentTransaction_1 = require("../../../models/transaction/paymentTransaction");
const bundleModel_1 = require("../../../models/qr-flow/bundleModel");
const salesman_1 = require("../../../models/auth/salesman");
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
            const match = lastBundle.bundleId.match(/BUNDLE-(\d+)/);
            if (match)
                nextNumber = parseInt(match[1], 10) + 1;
        }
        return `BUNDLE-${nextNumber}`;
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
        const serialNumber = (0, generateSerialNumber_1.generateRandomSerialNumber)();
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
        const bundles = yield bundleModel_1.Bundle.find({
            status: "UNASSIGNED",
        })
            .populate("qrTypeId", "qrName qrDescription")
            .populate("createdBy", "firstName lastName email")
            .select("bundleId qrTypeId qrCount createdBy status createdAt")
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
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    try {
        const { bundleId } = req.params;
        // Validate bundleId
        if (!bundleId) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Bundle ID is required", false, null);
        }
        // Find the bundle by its string bundleId and populate related fields
        const bundle = yield bundleModel_1.Bundle.findOne({ bundleId })
            .populate("qrTypeId")
            .populate({ path: "qrIds", select: "serialNumber qrUrl createdAt" })
            .populate("createdBy", "firstName lastName")
            .lean();
        if (!bundle) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "Bundle not found", false, null);
        }
        // Optional: permission check (skip if identities are missing)
        const isAdmin = ((_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a.role) === "ADMIN" ||
            ((_b = req === null || req === void 0 ? void 0 : req.data) === null || _b === void 0 ? void 0 : _b.role) === "ADMIN";
        const requesterId = ((_c = req === null || req === void 0 ? void 0 : req.user) === null || _c === void 0 ? void 0 : _c.id) || ((_d = req === null || req === void 0 ? void 0 : req.data) === null || _d === void 0 ? void 0 : _d.userId);
        const createdById = (_g = (_f = (_e = bundle === null || bundle === void 0 ? void 0 : bundle.createdBy) === null || _e === void 0 ? void 0 : _e._id) === null || _f === void 0 ? void 0 : _f.toString) === null || _g === void 0 ? void 0 : _g.call(_f);
        if (!isAdmin &&
            createdById &&
            requesterId &&
            createdById !== requesterId) {
            return (0, ApiResponse_1.ApiResponse)(res, 403, "Access denied", false, null);
        }
        // Get QR type information
        const qrType = bundle.qrTypeId;
        if (!qrType) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "QR type not found", false, null);
        }
        // Get all QRs in the bundle
        const qrs = bundle.qrIds;
        if (!qrs || qrs.length === 0) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "No QRs found in bundle", false, null);
        }
        // Import pdf-lib
        const { PDFDocument, rgb, StandardFonts } = yield Promise.resolve().then(() => __importStar(require("pdf-lib")));
        const pdfDoc = yield PDFDocument.create();
        const font = yield pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = yield pdfDoc.embedFont(StandardFonts.HelveticaBold);
        // PDF layout settings
        const margin = 50;
        const qrsPerPage = 4; // 4 QRs per page (2 columns × 2 rows)
        const columnsPerPage = 2; // 2 columns
        const rowsPerPage = 2; // 2 rows per column
        const totalPages = Math.ceil(qrs.length / qrsPerPage);
        // Generate PDF pages
        for (let pageNum = 0; pageNum < totalPages; pageNum++) {
            const page = pdfDoc.addPage();
            const { width, height } = page.getSize();
            // Header text
            const headerText = `Bundle: ${bundle.bundleId}`;
            const qrTypeText = `QR Type: ${qrType.qrName}`;
            const totalQRsText = `Total QRs: ${qrs.length}`;
            const createdByText = `Created by: ${((_h = bundle.createdBy) === null || _h === void 0 ? void 0 : _h.firstName) || ""} ${((_j = bundle.createdBy) === null || _j === void 0 ? void 0 : _j.lastName) || ""}`;
            const pageText = `Page ${pageNum + 1} of ${totalPages}`;
            // Draw header
            page.drawText(headerText, {
                x: margin,
                y: height - margin,
                size: 18,
                font: boldFont,
                color: rgb(0, 0, 0),
            });
            page.drawText(qrTypeText, {
                x: margin,
                y: height - margin - 25,
                size: 12,
                font: font,
                color: rgb(0, 0, 0),
            });
            page.drawText(totalQRsText, {
                x: margin,
                y: height - margin - 40,
                size: 12,
                font: font,
                color: rgb(0, 0, 0),
            });
            page.drawText(createdByText, {
                x: margin,
                y: height - margin - 55,
                size: 12,
                font: font,
                color: rgb(0, 0, 0),
            });
            page.drawText(pageText, {
                x: margin,
                y: height - margin - 70,
                size: 10,
                font: font,
                color: rgb(0.5, 0.5, 0.5),
            });
            // Load the template image
            const fs = yield Promise.resolve().then(() => __importStar(require("fs")));
            const path = yield Promise.resolve().then(() => __importStar(require("path")));
            // Use a more robust path resolution that works in both dev and prod
            const templatePath = path.join(__dirname, "template.png");
            let templateImage;
            try {
                const templateBuffer = fs.readFileSync(templatePath);
                templateImage = yield pdfDoc.embedPng(templateBuffer);
                console.log("Template image loaded successfully");
            }
            catch (error) {
                console.error("Failed to load template image from path:", templatePath, error);
                // Try alternative path resolution
                try {
                    const altTemplatePath = path.resolve(__dirname, "template.png");
                    console.log("Trying alternative template path:", altTemplatePath);
                    const templateBuffer = fs.readFileSync(altTemplatePath);
                    templateImage = yield pdfDoc.embedPng(templateBuffer);
                    console.log("Template image loaded successfully from alternative path");
                }
                catch (altError) {
                    console.error("Failed to load template image from alternative path:", altError);
                    // Continue without template if it fails to load
                }
            }
            // Load QR type icon conditionally:
            // If qrType name is "Test" use local policeTag.png; otherwise if qrIcon URL exists, use it.
            let qrTypeIcon;
            try {
                if ((qrType === null || qrType === void 0 ? void 0 : qrType.qrName) === "Test") {
                    const policeIconPath = path.join(__dirname, "policeTag.png");
                    console.log("Police icon path:", policeIconPath);
                    const policeBuffer = fs.readFileSync(policeIconPath);
                    qrTypeIcon = yield pdfDoc.embedPng(policeBuffer);
                    console.log("Police icon loaded successfully");
                }
                else if (qrType === null || qrType === void 0 ? void 0 : qrType.qrIcon) {
                    const iconResponse = yield fetch(qrType.qrIcon);
                    if (iconResponse.ok) {
                        const iconBuffer = yield iconResponse.arrayBuffer();
                        qrTypeIcon = yield pdfDoc.embedPng(iconBuffer);
                        console.log("QR type icon loaded successfully from URL");
                    }
                }
            }
            catch (error) {
                console.error("Failed to load QR type icon:", error);
                // Try alternative path resolution for policeTag.png
                try {
                    if ((qrType === null || qrType === void 0 ? void 0 : qrType.qrName) === "Test") {
                        const altPoliceIconPath = path.resolve(__dirname, "policeTag.png");
                        console.log("Trying alternative police icon path:", altPoliceIconPath);
                        const policeBuffer = fs.readFileSync(altPoliceIconPath);
                        qrTypeIcon = yield pdfDoc.embedPng(policeBuffer);
                        console.log("Police icon loaded successfully from alternative path");
                    }
                }
                catch (altError) {
                    console.error("Failed to load QR type icon from alternative path:", altError);
                }
            }
            // Calculate layout for QRs with template
            const headerHeight = 80; // Reduced from 120 to 80 to give more space for templates
            const availableHeight = height - 2 * margin - headerHeight;
            const availableWidth = width - 2 * margin;
            // Calculate spacing for 2x2 grid
            const templateSize = 250; // Size of the template circle
            const qrSize = 80; // Smaller QR size to fit in the bracket area
            const qrTypeIconSize = 50; // Size for QR type icon
            // Calculate spacing between columns and rows with more space
            const columnSpacing = 50; // Increased spacing between columns
            const rowSpacing = 60; // Fixed 60px spacing between rows
            // Calculate starting X position to center the grid
            const totalWidth = columnsPerPage * templateSize + (columnsPerPage - 1) * columnSpacing;
            const startX = margin + (availableWidth - totalWidth) / 2; // Center the grid
            // Start QR placement below header with reduced spacing
            const startY = height - margin - headerHeight + 60;
            // Draw QRs for this page
            for (let i = 0; i < qrsPerPage; i++) {
                const qrIndex = pageNum * qrsPerPage + i;
                // Stop if we've processed all QRs
                if (qrIndex >= qrs.length)
                    break;
                const qr = qrs[qrIndex];
                // Calculate grid position (2x2 layout)
                const row = Math.floor(i / columnsPerPage); // 0 or 1
                const col = i % columnsPerPage; // 0 or 1
                // Calculate position for current QR
                const x = startX + col * (templateSize + columnSpacing);
                const y = startY - row * (templateSize + rowSpacing) - templateSize / 2 + 20;
                try {
                    // Draw template background if available
                    if (templateImage) {
                        page.drawImage(templateImage, {
                            x: x,
                            y: y - templateSize,
                            width: templateSize,
                            height: templateSize,
                        });
                    }
                    // Draw QR type icon above the QR code if available
                    if (qrTypeIcon) {
                        const iconX = x + (templateSize - qrTypeIconSize) / 2;
                        const iconY = y - templateSize + (templateSize - qrSize) / 2 + qrSize - 20; // Position above QR code
                        page.drawImage(qrTypeIcon, {
                            x: iconX,
                            y: iconY,
                            width: qrTypeIconSize,
                            height: qrTypeIconSize,
                        });
                    }
                    // Fetch the QR image from Cloudinary
                    const response = yield fetch(qr.qrUrl);
                    if (response.ok) {
                        const imageBuffer = yield response.arrayBuffer();
                        const qrImage = yield pdfDoc.embedPng(imageBuffer);
                        // Calculate QR position within template (center of the white circle where brackets are)
                        // The QR should be placed in the exact center of the template
                        const qrX = x + (templateSize - qrSize) / 2;
                        const qrY = y - templateSize + (templateSize - qrSize) / 2 - 40; // Moved down by subtracting 10px
                        // Draw QR code in the center of template (where the brackets are)
                        page.drawImage(qrImage, {
                            x: qrX,
                            y: qrY,
                            width: qrSize,
                            height: qrSize,
                        });
                    }
                }
                catch (error) {
                    console.error(`Failed to fetch QR image for ${qr.serialNumber}:`, error);
                    // Draw placeholder text if image fails to load
                    page.drawText(`QR ${qr.serialNumber}`, {
                        x: x + templateSize / 2 - 30,
                        y: y - templateSize / 2,
                        size: 16,
                        font: boldFont,
                        color: rgb(0.7, 0.7, 0.7),
                    });
                }
            }
        }
        // Generate PDF bytes
        const pdfBytes = yield pdfDoc.save();
        const pdfBuffer = Buffer.from(pdfBytes);
        // Set response headers for file download
        const fileName = `bundle_${bundleId}_qrs.pdf`;
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
        res.setHeader("Content-Length", pdfBuffer.length);
        // Send the PDF file
        res.send(pdfBuffer);
    }
    catch (error) {
        console.error("Error downloading bundle QRs:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to download bundle QRs", false, null);
    }
}));
