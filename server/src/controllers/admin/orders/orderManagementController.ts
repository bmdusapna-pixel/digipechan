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
import {
  FRONTEND_BASE_URL_DEV,
  FRONTEND_BASE_URL_PROD_DOMAIN,
  NODE_ENV,
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
        const match = lastBundle.bundleId.match(/BUNDLE-(\d+)/);
        if (match) nextNumber = parseInt(match[1], 10) + 1;
      }

      return `BUNDLE-${nextNumber}`;
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
      const serialNumber = generateRandomSerialNumber();

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
      const bundles = await Bundle.find({
        status: "UNASSIGNED",
      })
        .populate("qrTypeId", "qrName qrDescription")
        .populate("createdBy", "firstName lastName email")
        .select("bundleId qrTypeId qrCount createdBy status createdAt")
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
    try {
      const { bundleId } = req.params;

      // Validate bundleId
      if (!bundleId) {
        return ApiResponse(res, 400, "Bundle ID is required", false, null);
      }

      // Find the bundle by its string bundleId and populate related fields
      const bundle = await Bundle.findOne({ bundleId })
        .populate("qrTypeId")
        .populate({ path: "qrIds", select: "serialNumber qrUrl createdAt" })
        .populate("createdBy", "firstName lastName")
        .lean();

      if (!bundle) {
        return ApiResponse(res, 404, "Bundle not found", false, null);
      }

      // Optional: permission check (skip if identities are missing)
      const isAdmin =
        (req as any)?.user?.role === "ADMIN" ||
        (req as any)?.data?.role === "ADMIN";
      const requesterId = (req as any)?.user?.id || (req as any)?.data?.userId;
      const createdById = (bundle as any)?.createdBy?._id?.toString?.();
      if (
        !isAdmin &&
        createdById &&
        requesterId &&
        createdById !== requesterId
      ) {
        return ApiResponse(res, 403, "Access denied", false, null);
      }

      // Get QR type information
      const qrType = bundle.qrTypeId as any;
      if (!qrType) {
        return ApiResponse(res, 404, "QR type not found", false, null);
      }

      // Get all QRs in the bundle
      const qrs = bundle.qrIds as any[];
      if (!qrs || qrs.length === 0) {
        return ApiResponse(res, 404, "No QRs found in bundle", false, null);
      }

      // Import pdf-lib
      const { PDFDocument, rgb, StandardFonts } = await import("pdf-lib");
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

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
        const createdByText = `Created by: ${(bundle.createdBy as any)?.firstName || ""} ${(bundle.createdBy as any)?.lastName || ""}`;
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
        const fs = await import("fs");
        const path = await import("path");

        // Use a more robust path resolution that works in both dev and prod
        const templatePath = path.join(__dirname, "template.png");

        let templateImage;
        try {
          const templateBuffer = fs.readFileSync(templatePath);
          templateImage = await pdfDoc.embedPng(templateBuffer);
          console.log("Template image loaded successfully");
        } catch (error) {
          console.error(
            "Failed to load template image from path:",
            templatePath,
            error
          );
          // Try alternative path resolution
          try {
            const altTemplatePath = path.resolve(__dirname, "template.png");
            console.log("Trying alternative template path:", altTemplatePath);
            const templateBuffer = fs.readFileSync(altTemplatePath);
            templateImage = await pdfDoc.embedPng(templateBuffer);
            console.log(
              "Template image loaded successfully from alternative path"
            );
          } catch (altError) {
            console.error(
              "Failed to load template image from alternative path:",
              altError
            );
            // Continue without template if it fails to load
          }
        }

        // Load QR type icon conditionally:
        // If qrType name is "Test" use local policeTag.png; otherwise if qrIcon URL exists, use it.
        let qrTypeIcon;
        try {
          if ((qrType as any)?.qrName === "Test") {
            const policeIconPath = path.join(__dirname, "policeTag.png");
            console.log("Police icon path:", policeIconPath);
            const policeBuffer = fs.readFileSync(policeIconPath);
            qrTypeIcon = await pdfDoc.embedPng(policeBuffer);
            console.log("Police icon loaded successfully");
          } else if ((qrType as any)?.qrIcon) {
            const iconResponse = await fetch((qrType as any).qrIcon);
            if (iconResponse.ok) {
              const iconBuffer = await iconResponse.arrayBuffer();
              qrTypeIcon = await pdfDoc.embedPng(iconBuffer);
              console.log("QR type icon loaded successfully from URL");
            }
          }
        } catch (error) {
          console.error("Failed to load QR type icon:", error);
          // Try alternative path resolution for policeTag.png
          try {
            if ((qrType as any)?.qrName === "Test") {
              const altPoliceIconPath = path.resolve(
                __dirname,
                "policeTag.png"
              );
              console.log(
                "Trying alternative police icon path:",
                altPoliceIconPath
              );
              const policeBuffer = fs.readFileSync(altPoliceIconPath);
              qrTypeIcon = await pdfDoc.embedPng(policeBuffer);
              console.log(
                "Police icon loaded successfully from alternative path"
              );
            }
          } catch (altError) {
            console.error(
              "Failed to load QR type icon from alternative path:",
              altError
            );
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
        const totalWidth =
          columnsPerPage * templateSize + (columnsPerPage - 1) * columnSpacing;
        const startX = margin + (availableWidth - totalWidth) / 2; // Center the grid

        // Start QR placement below header with reduced spacing
        const startY = height - margin - headerHeight + 60;

        // Draw QRs for this page
        for (let i = 0; i < qrsPerPage; i++) {
          const qrIndex = pageNum * qrsPerPage + i;

          // Stop if we've processed all QRs
          if (qrIndex >= qrs.length) break;

          const qr = qrs[qrIndex];

          // Calculate grid position (2x2 layout)
          const row = Math.floor(i / columnsPerPage); // 0 or 1
          const col = i % columnsPerPage; // 0 or 1

          // Calculate position for current QR
          const x = startX + col * (templateSize + columnSpacing);
          const y =
            startY - row * (templateSize + rowSpacing) - templateSize / 2 + 20;

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
              const iconY =
                y - templateSize + (templateSize - qrSize) / 2 + qrSize - 20; // Position above QR code

              page.drawImage(qrTypeIcon, {
                x: iconX,
                y: iconY,
                width: qrTypeIconSize,
                height: qrTypeIconSize,
              });
            }

            // Fetch the QR image from Cloudinary
            const response = await fetch(qr.qrUrl);
            if (response.ok) {
              const imageBuffer = await response.arrayBuffer();
              const qrImage = await pdfDoc.embedPng(imageBuffer);

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
          } catch (error) {
            console.error(
              `Failed to fetch QR image for ${qr.serialNumber}:`,
              error
            );

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
      const pdfBytes = await pdfDoc.save();
      const pdfBuffer = Buffer.from(pdfBytes);

      // Set response headers for file download
      const fileName = `bundle_${bundleId}_qrs.pdf`;
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Length", pdfBuffer.length);

      // Send the PDF file
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Error downloading bundle QRs:", error);
      return ApiResponse(
        res,
        500,
        "Failed to download bundle QRs",
        false,
        null
      );
    }
  }
);
