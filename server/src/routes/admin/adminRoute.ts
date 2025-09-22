import express from "express";
import { adminAnalytics, monthlyRevenueTrend, rangedRevenue, weeklyRevenueTrend } from "../../controllers/admin/analytics/adminController";
import { UserRoles } from "../../enums/enums";
import { authenticate, authorize } from "../../middlewares/jwtAuthenticationMiddleware";
import { getAllOrderInformation, updateOrderInformation, getBundles, assignBundleToSalesperson, bulkGenerateQRs, downloadBundleQRs } from "../../controllers/admin/orders/orderManagementController";
import { createSalesperson, updateSalesperson, updateSalespersonPassword, toggleSalespersonStatus } from "../../controllers/admin/salesperson/salespersonController";
import { getSalespersonManagement, getSalespersonCustomers, getSalespersonBundleDetails, transferBundleToSalesperson } from "../../controllers/admin/salesperson/salespersonManagementController";
import { getCustomerData, viewMoreCustomerData, updateCustomerData, updateViewMoreData } from "../../controllers/admin/customer-mgmt/customerManagementController";
import { getAllPaymentTickets, updatePaymentTicketStatus } from "../../controllers/payment/paymentTicketController";

export const adminRoute = express.Router();

adminRoute.get('/analytics', authenticate, authorize([UserRoles.ADMIN]),adminAnalytics);
adminRoute.post('/ranged-revenue', authenticate, authorize([UserRoles.ADMIN]), rangedRevenue);
adminRoute.post('/weekly-revenue', authenticate, authorize([UserRoles.ADMIN]), weeklyRevenueTrend);
adminRoute.post('/monthly-revenue', authenticate, authorize([UserRoles.ADMIN]), monthlyRevenueTrend);
adminRoute.post('/orders', authenticate, authorize([UserRoles.ADMIN]), getAllOrderInformation);
adminRoute.put('/update-order', authenticate, authorize([UserRoles.ADMIN]), updateOrderInformation)
adminRoute.post('/get-users', authenticate, authorize([UserRoles.ADMIN]), getCustomerData);
adminRoute.post('/get-more-data', authenticate, authorize([UserRoles.ADMIN]), viewMoreCustomerData);
adminRoute.put('/update-user-info', authenticate, authorize([UserRoles.ADMIN]), updateCustomerData);
adminRoute.put('/update-qr-info', authenticate, authorize([UserRoles.ADMIN]), updateViewMoreData);

// Bulk QR and Bundle Management
adminRoute.post('/generate-bulk-qrs', authenticate, authorize([UserRoles.ADMIN]), bulkGenerateQRs);
adminRoute.get('/bundles', authenticate, authorize([UserRoles.ADMIN]), getBundles);
adminRoute.put('/assign-bundle', authenticate, authorize([UserRoles.ADMIN]), assignBundleToSalesperson);
adminRoute.get('/bundles/:bundleId/download', authenticate, authorize([UserRoles.ADMIN]), downloadBundleQRs);

// Salesperson Management
adminRoute.post('/create-salesperson', authenticate, authorize([UserRoles.ADMIN]), createSalesperson);
adminRoute.put('/salesperson/:salespersonId', authenticate, authorize([UserRoles.ADMIN]), updateSalesperson);
adminRoute.put('/salesperson/:salespersonId/password', authenticate, authorize([UserRoles.ADMIN]), updateSalespersonPassword);
adminRoute.put('/salesperson/:salespersonId/toggle-status', authenticate, authorize([UserRoles.ADMIN]), toggleSalespersonStatus);
adminRoute.get('/salesperson-management', authenticate, authorize([UserRoles.ADMIN]), getSalespersonManagement);
adminRoute.get('/salesperson/:salespersonId/customers', authenticate, authorize([UserRoles.ADMIN]), getSalespersonCustomers);
adminRoute.get('/salesperson/:salespersonId/bundles', authenticate, authorize([UserRoles.ADMIN]), getSalespersonBundleDetails);
adminRoute.put('/bundles/:bundleId/transfer', authenticate, authorize([UserRoles.ADMIN]), transferBundleToSalesperson);

// Payment Ticket Management
adminRoute.get('/payment-tickets', authenticate, authorize([UserRoles.ADMIN]), getAllPaymentTickets);
adminRoute.put('/payment-tickets/:ticketId/status', authenticate, authorize([UserRoles.ADMIN]), updatePaymentTicketStatus);