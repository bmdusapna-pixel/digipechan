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
exports.updateBonvoiceToken = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const axios_1 = __importDefault(require("axios"));
const bonvoiceCredentialModel_1 = require("../../models/bonvoice/bonvoiceCredentialModel");
const ApiResponse_1 = require("../../config/ApiResponse");
exports.updateBonvoiceToken = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const firstUser = yield bonvoiceCredentialModel_1.BonvoiceCredential.findOne().sort({ createdAt: 1 });
    if (!firstUser) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, "No Bonvoice credentials found.", false, null, "Not Found");
    }
    try {
        const response = yield axios_1.default.post("https://backend.pbx.bonvoice.com/usermanagement/external-auth/", {
            username: firstUser.username,
            password: firstUser.password,
        });
        const { status, data } = response.data;
        if (status !== "1" || !(data === null || data === void 0 ? void 0 : data.header_value)) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, "Failed to get a valid token from Bonvoice API.", false, null, "Invalid API Response");
        }
        const headerValue = data.header_value;
        firstUser.token = headerValue;
        yield firstUser.save();
        return (0, ApiResponse_1.ApiResponse)(res, 200, "Bonvoice token updated successfully.", true, {
            username: firstUser.username,
            token: headerValue,
        });
    }
    catch (error) {
        console.error("Bonvoice API error:", error.message);
        return (0, ApiResponse_1.ApiResponse)(res, 500, "Failed to fetch or update token from Bonvoice API.", false, null, error.message || "Internal Server Error");
    }
}));
