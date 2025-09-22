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
exports.getScanQuestions = exports.upsertQRTypeQuestions = exports.getQRTypeQuestions = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const qrQuestions_1 = require("../../models/qr-flow/qrQuestions");
const qrModel_1 = require("../../models/qr-flow/qrModel");
const ApiResponse_1 = require("../../config/ApiResponse");
const mongoose_1 = __importDefault(require("mongoose"));
exports.getQRTypeQuestions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrTypeId } = req.body;
    if (!qrTypeId) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, 'qrTypeId is required', false);
    }
    const allDocs = yield qrQuestions_1.QRQuestions.find().select('qrId questions');
    const matchedDoc = allDocs.find((doc) => doc.qrId.equals(new mongoose_1.default.Types.ObjectId(qrTypeId)));
    if (!matchedDoc) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, 'No questions found for this QR type', false);
    }
    // console.log('Matched qrTypeId:', qrTypeId);
    // console.log('Matched Questions:', matchedDoc);
    return (0, ApiResponse_1.ApiResponse)(res, 200, 'QR Questions fetched successfully', true, matchedDoc.questions || []);
}));
// Admin: upsert questions for a QR type
exports.upsertQRTypeQuestions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrTypeId, questions } = req.body;
    if (!qrTypeId || !Array.isArray(questions)) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, 'qrTypeId and questions[] are required', false);
    }
    const updated = yield qrQuestions_1.QRQuestions.findOneAndUpdate({ qrId: new mongoose_1.default.Types.ObjectId(qrTypeId) }, { $set: { questions } }, { new: true, upsert: true }).select('qrId questions');
    return (0, ApiResponse_1.ApiResponse)(res, 200, 'QR questions updated', true, updated);
}));
// Public: fetch questions at scan time by qrId
exports.getScanQuestions = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const { qrId } = req.params;
    if (!qrId || !mongoose_1.default.Types.ObjectId.isValid(qrId)) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, 'Valid qrId is required', false);
    }
    const qr = yield qrModel_1.QRModel.findById(qrId).select('qrTypeId');
    if (!qr) {
        return (0, ApiResponse_1.ApiResponse)(res, 404, 'QR not found', false);
    }
    const doc = yield qrQuestions_1.QRQuestions.findOne({ qrId: qr.qrTypeId }).select('questions');
    const questions = (_a = doc === null || doc === void 0 ? void 0 : doc.questions) !== null && _a !== void 0 ? _a : [];
    return (0, ApiResponse_1.ApiResponse)(res, 200, 'Scan questions fetched', true, {
        questions,
    });
}));
