import expressAsyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { Request, Response } from "express";
import { Salesman } from "../../models/auth/salesman";
import { Bundle } from "../../models/qr-flow/bundleModel";
import { QRModel } from "../../models/qr-flow/qrModel";
import { ApiResponse } from "../../config/ApiResponse";
import { QRStatus } from "../../config/constants";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../secrets";
import { UserRoles } from "../../enums/enums";

// Get all active salesmen
export const getAllSalesmen = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const salesmen = await Salesman.find({ isActive: true })
        .select(
          "_id firstName lastName email phoneNumber territory totalQRsSold"
        )
        .sort({ firstName: 1 });

      return ApiResponse(
        res,
        200,
        "Salesmen fetched successfully",
        true,
        salesmen
      );
    } catch (error) {
      console.error("Error fetching salesmen:", error);
      return ApiResponse(res, 500, "Failed to fetch salesmen", false, null);
    }
  }
);

// Get salesman assigned bundles
export const getSalesmanBundles = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const salesmanId = req.data?.userId;

      const bundles = await Bundle.find({
        assignedTo: salesmanId,
        status: "ASSIGNED",
      })
        .populate(
          "qrTypeId",
          "qrName qrDescription originalPrice discountedPrice"
        )
        .populate("createdBy", "firstName lastName email")
        .select("bundleId qrTypeId qrCount status createdAt qrIds")
        .sort({ createdAt: -1 });

      return ApiResponse(
        res,
        200,
        "Assigned bundles fetched successfully",
        true,
        bundles
      );
    } catch (error) {
      console.error("Error fetching salesman bundles:", error);
      return ApiResponse(res, 500, "Failed to fetch bundles", false, null);
    }
  }
);

// Get QRs in a specific bundle for salesman
export const getBundleQRs = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bundleId } = req.params;
      const salesmanId = req.data?.userId;

      // Verify bundle belongs to this salesman
      const bundle = await Bundle.findOne({
        bundleId,
        assignedTo: salesmanId,
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

// Sell individual QR to customer
export const sellQRToCustomer = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { qrId, customerId, customerDetails } = req.body;
      const salesmanId = req.data?.userId;

      if (!qrId || !customerId) {
        return ApiResponse(
          res,
          400,
          "Missing required fields: qrId, customerId",
          false,
          null
        );
      }

      // Find QR and verify it belongs to salesman's bundle
      const qr = await QRModel.findById(qrId);
      if (!qr) {
        return ApiResponse(res, 404, "QR not found", false, null);
      }

      // Verify bundle belongs to salesman
      const bundle = await Bundle.findOne({
        bundleId: qr.bundleId,
        assignedTo: salesmanId,
      });

      if (!bundle) {
        return ApiResponse(
          res,
          403,
          "QR not in your assigned bundles",
          false,
          null
        );
      }

      // Check if QR is already sold or pending payment
      if (qr.createdFor && qr.qrStatus === QRStatus.ACTIVE) {
        return ApiResponse(
          res,
          400,
          "QR already sold to another customer",
          false,
          null
        );
      }

      // Check if QR is in pending payment or rejected status
      if (qr.qrStatus === QRStatus.PENDING_PAYMENT) {
        return ApiResponse(
          res,
          400,
          "QR is pending payment approval and cannot be sold",
          false,
          null
        );
      }

      if (qr.qrStatus === QRStatus.REJECTED) {
        return ApiResponse(
          res,
          400,
          "QR payment was rejected and cannot be sold without new payment",
          false,
          null
        );
      }

      // Update QR with customer details
      const updatedQR = await QRModel.findByIdAndUpdate(
        qrId,
        {
          createdFor: customerId,
          soldBySalesperson: salesmanId,
          qrStatus: QRStatus.ACTIVE,
          customerName: customerDetails?.name,
          mobileNumber: customerDetails?.phone,
          email: customerDetails?.email,
          vehicleNumber: customerDetails?.vehicleNumber,
        },
        { new: true }
      );

      // Update salesman's sold count
      await Salesman.findByIdAndUpdate(salesmanId, {
        $inc: { totalQRsSold: 1 },
      });

      return ApiResponse(
        res,
        200,
        "QR sold to customer successfully",
        true,
        updatedQR
      );
    } catch (error) {
      console.error("Error selling QR:", error);
      return ApiResponse(res, 500, "Failed to sell QR", false, null);
    }
  }
);

