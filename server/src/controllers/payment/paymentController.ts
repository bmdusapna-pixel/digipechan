import expressAsyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../types/AuthenticatedRequest";
import { Response } from "express";
import { QRMetaData } from "../../models/qr-flow/newQRTypeModel";
import { ApiResponse } from "../../config/ApiResponse";
import { PaymentTransaction } from "../../models/transaction/paymentTransaction";
import { PaymentTransactionStatus, QRStatus } from "../../config/constants";
import { Request } from "express";

import {
  BACKEND_BASE_URL,
  BACKEND_PROD_URL,
  EKQR_API_KEY,
  FRONTEND_BASE_URL_DEV,
  FRONTEND_BASE_URL_PROD_DOMAIN,
  FRONTEND_BASE_URL_PROD_VERCEL,
  NODE_ENV,
} from "../../secrets";
import { UserRoles } from "../../enums/enums";
import {
  PhonePePaymentInit,
  verifyPhonePeTransactionStatus,
} from "../../utils/phonePeUtils";
import { createAndSaveQR } from "../qr-flow/createNewQRTypeController";
import axios from "axios";
import { User } from "../../models/auth/user";
import mongoose, { Mongoose } from "mongoose";
import logger from "../../config/logger";
import { QRModel } from "../../models/qr-flow/qrModel";

export const initiatePayment = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    let {
      items,
      createdFor,
      shippingAddress = {},
      deliveryType,
      amount,
      qrId,
    } = req.body as any;
    console.log("Items : ", items);
    const createdBy = req.data?.userId;

    if (!createdFor) createdFor = req.data?.userId;

    let totalAmount = 0;

    // If an explicit amount is provided (e.g., salesman online payment), use it directly
    if (typeof amount === "number" && amount > 0) {
      totalAmount = amount;
    } else {
      for (const item of items) {
        console.log("Item is : ", item);
        const qrType = await QRMetaData.findById(item.qrTypeId);

        console.log("QR Type is : ", qrType);
        if (!qrType)
          return ApiResponse(res, 400, "QR Type Not Found!", false, null);

        totalAmount = totalAmount + item.quantity * qrType.discountedPrice;
      }
    }

    const transactionId = new mongoose.Types.ObjectId();

    await PaymentTransaction.create({
      transactionId,
      items: items?.map((i: any) => ({ ...i, qrId })) ?? [],
      createdBy,
      createdFor,
      salespersonId: (req as any)?.data?.roles?.includes?.(UserRoles.SALESPERSON)
        ? req.data?.userId
        : undefined, // when initiated by salesman
      deliveryType: deliveryType,
      shippingAddress,
      amount: totalAmount,
      status: PaymentTransactionStatus.INITIATED,
    });

    // Decide redirect url per flow:
    // - Salesman bundle sale (qrId present or salespersonId inferred): send backend callback so server updates QR
    // - Customer cart flow: keep existing frontend redirect and let FE poll /payment-status
    const isSalesmanFlow = Boolean(qrId);
    const backendUrl = NODE_ENV === 'dev' ? BACKEND_BASE_URL : BACKEND_PROD_URL;
    const frontendBaseUrl =
      NODE_ENV === "dev" ? FRONTEND_BASE_URL_DEV : FRONTEND_BASE_URL_PROD_DOMAIN;
    const redirectUrl = isSalesmanFlow
      ? `${backendUrl}/api/qr-flow/payment/verify-payment`
      : `${frontendBaseUrl}/payment-status`;

    const user = await User.findById(createdFor || req.data?.userId!);

    try {
      const ekqrPayload = {
        key: EKQR_API_KEY,
        client_txn_id: transactionId.toString(),
        amount: totalAmount.toString(),
        p_info: "QR Purchase",
        customer_name: (user?.firstName ?? "" + user?.lastName) || "Customer",
        customer_email: user?.email || "customer@example.com",
        customer_mobile: "9999999999",
        redirect_url: redirectUrl,
      };

      console.log("Payment Payload : ", ekqrPayload);
      const response = await axios.post(
        "https://api.ekqr.in/api/create_order",
        ekqrPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response is : ", response);

      const ekqrResponse = response.data;
      logger.info("EKQR Response", ekqrResponse);

      if (ekqrResponse.status && ekqrResponse.data?.payment_url) {
        return ApiResponse(
          res,
          200,
          "Payment initiated",
          true,
          ekqrResponse.data.payment_url
        );
      } else {
        logger.error("eKQR API Error:", ekqrResponse); // log full object
        return ApiResponse(
          res,
          500,
          "Failed to initiate payment with eKQR",
          false,
          null,
          ekqrResponse?.msg || JSON.stringify(ekqrResponse)
        );
      }
    } catch (error: any) {
      const errPayload =
        error?.response?.data || error?.message || "Unknown error";
      logger.error("Error initiating eKQR payment:", errPayload);
      return ApiResponse(
        res,
        500,
        "Payment initiation failed",
        false,
        null,
        typeof errPayload === "string" ? errPayload : JSON.stringify(errPayload)
      );
    }
  }
);

