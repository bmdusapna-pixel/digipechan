export const API_DOMAIN = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const API_ENDPOINTS = {
  // Authentication Endpoints
  login: `${API_DOMAIN}/auth/login`,
  profile: `${API_DOMAIN}/user`,
  sign_up: `${API_DOMAIN}/auth/signup`,
  resend_verification: `${API_DOMAIN}/auth/resend-verification`,
  verify_email: `${API_DOMAIN}/auth/verify-email`,
  forgot_password: `${API_DOMAIN}/auth/forgot-password`,
  reset_password: `${API_DOMAIN}/auth/reset-password`,
  logout: `${API_DOMAIN}/auth/logout`,

  // Salesperson Auth
  salespersonLogin: `${API_DOMAIN}/salesman/auth/login`,
  salesmanSignUp: `${API_DOMAIN}/salesman/auth/sign-up`,
  // Salesman Dashboard
  salesmanStats: `${API_DOMAIN}/salesman/stats`,
  salesmanBundles: `${API_DOMAIN}/salesman/bundles`,
  salesmanBundleQrs: (bundleId: string) =>
    `${API_DOMAIN}/salesman/bundle/${bundleId}/qrs`,

  adminBundleQrs: (bundleId: string) =>
    `${API_DOMAIN}/admin/bundle/${bundleId}/qrs`,

  // Create new qr type
  create_new_qr_type: `${API_DOMAIN}/qr-flow/create-new-type`,
  fetch_qrs_on_delivery_type: `${API_DOMAIN}/qr-flow/fetch-types`,

  // Payments
  initiatePayment: `${API_DOMAIN}/qr-flow/payment/initiate`,
  fetchPaymentStatus: `${API_DOMAIN}/qr-flow/payment/payment-status`,

  // QR Endpoints
  fetchQRDetails: (qrId: string) => `${API_DOMAIN}/qr-flow/scan/${qrId}`,

  // Activate and scan QR
  checkValidatity: `${API_DOMAIN}/qr-flow/check-validity`,
  updateQR: `${API_DOMAIN}/qr-flow/update-qr`,
  scanQR: (qrId: string) => `${API_DOMAIN}/qr-flow/scan/${qrId}`,

  // Statistics
  generalStatistics: `${API_DOMAIN}/admin/analytics`,
  dailyRangedRevenue: `${API_DOMAIN}/admin/ranged-revenue`,
  weeklyRevenue: `${API_DOMAIN}/admin/weekly-revenue`,
  monthlyRevenue: `${API_DOMAIN}/admin/monthly-revenue`,
  fetchOrders: `${API_DOMAIN}/admin/orders`,
  updateOrder: `${API_DOMAIN}/admin/update-order`,
  fetchGeneratedQrs: `${API_DOMAIN}/qr-flow/fetch-generated-qrs`,

  // QR Questions
  upsertQuestions: `${API_DOMAIN}/qr-flow/questions/upsert`,
  scanQuestions: (qrId: string) =>
    `${API_DOMAIN}/qr-flow/scan/${qrId}/questions`,
  getTypeQuestions: `${API_DOMAIN}/qr-flow/get-questions`,

  bulkGenerate: `${API_DOMAIN}/admin/generate-bulk-qrs`,
  bundles: `${API_DOMAIN}/admin/bundles`,
  assignBundle: `${API_DOMAIN}/admin/assign-bundle`,
  downloadBundleQRs: (bundleId: string) =>
    `${API_DOMAIN}/admin/bundles/${bundleId}/download`,
  shareBundleORs: (bundleId: string) =>
    `${API_DOMAIN}/admin/bundles/${bundleId}/share`,
  salesmen: `${API_DOMAIN}/salesman/list`,
  createSalesperson: `${API_DOMAIN}/admin/create-salesperson`,
  salespersonManagement: `${API_DOMAIN}/admin/salesperson-management`,
  salespersonCustomers: (id: string) =>
    `${API_DOMAIN}/admin/salesperson/${id}/customers`,
  salespersonToggleVerify: (id: string) =>
    `${API_DOMAIN}/admin/salesperson/${id}/toggle-is-verified`,
  salespersonBundles: (id: string) =>
    `${API_DOMAIN}/admin/salesperson/${id}/bundles`,
  adminTransferBundle: (bundleId: string) =>
    `${API_DOMAIN}/admin/bundles/${bundleId}/transfer`,
  salesmanSoldQrs: (status?: string) =>
    `${API_DOMAIN}/salesman/sold-qrs${status ? `?status=${status}` : ""}`,

  // Payment Tickets
  createPaymentTicket: `${API_DOMAIN}/salesman/payment-ticket`,
  getSalespersonTickets: `${API_DOMAIN}/salesman/payment-tickets`,
  getAllPaymentTickets: `${API_DOMAIN}/admin/payment-tickets`,
  updatePaymentTicketStatus: (ticketId: string) =>
    `${API_DOMAIN}/admin/payment-tickets/${ticketId}/status`,
};
