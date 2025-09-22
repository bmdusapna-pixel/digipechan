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
exports.getQrDetailsHandler = exports.startCallHandler = exports.scanQrHandler = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const qrModel_1 = require("../../models/qr-flow/qrModel");
const ApiResponse_1 = require("../../config/ApiResponse");
const constants_1 = require("../../config/constants");
const user_1 = require("../../models/auth/user");
const push_1 = require("../../config/push");
/**
 * Handler for scanning a QR code
 * Sends notification to the QR owner with scan location
 */
exports.scanQrHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    const { qrId } = req.params;
    const { latitude, longitude } = req.query;
    const lat = latitude ? parseFloat(latitude) : null;
    const long = longitude ? parseFloat(longitude) : null;
    // ✅ Fetch QR info with populated QR type
    const qr = yield qrModel_1.QRModel.findById(qrId)
        .populate({
        path: 'qrTypeId',
        select: 'qrName tagType'
    })
        .populate({
        path: 'createdFor',
        select: 'firstName lastName mobileNumber avatar'
    })
        .lean();
    if (!qr) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, 'QR Code not found', false);
    }
    let notificationSent = false;
    try {
        const ownerId = ((_b = (_a = qr.createdFor) === null || _a === void 0 ? void 0 : _a.toString) === null || _b === void 0 ? void 0 : _b.call(_a)) ||
            ((_e = (_d = (_c = qr.createdFor) === null || _c === void 0 ? void 0 : _c._id) === null || _d === void 0 ? void 0 : _d.toString) === null || _e === void 0 ? void 0 : _e.call(_d));
        if (ownerId) {
            const owner = yield user_1.User.findById(ownerId).select('deviceTokens').lean();
            const tokens = (owner === null || owner === void 0 ? void 0 : owner.deviceTokens) || [];
            if (tokens.length > 0) {
                yield push_1.push.notifyMany(tokens, 'QR Scanned', `Your QR ${qr.serialNumber || ''} was scanned at ${lat}, ${long}`, {
                    qrId: String(qr._id),
                    serialNumber: qr.serialNumber || '',
                    qrStatus: qr.qrStatus || '',
                    vehicleNumber: qr.vehicleNumber || '',
                    latitude: (lat === null || lat === void 0 ? void 0 : lat.toString()) || '',
                    longitude: (long === null || long === void 0 ? void 0 : long.toString()) || '',
                });
                notificationSent = true;
            }
        }
    }
    catch (err) {
        console.error('Push notification error:', err);
    }
    if (qr.qrStatus !== constants_1.QRStatus.ACTIVE) {
        return (0, ApiResponse_1.ApiResponse)(res, 403, 'QR Code is not active', false, {
            _id: qr._id,
            serialNumber: qr.serialNumber,
            qrStatus: qr.qrStatus,
            createdByAvatar: qr.createdBy || null,
            notificationSent,
        });
    }
    const visibleFields = qr.visibleInfoFields || [];
    const visibleData = Object.fromEntries(Object.entries(qr).filter(([key]) => visibleFields.includes(key)));
    // Calculate review statistics
    const reviews = qr.reviews || [];
    const reviewStats = {
        totalReviews: reviews.length,
        averageRating: reviews.length > 0
            ? Math.round((reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length) * 10) / 10
            : 0,
        latestReviews: reviews
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 3), // Show only latest 3 reviews
    };
    return (0, ApiResponse_1.ApiResponse)(res, 200, 'QR scanned successfully', true, {
        qr: {
            _id: qr._id,
            serialNumber: qr.serialNumber,
            qrTypeId: Object.assign(Object.assign({}, qr.qrTypeId), { questions: qr.questions || [] }),
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
}));
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
exports.startCallHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    console.log('📞 startCallHandler invoked');
    try {
        // ✅ Validate request data
        const { qrId } = req.params;
        const { userName, roomId } = req.body;
        if (!qrId || !userName || !roomId) {
            console.warn('⚠️ Missing required parameters');
            return (0, ApiResponse_1.ApiResponse)(res, 400, 'qrId, userName and roomId are required', false);
        }
        // ✅ Fetch QR Info
        console.log(`🔍 Fetching QR with id: ${qrId}`);
        const qr = yield qrModel_1.QRModel.findById(qrId)
            .populate({ path: 'createdFor', select: 'avatar' })
            .lean();
        if (!qr) {
            console.warn('❌ QR Code not found');
            return (0, ApiResponse_1.ApiResponse)(res, 404, 'QR Code not found', false);
        }
        console.log('✅ QR Code found:', {
            id: qr._id,
            serialNumber: qr.serialNumber,
            createdBy: ((_a = qr.createdBy) === null || _a === void 0 ? void 0 : _a._id) || 'N/A',
        });
        // ✅ Find QR owner
        const ownerId = ((_d = (_c = (_b = qr.createdFor) === null || _b === void 0 ? void 0 : _b._id) === null || _c === void 0 ? void 0 : _c.toString) === null || _d === void 0 ? void 0 : _d.call(_c)) ||
            ((_f = (_e = qr.createdFor) === null || _e === void 0 ? void 0 : _e.toString) === null || _f === void 0 ? void 0 : _f.call(_e));
        let notificationSent = false;
        if (ownerId) {
            const owner = yield user_1.User.findById(ownerId.toString()).select('deviceTokens').lean();
            const tokens = (owner === null || owner === void 0 ? void 0 : owner.deviceTokens) || [];
            if (tokens.length > 0) {
                try {
                    yield push_1.push.notifyMany(tokens, 'Incoming Call', `You have an incoming call from ${userName}`, {
                        qrId: String(qr._id),
                        serialNumber: qr.serialNumber || '',
                        roomId,
                        userName,
                    });
                    console.log('✅ Push notification sent to owner by phone:', ownerId);
                    notificationSent = true;
                }
                catch (pushErr) {
                    console.error('❌ Push notification error:', pushErr);
                    return (0, ApiResponse_1.ApiResponse)(res, 500, 'Failed to send call notification', false);
                }
            }
            else {
                console.warn('⚠️ No device tokens available for owner');
            }
        }
        else {
            console.warn('⚠️ No owner found for this QR');
        }
        // ✅ Final confirmation
        console.log('🎉 Call initiated successfully');
        return (0, ApiResponse_1.ApiResponse)(res, 200, 'Call initiated successfully', true, {
            roomId,
            userName,
            qrId,
            notificationSent,
        });
    }
    catch (err) {
        console.error('❌ startCallHandler internal error:', err);
        return (0, ApiResponse_1.ApiResponse)(res, 500, 'Internal server error', false);
    }
}));
exports.getQrDetailsHandler = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrId } = req.params;
    // ✅ Fetch QR info
    const qr = yield qrModel_1.QRModel.findById(qrId)
        .populate({ path: 'createdBy', select: 'avatar' })
        .lean();
    if (!qr) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, 'QR Code not found', false);
    }
    // ✅ Visible info fields logic (agar aapke model me ho)
    const visibleFields = qr.visibleInfoFields || [];
    const visibleData = Object.fromEntries(Object.entries(qr).filter(([key]) => visibleFields.includes(key)));
    // Calculate review statistics
    const reviews = qr.reviews || [];
    const reviewStats = {
        totalReviews: reviews.length,
        averageRating: reviews.length > 0
            ? Math.round((reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length) * 10) / 10
            : 0,
        latestReviews: reviews
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5), // Show latest 5 reviews for details view
    };
    return (0, ApiResponse_1.ApiResponse)(res, 200, 'QR details fetched successfully', true, {
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
}));
