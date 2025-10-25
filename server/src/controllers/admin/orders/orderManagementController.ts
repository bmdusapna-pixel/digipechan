import mongoose from "mongoose";
import { ApiResponse } from "../../../config/ApiResponse";
import {
  COLLECTION_NAMES,
  DeliveryType,
  OrderStatus,
  QRStatus,
} from "../../../config/constants";
import { QRModel } from "../../../models/qr-flow/qrModel";
import { AuthenticatedRequest } from "../../../types/AuthenticatedRequest";
import { Response } from "express";
import { PaymentTransaction } from "../../../models/transaction/paymentTransaction";
import { Bundle } from "../../../models/qr-flow/bundleModel";
import { Salesman } from "../../../models/auth/salesman";
import { generateBundlePDF } from "../../../utils/pdfGenerator";
import crypto from "crypto";
import {
  FRONTEND_BASE_URL_DEV,
  FRONTEND_BASE_URL_PROD_DOMAIN,
  NODE_ENV,
  BACKEND_BASE_URL,
  BACKEND_PROD_URL,
} from "../../../secrets";
import expressAsyncHandler from "express-async-handler";
import { QRMetaData } from "../../../models/qr-flow/newQRTypeModel";
import QRCode from "qrcode";
import { uploadToCloudinary } from "../../../config/uploadToCloudinary";
import { generateRandomSerialNumber } from "../../../utils/generateSerialNumber";
export const getAllOrderInformation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
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

    const qrData = await QRModel.aggregate([
      { $match: searchCondition },
      {
        $lookup: {
          from: COLLECTION_NAMES.PAYMENT_HISTORY,
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

    const totalCount = await QRModel.countDocuments(searchCondition);

    return ApiResponse(res, 200, "Information fetched successfully", true, {
      total: totalCount,
      page: pageNumber,
      pageSize,
      data: qrData,
    });
  } catch (error) {
    console.error("Error fetching order info:", error);
    return ApiResponse(res, 500, "Failed fetching information", false, error);
  }
};

export const updateOrderInformation = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { qrId, ...updateFields } = req.body;

    if (!qrId || !mongoose.Types.ObjectId.isValid(qrId)) {
      return ApiResponse(res, 400, "Invalid or missing QR Id", false);
    }

    if (updateFields.paymentStatus) {
      const qr = await QRModel.findById(qrId).select("transactionId").lean();

      if (qr?.transactionId) {
        console.log("Payment ID : ", qr.transactionId);
        const transaction = await PaymentTransaction.findByIdAndUpdate(
          qr.transactionId,
          { status: updateFields.paymentStatus },
          { new: true }
        );

        if (!transaction) {
          return ApiResponse(res, 404, "Transaction not found", false);
        }
      }
    }

    const updatedDoc = await QRModel.findByIdAndUpdate(
      qrId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedDoc) {
      return ApiResponse(res, 404, "QR document not found", false);
    }

    return ApiResponse(
      res,
      200,
      "Order information updated successfully",
      true,
      updatedDoc
    );
  } catch (error) {
    console.error("Error updating order info:", error);
    return ApiResponse(
      res,
      500,
      "Failed to update order information",
      false,
      error
    );
  }
};

