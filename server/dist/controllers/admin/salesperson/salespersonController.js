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
exports.toggleSalespersonStatus = exports.updateSalesperson = exports.updateSalespersonPassword = exports.createSalesperson = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const salesman_1 = require("../../../models/auth/salesman");
const ApiResponse_1 = require("../../../config/ApiResponse");
const enums_1 = require("../../../enums/enums");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
exports.createSalesperson = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, phoneNumber, password, territory, altMobileNumber } = req.body;
        if (!firstName || !lastName || !email || !phoneNumber || !password) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, 'Missing required fields: firstName, lastName, email, phoneNumber, password', false, null);
        }
        // Check if salesperson with email already exists
        const existingSalesperson = yield salesman_1.Salesman.findOne({ email });
        if (existingSalesperson) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, 'Salesperson with this email already exists', false, null);
        }
        // Hash password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        // Create new salesperson
        const newSalesperson = yield salesman_1.Salesman.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            altMobileNumber,
            password: hashedPassword,
            roles: [enums_1.UserRoles.SALESPERSON],
            isVerified: true, // Auto-verify admin-created accounts
            territory,
            isActive: true
        });
        // Remove password from response
        const salespersonResponse = {
            _id: newSalesperson._id,
            firstName: newSalesperson.firstName,
            lastName: newSalesperson.lastName,
            email: newSalesperson.email,
            phoneNumber: newSalesperson.phoneNumber,
            territory: newSalesperson.territory,
            isActive: newSalesperson.isActive,
            createdAt: (newSalesperson === null || newSalesperson === void 0 ? void 0 : newSalesperson.createdAt) || new Date()
        };
        return (0, ApiResponse_1.ApiResponse)(res, 201, 'Salesperson created successfully', true, salespersonResponse);
    }
    catch (error) {
        console.error('Error creating salesperson:', error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, 'Failed to create salesperson', false, null);
    }
}));
exports.updateSalespersonPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { salespersonId } = req.params;
        const { password } = req.body;
        if (!password || password.length < 6) {
            return (0, ApiResponse_1.ApiResponse)(res, 400, 'Password must be at least 6 characters long', false, null);
        }
        // Hash new password
        const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
        const updatedSalesperson = yield salesman_1.Salesman.findByIdAndUpdate(salespersonId, { $set: { password: hashedPassword } }, { new: true, select: '-password' });
        if (!updatedSalesperson) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, 'Salesperson not found', false, null);
        }
        return (0, ApiResponse_1.ApiResponse)(res, 200, 'Salesperson password updated successfully', true, updatedSalesperson);
    }
    catch (error) {
        console.error('Error updating salesperson password:', error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, 'Failed to update salesperson password', false, null);
    }
}));
exports.updateSalesperson = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { salespersonId } = req.params;
        const updateData = req.body;
        // Remove sensitive fields that shouldn't be updated through this endpoint
        delete updateData.password;
        delete updateData.roles;
        delete updateData.assignedBundles;
        const updatedSalesperson = yield salesman_1.Salesman.findByIdAndUpdate(salespersonId, { $set: updateData }, { new: true, select: '-password' });
        if (!updatedSalesperson) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, 'Salesperson not found', false, null);
        }
        return (0, ApiResponse_1.ApiResponse)(res, 200, 'Salesperson updated successfully', true, updatedSalesperson);
    }
    catch (error) {
        console.error('Error updating salesperson:', error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, 'Failed to update salesperson', false, null);
    }
}));
exports.toggleSalespersonStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { salespersonId } = req.params;
        const salesperson = yield salesman_1.Salesman.findById(salespersonId);
        if (!salesperson) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, 'Salesperson not found', false, null);
        }
        const updatedSalesperson = yield salesman_1.Salesman.findByIdAndUpdate(salespersonId, { $set: { isActive: !salesperson.isActive } }, { new: true, select: '-password' });
        return (0, ApiResponse_1.ApiResponse)(res, 200, `Salesperson ${(updatedSalesperson === null || updatedSalesperson === void 0 ? void 0 : updatedSalesperson.isActive) ? 'activated' : 'deactivated'} successfully`, true, updatedSalesperson);
    }
    catch (error) {
        console.error('Error toggling salesperson status:', error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, 'Failed to update salesperson status', false, null);
    }
}));
