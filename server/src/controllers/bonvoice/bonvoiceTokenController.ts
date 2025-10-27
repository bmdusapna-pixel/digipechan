import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import axios from "axios";
import { BonvoiceCredential } from "../../models/bonvoice/bonvoiceCredentialModel";
import { ApiResponse } from "../../config/ApiResponse";

export const updateBonvoiceToken = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const firstUser = await BonvoiceCredential.findOne().sort({ createdAt: 1 });

    if (!firstUser) {
      return ApiResponse(
        res,
        404,
        "No Bonvoice credentials found.",
        false,
        null,
        "Not Found"
      );
    }

    try {
      const response = await axios.post(
        "https://backend.pbx.bonvoice.com/usermanagement/external-auth/",
        {
          username: firstUser.username,
          password: firstUser.password,
        }
      );

      const { status, data } = response.data;

      if (status !== "1" || !data?.header_value) {
        return ApiResponse(
          res,
          400,
          "Failed to get a valid token from Bonvoice API.",
          false,
          null,
          "Invalid API Response"
        );
      }

      const headerValue = data.header_value;
      firstUser.token = headerValue;
      await firstUser.save();

      return ApiResponse(
        res,
        200,
        "Bonvoice token updated successfully.",
        true,
        {
          username: firstUser.username,
          token: headerValue,
        }
      );
    } catch (error: any) {
      console.error("Bonvoice API error:", error.message);
      return ApiResponse(
        res,
        500,
        "Failed to fetch or update token from Bonvoice API.",
        false,
        null,
        error.message || "Internal Server Error"
      );
    }
  }
);
