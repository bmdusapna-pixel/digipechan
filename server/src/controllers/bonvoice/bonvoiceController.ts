import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import { BonvoiceCredential } from "../../models/bonvoice/bonvoiceCredentialModel";
import { ApiResponse } from "../../config/ApiResponse";

export const getFirstBonvoiceCredential = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const first = await BonvoiceCredential.findOne().sort({ createdAt: 1 });

    if (!first) {
      return ApiResponse(
        res,
        404,
        "No Bonvoice credentials found.",
        false,
        null,
        "Not Found"
      );
    }

    return ApiResponse(
      res,
      200,
      "Bonvoice credential fetched successfully.",
      true,
      first
    );
  }
);

// Create Bonvoice credentials (without token)
export const createBonvoiceCredential = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { username, password, did } = req.body;

    if (!username || !password || did === undefined) {
      return ApiResponse(
        res,
        400,
        "Fields username, password, and did are required.",
        false,
        null,
        "Validation Error"
      );
    }

    const existing = await BonvoiceCredential.findOne({ username });
    if (existing) {
      return ApiResponse(
        res,
        400,
        "Bonvoice username already exists.",
        false,
        null,
        "Duplicate Entry"
      );
    }

    const created = await BonvoiceCredential.create({
      username,
      password,
      did,
    });

    return ApiResponse(
      res,
      201,
      "Bonvoice credential created successfully.",
      true,
      created
    );
  }
);

// Update Bonvoice credentials (without token)
export const updateBonvoiceCredential = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { username, password, did } = req.body;

    if (!username) {
      return ApiResponse(
        res,
        400,
        "Username is required to identify the record to update.",
        false,
        null,
        "Validation Error"
      );
    }

    const existing = await BonvoiceCredential.findOne({ username });
    if (!existing) {
      return ApiResponse(
        res,
        404,
        "Bonvoice record not found.",
        false,
        null,
        "Not Found"
      );
    }

    if (password) existing.password = password;
    if (did !== undefined) existing.did = did;

    const updated = await existing.save();
    return ApiResponse(
      res,
      200,
      "Bonvoice credential updated successfully.",
      true,
      updated
    );
  }
);
