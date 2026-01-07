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
exports.requirePin = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_1 = require("../models/auth/user");
const ApiResponse_1 = require("../config/ApiResponse");
exports.requirePin = (0, express_async_handler_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const providedPin = (req.body && req.body.pin) ||
        (req.headers && req.headers['x-pin']) ||
        (req.query && req.query.pin);
    if (!providedPin) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, 'PIN required', false, null, 'PIN Authentication Error');
    }
    const userId = (_a = req.data) === null || _a === void 0 ? void 0 : _a.userId;
    if (!userId) {
        return (0, ApiResponse_1.ApiResponse)(res, 401, 'Unauthenticated', false, null, 'Authentication Error');
    }
    const user = yield user_1.User.findById(userId).select('+pin');
    if (!user || !user.pin) {
        return (0, ApiResponse_1.ApiResponse)(res, 403, 'PIN not set for this account', false, null, 'PIN Authentication Error');
    }
    const match = yield bcrypt_1.default.compare(String(providedPin), user.pin);
    if (!match) {
        return (0, ApiResponse_1.ApiResponse)(res, 401, 'Invalid PIN', false, null, 'PIN Authentication Error');
    }
    next();
}));
exports.default = exports.requirePin;
