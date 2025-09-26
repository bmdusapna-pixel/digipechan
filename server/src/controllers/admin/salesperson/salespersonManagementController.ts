import expressAsyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../../types/AuthenticatedRequest";
import { Response } from "express";
import { Salesman } from "../../../models/auth/salesman";
import { Bundle } from "../../../models/qr-flow/bundleModel";
import { QRModel } from "../../../models/qr-flow/qrModel";
import { ApiResponse } from "../../../config/ApiResponse";
import { QRStatus } from "../../../config/constants";
import type { INewQRType } from "../../../types/newQRType.types";

export const getSalespersonManagement = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const salespeople = await Salesman.find({ isActive: true })
        .select(
          "_id firstName lastName email phoneNumber territory totalQRsSold assignedBundles isVerified"
        )
        .sort({ firstName: 1 });

      const salespersonData = await Promise.all(
        salespeople.map(async (salesperson) => {
          // Get assigned bundles with QR type info
          const assignedBundles = await Bundle.find({
            assignedTo: salesperson._id,
            status: "ASSIGNED",
          })
            .populate<{
              qrTypeId: Pick<INewQRType, "qrName" | "qrDescription">;
            }>("qrTypeId", "qrName qrDescription")
            .select("bundleId qrTypeId qrCount createdAt");

          // Count total QRs assigned
          const totalQRsAssigned = assignedBundles.reduce(
            (sum, bundle) => sum + bundle.qrCount,
            0
          );

          // Count available (unsold) QRs: truly available for sale
          const availableQRs = await QRModel.countDocuments({
            bundleId: { $in: assignedBundles.map((b) => b.bundleId) },
            qrStatus: QRStatus.INACTIVE,
            createdFor: null,
            $or: [
              { isSold: { $exists: false } },
              { isSold: false },
              { isSold: null },
            ],
          });

          // Count sold QRs: include ACTIVE (customer-activated) or INACTIVE but approved (isSold=true)
          const soldQRs = await QRModel.countDocuments({
            bundleId: { $in: assignedBundles.map((b) => b.bundleId) },
            $or: [
              { qrStatus: QRStatus.ACTIVE, createdFor: { $ne: null } },
              { qrStatus: QRStatus.INACTIVE, isSold: true },
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
            bundles: assignedBundles.map((bundle) => ({
              bundleId: bundle.bundleId,
              qrTypeName:
                (bundle.qrTypeId as unknown as Pick<INewQRType, "qrName">)
                  ?.qrName || "Unknown",
              qrCount: bundle.qrCount,
              createdAt: bundle.createdAt,
            })),
          };
        })
      );

      return ApiResponse(
        res,
        200,
        "Salesperson management data fetched successfully",
        true,
        salespersonData
      );
    } catch (error) {
      console.error("Error fetching salesperson management data:", error);
      return ApiResponse(
        res,
        500,
        "Failed to fetch salesperson management data",
        false,
        null
      );
    }
  }
);

export const getSalespersonCustomers = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { salespersonId } = req.params;

      // Get all bundles assigned to this salesperson
      const assignedBundles = await Bundle.find({
        assignedTo: salespersonId,
        status: "ASSIGNED",
      }).select("bundleId");

      const bundleIds = assignedBundles.map((b) => b.bundleId);

      // Get all customer-related QRs from these bundles with customer info
      // Include:
      // - ACTIVE QRs with createdFor (customer activated)
      // - INACTIVE QRs that are approved/sold (isSold=true) awaiting customer activation
      const soldQRs = await QRModel.find({
        bundleId: { $in: bundleIds },
        $or: [
          { qrStatus: QRStatus.ACTIVE, createdFor: { $ne: null } },
          { qrStatus: QRStatus.INACTIVE, isSold: true },
        ],
      })
        .populate("qrTypeId", "qrName qrDescription")
        .populate("createdFor", "firstName lastName email phoneNumber")
        .select(
          "serialNumber qrTypeId customerName mobileNumber email  createdAt updatedAt bundleId createdFor"
        )
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

      return ApiResponse(
        res,
        200,
        "Salesperson customers fetched successfully",
        true,
        soldQRs
      );
    } catch (error) {
      console.error("Error fetching salesperson customers:", error);
      return ApiResponse(
        res,
        500,
        "Failed to fetch salesperson customers",
        false,
        null
      );
    }
  }
);

