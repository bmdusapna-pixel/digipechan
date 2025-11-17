import express from "express";
import {
  authenticate,
  authorize,
} from "../../middlewares/jwtAuthenticationMiddleware";
import {
  createBonvoiceCredential,
  updateBonvoiceCredential,
  getFirstBonvoiceCredential,
} from "../../controllers/bonvoice/bonvoiceController";
import { updateBonvoiceToken } from "../../controllers/bonvoice/bonvoiceTokenController";
import { UserRoles } from "../../enums/enums";
import { startAutoCallBridge } from "../../controllers/bonvoice/callController";
import { callWebhook } from "../../controllers/bonvoice/callWebhookController";
import { setCallLog } from "../../controllers/bonvoice/setCallLogController";

export const bonvoiceRoute = express.Router();

bonvoiceRoute.post("/call-webhook", callWebhook);
bonvoiceRoute.post("/call-log", setCallLog);

bonvoiceRoute.post(
  "/call",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  startAutoCallBridge
);
bonvoiceRoute.get(
  "/get-bonvoice",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  getFirstBonvoiceCredential
);

bonvoiceRoute.get(
  "/token",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  updateBonvoiceToken
);

bonvoiceRoute.post(
  "/create-bonvoice",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  createBonvoiceCredential
);

bonvoiceRoute.put(
  "/update-bonvoice",
  authenticate,
  authorize([UserRoles.BASIC_USER]),
  updateBonvoiceCredential
);
