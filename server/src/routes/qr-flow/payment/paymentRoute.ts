import express from "express";
import {
  authenticate,
  authorize,
} from "../../../middlewares/jwtAuthenticationMiddleware";
import { UserRoles } from "../../../enums/enums";
import {
  initiatePaymentDemo,
  paymentStatusHandlerDemo,
  paymentCallBackHandlerDemo,
} from "../../../controllers/payment/paymentController";
import { User } from "../../../models/auth/user";

export const paymentRoute = express.Router();

paymentRoute.post(
  "/initiate",
  authenticate,
  authorize([UserRoles.BASIC_USER, UserRoles.SALESPERSON]),
  initiatePaymentDemo
);

paymentRoute.get(
  "/verify-payment",
  // authenticate,
  // authorize([UserRoles.BASIC_USER]),
  paymentCallBackHandlerDemo
);

paymentRoute.get(
  "/payment-status",
  // authenticate,
  // authorize([UserRoles.BASIC_USER]),
  paymentStatusHandlerDemo
);
