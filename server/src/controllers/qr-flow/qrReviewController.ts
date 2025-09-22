import { Request, Response } from 'express';
import expressAsyncHandler from 'express-async-handler';
import { QRModel } from '../../models/qr-flow/qrModel';
import { ApiResponse } from '../../config/ApiResponse';
import mongoose from 'mongoose';
import { IReview } from '../../types/newQR.types';

// Add a review to a QR code
export const addQRReview = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { qrId } = req.params;
    const { name, review, rating = 5 } = req.body;

    // Validate required fields
    if (!name || !review) {
      return ApiResponse(res, 400, 'Name and review are required', false);
    }

    // Validate QR ID
    if (!mongoose.Types.ObjectId.isValid(qrId)) {
      return ApiResponse(res, 400, 'Invalid QR ID format', false);
    }

    // Validate rating
    if (rating && (rating < 1 || rating > 5)) {
      return ApiResponse(res, 400, 'Rating must be between 1 and 5', false);
    }

    try {
      // Find the QR code
      const qrCode = await QRModel.findById(qrId);
      if (!qrCode) {
        return ApiResponse(res, 404, 'QR code not found', false);
      }

      // Create new review object
      const newReview: IReview = {
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
      await qrCode.save();

      return ApiResponse(
        res,
        201,
        'Review added successfully',
        true,
        {
          reviewId: qrCode.reviews[qrCode.reviews.length - 1]._id,
          totalReviews: qrCode.reviews.length,
          averageRating: qrCode.reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / qrCode.reviews.length,
        }
      );
    } catch (error) {
      console.error('Error adding QR review:', error);
      return ApiResponse(res, 500, 'Internal server error', false);
    }
  },
);

// Get all reviews for a QR code
export const getQRReviews = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { qrId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    // Validate QR ID
    if (!mongoose.Types.ObjectId.isValid(qrId)) {
      return ApiResponse(res, 400, 'Invalid QR ID format', false);
    }

    try {
      const qrCode = await QRModel.findById(qrId).select('reviews serialNumber');
      if (!qrCode) {
        return ApiResponse(res, 404, 'QR code not found', false);
      }

      const reviews = qrCode.reviews || [];
      
      // Pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedReviews = reviews
        .sort((a, b) => new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime())
        .slice(startIndex, endIndex);

      // Calculate statistics
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews 
        : 0;

      return ApiResponse(
        res,
        200,
        'Reviews fetched successfully',
        true,
        {
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
        }
      );
    } catch (error) {
      console.error('Error fetching QR reviews:', error);
      return ApiResponse(res, 500, 'Internal server error', false);
    }
  },
);

// Delete a review from a QR code (admin or review author could delete)
export const deleteQRReview = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { qrId, reviewId } = req.params;

    // Validate IDs
    if (!mongoose.Types.ObjectId.isValid(qrId) || !mongoose.Types.ObjectId.isValid(reviewId)) {
      return ApiResponse(res, 400, 'Invalid QR ID or Review ID format', false);
    }

    try {
      const qrCode = await QRModel.findById(qrId);
      if (!qrCode) {
        return ApiResponse(res, 404, 'QR code not found', false);
      }

      if (!qrCode.reviews || qrCode.reviews.length === 0) {
        return ApiResponse(res, 404, 'No reviews found for this QR code', false);
      }

      // Find and remove the review
      const reviewIndex = qrCode.reviews.findIndex(
        (review) => review._id?.toString() === reviewId
      );

      if (reviewIndex === -1) {
        return ApiResponse(res, 404, 'Review not found', false);
      }

      // Remove the review
      qrCode.reviews.splice(reviewIndex, 1);
      await qrCode.save();

      return ApiResponse(
        res,
        200,
        'Review deleted successfully',
        true,
        {
          remainingReviews: qrCode.reviews.length,
        }
      );
    } catch (error) {
      console.error('Error deleting QR review:', error);
      return ApiResponse(res, 500, 'Internal server error', false);
    }
  },
);

// Get QR review statistics
export const getQRReviewStats = expressAsyncHandler(
  async (req: Request, res: Response) => {
    const { qrId } = req.params;

    // Validate QR ID
    if (!mongoose.Types.ObjectId.isValid(qrId)) {
      return ApiResponse(res, 400, 'Invalid QR ID format', false);
    }

    try {
      const qrCode = await QRModel.findById(qrId).select('reviews serialNumber');
      if (!qrCode) {
        return ApiResponse(res, 404, 'QR code not found', false);
      }

      const reviews = qrCode.reviews || [];
      const totalReviews = reviews.length;

      if (totalReviews === 0) {
        return ApiResponse(
          res,
          200,
          'Review statistics fetched successfully',
          true,
          {
            qrId,
            serialNumber: qrCode.serialNumber,
            totalReviews: 0,
            averageRating: 0,
            ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          }
        );
      }

      // Calculate statistics
      const averageRating = reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / totalReviews;
      
      // Rating distribution
      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach((review) => {
        const rating = review.rating || 5;
        ratingDistribution[rating as keyof typeof ratingDistribution]++;
      });

      return ApiResponse(
        res,
        200,
        'Review statistics fetched successfully',
        true,
        {
          qrId,
          serialNumber: qrCode.serialNumber,
          totalReviews,
          averageRating: Math.round(averageRating * 10) / 10,
          ratingDistribution,
          latestReview: reviews.sort((a, b) => 
            new Date(b.timestamp!).getTime() - new Date(a.timestamp!).getTime()
          )[0],
        }
      );
    } catch (error) {
      console.error('Error fetching QR review statistics:', error);
      return ApiResponse(res, 500, 'Internal server error', false);
    }
  },
);
