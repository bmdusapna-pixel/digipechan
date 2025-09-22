"use client";

import { PaymentTicketManagement } from "@/components/layout/admin/PaymentTicketManagement";

export default function AdminPaymentTicketsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Payment Ticket Management</h1>
        <p className="text-gray-600">
          Review and approve payment tickets from salespeople
        </p>
      </div>
      
      <PaymentTicketManagement />
    </div>
  );
}