export const bulkGenerateQRs = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const getNextBundleId = async (): Promise<string> => {
      const lastBundle = await Bundle.findOne({})
        .sort({ createdAt: -1 }) // get the latest bundle
        .lean();

      let nextNumber = 1;
      if (lastBundle?.bundleId) {
        const match = lastBundle.bundleId.match(/DIGI(\d+)/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
      }

      return `DIGI${nextNumber}`;
    };
    const { quantity, price, qrTypeId, tagType, questions } = req.body as any;

    if (!quantity || !qrTypeId || price === undefined) {
      return ApiResponse(
        res,
        400,
        "Missing required fields: quantity, price, qrTypeId",
        false,
        null
      );
    }

    const num = parseInt(quantity);
    const unitPrice = parseFloat(price);
    if (isNaN(num) || num <= 0 || num > 100) {
      return ApiResponse(
        res,
        400,
        "Invalid quantity (must be 1-100)",
        false,
        null
      );
    }
    if (isNaN(unitPrice) || unitPrice <= 0) {
      return ApiResponse(
        res,
        400,
        "Invalid price (must be greater than 0)",
        false,
        null
      );
    }

    const qrType = await QRMetaData.findById(qrTypeId);
    if (!qrType) {
      return ApiResponse(res, 404, "QR Type not found", false, null);
    }

    // Update QR type with tag type and questions if provided
    if (tagType || questions) {
      const updateData: any = {};
      if (tagType) updateData.tagType = tagType;
      if (questions && questions.length > 0) updateData.questions = questions;

      await QRMetaData.findByIdAndUpdate(qrTypeId, updateData);
    }

    const adminId = req.data?.userId;
    const frontendUrl =
      NODE_ENV === "dev"
        ? FRONTEND_BASE_URL_DEV
        : FRONTEND_BASE_URL_PROD_DOMAIN;
    const generatedQRs = [];

    // Generate unique bundle ID
    const bundleId = await getNextBundleId();

    for (let i = 0; i < num; i++) {
      const qrId = new mongoose.Types.ObjectId();
      const qrRawData = `${frontendUrl}/qr/scan/${qrId.toString()}`;
      const qrBuffer = await QRCode.toBuffer(qrRawData, { type: "png" });
      const cloudinaryResult: any = await uploadToCloudinary(
        qrBuffer,
        "qr_codes/",
        "image"
      );
      const serialNumber = generateRandomSerialNumber(bundleId);

      const qr = await QRModel.create({
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
        qrStatus: QRStatus.INACTIVE,
        bundleId: bundleId, // Add bundle ID to QR
        price: unitPrice,
        tagType: tagType,
        questions: questions || [], // Add questions to each QR
      });

      generatedQRs.push(qr);
    }

    // Create bundle record
    const bundle = await Bundle.create({
      bundleId,
      qrTypeId,
      qrCount: num,
      createdBy: adminId,
      qrIds: generatedQRs.map((qr) => qr._id),
      status: "UNASSIGNED",
      pricePerQr: unitPrice,
    });

    return ApiResponse(
      res,
      200,
      `Successfully generated bundle with ${num} QR codes`,
      true,
      { bundleId, qrIds: generatedQRs.map((qr) => qr._id) }
    );
  }
);

export const getBundles = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const bundles = await Bundle.find({})
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
        .select(
          "bundleId qrTypeId qrCount createdBy status createdAt assignmentHistory"
        )
        .sort({ createdAt: -1 });

      return ApiResponse(
        res,
        200,
        "Bundles fetched successfully",
        true,
        bundles
      );
    } catch (error) {
      console.error("Error fetching bundles:", error);
      return ApiResponse(res, 500, "Failed to fetch bundles", false, null);
    }
  }
);

export const assignBundleToSalesperson = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bundleId, salespersonId, deliveryType } = req.body;

      if (!bundleId || !salespersonId || !deliveryType) {
        return ApiResponse(
          res,
          400,
          "Missing required fields: bundleId, salespersonId, deliveryType",
          false,
          null
        );
      }

      // Update bundle
      const updatedBundle = await Bundle.findOneAndUpdate(
        { bundleId },
        {
          assignedTo: salespersonId,
          deliveryType,
          status: "ASSIGNED",
        },
        { new: true }
      );

      if (!updatedBundle) {
        return ApiResponse(res, 404, "Bundle not found", false, null);
      }

      // Update all QRs in the bundle - set createdBy to salesperson, but keep createdFor null until sold
      await QRModel.updateMany(
        { bundleId },
        {
          deliveryType,
          orderStatus: deliveryType === "ETAG" ? "DELIVERED" : "SHIPPED",
        }
      );

      // Add bundle to salesman's assigned bundles
      await Salesman.findByIdAndUpdate(salespersonId, {
        $addToSet: { assignedBundles: updatedBundle._id },
      });

      return ApiResponse(
        res,
        200,
        "Bundle assigned to salesperson successfully",
        true,
        updatedBundle
      );
    } catch (error) {
      console.error("Error assigning bundle:", error);
      return ApiResponse(res, 500, "Failed to assign bundle", false, null);
    }
  }
);

