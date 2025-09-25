"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.salesmanRoute = void 0;
const express_1 = __importDefault(require("express"));
const enums_1 = require("../../enums/enums");
const jwtAuthenticationMiddleware_1 = require("../../middlewares/jwtAuthenticationMiddleware");
const salesmanController_1 = require("../../controllers/salesman/salesmanController");
const paymentTicketController_1 = require("../../controllers/payment/paymentTicketController");
const multerConfig_1 = require("../../config/multerConfig");
exports.salesmanRoute = express_1.default.Router();
// s
// Admin routes - for fetching salesmen list
exports.salesmanRoute.post("/auth/sign-up", salesmanController_1.registerSalesperson);
exports.salesmanRoute.get("/list", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), salesmanController_1.getAllSalesmen);
// Salesman routes - for salesman dashboard
exports.salesmanRoute.get("/bundles", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.SALESPERSON]), salesmanController_1.getSalesmanBundles);
exports.salesmanRoute.get("/bundle/:bundleId/qrs", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.SALESPERSON]), salesmanController_1.getBundleQRs);
exports.salesmanRoute.put("/sell-qr", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.SALESPERSON]), salesmanController_1.sellQRToCustomer);
exports.salesmanRoute.get("/stats", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.SALESPERSON]), salesmanController_1.getSalesmanStats);
exports.salesmanRoute.get("/sold-qrs", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.SALESPERSON]), salesmanController_1.getSoldQrsForSalesman);
exports.salesmanRoute.post("/auth/login", salesmanController_1.salesmanLogin);
// Payment ticket routes for salespeople
exports.salesmanRoute.post("/payment-ticket", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.SALESPERSON]), multerConfig_1.upload.single("paymentProof"), paymentTicketController_1.createPaymentTicket);
exports.salesmanRoute.get("/payment-tickets", jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.SALESPERSON]), paymentTicketController_1.getSalespersonTickets);