export const paymentCallBackHandler = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { client_txn_id: transactionId } = req.query;

    if (!transactionId)
      return ApiResponse(res, 400, "Missing Txn ID", false, null);

    let isPaymentSuccess = false;
    let paymentStatusMessage = "Payment unfulfilled";

    const transaction = await PaymentTransaction.findOne({ transactionId });

    const transactionDate = transaction!.createdAt;
    const year = transactionDate!.getFullYear();
    const month = (transactionDate!.getMonth() + 1).toString().padStart(2, "0");
    const day = transactionDate!.getDate().toString().padStart(2, "0");

    const formattedTxnDate = `${day}-${month}-${year}`;
    try {
      const statusCheckPayload = {
        key: EKQR_API_KEY,
        client_txn_id: transactionId,
        txn_date: formattedTxnDate,
      };

      const statusCheckResponse = await axios.post(
        "https://api.ekqr.in/api/check_order_status",
        statusCheckPayload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const ekqrStatusData = statusCheckResponse.data;
      console.log("eKQR Status Check Response:", ekqrStatusData);
      if (
        ekqrStatusData.status === true &&
        ekqrStatusData.data?.status === "success"
      ) {
        isPaymentSuccess = true;
        paymentStatusMessage = "Payment successful";
      } else {
        paymentStatusMessage =
          ekqrStatusData.data?.status_message || "Payment failed or pending";
      }
    } catch (error: any) {
      logger.error("Error verifying eKQR payment status:", error.message);
      paymentStatusMessage = "Failed to verify payment status with gateway.";
    }

    if (transaction && isPaymentSuccess) {
      transaction.status = PaymentTransactionStatus.PAID;

      let transactionDocumentId = transaction._id;
      let items = transaction.items;
      console.log("Items : ", items);
      let createdBy = transaction.createdBy;
      let createdFor = transaction.createdFor;

      for (const item of items) {
        // If a specific QR was referenced (salesman selling from bundle), mark it sold
        if (item.qrId) {
          logger.debug(
            `QR update attempt tx=${transactionId} qrId=${item.qrId}`
          );
          await QRModel.findByIdAndUpdate(
            item.qrId,
            {
              isSold: true,
              createdFor,
              soldBySalesperson: transaction.salespersonId,
              transactionId: transactionDocumentId,
            },
            {
              new: true,
            }
          );
          logger.debug(
            `QR update success tx=${transactionId} qrId=${item.qrId}`
          );
        } else {
          await createAndSaveQR({
            qrTypeId: item.qrTypeId,
            createdBy: createdBy,
            createdFor: createdFor,
            transactionId: transactionDocumentId,
            shippingAddress: transaction?.shippingAddress,
            deliveryType: transaction.deliveryType,
            currentUserIdLoggedIn: createdFor?.toString()!,
          });
        }
      }

      await transaction.save();

      //TODO : Here we will send the pdfs on email.
    } else if (transaction) {
      transaction.status = PaymentTransactionStatus.FAILED;
      await transaction.save();
    }

    const frontendBaseUrl =
      NODE_ENV === "dev" ? FRONTEND_BASE_URL_DEV : FRONTEND_BASE_URL_PROD_DOMAIN;
    const redirectFrontendUrl = `${frontendBaseUrl}/payment-status?transactionId=${transactionId}`;

    // return ApiResponse(res,200, 'Phone Pe Payment completed!', true, redirectFrontendUrl);
    return res.redirect(redirectFrontendUrl);
  }
);

