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
exports.getSoldQrsForSalesman = exports.salesmanLogin = exports.getSalesmanStats = exports.sellQRToCustomer = exports.getBundleQRs = exports.getSalesmanBundles = exports.getAllSalesmen = exports.registerSalesperson = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const salesman_1 = require("../../models/auth/salesman");
const bundleModel_1 = require("../../models/qr-flow/bundleModel");
const qrModel_1 = require("../../models/qr-flow/qrModel");
const ApiResponse_1 = require("../../config/ApiResponse");
const constants_1 = require("../../config/constants");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("../../secrets");
const enums_1 = require("../../enums/enums");
exports.registerSalesperson = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, phoneNumber, password, territory, altMobileNumber, } = req.body;
        if (!firstName || !lastName || !email || !phoneNumber || !password) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Missing required fields: firstName, lastName, email, phoneNumber, password", false, null);
        }
        // Check if salesperson with email already exists
        const existingSalesperson = yield salesman_1.Salesman.findOne({ email });
        if (existingSalesperson) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Salesperson with this email already exists", false, null);
        }
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create salesperson (self-registered, not auto-verified)
        const newSalesperson = yield salesman_1.Salesman.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            altMobileNumber,
            password: hashedPassword,
            roles: [enums_1.UserRoles.SALESPERSON],
            isVerified: false, // <-- IMPORTANT difference
            territory,
            isActive: true,
        });
        // Return limited info (no password)
        const salespersonResponse = {
            _id: newSalesperson._id,
            firstName: newSalesperson.firstName,
            lastName: newSalesperson.lastName,
            email: newSalesperson.email,
            phoneNumber: newSalesperson.phoneNumber,
            territory: newSalesperson.territory,
            isActive: newSalesperson.isActive,
            isVerified: newSalesperson.isVerified,
            createdAt: (newSalesperson === null || newSalesperson === void 0 ? void 0 : newSalesperson.createdAt) || new Date(),
        };
        return (0, ApiResponse_1.ApiResponse)(res, 201, "Salesperson registered successfully. Awaiting verification.", true, salespersonResponse);
    }
    catch (error) {
        console.error("Error registering salesperson:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to register salesperson", false, null);
    }
}));
// Get all active salesmen
exports.getAllSalesmen = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const salesmen = yield salesman_1.Salesman.find({ isActive: true })
            .select("_id firstName lastName email phoneNumber territory totalQRsSold")
            .sort({ firstName: 1 });
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Salesmen fetched successfully", true, salesmen);
    }
    catch (error) {
        console.error("Error fetching salesmen:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch salesmen", false, null);
    }
}));
// Get salesman assigned bundles
exports.getSalesmanBundles = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const salesmanId = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
        const bundles = yield bundleModel_1.Bundle.find({
            assignedTo: salesmanId,
            status: "ASSIGNED",
        })
            .populate("qrTypeId", "qrName qrDescription originalPrice discountedPrice")
            .populate("createdBy", "firstName lastName email")
            .select("bundleId qrTypeId qrCount status createdAt qrIds")
            .sort({ createdAt: -1 });
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Assigned bundles fetched successfully", true, bundles);
    }
    catch (error) {
        console.error("Error fetching salesman bundles:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch bundles", false, null);
    }
}));
// Get QRs in a specific bundle for salesman
exports.getBundleQRs = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { bundleId } = req.params;
        const salesmanId = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
        // Verify bundle belongs to this salesman
        const bundle = yield bundleModel_1.Bundle.findOne({
            bundleId,
            assignedTo: salesmanId,
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
                pricePerQr: (_b = bundle === null || bundle === void 0 ? void 0 : bundle.pricePerQr) !== null && _b !== void 0 ? _b : null,
            },
            qrs,
        });
    }
    catch (error) {
        console.error("Error fetching bundle QRs:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch bundle QRs", false, null);
    }
}));
// Sell individual QR to customer
exports.sellQRToCustomer = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { qrId, customerId, customerDetails } = req.body;
        const salesmanId = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
        if (!qrId || !customerId) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Missing required fields: qrId, customerId", false, null);
        }
        // Find QR and verify it belongs to salesman's bundle
        const qr = yield qrModel_1.QRModel.findById(qrId);
        if (!qr) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "QR not found", false, null);
        }
        // Verify bundle belongs to salesman
        const bundle = yield bundleModel_1.Bundle.findOne({
            bundleId: qr.bundleId,
            assignedTo: salesmanId,
        });
        if (!bundle) {
            return (0, ApiResponse_1.ApiResponse)(res, 403, "QR not in your assigned bundles", false, null);
        }
        // Check if QR is already sold or pending payment
        if (qr.createdFor && qr.qrStatus === constants_1.QRStatus.ACTIVE) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "QR already sold to another customer", false, null);
        }
        // Check if QR is in pending payment or rejected status
        if (qr.qrStatus === constants_1.QRStatus.PENDING_PAYMENT) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "QR is pending payment approval and cannot be sold", false, null);
        }
        if (qr.qrStatus === constants_1.QRStatus.REJECTED) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "QR payment was rejected and cannot be sold without new payment", false, null);
        }
        // Update QR with customer details
        const updatedQR = yield qrModel_1.QRModel.findByIdAndUpdate(qrId, {
            createdFor: customerId,
            soldBySalesperson: salesmanId,
            qrStatus: constants_1.QRStatus.ACTIVE,
            customerName: customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.name,
            mobileNumber: customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.phone,
            email: customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.email,
            vehicleNumber: customerDetails === null || customerDetails === void 0 ? void 0 : customerDetails.vehicleNumber,
        }, { new: true });
        // Update salesman's sold count
        yield salesman_1.Salesman.findByIdAndUpdate(salesmanId, {
            $inc: { totalQRsSold: 1 },
        });
        return (0, ApiResponse_1.ApiResponse)(res, 200, "QR sold to customer successfully", true, updatedQR);
    }
    catch (error) {
        console.error("Error selling QR:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to sell QR", false, null);
    }
}));
// Get salesman sales statistics
exports.getSalesmanStats = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const salesmanId = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
        const salesman = yield salesman_1.Salesman.findById(salesmanId).select("firstName lastName totalQRsSold digitalWalletCoins assignedBundles");
        if (!salesman) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "Salesman not found", false, null);
        }
        const totalBundles = salesman.assignedBundles.length;
        // Count available QRs (not sold yet)
        const availableQRs = yield qrModel_1.QRModel.countDocuments({
            bundleId: {
                $in: yield bundleModel_1.Bundle.find({ assignedTo: salesmanId }).distinct("bundleId"),
            },
            qrStatus: constants_1.QRStatus.INACTIVE,
            createdFor: null,
        });
        // Count sold QRs - should match the same logic as totalQRsSold
        // Only count QRs that are actually sold and activated by customers
        const soldQRs = yield qrModel_1.QRModel.countDocuments({
            $and: [{ soldBySalesperson: salesmanId }, { isSold: true }],
        });
        const stats = {
            salesmanInfo: {
                name: `${salesman.firstName} ${salesman.lastName}`,
                totalQRsSold: soldQRs, // Use computed count instead of stored field
                digitalWalletCoins: salesman.digitalWalletCoins,
            },
            inventory: {
                totalBundles,
                availableQRs,
                soldQRs,
            },
        };
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Salesman statistics fetched successfully", true, stats);
    }
    catch (error) {
        console.error("Error fetching salesman stats:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch statistics", false, null);
    }
}));
exports.salesmanLogin = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body || {};
    if (!email || !password) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "Email and password are required", false, null);
    }
    const salesman = yield salesman_1.Salesman.findOne({ email }).select("+password");
    if (!salesman) {
        return (0, ApiResponse_1.ApiResponse)(res, 401, "Invalid credentials", false, null);
    }
    if (!salesman.isActive) {
        return (0, ApiResponse_1.ApiResponse)(res, 403, "Account is inactive", false, null);
    }
    if (!salesman.isVerified) {
        return (0, ApiResponse_1.ApiResponse)(res, 403, "Account is not verified", false, null);
    }
    const match = yield bcrypt_1.default.compare(password, salesman.password);
    if (!match) {
        return (0, ApiResponse_1.ApiResponse)(res, 401, "Invalid credentials", false, null);
    }
    const token = jsonwebtoken_1.default.sign({ userId: salesman._id, roles: [enums_1.UserRoles.SALESPERSON] }, secrets_1.JWT_SECRET, { expiresIn: "7d" });
    // Mirror user login cookie behavior
    const cookieOptions = {
        httpOnly: true,
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    if (process.env.NODE_ENV === "production") {
        cookieOptions.secure = true;
        cookieOptions.sameSite = "none";
    }
    else {
        cookieOptions.secure = false;
        cookieOptions.sameSite = "lax";
    }
    res.cookie("token", token, cookieOptions);
    return (0, ApiResponse_1.ApiResponse)(res, 200, "Login successful", true, { token });
}));
// Get sold QRs for the logged-in salesperson with optional status filter
exports.getSoldQrsForSalesman = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const salesmanId = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
        const bundleIds = yield bundleModel_1.Bundle.find({ assignedTo: salesmanId }).distinct("bundleId");
        const match = {
            $and: [
                { soldBySalesperson: salesmanId },
                { isSold: true },
                { bundleId: { $in: bundleIds } },
            ],
        };
        const qrs = yield qrModel_1.QRModel.find(match)
            .select("_id serialNumber qrStatus qrUrl createdAt createdFor bundleId soldBySalesperson isSold")
            .sort({ createdAt: -1 })
            .lean();
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Sold QRs fetched", true, { qrs });
    }
    catch (error) {
        console.error("Error fetching sold QRs:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch sold QRs", false, null);
    }
}));
