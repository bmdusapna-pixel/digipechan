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
exports.updateBonvoiceCredential = exports.createBonvoiceCredential = exports.getFirstBonvoiceCredential = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bonvoiceCredentialModel_1 = require("../../models/bonvoice/bonvoiceCredentialModel");
const ApiResponse_1 = require("../../config/ApiResponse");
exports.getFirstBonvoiceCredential = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const first = yield bonvoiceCredentialModel_1.BonvoiceCredential.findOne().sort({ createdAt: 1 });
    if (!first) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, "No Bonvoice credentials found.", false, null, "Not Found");
    }
    return (0, ApiResponse_1.ApiResponse)(res, 200, "Bonvoice credential fetched successfully.", true, first);
}));
// Create Bonvoice credentials (without token)
exports.createBonvoiceCredential = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, did } = req.body;
    if (!username || !password || did === undefined) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "Fields username, password, and did are required.", false, null, "Validation Error");
    }
    const existing = yield bonvoiceCredentialModel_1.BonvoiceCredential.findOne({ username });
    if (existing) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "Bonvoice username already exists.", false, null, "Duplicate Entry");
    }
    const created = yield bonvoiceCredentialModel_1.BonvoiceCredential.create({
        username,
        password,
        did,
    });
    return (0, ApiResponse_1.ApiResponse)(res, 201, "Bonvoice credential created successfully.", true, created);
}));
// Update Bonvoice credentials (without token)
exports.updateBonvoiceCredential = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { username, password, did } = req.body;
    if (!username) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, "Username is required to identify the record to update.", false, null, "Validation Error");
    }
    const existing = yield bonvoiceCredentialModel_1.BonvoiceCredential.findOne({ username });
    if (!existing) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, "Bonvoice record not found.", false, null, "Not Found");
    }
    if (password)
        existing.password = password;
    if (did !== undefined)
        existing.did = did;
    const updated = yield existing.save();
    return (0, ApiResponse_1.ApiResponse)(res, 200, "Bonvoice credential updated successfully.", true, updated);
}));
