import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { QRModel } from "../../models/qr-flow/qrModel";
import { ApiResponse } from "../../config/ApiResponse";
import { QRStatus } from "../../config/constants";
import { User } from "../../models/auth/user";
import { push } from "../../config/push";

/**
 * Handler for scanning a QR code
 * Sends notification to the QR owner with scan location
 */
export const scanQrHandler = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { qrId } = req.params;
    const { latitude, longitude } = req.query;

    const lat = latitude ? parseFloat(latitude as string) : null;
    const long = longitude ? parseFloat(longitude as string) : null;

    // ✅ Fetch QR info with populated QR type
    const qr = await QRModel.findById(qrId)
      .populate({
        path: "qrTypeId",
        select: "qrName tagType",
      })
      .populate({
        path: "createdFor",
        select: "firstName lastName mobileNumber avatar",
      })
      .lean();

    if (!qr) {
      return ApiResponse(res, 404, "QR Code not found", false);
    }

    let notificationSent = false;

    try {
      const ownerId = (qr as any).createdFor?._id?.toString();

      if (ownerId) {
        const owner = await User.findById(ownerId)
          .select("deviceTokens")
          .lean();
        const tokens = owner?.deviceTokens || [];

        if (tokens.length > 0) {
          await push.notifyMany(
            tokens,
            "QR Scanned",
            `Your QR ${qr.serialNumber || ""} was scanned at ${lat}, ${long}`,
            {
              qrId: String(qr._id),
              serialNumber: qr.serialNumber || "",
              qrStatus: qr.qrStatus || "",
              vehicleNumber: qr.vehicleNumber || "",
              latitude: lat?.toString() || "",
              longitude: long?.toString() || "",
            }
          );
          notificationSent = true;
        }
      }
    } catch (err) {
      console.error("Push notification error:", err);
    }

    if (qr.qrStatus !== QRStatus.ACTIVE) {
      return ApiResponse(res, 403, "QR Code is not active", false, {
        _id: qr._id,
        serialNumber: qr.serialNumber,
        qrStatus: qr.qrStatus,
        createdByAvatar: qr.createdBy || null,
        notificationSent,
      });
    }

    const visibleFields = qr.visibleInfoFields || [];
    const visibleData = Object.fromEntries(
      Object.entries(qr).filter(([key]) => visibleFields.includes(key))
    );

    // Calculate review statistics
    const reviews = qr.reviews || [];
    const reviewStats = {
      totalReviews: reviews.length,
      averageRating:
        reviews.length > 0
          ? Math.round(
              (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) /
                reviews.length) *
                10
            ) / 10
          : 0,
      latestReviews: reviews
        .sort(
          (a, b) =>
            new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
        )
        .slice(0, 3), // Show only latest 3 reviews
    };

    return ApiResponse(res, 200, "QR scanned successfully", true, {
      qr: {
        _id: qr._id,
        serialNumber: qr.serialNumber,
        qrTypeId: {
          ...qr.qrTypeId,
          questions: qr.questions || [], // Use questions from QR record
        },
        qrStatus: qr.qrStatus,
        customerName: qr.customerName || null,
        altMobileNumber: qr.altMobileNumber || null,
        email: qr.email || null,
        vehicleNumber: qr.vehicleNumber || null,
        mobileNumber: qr.mobileNumber || null,
        textMessagesAllowed: qr.textMessagesAllowed || false,
        voiceCallsAllowed: qr.voiceCallsAllowed || false,
        videoCallsAllowed: qr.videoCallsAllowed || false,
        createdFor: qr.createdFor,
        visibleData,
        createdByAvatar: qr.createdBy || null,
        questions: qr.questions || [], // Also include questions directly
      },
      notificationSent,
      latitude: lat,
      longitude: long,
      reviewStats,
    });
  }
);

/**
 * Handler to initiate a video call
 * Sends incoming call notification to driver with a unique roomId
//  */
// export const startCallHandler = expressAsyncHandler(
//   async (req: Request, res: Response) => {
//     console.log('startCallHandler invoked');
//     console.log('Request params:', req.params);
//     console.log('Request body:', req.body);

//     const { qrId } = req.params;
//     const { userName, roomId } = req.body;

//     if (!qrId || !userName || !roomId) {
//       console.log('Missing parameters');
//       return ApiResponse(res, 400, 'qrId, userName and roomId are required', false);
//     }

//     // ✅ Fetch QR info
//     const qr = await QRModel.findById(qrId)
//       .populate({ path: 'createdFor', select: 'deviceTokens firstName lastName email' })
//       .lean();

//     if (!qr) {
//       console.log('QR Code not found');
//       return ApiResponse(res, 404, 'QR Code not found', false);
//     }

//     // ✅ Send incoming call notification to the driver
//     try {
//       const ownerId =
//         (qr as any).createdFor?.toString?.() ||
//         (qr as any).createdFor?._id?.toString?.();

//       if (ownerId) {
//         const owner = await User.findById(ownerId).select('deviceTokens').lean();
//         const tokens = owner?.deviceTokens || [];