// Get salesman sales statistics
export const getSalesmanStats = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const salesmanId = req.data?.userId;

      const salesman = await Salesman.findById(salesmanId).select(
        "firstName lastName totalQRsSold digitalWalletCoins assignedBundles"
      );

      if (!salesman) {
        return ApiResponse(res, 404, "Salesman not found", false, null);
      }

      const totalBundles = salesman.assignedBundles.length;

      // Count available QRs (not sold yet)
      const availableQRs = await QRModel.countDocuments({
        bundleId: {
          $in: await Bundle.find({ assignedTo: salesmanId }).distinct(
            "bundleId"
          ),
        },
        qrStatus: QRStatus.INACTIVE,
        createdFor: null,
      });

      // Count sold QRs - should match the same logic as totalQRsSold
      // Only count QRs that are actually sold and activated by customers
      const soldQRs = await QRModel.countDocuments({
        $and: [
          { soldBySalesperson: salesmanId },
          { isSold: true },
        ],
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

      return ApiResponse(
        res,
        200,
        "Salesman statistics fetched successfully",
        true,
        stats
      );
    } catch (error) {
      console.error("Error fetching salesman stats:", error);
      return ApiResponse(res, 500, "Failed to fetch statistics", false, null);
    }
  }
);

export const salesmanLogin = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return ApiResponse(
        res,
        400,
        "Email and password are required",
        false,
        null
      );
    }

    const salesman = await Salesman.findOne({ email }).select("+password");
    if (!salesman) {
      return ApiResponse(res, 401, "Invalid credentials", false, null);
    }

    if (!salesman.isActive) {
      return ApiResponse(res, 403, "Account is inactive", false, null);
    }

    const match = await bcrypt.compare(password, salesman.password);
    if (!match) {
      return ApiResponse(res, 401, "Invalid credentials", false, null);
    }

    const token = jwt.sign(
      { userId: salesman._id, roles: [UserRoles.SALESPERSON] },
      JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Mirror user login cookie behavior
    const cookieOptions: {
      httpOnly: boolean;
      maxAge: number;
      secure?: boolean;
      sameSite?: "none" | "lax" | "strict";
    } = {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };

    if (process.env.NODE_ENV === "production") {
      cookieOptions.secure = true;
      cookieOptions.sameSite = "none";
    } else {
      cookieOptions.secure = false;
      cookieOptions.sameSite = "lax";
    }

    res.cookie("token", token, cookieOptions);

    return ApiResponse(res, 200, "Login successful", true, { token });
  }
);

// Get sold QRs for the logged-in salesperson with optional status filter
export const getSoldQrsForSalesman = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const salesmanId = req.data?.userId;

      const bundleIds = await Bundle.find({ assignedTo: salesmanId }).distinct(
        "bundleId"
      );

      const match: any = {
        $and: [
          { soldBySalesperson: salesmanId },
          { isSold: true },
          { bundleId: { $in: bundleIds } },
        ],
      };

      const qrs = await QRModel.find(match)
        .select(
          "_id serialNumber qrStatus qrUrl createdAt createdFor bundleId soldBySalesperson isSold"
        )
        .sort({ createdAt: -1 })
        .lean();

      return ApiResponse(res, 200, "Sold QRs fetched", true, { qrs });
    } catch (error) {
      console.error("Error fetching sold QRs:", error);
      return ApiResponse(res, 500, "Failed to fetch sold QRs", false, null);
    }
  }
);
