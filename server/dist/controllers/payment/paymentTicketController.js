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
exports.getAllPaymentTickets = exports.updatePaymentTicketStatus = exports.getSalespersonTickets = exports.createPaymentTicket = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const paymentTicket_1 = require("../../models/payment/paymentTicket");
const qrModel_1 = require("../../models/qr-flow/qrModel");
const salesman_1 = require("../../models/auth/salesman");
const ApiResponse_1 = require("../../config/ApiResponse");
const constants_1 = require("../../config/constants");
const bundleModel_1 = require("../../models/qr-flow/bundleModel");
const uploadToCloudinary_1 = require("../../config/uploadToCloudinary");
// Salesperson creates a payment ticket for offline payment
exports.createPaymentTicket = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const salespersonId = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
        const { customerName, customerPhone, customerEmail, qrIds: qrIdsRaw, bundleId, amount, paymentMethod, } = req.body;
        // Handle qrIds - it might come as string or array from FormData
        const qrIds = Array.isArray(qrIdsRaw) ? qrIdsRaw : [qrIdsRaw];
        // Handle file upload if present
        let paymentProofUrl;
        if (req.file) {
            try {
                const cloudinaryResult = yield (0, uploadToCloudinary_1.uploadToCloudinary)(req.file.buffer, `payment-proofs/${salespersonId}`, req.file.mimetype.startsWith("image/") ? "image" : "raw");
                paymentProofUrl = cloudinaryResult.secure_url;
            }
            catch (uploadError) {
                console.error("File upload error:", uploadError);
                return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to upload payment proof", false, null);
            }
        }
        if (!customerName ||
            !customerPhone ||
            !qrIds ||
            !bundleId ||
            !amount ||
            !paymentMethod) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Missing required fields", false, null);
        }
        // Verify salesperson exists
        const salesperson = yield salesman_1.Salesman.findById(salespersonId);
        if (!salesperson) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "Salesperson not found", false, null);
        }
        // Verify QRs belong to salesperson's bundle and are available
        const qrs = yield qrModel_1.QRModel.find({
            _id: { $in: qrIds },
            bundleId,
            qrStatus: constants_1.QRStatus.INACTIVE, // Only INACTIVE QRs can be selected for payment tickets
        });
        // Check if any of these QRs are already in pending tickets
        const existingPendingTickets = yield paymentTicket_1.PaymentTicket.find({
            qrIds: { $in: qrIds },
            status: "PENDING",
        });
        if (existingPendingTickets.length > 0) {
            const conflictingQrIds = existingPendingTickets.flatMap((ticket) => ticket.qrIds);
            const uniqueConflictingQrIds = [
                ...new Set(conflictingQrIds.map((id) => id.toString())),
            ];
            return (0, ApiResponse_1.ApiResponse)(res, 400, `Some QRs are already in pending payment tickets: ${uniqueConflictingQrIds.slice(0, 3).join(", ")}${uniqueConflictingQrIds.length > 3 ? "..." : ""}`, false, null);
        }
        console.log("=== QR VALIDATION DEBUG ===");
        console.log("Requested QR IDs:", qrIds);
        console.log("Bundle ID:", bundleId);
        console.log("Found QRs:", qrs.length);
        console.log("Expected QRs:", qrIds.length);
        console.log("Found QR IDs:", qrs.map((qr) => qr._id.toString()));
        console.log("==========================");
        if (qrs.length !== qrIds.length) {
            // Get more details about what's missing
            const foundQrIds = qrs.map((qr) => qr._id.toString());
            const missingQrIds = qrIds.filter((qrId) => !foundQrIds.includes(qrId));
            console.log("Missing QR IDs:", missingQrIds);
            return (0, ApiResponse_1.ApiResponse)(res, 400, `Some QRs not found or already sold: ${qrs.length} of ${qrIds.length}. Missing: ${missingQrIds.slice(0, 5).join(", ")}${missingQrIds.length > 5 ? "..." : ""}`, false, null);
        }
        // Verify the bundle is assigned to this salesperson
        const bundle = yield bundleModel_1.Bundle.findOne({
            bundleId,
            assignedTo: salespersonId,
            status: "ASSIGNED",
        });
        if (!bundle) {
            return (0, ApiResponse_1.ApiResponse)(res, 403, "Bundle not assigned to you or not found", false, null);
        }
        // Generate unique ticket ID
        const ticketId = `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        // Create payment ticket
        const paymentTicket = yield paymentTicket_1.PaymentTicket.create({
            ticketId,
            salespersonId,
            customerName,
            customerPhone,
            customerEmail,
            qrIds,
            bundleId,
            amount,
            paymentMethod,
            paymentProof: paymentProofUrl,
            status: "PENDING",
        });
        // Update QR status to PENDING_PAYMENT to reserve them
        yield qrModel_1.QRModel.updateMany({ _id: { $in: qrIds } }, {
            qrStatus: constants_1.QRStatus.PENDING_PAYMENT,
            soldBySalesperson: salespersonId,
        });
        return (0, ApiResponse_1.ApiResponse)(res, 201, "Payment ticket created successfully", true, paymentTicket);
    }
    catch (error) {
        console.error("Error creating payment ticket:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, `Failed to create payment ticket: ${error instanceof Error ? error.message : "Unknown error"}`, false, null);
    }
}));
// Get salesperson's payment tickets
exports.getSalespersonTickets = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const salespersonId = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
        const { status } = req.query;
        const filter = { salespersonId };
        if (status) {
            filter.status = status;
        }
        const tickets = yield paymentTicket_1.PaymentTicket.find(filter)
            .populate("qrIds", "serialNumber qrTypeId")
            .populate("qrIds.qrTypeId", "qrName qrDescription")
            .populate("approvedBy", "firstName lastName")
            .sort({ createdAt: -1 });
        // Get bundle information for each ticket
        const ticketsWithBundleInfo = yield Promise.all(tickets.map((ticket) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const bundle = yield bundleModel_1.Bundle.findOne({ bundleId: ticket.bundleId })
                .populate("qrTypeId", "qrName qrDescription");
            return Object.assign(Object.assign({}, ticket.toObject()), { bundleInfo: bundle ? {
                    bundleId: bundle.bundleId,
                    qrTypeName: ((_a = bundle.qrTypeId) === null || _a === void 0 ? void 0 : _a.qrName) || "Unknown Type",
                    qrTypeDescription: ((_b = bundle.qrTypeId) === null || _b === void 0 ? void 0 : _b.qrDescription) || "",
                    pricePerQr: bundle.pricePerQr || null,
                    qrCount: bundle.qrCount || 0
                } : null });
        })));
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Payment tickets fetched successfully", true, ticketsWithBundleInfo);
    }
    catch (error) {
        console.error("Error fetching payment tickets:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch payment tickets", false, null);
    }
}));
// Admin approves/rejects payment ticket
exports.updatePaymentTicketStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { ticketId } = req.params;
        const { status, adminNotes } = req.body;
        const adminId = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
        if (!status || !["APPROVED", "REJECTED"].includes(status)) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Invalid status. Must be APPROVED or REJECTED", false, null);
        }
        const ticket = yield paymentTicket_1.PaymentTicket.findOne({ ticketId });
        if (!ticket) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, "Payment ticket not found", false, null);
        }
        // Allow transitions:
        // - PENDING -> APPROVED | REJECTED
        // - REJECTED -> APPROVED (when payment received later)
        const isPendingFlow = ticket.status === "PENDING";
        const isRejectedToApproved = ticket.status === "REJECTED" && status === "APPROVED";
        if (!isPendingFlow && !isRejectedToApproved) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Invalid state transition for this ticket", false, null);
        }
        // Update ticket status
        ticket.status = status;
        ticket.adminNotes = adminNotes;
        // ticket.approvedBy = adminId;
        ticket.approvedAt = new Date();
        if (status === "APPROVED") {
            // Set QRs to INACTIVE so customer can manually activate them
            yield qrModel_1.QRModel.updateMany({ _id: { $in: ticket.qrIds } }, {
                qrStatus: constants_1.QRStatus.INACTIVE,
                customerName: ticket.customerName,
                mobileNumber: ticket.customerPhone,
                email: ticket.customerEmail,
                soldBySalesperson: ticket.salespersonId, // Mark as sold by this salesperson
                isSold: true,
            });
            // Update salesperson's sold count
            yield salesman_1.Salesman.findByIdAndUpdate(ticket.salespersonId, {
                $inc: { totalQRsSold: ticket.qrIds.length },
            });
            console.log(`✅ Payment ticket approved. Incremented sold count by ${ticket.qrIds.length} for salesperson ${ticket.salespersonId}`);
        }
        else if (status === "REJECTED") {
            // Mark QRs as REJECTED to prevent activation without payment
            yield qrModel_1.QRModel.updateMany({ _id: { $in: ticket.qrIds } }, {
                qrStatus: constants_1.QRStatus.REJECTED,
                soldBySalesperson: null,
                isSold: false,
            });
            console.log(`❌ Payment ticket rejected. No change to sold count for salesperson ${ticket.salespersonId}`);
        }
        yield ticket.save();
        return (0, ApiResponse_1.ApiResponse)(res, 200, `Payment ticket ${status.toLowerCase()} successfully`, true, ticket);
    }
    catch (error) {
        console.error("Error updating payment ticket:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to update payment ticket", false, null);
    }
}));
// Admin gets all payment tickets
exports.getAllPaymentTickets = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }
        const tickets = yield paymentTicket_1.PaymentTicket.find(filter)
            .populate("salespersonId", "firstName lastName email phoneNumber")
            .populate("qrIds", "serialNumber qrTypeId")
            .populate("approvedBy", "firstName lastName")
            .sort({ createdAt: -1 });
        // Get bundle information for each ticket
        const ticketsWithBundleInfo = yield Promise.all(tickets.map((ticket) => __awaiter(void 0, void 0, void 0, function* () {
            var _a, _b;
            const bundle = yield bundleModel_1.Bundle.findOne({ bundleId: ticket.bundleId })
                .populate("qrTypeId", "qrName qrDescription");
            return Object.assign(Object.assign({}, ticket.toObject()), { bundleInfo: bundle ? {
                    bundleId: bundle.bundleId,
                    qrTypeName: ((_a = bundle.qrTypeId) === null || _a === void 0 ? void 0 : _a.qrName) || "Unknown Type",
                    qrTypeDescription: ((_b = bundle.qrTypeId) === null || _b === void 0 ? void 0 : _b.qrDescription) || "",
                    pricePerQr: bundle.pricePerQr || null,
                    qrCount: bundle.qrCount || 0
                } : null });
        })));
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Payment tickets fetched successfully", true, ticketsWithBundleInfo);
    }
    catch (error) {
        console.error("Error fetching payment tickets:", error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch payment tickets", false, null);
    }
}));
