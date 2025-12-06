import express from "express";
import {
  authenticate,
  authorize,
} from "../../middlewares/jwtAuthenticationMiddleware";
import requirePin from "../../middlewares/pinAuthenticationMiddleware";
import { UserRoles } from "../../enums/enums";
import { upload } from "../../config/multerConfig";
import { downloadQR } from "../../controllers/admin/orders/orderManagementController";
import { createNewQRType } from "../../controllers/qr-flow/createNewQRTypeController";
import {
  fetchTypesOfQRBasedOnDelivery,
  updateQRPermissionsByUserHandler,
} from "../../controllers/qr-flow/qrController";
import { paymentRoute } from "./payment/paymentRoute";
import { User } from "../../models/auth/user";
import {
  checkQRValidity,
  updateQRBySerialNumberHandler,
  updateQRPermissions,
} from "../../controllers/qr-flow/activateQRController";
import { scanQrHandler } from "../../controllers/qr-flow/qrScanController";
import { sendQuestionNotificationHandler } from "../../controllers/qr-flow/sendQuestionNotification";
import { mailQRTemplate } from "../../controllers/qr-flow/mailQRTemplateController";
import { uploadLocalPDF } from "../../helpers/generateQRPDF";
import {
  getQRTypeQuestions,
  upsertQRTypeQuestions,
  getScanQuestions,
} from "../../controllers/qr-flow/qrQuestionsController";
import { fetchGeneratedQRsByUser } from "../../controllers/qr-flow/qrController";
import { startCallHandler } from "../../controllers/qr-flow/qrScanController";
import { getQrDetailsHandler } from "../../controllers/qr-flow/qrScanController";
import {
  addQRReview,
  getQRReviews,
  deleteQRReview,
  getQRReviewStats,
} from "../../controllers/qr-flow/qrReviewController";

export const qrFlowRoute = express.Router();

qrFlowRoute.post(
  "/create-new-type",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  upload.any(),
  createNewQRType
);

qrFlowRoute.post(
  "/fetch-types",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  fetchTypesOfQRBasedOnDelivery
);

qrFlowRoute.post(
  "/check-validity",
  authenticate,
  authorize([UserRoles.BASIC_USER, UserRoles.ADMIN, UserRoles.SALESPERSON]),
  checkQRValidity
);

qrFlowRoute.post(
  "/update-qr",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  updateQRBySerialNumberHandler
);

qrFlowRoute.post(
  "/qr/:qrId/permissions",
  authenticate,
  requirePin,
  authorize([UserRoles.BASIC_USER]),
  updateQRPermissions
);

qrFlowRoute.get(
  "/scan/:qrId",
  // authenticate,
  // authorize([UserRoles.BASIC_USER]),
  scanQrHandler
);
qrFlowRoute.post(
  "/notification/:qrId",
  // authenticate,
  // authorize([UserRoles.BASIC_USER]),
  sendQuestionNotificationHandler
);
qrFlowRoute.post(
  "/start-call/:qrId",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  startCallHandler
);

qrFlowRoute.post(
  "/send-qr-pdf",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  mailQRTemplate
);

// Bulk update permissions for all QRs of a user (createdFor)
qrFlowRoute.post(
  "/update-permissions-by-user",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  updateQRPermissionsByUserHandler
);

qrFlowRoute.get(
  "/qrdetails/:qrId",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  getQrDetailsHandler
);

qrFlowRoute.post("/test", (req, res) => {
  console.log("Test route hit");
  res.status(200).json({ message: "Route is working" });
});

qrFlowRoute.post("/upload", uploadLocalPDF);

qrFlowRoute.post(
  "/get-questions",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  getQRTypeQuestions
);

// Admin upsert questions for a QR type (to be used in bundle generation UI)
qrFlowRoute.post(
  "/questions/upsert",
  authenticate,
  authorize([UserRoles.ADMIN]),
  upsertQRTypeQuestions
);

// Fetch scan questions by qrId (shown during scan flow)
qrFlowRoute.get(
  "/scan/:qrId/questions",
  // authenticate,
  // authorize([UserRoles.BASIC_USER]),
  getScanQuestions
);
qrFlowRoute.get(
  "/fetch-generated-qrs",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  fetchGeneratedQRsByUser
);

// QR Review Routes
qrFlowRoute.post(
  "/qr/:qrId/reviews",
  authenticate,
  authorize([UserRoles.BASIC_USER, UserRoles.ADMIN]),
  addQRReview
);

qrFlowRoute.get(
  "/qr/:qrId/reviews",
  authenticate,
  authorize([UserRoles.BASIC_USER, UserRoles.ADMIN]),
  getQRReviews
);

qrFlowRoute.delete(
  "/qr/:qrId/reviews/:reviewId",
  authenticate,
  authorize([UserRoles.BASIC_USER, UserRoles.ADMIN]),
  requirePin,
  deleteQRReview
);

qrFlowRoute.get(
  "/qr/:qrId/review-stats",
  authenticate,
  authorize([UserRoles.BASIC_USER, UserRoles.ADMIN]),
  getQRReviewStats
);

qrFlowRoute.use("/payment", paymentRoute);

// Download single QR as PDF
qrFlowRoute.get(
  "/qrs/:qrId/download",
  authenticate,
  authorize([UserRoles.BASIC_USER, UserRoles.SALESPERSON, UserRoles.ADMIN]),
  downloadQR
);
