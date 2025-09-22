"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoute = void 0;
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../../controllers/admin/analytics/adminController");
const enums_1 = require("../../enums/enums");
const jwtAuthenticationMiddleware_1 = require("../../middlewares/jwtAuthenticationMiddleware");
const orderManagementController_1 = require("../../controllers/admin/orders/orderManagementController");
const salespersonController_1 = require("../../controllers/admin/salesperson/salespersonController");
const salespersonManagementController_1 = require("../../controllers/admin/salesperson/salespersonManagementController");
const customerManagementController_1 = require("../../controllers/admin/customer-mgmt/customerManagementController");
const paymentTicketController_1 = require("../../controllers/payment/paymentTicketController");
exports.adminRoute = express_1.default.Router();
exports.adminRoute.get('/analytics', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), adminController_1.adminAnalytics);
exports.adminRoute.post('/ranged-revenue', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), adminController_1.rangedRevenue);
exports.adminRoute.post('/weekly-revenue', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), adminController_1.weeklyRevenueTrend);
exports.adminRoute.post('/monthly-revenue', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), adminController_1.monthlyRevenueTrend);
exports.adminRoute.post('/orders', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), orderManagementController_1.getAllOrderInformation);
exports.adminRoute.put('/update-order', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), orderManagementController_1.updateOrderInformation);
exports.adminRoute.post('/get-users', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), customerManagementController_1.getCustomerData);
exports.adminRoute.post('/get-more-data', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), customerManagementController_1.viewMoreCustomerData);
exports.adminRoute.put('/update-user-info', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), customerManagementController_1.updateCustomerData);
exports.adminRoute.put('/update-qr-info', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), customerManagementController_1.updateViewMoreData);
// Bulk QR and Bundle Management
exports.adminRoute.post('/generate-bulk-qrs', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), orderManagementController_1.bulkGenerateQRs);
exports.adminRoute.get('/bundles', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), orderManagementController_1.getBundles);
exports.adminRoute.put('/assign-bundle', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), orderManagementController_1.assignBundleToSalesperson);
exports.adminRoute.get('/bundles/:bundleId/download', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), orderManagementController_1.downloadBundleQRs);
// Salesperson Management
exports.adminRoute.post('/create-salesperson', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), salespersonController_1.createSalesperson);
exports.adminRoute.put('/salesperson/:salespersonId', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), salespersonController_1.updateSalesperson);
exports.adminRoute.put('/salesperson/:salespersonId/password', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), salespersonController_1.updateSalespersonPassword);
exports.adminRoute.put('/salesperson/:salespersonId/toggle-status', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), salespersonController_1.toggleSalespersonStatus);
exports.adminRoute.get('/salesperson-management', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), salespersonManagementController_1.getSalespersonManagement);
exports.adminRoute.get('/salesperson/:salespersonId/customers', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), salespersonManagementController_1.getSalespersonCustomers);
exports.adminRoute.get('/salesperson/:salespersonId/bundles', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), salespersonManagementController_1.getSalespersonBundleDetails);
exports.adminRoute.put('/bundles/:bundleId/transfer', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), salespersonManagementController_1.transferBundleToSalesperson);
// Payment Ticket Management
exports.adminRoute.get('/payment-tickets', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), paymentTicketController_1.getAllPaymentTickets);
exports.adminRoute.put('/payment-tickets/:ticketId/status', jwtAuthenticationMiddleware_1.authenticate, (0, jwtAuthenticationMiddleware_1.authorize)([enums_1.UserRoles.ADMIN]), paymentTicketController_1.updatePaymentTicketStatus);