export const getSalespersonBundleDetails = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { salespersonId } = req.params;

      // Get all bundles assigned to this salesperson with detailed QR info
      const assignedBundles = await Bundle.find({
        assignedTo: salespersonId,
        status: "ASSIGNED",
      })
        .populate<{
          qrTypeId: Pick<
            INewQRType,
            "qrName" | "qrDescription" | "originalPrice" | "discountedPrice"
          >;
        }>("qrTypeId", "qrName qrDescription originalPrice discountedPrice")
        .select("bundleId qrTypeId qrCount createdAt");

      const bundleDetails = await Promise.all(
        assignedBundles.map(async (bundle) => {
          // Get QR stats for this bundle
          const qrStats = await QRModel.aggregate([
            { $match: { bundleId: bundle.bundleId } },
            {
              $group: {
                _id: "$qrStatus",
                count: { $sum: 1 },
              },
            },
          ]);

          const activeQRs =
            qrStats.find((stat) => stat._id === QRStatus.ACTIVE)?.count || 0;
          const inactiveQRs =
            qrStats.find((stat) => stat._id === QRStatus.INACTIVE)?.count || 0;

          return {
            bundleId: bundle.bundleId,
            // qrTypeName: bundle.qrTypeId?.qrName || "Unknown",
            // qrTypeDescription: bundle.qrTypeId?.qrDescription || "",
            totalQRs: bundle.qrCount,
            soldQRs: activeQRs,
            availableQRs: inactiveQRs,
            createdAt: bundle.createdAt,
          };
        })
      );

      return ApiResponse(
        res,
        200,
        "Salesperson bundle details fetched successfully",
        true,
        bundleDetails
      );
    } catch (error) {
      console.error("Error fetching salesperson bundle details:", error);
      return ApiResponse(
        res,
        500,
        "Failed to fetch salesperson bundle details",
        false,
        null
      );
    }
  }
);

// Admin: transfer a bundle to another salesperson
export const transferBundleToSalesperson = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { bundleId } = req.params as { bundleId: string };
      const { targetSalespersonId } = req.body as {
        targetSalespersonId: string;
      };

      if (!bundleId || !targetSalespersonId) {
        return ApiResponse(
          res,
          400,
          "bundleId and targetSalespersonId are required",
          false,
          null
        );
      }

      // Validate target salesperson exists and is active
      const targetSalesperson = await Salesman.findById(targetSalespersonId);
      if (!targetSalesperson || targetSalesperson.isActive === false) {
        return ApiResponse(
          res,
          404,
          "Target salesperson not found or inactive",
          false,
          null
        );
      }

      // Find bundle
      const bundle = await Bundle.findOne({ bundleId, status: "ASSIGNED" });
      if (!bundle) {
        return ApiResponse(
          res,
          404,
          "Bundle not found or not assigned",
          false,
          null
        );
      }

      // Block transfer if there are pending payment QRs in this bundle
      const pendingCount = await QRModel.countDocuments({
        bundleId,
        qrStatus: QRStatus.PENDING_PAYMENT,
      });
      if (pendingCount > 0) {
        return ApiResponse(
          res,
          400,
          "Cannot transfer bundle while there are QRs with pending payment",
          false,
          null
        );
      }

      if (bundle.assignedTo) {
        // Record previous assignment before changing
        bundle.assignmentHistory.push({
          salesperson: bundle.assignedTo,
          assignedAt: new Date(),
        });
      }

      // Perform transfer (cast _id to ObjectId)
      bundle.assignedTo =
        targetSalesperson._id as unknown as typeof bundle.assignedTo;
      await bundle.save();

      return ApiResponse(res, 200, "Bundle transferred successfully", true, {
        bundleId: bundle.bundleId,
        assignedTo: bundle.assignedTo,
        assignmentHistory: bundle.assignmentHistory,
      });
    } catch (error) {
      console.error("Error transferring bundle:", error);
      return ApiResponse(res, 500, "Failed to transfer bundle", false, null);
    }
  }
);