//         if (tokens.length > 0) {
//           console.log('Sending push notification');
//           await push.notifyMany(
//             tokens,
//             'Incoming Call',
//             `You have an incoming call from ${userName}`,
//             {
//               qrId: String(qr._id),
//               serialNumber: qr.serialNumber || '',
//               roomId,
//               userName,
//             }
//           );
//         }
//       }
//     } catch (err) {
//       console.error('Push notification error:', err);
//       return ApiResponse(res, 500, 'Failed to send call notification', false);
//     }

//     console.log('Call initiated successfully');
//     return ApiResponse(res, 200, 'Call initiated successfully', true, {
//       roomId,
//       userName,
//     });
//   }
// );

export const startCallHandler = expressAsyncHandler(
  async (req: Request, res: Response) => {
    console.log("📞 startCallHandler invoked");

    try {
      // ✅ Validate request data
      const { qrId } = req.params;
      const { userName, roomId } = req.body;

      if (!qrId || !userName || !roomId) {
        console.warn("⚠️ Missing required parameters");
        return ApiResponse(
          res,
          400,
          "qrId, userName and roomId are required",
          false
        );
      }

      // ✅ Fetch QR Info
      console.log(`🔍 Fetching QR with id: ${qrId}`);
      const qr = await QRModel.findById(qrId)
        .populate({ path: "createdFor", select: "avatar" })
        .lean();

      if (!qr) {
        console.warn("❌ QR Code not found");
        return ApiResponse(res, 404, "QR Code not found", false);
      }

      console.log("✅ QR Code found:", {
        id: qr._id,
        serialNumber: qr.serialNumber,
        createdBy: qr.createdBy?._id || "N/A",
      });

      // ✅ Find QR owner
      const ownerId =
        (qr as any).createdFor?._id?.toString?.() ||
        (qr as any).createdFor?.toString?.();

      let notificationSent = false;

      if (ownerId) {
        const owner = await User.findById(ownerId.toString())
          .select("deviceTokens")
          .lean();
        const tokens = owner?.deviceTokens || [];

        if (tokens.length > 0) {
          try {
            await push.notifyMany(
              tokens,
              "Incoming Call",
              `You have an incoming call from ${userName}`,
              {
                qrId: String(qr._id),
                serialNumber: qr.serialNumber || "",
                roomId,
                userName,
              }
            );
            console.log(
              "✅ Push notification sent to owner by phone:",
              ownerId
            );
            notificationSent = true;
          } catch (pushErr) {
            console.error("❌ Push notification error:", pushErr);
            return ApiResponse(
              res,
              500,
              "Failed to send call notification",
              false
            );
          }
        } else {
          console.warn("⚠️ No device tokens available for owner");
        }
      } else {
        console.warn("⚠️ No owner found for this QR");
      }

      // ✅ Final confirmation
      console.log("🎉 Call initiated successfully");
      return ApiResponse(res, 200, "Call initiated successfully", true, {
        roomId,
        userName,
        qrId,
        notificationSent,
      });
    } catch (err) {
      console.error("❌ startCallHandler internal error:", err);
      return ApiResponse(res, 500, "Internal server error", false);
    }
  }
);

export const getQrDetailsHandler = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { qrId } = req.params;

    // ✅ Fetch QR info
    const qr = await QRModel.findById(qrId)
      .populate({ path: "createdBy", select: "avatar" })
      .lean();

    if (!qr) {
      return ApiResponse(res, 404, "QR Code not found", false);
    }

    // ✅ Visible info fields logic (agar aapke model me ho)
    const visibleFields = qr.visibleInfoFields || [];
    const visibleData = Object.fromEntries(
      Object.entries(qr).filter(([key]) => visibleFields.includes(key))
    );

    // Calculate review statistics
    const reviews = qr.reviews || [];
    const reviewStats = {
      totalReviews: reviews.length,
      averageRating:
        reviews.length > 0
          ? Math.round(
              (reviews.reduce((sum, r) => sum + (r.rating || 5), 0) /
                reviews.length) *
                10
            ) / 10
          : 0,
      latestReviews: reviews
        .sort(
          (a, b) =>
            new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
        )
        .slice(0, 5), // Show latest 5 reviews for details view
    };

    return ApiResponse(res, 200, "QR details fetched successfully", true, {
      qrTypeId: qr.qrTypeId,
      visibleData,
      qrStatus: qr.qrStatus,
      customerName: qr.customerName || null,
      altMobileNumber: qr.altMobileNumber || null,
      email: qr.email || null,
      vehicleNumber: qr.vehicleNumber || null,
      mobileNumber: qr.mobileNumber || null,
      textMessagesAllowed: qr.textMessagesAllowed || false,
      voiceCallsAllowed: qr.voiceCallsAllowed || false,
      videoCallsAllowed: qr.videoCallsAllowed || false,
      createdByAvatar: qr.createdBy || null,
      reviewStats,
    });
  }
);
