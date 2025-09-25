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
exports.transferBundleToSalesperson = exports.getSalespersonBundleDetails = exports.getSalespersonCustomers = exports.getSalespersonManagement = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const salesman_1 = require("../../../models/auth/salesman");
const bundleModel_1 = require("../../../models/qr-flow/bundleModel");
const qrModel_1 = require("../../../models/qr-flow/qrModel");
const ApiResponse_1 = require("../../../config/ApiResponse");
const constants_1 = require("../../../config/constants");
exports.getSalespersonManagement = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const salespeople = yield salesman_1.Salesman.find({ isActive: true })
            .select("_id firstName lastName email phoneNumber territory totalQRsSold assignedBundles isVerified")
            .sort({ firstName: 1 });
        const salespersonData = yield Promise.all(salespeople.map((salesperson) => __awaiter(void 0, void 0, void 0, function* () {
            // Get assigned bundles with QR type info
            const assignedBundles = yield bundleModel_1.Bundle.find({
                assignedTo: salesperson._id,
                status: "ASSIGNED",
            })
                .populate("qrTypeId", "qrName qrDescription")
                .select("bundleId qrTypeId qrCount createdAt");
            // Count total QRs assigned
            const totalQRsAssigned = assignedBundles.reduce((sum, bundle) => sum + bundle.qrCount, 0);
            // Count available (unsold) QRs: truly available for sale
            const availableQRs = yield qrModel_1.QRModel.countDocuments({
                bundleId: { $in: assignedBundles.map((b) => b.bundleId) },
                qrStatus: constants_1.QRStatus.INACTIVE,
                createdFor: null,
                $or: [
                    { isSold: { $exists: false } },
                    { isSold: false },
                    { isSold: null },
                ],
            });
            // Count sold QRs: include ACTIVE (customer-activated) or INACTIVE but approved (isSold=true)
            const soldQRs = yield qrModel_1.QRModel.countDocuments({
                bundleId: { $in: assignedBundles.map((b) => b.bundleId) },
                $or: [
                    { qrStatus: constants_1.QRStatus.ACTIVE, createdFor: { $ne: null } },
                    { qrStatus: constants_1.QRStatus.INACTIVE, isSold: true },
                ],
            });
            return {
                _id: salesperson._id,
                name: `${salesperson.firstName} ${salesperson.lastName}`,
                email: salesperson.email,
                phoneNumber: salesperson.phoneNumber,
                territory: salesperson.territory,
                bundlesAssigned: assignedBundles.length,
                totalQRsAssigned,
                availableQRs,
                soldQRs,
                isVerified: salesperson.isVerified,
                bundles: assignedBundles.map((bundle) => {
                    var _a;
                    return ({
                        bundleId: bundle.bundleId,
                        qrTypeName: ((_a = bundle.qrTypeId) === null || _a === void 0 ? void 0 : _a.qrName) || "Unknown",
                        qrCount: bundle.qrCount,
                        createdAt: bundle.createdAt,
                    });
                }),
            };
        })));
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Salesperson management data fetched successfully", true, salespersonData);
    }
    catch (error) {
        console.error("Error fetching salesperson management data:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch salesperson management data", false, null);
    }
}));
exports.getSalespersonCustomers = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { salespersonId } = req.params;
        // Get all bundles assigned to this salesperson
        const assignedBundles = yield bundleModel_1.Bundle.find({
            assignedTo: salespersonId,
            status: "ASSIGNED",
        }).select("bundleId");
        const bundleIds = assignedBundles.map((b) => b.bundleId);
        // Get all customer-related QRs from these bundles with customer info
        // Include:
        // - ACTIVE QRs with createdFor (customer activated)
        // - INACTIVE QRs that are approved/sold (isSold=true) awaiting customer activation
        const soldQRs = yield qrModel_1.QRModel.find({
            bundleId: { $in: bundleIds },
            $or: [
                { qrStatus: constants_1.QRStatus.ACTIVE, createdFor: { $ne: null } },
                { qrStatus: constants_1.QRStatus.INACTIVE, isSold: true },
            ],
        })
            .populate("qrTypeId", "qrName qrDescription")
            .populate("createdFor", "firstName lastName email phoneNumber")
            .select("serialNumber qrTypeId customerName mobileNumber email  createdAt updatedAt bundleId createdFor")
            .sort({ updatedAt: -1 });
        // const customerData = soldQRs.map(qr => ({
        //   qrId: qr._id,
        //   serialNumber: qr.serialNumber,
        //   qrTypeName: qr.qrTypeId?.qrName || 'Unknown',
        //   bundleId: qr.bundleId,
        //   customerName: qr.customerName || `${qr.createdFor?.firstName} ${qr.createdFor?.lastName}` || 'Unknown',
        //   customerPhone: qr.mobileNumber || qr.createdFor?.phoneNumber || '-',
        //   customerEmail: qr.email || qr.createdFor?.email || '-',
        //   vehicleNumber: qr.vehicleNumber || '-',
        //   soldDate: qr.createdAt
        // }));
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Salesperson customers fetched successfully", true, soldQRs);
    }
    catch (error) {
        console.error("Error fetching salesperson customers:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch salesperson customers", false, null);
    }
}));
exports.getSalespersonBundleDetails = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { salespersonId } = req.params;
        // Get all bundles assigned to this salesperson with detailed QR info
        const assignedBundles = yield bundleModel_1.Bundle.find({
            assignedTo: salespersonId,
            status: "ASSIGNED",
        })
            .populate("qrTypeId", "qrName qrDescription originalPrice discountedPrice")
            .select("bundleId qrTypeId qrCount createdAt");
        const bundleDetails = yield Promise.all(assignedBundles.map((bundle) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            // Get QR stats for this bundle
            const qrStats = yield qrModel_1.QRModel.aggregate([
                { $match: { bundleId: bundle.bundleId } },
                {
                    $group: {
                        _id: "$qrStatus",
                        count: { $sum: 1 },
                    },
                },
            ]);
            const activeQRs = ((_a = qrStats.find((stat) => stat._id === constants_1.QRStatus.ACTIVE)) === null || _a === void 0 ? void 0 : _a.count) || 0;
            const inactiveQRs = ((_b = qrStats.find((stat) => stat._id === constants_1.QRStatus.INACTIVE)) === null || _b === void 0 ? void 0 : _b.count) || 0;
            return {
                bundleId: bundle.bundleId,
                // qrTypeName: bundle.qrTypeId?.qrName || "Unknown",
                // qrTypeDescription: bundle.qrTypeId?.qrDescription || "",
                totalQRs: bundle.qrCount,
                soldQRs: activeQRs,
                availableQRs: inactiveQRs,
                createdAt: bundle.createdAt,
            };
        })));
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Salesperson bundle details fetched successfully", true, bundleDetails);
    }
    catch (error) {
        console.error("Error fetching salesperson bundle details:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch salesperson bundle details", false, null);
    }
}));
// Admin: transfer a bundle to another salesperson
exports.transferBundleToSalesperson = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bundleId } = req.params;
        const { targetSalespersonId } = req.body;
        if (!bundleId || !targetSalespersonId) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "bundleId and targetSalespersonId are required", false, null);
        }
        // Validate target salesperson exists and is active
        const targetSalesperson = yield salesman_1.Salesman.findById(targetSalespersonId);
        if (!targetSalesperson || targetSalesperson.isActive === false) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "Target salesperson not found or inactive", false, null);
        }
        // Find bundle
        const bundle = yield bundleModel_1.Bundle.findOne({ bundleId, status: "ASSIGNED" });
        if (!bundle) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "Bundle not found or not assigned", false, null);
        }
        // Block transfer if there are pending payment QRs in this bundle
        const pendingCount = yield qrModel_1.QRModel.countDocuments({
            bundleId,
            qrStatus: constants_1.QRStatus.PENDING_PAYMENT,
        });
        if (pendingCount > 0) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Cannot transfer bundle while there are QRs with pending payment", false, null);
        }
        // Perform transfer (cast _id to ObjectId)
        bundle.assignedTo =
            targetSalesperson._id;
        yield bundle.save();
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Bundle transferred successfully", true, {
            bundleId: bundle.bundleId,
            assignedTo: bundle.assignedTo,
        });
    }
    catch (error) {
        console.error("Error transferring bundle:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to transfer bundle", false, null);
    }
}));