export const paymentStatusHandler = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { transactionId, client_txn_id } = req.query as {
      transactionId?: string;
      client_txn_id?: string;
    };
    const id = transactionId || client_txn_id;
    if (!id)
      return ApiResponse(res, 400, "Missing transaction id", false, null);

    const transaction = await PaymentTransaction.findOne({ transactionId: id });
    if (!transaction)
      return ApiResponse(res, 400, "No transaction found!", false, null);

    if (transaction.status === PaymentTransactionStatus.INITIATED) {
      const d = transaction.createdAt!;
      const txn_date = `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;

      try {
        const statusCheckPayload = {
          key: EKQR_API_KEY,
          client_txn_id: id,
          txn_date,
        };
        const statusRes = await axios.post(
          "https://api.ekqr.in/api/check_order_status",
          statusCheckPayload,
          {
            headers: { "Content-Type": "application/json" },
          }
        );
        const ekqr = statusRes.data;

        if (ekqr?.status === true && ekqr?.data?.status === "success") {
          transaction.status = PaymentTransactionStatus.PAID;
          
          for (const item of transaction.items) {
            if ((item as any).qrId) {
              await QRModel.findByIdAndUpdate((item as any).qrId, {
                isSold: true,
                createdFor: transaction.createdFor,
                soldBySalesperson: (transaction as any).salespersonId,
                transactionId: transaction._id,
              });
            } else {
              await createAndSaveQR({
                qrTypeId: item.qrTypeId as any,
                createdBy: transaction.createdBy as any,
                createdFor: transaction.createdFor as any,
                transactionId: transaction._id as any,
                shippingAddress: transaction.shippingAddress as any,
                deliveryType: transaction.deliveryType as any,
                currentUserIdLoggedIn: transaction.createdFor?.toString()!,
              });
            }
          }
          await transaction.save();
        } else if (["failed", "cancelled"].includes(ekqr?.data?.status)) {
          transaction.status = PaymentTransactionStatus.FAILED;
          await transaction.save();
        }
      } catch {
        // keep INITIATED; frontend will continue polling
      }
    }

    // If transaction is already PAID (e.g., previously updated), ensure QR docs are reconciled
    if (transaction.status === PaymentTransactionStatus.PAID) {
      for (const item of transaction.items as any[]) {
        if (item.qrId) {
          await QRModel.updateOne(
            { _id: item.qrId },
            {
              $set: {
                isSold: true,
                createdFor: transaction.createdFor,
                soldBySalesperson: (transaction as any).salespersonId,
                transactionId: transaction._id,
              },
            }
          );
        }
      }
    }
    
    return ApiResponse(
      res,
      200,
      "Payment information fetched successfully",
      true,
      {
        paymentStatus: transaction.status,
        items: transaction.items,
        amount: transaction.amount,
      }
    );
  }
);

// ---------------------- DEMO HANDLERS (no external API / DB calls) ----------------------
// These handlers simulate the behaviour of the real controllers for testing/demo
export const initiatePaymentDemo = expressAsyncHandler(
  async (req: AuthenticatedRequest, res: Response) => {
    const { items = [], amount } = req.body as any;
    const transactionId = new mongoose.Types.ObjectId();

    const mockAmount =
      typeof amount === "number" && amount > 0
        ? amount
        : (items?.length ?? 0) * 100; // fallback mock calculation

    const demoPaymentUrl = `https://demo.payment/gateway/${transactionId.toString()}`;

    // Return same shape as original handler on success (payment_url string)
    return ApiResponse(res, 200, "Payment initiated", true, demoPaymentUrl);
  }
);

export const paymentCallBackHandlerDemo = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { client_txn_id: transactionId } = req.query as any;

    if (!transactionId)
      return ApiResponse(res, 400, "Missing Txn ID", false, null);

    // Mirror original redirect (no extra query params)
    const frontendBaseUrl =
      NODE_ENV === "dev" ? FRONTEND_BASE_URL_DEV : FRONTEND_BASE_URL_PROD_DOMAIN;
    const redirectFrontendUrl = `${frontendBaseUrl}/payment-status?transactionId=${transactionId}`;

    return res.redirect(redirectFrontendUrl);
  }
);

export const paymentStatusHandlerDemo = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { transactionId, client_txn_id } = req.query as any;
    const id = transactionId || client_txn_id;
    if (!id) return ApiResponse(res, 400, "Missing transaction id", false, null);

    // Return same shape as original: { paymentStatus, items, amount }
    const demoResponse = {
      paymentStatus: PaymentTransactionStatus.PAID,
      items: [
        {
          qrTypeId: "demo-qrtype",
          quantity: 1,
        },
      ],
      amount: 100,
    };

    return ApiResponse(
      res,
      200,
      "Payment information fetched successfully",
      true,
      demoResponse
    );
  }
);
