import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PaymentTicketStatusBadge } from "@/components/ui/payment-ticket-status-badge";
import { getAllPaymentTickets, updatePaymentTicketStatus } from "@/lib/api/paymentTicket";
import { IPaymentTicketWithDetails, IUpdatePaymentTicketStatusRequest } from "@/types/paymentTicket.types";
import { format } from "date-fns";
import { Eye, CheckCircle, XCircle, Download, Receipt, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentTicketManagementProps {
  className?: string;
}

export function PaymentTicketManagement({ className }: PaymentTicketManagementProps) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<IPaymentTicketWithDetails | null>(null);
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  const queryClient = useQueryClient();

  const { data: tickets, isLoading, error, refetch } = useQuery({
    queryKey: ["admin-payment-tickets", statusFilter],
    queryFn: () => getAllPaymentTickets(statusFilter || undefined),
  });

  const updateTicketMutation = useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: IUpdatePaymentTicketStatusRequest }) =>
      updatePaymentTicketStatus(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-payment-tickets"] });
      toast.success("Payment ticket status updated successfully!");
      closeTicketDetails();
    },
    onError: (error) => {
      console.error("Error updating ticket:", error);
      toast.error("Failed to update payment ticket status");
    },
  });

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
  };

  const openTicketDetails = (ticket: IPaymentTicketWithDetails) => {
    setSelectedTicket(ticket);
    setAdminNotes(ticket.adminNotes || "");
  };

  const closeTicketDetails = () => {
    setSelectedTicket(null);
    setAdminNotes("");
  };

  const handleApproveTicket = async () => {
    if (!selectedTicket) return;
    setIsApproving(true);
    try {
      await updateTicketMutation.mutateAsync({
        ticketId: selectedTicket.ticketId,
        data: {
          status: "APPROVED",
          adminNotes: adminNotes.trim() || undefined,
        },
      });
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectTicket = async () => {
    if (!selectedTicket) return;
    setIsRejecting(true);
    try {
      await updateTicketMutation.mutateAsync({
        ticketId: selectedTicket.ticketId,
        data: {
          status: "REJECTED",
          adminNotes: adminNotes.trim() || undefined,
        },
      });
    } finally {
      setIsRejecting(false);
    }
  };

  const getPaymentMethodDisplay = (method: string) => {
    switch (method) {
      case "CASH": return "Cash";
      case "UPI": return "UPI";
      case "BANK_TRANSFER": return "Bank Transfer";
      case "CHEQUE": return "Cheque";
      default: return method;
    }
  };

  const getStats = () => {
    if (!tickets) return { pending: 0, approved: 0, rejected: 0, total: 0 };
    
    return {
      pending: tickets.filter(t => t.status === "PENDING").length,
      approved: tickets.filter(t => t.status === "APPROVED").length,
      rejected: tickets.filter(t => t.status === "REJECTED").length,
      total: tickets.length,
    };
  };

  const stats = getStats();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Payment Ticket Management</CardTitle>
          <CardDescription>Loading payment tickets...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Payment Ticket Management</CardTitle>
          <CardDescription>Error loading payment tickets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-600">Failed to load payment tickets</p>
            <Button onClick={() => refetch()} className="mt-2">
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Payment Ticket Management
              </CardTitle>
              <CardDescription>
                Review and approve payment tickets from salespeople
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
              <p className="text-sm text-blue-600">Total Tickets</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-sm text-yellow-600">Pending</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
              <p className="text-sm text-green-600">Approved</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              <p className="text-sm text-red-600">Rejected</p>
            </div>
          </div>

          {tickets && tickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Salesperson</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket._id}>
                    <TableCell className="font-mono text-sm">
                      {ticket.ticketId}
                    </TableCell>
                    <TableCell>
                      {ticket.salesperson ? (
                        <div>
                          <p className="font-medium">
                            {ticket.salesperson.firstName} {ticket.salesperson.lastName}
                          </p>
                          <p className="text-sm text-gray-500">{ticket.salesperson.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{ticket.customerName}</p>
                        <p className="text-sm text-gray-500">{ticket.customerPhone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ₹{ticket.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {getPaymentMethodDisplay(ticket.paymentMethod)}
                    </TableCell>
                    <TableCell>
                      <PaymentTicketStatusBadge status={ticket.status} />
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openTicketDetails(ticket)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No payment tickets found
              </h3>
              <p className="text-gray-500">
                {statusFilter 
                  ? `No tickets with status "${statusFilter.toLowerCase()}"`
                  : "No payment tickets have been created yet."
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Details Dialog */}
      <Dialog open={!!selectedTicket} onOpenChange={closeTicketDetails}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payment Ticket Review</DialogTitle>
            <DialogDescription>
              Review payment ticket details and approve or reject
            </DialogDescription>
          </DialogHeader>
          
          {selectedTicket && (
            <div className="space-y-6">
              {/* Status Alert */}
              {selectedTicket.status === "PENDING" && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    This ticket is pending approval. Review the details and payment proof before making a decision.
                  </AlertDescription>
                </Alert>
              )}

              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">Ticket ID</Label>
                  <p className="font-mono text-sm">{selectedTicket.ticketId}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Status</Label>
                  <PaymentTicketStatusBadge status={selectedTicket.status} />
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Amount</Label>
                  <p className="font-medium">₹{selectedTicket.amount.toFixed(2)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">Payment Method</Label>
                  <p>{getPaymentMethodDisplay(selectedTicket.paymentMethod)}</p>
                </div>
              </div>

              {/* Salesperson Information */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Salesperson</Label>
                <div className="mt-2 space-y-1">
                  {selectedTicket.salesperson ? (
                    <>
                      <p><strong>Name:</strong> {selectedTicket.salesperson.firstName} {selectedTicket.salesperson.lastName}</p>
                      <p><strong>Email:</strong> {selectedTicket.salesperson.email}</p>
                      <p><strong>Phone:</strong> {selectedTicket.salesperson.phoneNumber}</p>
                    </>
                  ) : (
                    <p className="text-gray-500">Salesperson information not available</p>
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div>
                <Label className="text-sm font-medium text-gray-500">Customer Details</Label>
                <div className="mt-2 space-y-1">
                  <p><strong>Name:</strong> {selectedTicket.customerName}</p>
                  <p><strong>Phone:</strong> {selectedTicket.customerPhone}</p>
                  {selectedTicket.customerEmail && (
                    <p><strong>Email:</strong> {selectedTicket.customerEmail}</p>
                  )}
                </div>
              </div>

              {/* QR Details */}
              <div>
                <Label className="text-sm font-medium text-gray-500">QR Codes ({selectedTicket.qrIds.length})</Label>
                <div className="mt-2 space-y-1">
                  {selectedTicket.qrDetails?.map((qr) => (
                    <div key={qr._id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-mono text-sm">{qr.serialNumber}</p>
                        <p className="text-xs text-gray-500">{qr.qrTypeId.qrName}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Proof */}
              {selectedTicket.paymentProof && (
                <div>
                  <Label className="text-sm font-medium text-gray-500">Payment Proof</Label>
                  <div className="mt-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      View Proof
                    </Button>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <Label htmlFor="admin-notes" className="text-sm font-medium text-gray-500">
                  Admin Notes {selectedTicket.status === "PENDING" && "(Optional)"}
                </Label>
                <Textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this ticket..."
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                <div>
                  <Label>Created</Label>
                  <p>{format(new Date(selectedTicket.createdAt), "MMM dd, yyyy 'at' h:mm a")}</p>
                </div>
                {selectedTicket.approvedAt && (
                  <div>
                    <Label>Processed</Label>
                    <p>{format(new Date(selectedTicket.approvedAt), "MMM dd, yyyy 'at' h:mm a")}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {(selectedTicket.status === "PENDING" || selectedTicket.status === "REJECTED") && (
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    onClick={handleApproveTicket}
                    disabled={isApproving}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {isApproving
                      ? "Approving..."
                      : selectedTicket.status === "REJECTED"
                      ? "Mark as Paid & Approve"
                      : "Approve"}
                  </Button>
                  {selectedTicket.status === "PENDING" && (
                    <Button
                      onClick={handleRejectTicket}
                      disabled={isRejecting}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {isRejecting ? "Rejecting..." : "Reject"}
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
