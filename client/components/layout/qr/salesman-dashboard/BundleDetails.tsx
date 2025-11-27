"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CreatePaymentTicketForm } from "@/components/layout/salesman/CreatePaymentTicketForm";
import {
  ArrowLeft,
  QrCode,
  Package,
  CreditCard,
  Receipt,
  MoreHorizontal,
  Loader2,
  Loader2Icon,
} from "lucide-react";
import { getBundleQrs, SalesmanQR } from "@/types/salesman";
import { initiatePayment } from "@/lib/api/qr/initiatePayment";
import { DeliveryType } from "@/common/constants/enum";
import { toast } from "sonner";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";

export default function BundleDetails({ bundleId }: { bundleId: string }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.user?.accessToken);
  const headers = { Authorization: `Bearer ${token ?? ""}` };

  const [selectedQr, setSelectedQr] = useState<SalesmanQR | null>(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [redirectingQrId, setRedirectingQrId] = useState<string | null>(null);
  const [downloadingQrId, setDownloadingQrId] = useState<string | null>(null);

  const {
    data: bundleData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["bundle-qrs", bundleId],
    queryFn: () => getBundleQrs(bundleId, headers),
    enabled: !!token && !!bundleId,
  });

  const qrs = bundleData?.qrs ?? [];
  const bundle = bundleData?.bundle;

  const handleOnlinePayment = async (qr: SalesmanQR) => {
    try {
      setRedirectingQrId(qr._id);
      if (typeof qr.price !== "number" || qr.price <= 0) {
        toast.error("Invalid price for this QR");
        setRedirectingQrId(null);
        return;
      }

      const qrTypeId = (qr.qrTypeId as any)?._id || "";
      if (!qrTypeId) {
        toast.error("Missing QR type for payment");
        setRedirectingQrId(null);
        return;
      }

      const paymentUrl = await initiatePayment({
        items: [{ qrTypeId, quantity: 1 }],
        deliveryType:
          (bundle?.deliveryType as DeliveryType) || DeliveryType.ETAG,
        amount: qr.price,
        qrId: qr._id, // Add the QR ID to identify this as a salesman bundle sale
      });

      if (paymentUrl) {
        window.location.href = paymentUrl as unknown as string;
        return; // Note: page will redirect
      }
      setRedirectingQrId(null);
    } catch (e) {
      toast.error("Failed to start online payment");
      setRedirectingQrId(null);
    }
  };

  const handleOfflinePayment = (qr: SalesmanQR) => {
    setSelectedQr(qr);
    setShowCreateTicket(true);
  };

  const handleTicketCreated = async () => {
    setShowCreateTicket(false);
    setSelectedQr(null);

    // Refetch bundle data to show updated QR statuses
    try {
      await refetch();
      toast.success("Payment ticket created! QR status updated.");
    } catch (error) {
      console.error("Failed to refetch bundle data:", error);
      toast.error(
        "Ticket created but failed to update display. Please refresh the page."
      );
    }
  };

  const canSellQr = (qr: SalesmanQR) => {
    // Only INACTIVE QRs without a customer and not already sold can be sold
    // Exclude PENDING_PAYMENT and REJECTED QRs
    return qr.qrStatus === "INACTIVE" && !qr.createdFor && !qr.isSold;
  };

  const handleDownloadQR = async (qrId: string, serialNumber: string) => {
    try {
      setDownloadingQrId(qrId);

      // Get the auth token
      const state = useAuthStore.getState();
      const accessToken = state.user?.accessToken;

      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      // Make the download request
      const response = await fetch(API_ENDPOINTS.downloadQR(qrId), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `QR-${serialNumber}.pdf`;

      // Trigger the download
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success("QR code PDF downloaded successfully!");
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download QR code");
    } finally {
      setDownloadingQrId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 mt-10">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bundle Details</h1>
            <p className="text-gray-600 text-sm">Bundle ID: {bundleId}</p>
          </div>
        </div>

        {/* Bundle Info Card */}
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-blue-600" />
              Bundle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Total QRs:</span>
                <p className="text-lg font-bold text-blue-600">
                  {bundle?.qrCount ?? qrs.length}
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-600">QR Type:</span>
                <p className="text-lg font-bold text-gray-900">
                  {qrs?.[0]?.qrTypeId?.qrName ?? "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QRs Grid */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-green-600" />
              QR Codes ({qrs.length})
              {isRefetching && (
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2Icon className="w-8 h-8 animate-spin mx-auto" />
                <p className="mt-2 text-gray-600">Loading QRs...</p>
              </div>
            ) : qrs.length === 0 ? (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No QRs found in this bundle</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {qrs.map((qr: SalesmanQR) => (
                  <div
                    key={qr._id}
                    className="bg-gray-50 rounded-lg p-3 border hover:shadow-md transition-shadow"
                  >
                    <div className="text-center space-y-2">
                      <div
                        onClick={
                          qr.qrStatus === "ACTIVE"
                            ? () => handleDownloadQR(qr._id, qr.serialNumber)
                            : undefined
                        }
                        className={`cursor-pointer ${
                          qr.qrStatus === "ACTIVE"
                            ? "hover:opacity-80 transition-opacity"
                            : ""
                        }`}
                        title={
                          qr.qrStatus === "ACTIVE"
                            ? "Click to download QR code"
                            : ""
                        }
                      >
                        <img
                          src={qr.qrUrl}
                          alt="QR Code"
                          className="w-full h-auto rounded border-2 border-gray-200"
                        />
                      </div>
                      <div className="text-xs space-y-1">
                        <p className="font-medium text-gray-900 truncate">
                          {qr.serialNumber}
                        </p>
                        <p className="text-gray-700">
                          {qr.qrTypeId?.qrName ?? "Unknown Type"}
                        </p>
                        {typeof qr.price === "number" && (
                          <p className="text-green-700 font-semibold">
                            ₹{qr.price.toFixed(2)}
                          </p>
                        )}
                        <div
                          className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            qr.qrStatus === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : qr.qrStatus === "PENDING_PAYMENT"
                                ? "bg-orange-100 text-orange-800"
                                : qr.qrStatus === "REJECTED"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {qr.qrStatus === "PENDING_PAYMENT"
                            ? "Pending Payment"
                            : qr.qrStatus === "REJECTED"
                              ? "Payment Rejected"
                              : qr.qrStatus}
                        </div>

                        {/* Sell Button - Only show for available QRs */}
                        {canSellQr(qr) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                size="sm"
                                className="w-full mt-2 bg-blue-600 hover:bg-blue-700"
                                disabled={redirectingQrId === qr._id}
                              >
                                {redirectingQrId === qr._id ? (
                                  <>
                                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                                    Processing...
                                  </>
                                ) : (
                                  <>
                                    Sell QR
                                    <MoreHorizontal className="w-3 h-3 ml-1" />
                                  </>
                                )}
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => handleOnlinePayment(qr)}
                                className="flex items-center gap-2"
                              >
                                <CreditCard className="w-4 h-4" />
                                Online Payment
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOfflinePayment(qr)}
                                className="flex items-center gap-2"
                              >
                                <Receipt className="w-4 h-4" />
                                Offline Payment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}

                        {/* Show status for sold QRs */}
                        {!canSellQr(qr) && (
                          <div className="text-xs text-gray-500 mt-2">
                            {qr.qrStatus === "ACTIVE"
                              ? "Activated & Sold"
                              : qr.qrStatus === "INACTIVE"
                                ? "Payment Approved - Ready to Activate"
                                : qr.qrStatus === "PENDING_PAYMENT"
                                  ? "Payment Pending - Ticket Created"
                                  : qr.qrStatus === "REJECTED"
                                    ? "Payment Rejected - Contact Admin"
                                    : "Not Available"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Payment Ticket Dialog */}
      <Dialog open={showCreateTicket} onOpenChange={setShowCreateTicket}>
        <DialogContent className="max-w-2xl sm:max-w-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Payment Ticket</DialogTitle>
            <DialogDescription>
              Create a payment ticket for offline sale of QR:{" "}
              {selectedQr?.serialNumber}
            </DialogDescription>
          </DialogHeader>

          {selectedQr && (
            <CreatePaymentTicketForm
              availableQrs={[
                {
                  _id: selectedQr._id,
                  serialNumber: selectedQr.serialNumber,
                  price: selectedQr.price,
                  qrTypeId: {
                    qrName: selectedQr.qrTypeId?.qrName || "Unknown",
                    qrDescription: selectedQr.qrTypeId?.qrDescription || "",
                  },
                },
              ]}
              bundleId={bundleId}
              bundlePricePerQr={bundle?.pricePerQr}
              onSuccess={handleTicketCreated}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
