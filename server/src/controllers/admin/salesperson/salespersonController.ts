import expressAsyncHandler from "express-async-handler";
import { AuthenticatedRequest } from "../../../types/AuthenticatedRequest";
import { Response } from "express";
import { Salesman } from "../../../models/auth/salesman";
import { ApiResponse } from "../../../config/ApiResponse";
import { UserRoles } from "../../../enums/enums";
import bcrypt from "bcryptjs";

export const createSalesperson = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phoneNumber, 
      password, 
      territory,
      altMobileNumber 
    } = req.body;

    if (!firstName || !lastName || !email || !phoneNumber || !password) {
      return ApiResponse(res, 400, 'Missing required fields: firstName, lastName, email, phoneNumber, password', false, null);
    }

    // Check if salesperson with email already exists
    const existingSalesperson = await Salesman.findOne({ email });
    if (existingSalesperson) {
      return ApiResponse(res, 400, 'Salesperson with this email already exists', false, null);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new salesperson
    const newSalesperson = await Salesman.create({
      firstName,
      lastName,
      email,
      phoneNumber,
      altMobileNumber,
      password: hashedPassword,
      roles: [UserRoles.SALESPERSON],
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
      createdAt: newSalesperson?.createdAt || new Date()
    };  

    return ApiResponse(res, 201, 'Salesperson created successfully', true, salespersonResponse);
  } catch (error) {
    console.error('Error creating salesperson:', error);
    return ApiResponse(res, 500, 'Failed to create salesperson', false, null);
  }
});

export const updateSalespersonPassword = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { salespersonId } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return ApiResponse(res, 400, 'Password must be at least 6 characters long', false, null);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedSalesperson = await Salesman.findByIdAndUpdate(
      salespersonId,
      { $set: { password: hashedPassword } },
      { new: true, select: '-password' }
    );

    if (!updatedSalesperson) {
      return ApiResponse(res, 404, 'Salesperson not found', false, null);
    }

    return ApiResponse(res, 200, 'Salesperson password updated successfully', true, updatedSalesperson);
  } catch (error) {
    console.error('Error updating salesperson password:', error);
    return ApiResponse(res, 500, 'Failed to update salesperson password', false, null);
  }
});

export const updateSalesperson = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { salespersonId } = req.params;
    const updateData = req.body;

    // Remove sensitive fields that shouldn't be updated through this endpoint
    delete updateData.password;
    delete updateData.roles;
    delete updateData.assignedBundles;

    const updatedSalesperson = await Salesman.findByIdAndUpdate(
      salespersonId,
      { $set: updateData },
      { new: true, select: '-password' }
    );

    if (!updatedSalesperson) {
      return ApiResponse(res, 404, 'Salesperson not found', false, null);
    }

    return ApiResponse(res, 200, 'Salesperson updated successfully', true, updatedSalesperson);
  } catch (error) {
    console.error('Error updating salesperson:', error);
    return ApiResponse(res, 500, 'Failed to update salesperson', false, null);
  }
});

export const toggleSalespersonStatus = expressAsyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { salespersonId } = req.params;

    const salesperson = await Salesman.findById(salespersonId);
    if (!salesperson) {
      return ApiResponse(res, 404, 'Salesperson not found', false, null);
    }

    const updatedSalesperson = await Salesman.findByIdAndUpdate(
      salespersonId,
      { $set: { isActive: !salesperson.isActive } },
      { new: true, select: '-password' }
    );

    return ApiResponse(
      res, 
      200, 
      `Salesperson ${updatedSalesperson?.isActive ? 'activated' : 'deactivated'} successfully`, 
      true, 
      updatedSalesperson
    );
  } catch (error) {
    console.error('Error toggling salesperson status:', error);
    return ApiResponse(res, 500, 'Failed to update salesperson status', false, null);
  }
});
