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
exports.getQRReviewStats = exports.deleteQRReview = exports.getQRReviews = exports.addQRReview = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const qrModel_1 = require("../../models/qr-flow/qrModel");
const ApiResponse_1 = require("../../config/ApiResponse");
const mongoose_1 = __importDefault(require("mongoose"));
// Add a review to a QR code
exports.addQRReview = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrId } = req.params;
    const { name, review, rating = 5 } = req.body;
    // Validate required fields
    if (!name || !review) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, 'Name and review are required', false);
    }
    // Validate QR ID
    if (!mongoose_1.default.Types.ObjectId.isValid(qrId)) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, 'Invalid QR ID format', false);
    }
    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, 'Rating must be between 1 and 5', false);
    }
    try {
        // Find the QR code
        const qrCode = yield qrModel_1.QRModel.findById(qrId);
        if (!qrCode) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, 'QR code not found', false);
        }
        // Create new review object
        const newReview = {
            name: name.trim(),
            review: review.trim(),
            rating: rating || 5,
            timestamp: new Date(),
        };
        // Add review to the QR code
        if (!qrCode.reviews) {
            qrCode.reviews = [];
        }
        qrCode.reviews.push(newReview);
        // Save the updated QR code
        yield qrCode.save();
        return (0, ApiResponse_1.ApiResponse)(res, 201, 'Review added successfully', true, {
            reviewId: qrCode.reviews[qrCode.reviews.length - 1]._id,
            totalReviews: qrCode.reviews.length,
            averageRating: qrCode.reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / qrCode.reviews.length,
        });
    }
    catch (error) {
        console.error('Error adding QR review:', error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, 'Internal server error', false);
    }
}));
// Get all reviews for a QR code
exports.getQRReviews = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    // Validate QR ID
    if (!mongoose_1.default.Types.ObjectId.isValid(qrId)) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, 'Invalid QR ID format', false);
    }
    try {
        const qrCode = yield qrModel_1.QRModel.findById(qrId).select('reviews serialNumber');
        if (!qrCode) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, 'QR code not found', false);
        }
        const reviews = qrCode.reviews || [];
        // Pagination
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedReviews = reviews
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(startIndex, endIndex);
        // Calculate statistics
        const totalReviews = reviews.length;
        const averageRating = totalReviews > 0
            ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews
            : 0;
        return (0, ApiResponse_1.ApiResponse)(res, 200, 'Reviews fetched successfully', true, {
            qrId,
            serialNumber: qrCode.serialNumber,
            reviews: paginatedReviews,
            pagination: {
                currentPage: pageNum,
                totalPages: Math.ceil(totalReviews / limitNum),
                totalReviews,
                hasNextPage: endIndex < totalReviews,
                hasPrevPage: pageNum > 1,
            },
            statistics: {
                totalReviews,
                averageRating: Math.round(averageRating * 10) / 10,
            },
        });
    }
    catch (error) {
        console.error('Error fetching QR reviews:', error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, 'Internal server error', false);
    }
}));
// Delete a review from a QR code (admin or review author could delete)
exports.deleteQRReview = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrId, reviewId } = req.params;
    // Validate IDs
    if (!mongoose_1.default.Types.ObjectId.isValid(qrId) || !mongoose_1.default.Types.ObjectId.isValid(reviewId)) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, 'Invalid QR ID or Review ID format', false);
    }
    try {
        const qrCode = yield qrModel_1.QRModel.findById(qrId);
        if (!qrCode) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, 'QR code not found', false);
        }
        if (!qrCode.reviews || qrCode.reviews.length === 0) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, 'No reviews found for this QR code', false);
        }
        // Find and remove the review
        const reviewIndex = qrCode.reviews.findIndex((review) => { var _a; return ((_a = review._id) === null || _a === void 0 ? void 0 : _a.toString()) === reviewId; });
        if (reviewIndex === -1) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, 'Review not found', false);
        }
        // Remove the review
        qrCode.reviews.splice(reviewIndex, 1);
        yield qrCode.save();
        return (0, ApiResponse_1.ApiResponse)(res, 200, 'Review deleted successfully', true, {
            remainingReviews: qrCode.reviews.length,
        });
    }
    catch (error) {
        console.error('Error deleting QR review:', error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, 'Internal server error', false);
    }
}));
// Get QR review statistics
exports.getQRReviewStats = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { qrId } = req.params;
    // Validate QR ID
    if (!mongoose_1.default.Types.ObjectId.isValid(qrId)) {
        return (0, ApiResponse_1.ApiResponse)(res, 400, 'Invalid QR ID format', false);
    }
    try {
        const qrCode = yield qrModel_1.QRModel.findById(qrId).select('reviews serialNumber');
        if (!qrCode) {
            return (0, ApiResponse_1.ApiResponse)(res, 404, 'QR code not found', false);
        }
        const reviews = qrCode.reviews || [];
        const totalReviews = reviews.length;
        if (totalReviews === 0) {
            return (0, ApiResponse_1.ApiResponse)(res, 200, 'Review statistics fetched successfully', true, {
                qrId,
                serialNumber: qrCode.serialNumber,
                totalReviews: 0,
                averageRating: 0,
                ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
            });
        }
        // Calculate statistics
        const averageRating = reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews;
        // Rating distribution
        const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach((review) => {
            const rating = review.rating || 5;
            ratingDistribution[rating]++;
        });
        return (0, ApiResponse_1.ApiResponse)(res, 200, 'Review statistics fetched successfully', true, {
            qrId,
            serialNumber: qrCode.serialNumber,
            totalReviews,
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
            latestReview: reviews.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0],
        });
    }
    catch (error) {
        console.error('Error fetching QR review statistics:', error);
        return (0, ApiResponse_1.ApiResponse)(res, 500, 'Internal server error', false);
    }
}));
