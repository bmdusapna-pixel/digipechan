import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { QRQuestions } from '../../models/qr-flow/qrQuestions';
import { QRModel } from '../../models/qr-flow/qrModel';
import { ApiResponse } from '../../config/ApiResponse';
import mongoose from 'mongoose';

export const getQRTypeQuestions = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { qrTypeId } = req.body;

    if (!qrTypeId) {
      return ApiResponse(res, 400, 'qrTypeId is required', false);
    }
    const allDocs = await QRQuestions.find().select('qrId questions');

    const matchedDoc = allDocs.find((doc) =>
      doc.qrId.equals(new mongoose.Types.ObjectId(qrTypeId)),
    );

    if (!matchedDoc) {
      return ApiResponse(
        res,
        404,
        'No questions found for this QR type',
        false,
      );
    }

    // console.log('Matched qrTypeId:', qrTypeId);
    // console.log('Matched Questions:', matchedDoc);

    return ApiResponse(
      res,
      200,
      'QR Questions fetched successfully',
      true,
      matchedDoc.questions || [],
    );
  },
);

// Admin: upsert questions for a QR type
export const upsertQRTypeQuestions = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { qrTypeId, questions } = req.body as { qrTypeId?: string; questions?: string[] };

    if (!qrTypeId || !Array.isArray(questions)) {
      return ApiResponse(res, 400, 'qrTypeId and questions[] are required', false);
    }

    const updated = await QRQuestions.findOneAndUpdate(
      { qrId: new mongoose.Types.ObjectId(qrTypeId) },
      { $set: { questions } },
      { new: true, upsert: true }
    ).select('qrId questions');

    return ApiResponse(res, 200, 'QR questions updated', true, updated);
  }
);

// Public: fetch questions at scan time by qrId
export const getScanQuestions = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { qrId } = req.params as { qrId: string };

    if (!qrId || !mongoose.Types.ObjectId.isValid(qrId)) {
      return ApiResponse(res, 400, 'Valid qrId is required', false);
    }

    const qr = await QRModel.findById(qrId).select('qrTypeId');
    if (!qr) {
      return ApiResponse(res, 404, 'QR not found', false);
    }

    const doc = await QRQuestions.findOne({ qrId: qr.qrTypeId }).select('questions');
    const questions = doc?.questions ?? [];

    return ApiResponse(res, 200, 'Scan questions fetched', true, {
      questions,
    });
  }
);
