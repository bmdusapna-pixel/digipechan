import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentTicketStatusBadge } from "@/components/ui/payment-ticket-status-badge";
import { getSalespersonTickets } from "@/lib/api/paymentTicket";
import { IPaymentTicketWithDetails } from "@/types/paymentTicket.types";
import { format } from "date-fns";
import { Eye, Download, Receipt, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";

interface PaymentTicketListProps {
  className?: string;
}

export function PaymentTicketList({ className }: PaymentTicketListProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [selectedTicket, setSelectedTicket] =
    useState<IPaymentTicketWithDetails | null>(null);

  const {
    data: tickets,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["salesperson-tickets", statusFilter],
    queryFn: async () => {
      console.log("Fetching payment tickets with status filter:", statusFilter);
      try {
        // If statusFilter is "ALL", don't pass any status filter to the API
        const result = await getSalespersonTickets(
          statusFilter === "ALL" ? undefined : statusFilter
        );
        console.log("Payment tickets API response:", result);
        return result;
      } catch (err) {
        console.error("Error fetching payment tickets:", err);
        throw err;
      }
    },
    retry: 2,
    staleTime: 30000, // 30 seconds
  });

  console.log(
    "PaymentTicketList render - tickets:",
    tickets,
    "loading:",
    isLoading,
    "error:",
    error
  );

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const openTicketDetails = (ticket: IPaymentTicketWithDetails) => {
    setSelectedTicket(ticket);
  };

  const closeTicketDetails = () => {
    setSelectedTicket(null);
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case "CASH":
        return "Cash";
      case "UPI":
        return "UPI";
      case "BANK_TRANSFER":
        return "Bank Transfer";
      case "CHEQUE":
        return "Cheque";
      default:
        return method;
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Payment Tickets
          </CardTitle>
          <CardDescription>Loading your payment tickets...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Loading Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-100 rounded-lg p-3 sm:p-4 animate-pulse"
                >
                  <div className="h-6 sm:h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
            {/* Loading Table */}
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 sm:h-12 bg-gray-100 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Payment Tickets
          </CardTitle>
          <CardDescription>Error loading payment tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 px-4">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600 mb-2 text-base sm:text-lg">
              Failed to load payment tickets
            </p>
            <p className="text-sm text-gray-500 mb-4 max-w-md mx-auto">
              {error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
            </p>
            <Button onClick={() => refetch()} className="mt-2 w-full sm:w-auto">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="flex items-center gap-2 text-lg lg:text-xl">
                <Receipt className="w-5 h-5" />
                Payment Tickets
              </CardTitle>
              <CardDescription className="text-sm lg:text-base">
                Track your offline payment tickets and their approval status.
                Payment tickets are created when you sell QRs offline and need
                to record customer payments for admin approval.
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Select
                value={statusFilter}
                onValueChange={handleStatusFilterChange}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <div className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}>
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                  ) : (
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  )}
                </div>
                <span className="hidden sm:inline">Refresh</span>
                <span className="sm:hidden">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Information Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-xs sm:text-sm text-blue-800 min-w-0">
                <p className="font-medium mb-1">
                  About Payment Tickets
                </p>
                <p className="text-blue-700 break-words">
                  Payment tickets are created when you sell QRs offline. They
                  record customer payments and are sent to admins for approval.
                  You can track the status of each ticket here - Pending
                  (awaiting approval), Approved (payment confirmed), or Rejected
                  (payment issues).
                </p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          {tickets && tickets.length > 0 ? (
            <div className="space-y-4">
              {/* Status Filter Indicator */}
              {statusFilter !== "ALL" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                  <span className="whitespace-nowrap">Showing tickets with status:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="capitalize">
                      {statusFilter.toLowerCase()}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setStatusFilter("ALL")}
                      className="h-6 px-2 text-xs"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}

                             <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-blue-600">
                    {tickets.filter((t) => t.status === "PENDING").length}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600 font-medium">
                    Pending
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-green-600">
                    {tickets.filter((t) => t.status === "APPROVED").length}
                  </div>
                  <div className="text-xs sm:text-sm text-green-600 font-medium">
                    Approved
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-red-600">
                    {tickets.filter((t) => t.status === "REJECTED").length}
                  </div>
                  <div className="text-xs sm:text-sm text-red-600 font-medium">
                    Rejected
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 text-center">
                  <div className="text-xl sm:text-2xl font-bold text-gray-600">
                    {tickets.length}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 font-medium">
                    Total
                  </div>
                </div>
              </div>
            </div>
          ) : tickets && tickets.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4 mb-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div className="text-xs sm:text-sm text-yellow-800">
                  <p className="font-medium mb-1">No Payment Tickets Found</p>
                  <p className="text-yellow-700">
                    You haven't created any payment tickets yet. Payment tickets
                    are created when you sell QRs offline and need to record
                    customer payments for admin approval.
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {tickets && tickets.length > 0 ? (
            <>
              {/* Mobile Card View */}
              <div className="block lg:hidden space-y-4">
                {tickets.map((ticket) => (
                  <div
                    key={ticket._id}
                    className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-200"
                  >
                    <div className="space-y-4">
                      {/* Header Section */}
                      <div className="space-y-3">
                        {/* Ticket ID and Status */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-xs text-gray-600 break-all bg-gray-50 px-2 py-1 rounded border">
                              {ticket.ticketId}
                            </p>
                          </div>
                          <PaymentTicketStatusBadge status={ticket.status} />
                        </div>
                        
                        {/* Customer Info */}
                        <div>
                          <h3 className="font-semibold text-gray-900 text-base mb-1 leading-tight break-words">
                            {ticket.customerName}
                          </h3>
                          <p className="text-sm text-gray-600 flex items-center gap-1 break-all">
                            <span className="inline-block w-1 h-1 bg-gray-400 rounded-full flex-shrink-0"></span>
                            {ticket.customerPhone}
                          </p>
                        </div>
                      </div>

                      {/* Amount Section - Prominent */}
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                            Amount
                          </p>
                          <p className="text-2xl font-bold text-gray-900">
                            ₹{ticket.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Payment Method */}
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                          Payment Method
                        </p>
                        <p className="text-sm font-medium text-gray-800">
                          {getPaymentMethodDisplay(ticket.paymentMethod)}
                        </p>
                      </div>

                      {/* Footer Section */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-gray-300 rounded-full flex-shrink-0"></div>
                          <p className="text-xs text-gray-500 font-medium">
                            {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openTicketDetails(ticket)}
                          className="text-xs px-3 py-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 transition-colors w-full sm:w-auto"
                        >
                          <Eye className="w-3 h-3 mr-1.5" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[120px]">Ticket ID</TableHead>
                      <TableHead className="min-w-[150px]">Customer</TableHead>
                      <TableHead className="min-w-[100px]">Amount</TableHead>
                      <TableHead className="min-w-[120px]">
                        Payment Method
                      </TableHead>
                      <TableHead className="min-w-[100px]">Status</TableHead>
                      <TableHead className="min-w-[120px]">Created</TableHead>
                      <TableHead className="min-w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tickets.map((ticket) => (
                      <TableRow key={ticket._id} className="hover:bg-gray-50">
                        <TableCell className="font-mono text-sm">
                          <div className="break-all">{ticket.ticketId}</div>
                        </TableCell>
                        <TableCell>
                          <div className="min-w-0">
                            <p className="font-medium truncate">
                              {ticket.customerName}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {ticket.customerPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="whitespace-nowrap">
                            ₹{ticket.amount.toFixed(2)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="whitespace-nowrap">
                            {getPaymentMethodDisplay(ticket.paymentMethod)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <PaymentTicketStatusBadge status={ticket.status} />
                        </TableCell>
                        <TableCell className="text-sm text-gray-500">
                          <div className="whitespace-nowrap">
                            {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openTicketDetails(ticket)}
                            className="hover:bg-blue-50 hover:text-blue-600 w-full sm:w-auto"
                          >
                            <Eye className="w-4 h-4" />
                            <span className="sm:hidden ml-1">View</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-8 sm:py-12 px-4">
              <Receipt className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-2">
                {statusFilter !== "ALL"
                  ? "No tickets found"
                  : "No payment tickets yet"}
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto text-sm sm:text-base">
                {statusFilter !== "ALL"
                  ? `No tickets with status "${statusFilter.toLowerCase()}" found. Try changing the filter or create a new ticket.`
                  : "You haven't created any payment tickets yet. Payment tickets are created when you sell QRs offline and need to record customer payments."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {statusFilter === "ALL" && (
                  <Button
                    variant="outline"
                    onClick={() => refetch()}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    Refresh Data
                  </Button>
                )}
                {statusFilter !== "ALL" && (
                  <Button
                    variant="outline"
                    onClick={() => setStatusFilter("ALL")}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    Clear Filter
                  </Button>
                )}
              </div>
              {statusFilter === "ALL" && (
                <div className="mt-6 text-xs sm:text-sm text-gray-400 px-4">
                  <p className="font-medium mb-2">
                    To create a payment ticket:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-left max-w-xs mx-auto">
                    <li>Go to the "My Bundles" tab</li>
                    <li>Click "Create New Ticket" on a bundle</li>
                    <li>Fill in customer details and payment information</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={closeTicketDetails}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Payment Ticket Details
            </DialogTitle>
            <DialogDescription className="text-sm">
              Detailed information about the payment ticket
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Ticket ID
                  </Label>
                  <p className="font-mono text-sm break-all">
                    {selectedTicket.ticketId}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <PaymentTicketStatusBadge status={selectedTicket.status} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Amount
                  </Label>
                  <p className="font-medium">
                    ₹{selectedTicket.amount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Payment Method
                  </Label>
                  <p>{getPaymentMethodDisplay(selectedTicket.paymentMethod)}</p>
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  Customer Details
                </Label>
                <div className="mt-2 space-y-1">
                  <p>
                    <strong>Name:</strong> {selectedTicket.customerName}
                  </p>
                  <p>
                    <strong>Phone:</strong> {selectedTicket.customerPhone}
                  </p>
                  {selectedTicket.customerEmail && (
                    <p>
                      <strong>Email:</strong> {selectedTicket.customerEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* QR Details */}
              <div>
                <Label className="text-sm font-medium text-gray-500">
                  QR Codes ({selectedTicket.qrIds.length})
                </Label>
                <div className="mt-2 space-y-1">
                  {selectedTicket.qrDetails?.map((qr) => (
                    <div
                      key={qr._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-mono text-sm">{qr.serialNumber}</p>
                        <p className="text-xs text-gray-500">
                          {qr.qrTypeId.qrName}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Admin Notes */}
              {selectedTicket.adminNotes && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Admin Notes
                  </Label>
                  <p className="mt-2 p-3 bg-gray-50 rounded text-sm">
                    {selectedTicket.adminNotes}
                  </p>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <Label>Created</Label>
                  <p className="break-words">
                    {format(
                      new Date(selectedTicket.createdAt),
                      "MMM dd, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>
                {selectedTicket.approvedAt && (
                  <div>
                    <Label>Processed</Label>
                    <p className="break-words">
                      {format(
                        new Date(selectedTicket.approvedAt),
                        "MMM dd, yyyy 'at' h:mm a"
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Payment Proof */}
              {selectedTicket.paymentProof && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Payment Proof
                  </Label>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      View Proof
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