export const downloadBundleQRs = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { bundleId } = req.params;

    if (!bundleId) {
      return ApiResponse(res, 400, "Bundle ID is required", false, null);
    }

    const bundle = await Bundle.findOne({ bundleId })
      .populate("qrTypeId")
      .populate({ path: "qrIds", select: "serialNumber qrUrl createdAt" })
      .populate("createdBy", "firstName lastName")
      .lean();

    if (!bundle) {
      return ApiResponse(res, 404, "Bundle not found", false, null);
    }

    // Permission check
    const isAdmin =
      (req as any)?.user?.role === "ADMIN" ||
      (req as any)?.data?.role === "ADMIN";
    const requesterId = (req as any)?.user?.id || (req as any)?.data?.userId;
    const createdById = (bundle as any)?.createdBy?._id?.toString?.();

    if (!isAdmin && createdById && requesterId && createdById !== requesterId) {
      return ApiResponse(res, 403, "Access denied", false, null);
    }

    if (!bundle.qrTypeId) {
      return ApiResponse(res, 404, "QR type not found", false, null);
    }

    if (!bundle.qrIds || bundle.qrIds.length === 0) {
      return ApiResponse(res, 404, "No QRs found in bundle", false, null);
    }

    const pdfBuffer = await generateBundlePDF(bundle);

    const fileName = `bundle_${bundleId}_qrs.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  }
);

// Admin: Generate share link (auth required)
export const generateShareLink = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { bundleId } = req.params;

    const bundle = await Bundle.findOne({ bundleId });
    if (!bundle) {
      return ApiResponse(res, 404, "Bundle not found", false, null);
    }

    const token = crypto.randomBytes(24).toString("hex");
    bundle.shareToken = token;
    bundle.shareTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await bundle.save();

    const shareUrl = `${BACKEND_PROD_URL}/api/admin/share/bundles/${token}`;
    return ApiResponse(res, 200, "Share link generated", true, { shareUrl });
  }
);

// Public: Download via share link (no auth)
export const downloadSharedBundle = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { token } = req.params;

    const bundle = await Bundle.findOne({
      shareToken: token,
      shareTokenExpiresAt: { $gt: new Date() },
    })
      .populate("qrTypeId")
      .populate({ path: "qrIds", select: "serialNumber qrUrl createdAt" })
      .populate("createdBy", "firstName lastName")
      .lean();

    if (!bundle) {
      return ApiResponse(
        res,
        404,
        "Invalid or expired share link",
        false,
        null
      );
    }

    const pdfBuffer = await generateBundlePDF(bundle);

    const fileName = `bundle_${bundle.bundleId}_qrs.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", pdfBuffer.length);

    res.send(pdfBuffer);
  }
);
// Get QRs in a specific bundle for salesman
export const getBundleQRs = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bundleId } = req.params;

      // Verify bundle belongs to this salesman
      const bundle = await Bundle.findOne({
        bundleId,
      }).populate("qrTypeId", "qrName");

      if (!bundle) {
        return ApiResponse(
          res,
          403,
          "Bundle not found or not assigned to you",
          false,
          null
        );
      }

      const qrs = await QRModel.find({ bundleId })
        .populate("qrTypeId", "qrName qrDescription")
        .select(
          "_id serialNumber qrTypeId qrStatus qrUrl createdAt createdFor price isSold soldBySalesperson"
        )
        .sort({ createdAt: -1 });

      return ApiResponse(res, 200, "Bundle QRs fetched successfully", true, {
        bundle: {
          bundleId: bundle.bundleId,
          qrCount: bundle.qrCount,
          qrTypeName: (bundle as any)?.qrTypeId,
          deliveryType: bundle.deliveryType,
          pricePerQr: (bundle as any)?.pricePerQr ?? null,
        },
        qrs,
      });
    } catch (error) {
      console.error("Error fetching bundle QRs:", error);
      return ApiResponse(res, 500, "Failed to fetch bundle QRs", false, null);
    }
  }
);
