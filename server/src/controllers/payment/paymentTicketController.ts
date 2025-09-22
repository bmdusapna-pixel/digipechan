import expressAsyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { Response } from "express";
import { PaymentTicket } from "../../models/payment/paymentTicket";
import { QRModel } from "../../models/qr-flow/qrModel";
import { Salesman } from "../../models/auth/salesman";
import { ApiResponse } from "../../config/ApiResponse";
import { QRStatus } from "../../config/constants";
import mongoose from "mongoose";
import { Bundle } from "../../models/qr-flow/bundleModel";
import { uploadToCloudinary } from "../../config/uploadToCloudinary";

// Salesperson creates a payment ticket for offline payment
export const createPaymentTicket = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const salespersonId = req.data?.userId;
      const {
        customerName,
        customerPhone,
        customerEmail,
        qrIds: qrIdsRaw,
        bundleId,
        amount,
        paymentMethod,
      } = req.body;

      // Handle qrIds - it might come as string or array from FormData
      const qrIds = Array.isArray(qrIdsRaw) ? qrIdsRaw : [qrIdsRaw];

      // Handle file upload if present
      let paymentProofUrl: string | undefined;
      if (req.file) {
        try {
          const cloudinaryResult: any = await uploadToCloudinary(
            req.file.buffer,
            `payment-proofs/${salespersonId}`,
            req.file.mimetype.startsWith("image/") ? "image" : "raw"
          );
          paymentProofUrl = cloudinaryResult.secure_url;
        } catch (uploadError) {
          console.error("File upload error:", uploadError);
          return ApiResponse(
            res,
            500,
            "Failed to upload payment proof",
            false,
            null
          );
        }
      }

      if (
        !customerName ||
        !customerPhone ||
        !qrIds ||
        !bundleId ||
        !amount ||
        !paymentMethod
      ) {
        return ApiResponse(res, 400, "Missing required fields", false, null);
      }

      // Verify salesperson exists
      const salesperson = await Salesman.findById(salespersonId);
      if (!salesperson) {
        return ApiResponse(res, 404, "Salesperson not found", false, null);
      }

      // Verify QRs belong to salesperson's bundle and are available
      const qrs = await QRModel.find({
        _id: { $in: qrIds },
        bundleId,
        qrStatus: QRStatus.INACTIVE, // Only INACTIVE QRs can be selected for payment tickets
      });

      // Check if any of these QRs are already in pending tickets
      const existingPendingTickets = await PaymentTicket.find({
        qrIds: { $in: qrIds },
        status: "PENDING",
      });

      if (existingPendingTickets.length > 0) {
        const conflictingQrIds = existingPendingTickets.flatMap(
          (ticket) => ticket.qrIds
        );
        const uniqueConflictingQrIds = [
          ...new Set(conflictingQrIds.map((id) => id.toString())),
        ];

        return ApiResponse(
          res,
          400,
          `Some QRs are already in pending payment tickets: ${uniqueConflictingQrIds.slice(0, 3).join(", ")}${uniqueConflictingQrIds.length > 3 ? "..." : ""}`,
          false,
          null
        );
      }

      console.log("=== QR VALIDATION DEBUG ===");
      console.log("Requested QR IDs:", qrIds);
      console.log("Bundle ID:", bundleId);
      console.log("Found QRs:", qrs.length);
      console.log("Expected QRs:", qrIds.length);
      console.log(
        "Found QR IDs:",
        qrs.map((qr) => qr._id.toString())
      );
      console.log("==========================");

      if (qrs.length !== qrIds.length) {
        // Get more details about what's missing
        const foundQrIds = qrs.map((qr) => qr._id.toString());
        const missingQrIds = qrIds.filter(
          (qrId: string) => !foundQrIds.includes(qrId)
        );

        console.log("Missing QR IDs:", missingQrIds);

        return ApiResponse(
          res,
          400,
          `Some QRs not found or already sold: ${qrs.length} of ${qrIds.length}. Missing: ${missingQrIds.slice(0, 5).join(", ")}${missingQrIds.length > 5 ? "..." : ""}`,
          false,
          null
        );
      }

      // Verify the bundle is assigned to this salesperson
      const bundle = await Bundle.findOne({
        bundleId,
        assignedTo: salespersonId,
        status: "ASSIGNED",
      });

      if (!bundle) {
        return ApiResponse(
          res,
          403,
          "Bundle not assigned to you or not found",
          false,
          null
        );
      }

      // Generate unique ticket ID
      const ticketId = `TICKET_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Create payment ticket
      const paymentTicket = await PaymentTicket.create({
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
      await QRModel.updateMany(
        { _id: { $in: qrIds } },
        {
          qrStatus: QRStatus.PENDING_PAYMENT,
          soldBySalesperson: salespersonId,
        }
      );

      return ApiResponse(
        res,
        201,
        "Payment ticket created successfully",
        true,
        paymentTicket
      );
    } catch (error) {
      console.error("Error creating payment ticket:", error);
      return ApiResponse(
        res,
        500,
        `Failed to create payment ticket: ${error instanceof Error ? error.message : "Unknown error"}`,
        false,
        null
      );
    }
  }
);

// Get salesperson's payment tickets
export const getSalespersonTickets = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const salespersonId = req.data?.userId;
      const { status } = req.query;

      const filter: any = { salespersonId };
      if (status) {
        filter.status = status;
      }

      const tickets = await PaymentTicket.find(filter)
        .populate("qrIds", "serialNumber qrTypeId")
        .populate("qrIds.qrTypeId", "qrName qrDescription")
        .populate("approvedBy", "firstName lastName")
        .sort({ createdAt: -1 });

      // Get bundle information for each ticket
      const ticketsWithBundleInfo = await Promise.all(
        tickets.map(async (ticket) => {
          const bundle = await Bundle.findOne({ bundleId: ticket.bundleId })
            .populate("qrTypeId", "qrName qrDescription");
          
          return {
            ...ticket.toObject(),
            bundleInfo: bundle ? {
              bundleId: bundle.bundleId,
              qrTypeName: (bundle as any).qrTypeId?.qrName || "Unknown Type",
              qrTypeDescription: (bundle as any).qrTypeId?.qrDescription || "",
              pricePerQr: bundle.pricePerQr || null,
              qrCount: bundle.qrCount || 0
            } : null
          };
        })
      );

      return ApiResponse(
        res,
        200,
        "Payment tickets fetched successfully",
        true,
        ticketsWithBundleInfo
      );
    } catch (error) {
      console.error("Error fetching payment tickets:", error);
      return ApiResponse(
        res,
        500,
        "Failed to fetch payment tickets",
        false,
        null
      );
    }
  }
);

// Admin approves/rejects payment ticket
export const updatePaymentTicketStatus = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { ticketId } = req.params;
      const { status, adminNotes } = req.body;
      const adminId = req.data?.userId;

      if (!status || !["APPROVED", "REJECTED"].includes(status)) {
        return ApiResponse(
          res,
          400,
          "Invalid status. Must be APPROVED or REJECTED",
          false,
          null
        );
      }

      const ticket = await PaymentTicket.findOne({ ticketId });
      if (!ticket) {
        return ApiResponse(res, 404, "Payment ticket not found", false, null);
      }

      // Allow transitions:
      // - PENDING -> APPROVED | REJECTED
      // - REJECTED -> APPROVED (when payment received later)
      const isPendingFlow = ticket.status === "PENDING";
      const isRejectedToApproved = ticket.status === "REJECTED" && status === "APPROVED";
      if (!isPendingFlow && !isRejectedToApproved) {
        return ApiResponse(
          res,
          400,
          "Invalid state transition for this ticket",
          false,
          null
        );
      }

      // Update ticket status
      ticket.status = status;
      ticket.adminNotes = adminNotes;
      // ticket.approvedBy = adminId;
      ticket.approvedAt = new Date();

      if (status === "APPROVED") {
        // Set QRs to INACTIVE so customer can manually activate them
        await QRModel.updateMany(
          { _id: { $in: ticket.qrIds } },
          {
            qrStatus: QRStatus.INACTIVE,
            customerName: ticket.customerName,
            mobileNumber: ticket.customerPhone,
            email: ticket.customerEmail,
            soldBySalesperson: ticket.salespersonId, // Mark as sold by this salesperson
            isSold: true,
          }
        );

        // Update salesperson's sold count
        await Salesman.findByIdAndUpdate(ticket.salespersonId, {
          $inc: { totalQRsSold: ticket.qrIds.length },
        });
        
        console.log(`✅ Payment ticket approved. Incremented sold count by ${ticket.qrIds.length} for salesperson ${ticket.salespersonId}`);
      } else if (status === "REJECTED") {
        // Mark QRs as REJECTED to prevent activation without payment
        await QRModel.updateMany(
          { _id: { $in: ticket.qrIds } },
          {
            qrStatus: QRStatus.REJECTED,
            soldBySalesperson: null,
            isSold: false,
          }
        );
        
        console.log(`❌ Payment ticket rejected. No change to sold count for salesperson ${ticket.salespersonId}`);
      }

      await ticket.save();

      return ApiResponse(
        res,
        200,
        `Payment ticket ${status.toLowerCase()} successfully`,
        true,
        ticket
      );
    } catch (error) {
      console.error("Error updating payment ticket:", error);
      return ApiResponse(
        res,
        500,
        "Failed to update payment ticket",
        false,
        null
      );
    }
  }
);

// Admin gets all payment tickets
export const getAllPaymentTickets = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.query;

      const filter: any = {};
      if (status) {
        filter.status = status;
      }

      const tickets = await PaymentTicket.find(filter)
        .populate("salespersonId", "firstName lastName email phoneNumber")
        .populate("qrIds", "serialNumber qrTypeId")
        .populate("approvedBy", "firstName lastName")
        .sort({ createdAt: -1 });

      // Get bundle information for each ticket
      const ticketsWithBundleInfo = await Promise.all(
        tickets.map(async (ticket) => {
          const bundle = await Bundle.findOne({ bundleId: ticket.bundleId })
            .populate("qrTypeId", "qrName qrDescription");
          
          return {
            ...ticket.toObject(),
            bundleInfo: bundle ? {
              bundleId: bundle.bundleId,
              qrTypeName: (bundle as any).qrTypeId?.qrName || "Unknown Type",
              qrTypeDescription: (bundle as any).qrTypeId?.qrDescription || "",
              pricePerQr: bundle.pricePerQr || null,
              qrCount: bundle.qrCount || 0
            } : null
          };
        })
      );

      return ApiResponse(
        res,
        200,
        "Payment tickets fetched successfully",
        true,
        ticketsWithBundleInfo
      );
    } catch (error) {
      console.error("Error fetching payment tickets:", error);
      return ApiResponse(
        res,
        500,
        "Failed to fetch payment tickets",
        false,
        null
      );
    }
  }
);
