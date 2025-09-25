import express from "express";
import { UserRoles } from "../../enums/enums";
import {
  authenticate,
  authorize,
} from "../../middlewares/jwtAuthenticationMiddleware";
import {
  getAllSalesmen,
  getSalesmanBundles,
  getBundleQRs,
  sellQRToCustomer,
  getSalesmanStats,
  salesmanLogin,
  getSoldQrsForSalesman,
  registerSalesperson,
} from "../../controllers/salesman/salesmanController";
import {
  createPaymentTicket,
  getSalespersonTickets,
} from "../../controllers/payment/paymentTicketController";
import { upload } from "../../config/multerConfig";

export const salesmanRoute = express.Router();
// s
// Admin routes - for fetching salesmen list
salesmanRoute.post("/auth/sign-up", registerSalesperson);

salesmanRoute.get(
  "/list",
  authenticate,
  authorize([UserRoles.ADMIN]),
  getAllSalesmen
);

// Salesman routes - for salesman dashboard
salesmanRoute.get(
  "/bundles",
  authenticate,
  authorize([UserRoles.SALESPERSON]),
  getSalesmanBundles
);
salesmanRoute.get(
  "/bundle/:bundleId/qrs",
  authenticate,
  authorize([UserRoles.SALESPERSON]),
  getBundleQRs
);
salesmanRoute.put(
  "/sell-qr",
  authenticate,
  authorize([UserRoles.SALESPERSON]),
  sellQRToCustomer
);
salesmanRoute.get(
  "/stats",
  authenticate,
  authorize([UserRoles.SALESPERSON]),
  getSalesmanStats
);
salesmanRoute.get(
  "/sold-qrs",
  authenticate,
  authorize([UserRoles.SALESPERSON]),
  getSoldQrsForSalesman
);
salesmanRoute.post("/auth/login", salesmanLogin);

// Payment ticket routes for salespeople
salesmanRoute.post(
  "/payment-ticket",
  authenticate,
  authorize([UserRoles.SALESPERSON]),
  upload.single("paymentProof"),
  createPaymentTicket
);
salesmanRoute.get(
  "/payment-tickets",
  authenticate,
  authorize([UserRoles.SALESPERSON]),
  getSalespersonTickets
);
