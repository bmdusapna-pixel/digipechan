"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qrFlowRoute = void 0;
const express_1 = __importDefault(require("express"));
const jwtAuthenticationMiddleware_1 = require("../../middlewares/jwtAuthenticationMiddleware");
const passwordAuthenticationMiddleware_1 = __importDefault(require("../../middlewares/passwordAuthenticationMiddleware"));
const enums_1 = require("../../enums/enums");
const multerConfig_1 = require("../../config/multerConfig");
const orderManagementController_1 = require("../../controllers/admin/orders/orderManagementController");
const orderManagementController_2 = require("../../controllers/admin/orders/orderManagementController");
const createNewQRTypeController_1 = require("../../controllers/qr-flow/createNewQRTypeController");
const qrController_1 = require("../../controllers/qr-flow/qrController");
const paymentRoute_1 = require("./payment/paymentRoute");
const activateQRController_1 = require("../../controllers/qr-flow/activateQRController");
const qrScanController_1 = require("../../controllers/qr-flow/qrScanController");
const sendQuestionNotification_1 = require("../../controllers/qr-flow/sendQuestionNotification");
const mailQRTemplateController_1 = require("../../controllers/qr-flow/mailQRTemplateController");
const generateQRPDF_1 = require("../../helpers/generateQRPDF");
const qrQuestionsController_1 = require("../../controllers/qr-flow/qrQuestionsController");
const qrController_2 = require("../../controllers/qr-flow/qrController");
const qrScanController_2 = require("../../controllers/qr-flow/qrScanController");
const qrScanController_3 = require("../../controllers/qr-flow/qrScanController");
const qrReviewController_1 = require("../../controllers/qr-flow/qrReviewController");
exports.qrFlowRoute = express_1.default.Router();
exports.qrFlowRoute.post("/create-new-type", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), multerConfig_1.upload.any(), createNewQRTypeController_1.createNewQRType);
exports.qrFlowRoute.post("/fetch-types", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), qrController_1.fetchTypesOfQRBasedOnDelivery);
exports.qrFlowRoute.post("/check-validity", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER, enums_1.UserRoles.ADMIN, enums_1.UserRoles.SALESPERSON]), activateQRController_1.checkQRValidity);
exports.qrFlowRoute.post("/update-qr", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), activateQRController_1.updateQRBySerialNumberHandler);
exports.qrFlowRoute.post("/qr/:qrId/permissions", jwtAuthenticationMiddleware_1.authenticate, passwordAuthenticationMiddleware_1.default, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), activateQRController_1.updateQRPermissions);
exports.qrFlowRoute.get("/scan/:qrId", 
// authenticate,
// authorize([UserRoles.BASIC_USER]),
qrScanController_1.scanQrHandler);
exports.qrFlowRoute.post("/notification/:qrId", 
// authenticate,
// authorize([UserRoles.BASIC_USER]),
sendQuestionNotification_1.sendQuestionNotificationHandler);
exports.qrFlowRoute.post("/start-call/:qrId", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), qrScanController_2.startCallHandler);
exports.qrFlowRoute.post("/send-qr-pdf", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), mailQRTemplateController_1.mailQRTemplate);
// Bulk update permissions for all QRs of a user (createdFor)
exports.qrFlowRoute.post("/update-permissions-by-user", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), qrController_1.updateQRPermissionsByUserHandler);
exports.qrFlowRoute.get("/qrdetails/:qrId", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), qrScanController_3.getQrDetailsHandler);
exports.qrFlowRoute.post("/test", (req, res) => {
    console.log("Test route hit");
    res.status(200).json({ message: "Route is working" });
});
exports.qrFlowRoute.post("/upload", generateQRPDF_1.uploadLocalPDF);
exports.qrFlowRoute.post("/get-questions", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), qrQuestionsController_1.getQRTypeQuestions);
// Admin upsert questions for a QR type (to be used in bundle generation UI)
exports.qrFlowRoute.post("/questions/upsert", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), qrQuestionsController_1.upsertQRTypeQuestions);
// Fetch scan questions by qrId (shown during scan flow)
exports.qrFlowRoute.get("/scan/:qrId/questions", 
// authenticate,
// authorize([UserRoles.BASIC_USER]),
qrQuestionsController_1.getScanQuestions);
exports.qrFlowRoute.get("/fetch-generated-qrs", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER]), qrController_2.fetchGeneratedQRsByUser);
// QR Review Routes
exports.qrFlowRoute.post("/qr/:qrId/reviews", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER, enums_1.UserRoles.ADMIN]), qrReviewController_1.addQRReview);
exports.qrFlowRoute.get("/qr/:qrId/reviews", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER, enums_1.UserRoles.ADMIN]), qrReviewController_1.getQRReviews);
exports.qrFlowRoute.delete("/qr/:qrId/reviews/:reviewId", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER, enums_1.UserRoles.ADMIN]), passwordAuthenticationMiddleware_1.default, qrReviewController_1.deleteQRReview);
exports.qrFlowRoute.get("/qr/:qrId/review-stats", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER, enums_1.UserRoles.ADMIN]), qrReviewController_1.getQRReviewStats);
exports.qrFlowRoute.use("/payment", paymentRoute_1.paymentRoute);
// Download single QR as PDF
exports.qrFlowRoute.get("/qrs/:qrId/download", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER, enums_1.UserRoles.SALESPERSON, enums_1.UserRoles.ADMIN]), orderManagementController_1.downloadQR);
// Generate share link for individual QR (authenticated)
exports.qrFlowRoute.post("/qrs/:qrId/share", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.BASIC_USER, enums_1.UserRoles.SALESPERSON, enums_1.UserRoles.ADMIN]), orderManagementController_2.generateQRShareLink);
// Public: download individual QR via share token
exports.qrFlowRoute.get("/share/qrs/:token", orderManagementController_2.downloadSharedQR);
