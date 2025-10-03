"use client";
import { useQuery } from "@tanstack/react-query";
import useAuthStore from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { QrCode, Package, Loader2, Loader2Icon } from "lucide-react";
import { getBundleQrs, SalesmanQR } from "@/types/admin";

export default function BundleDetailsDialog({
  bundleId,
  open,
  onOpenChange,
}: {
  bundleId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const token = useAuthStore((s) => s.user?.accessToken);
  const headers = { Authorization: `Bearer ${token ?? ""}` };

  const {
    data: bundleData,
    isLoading,
    isRefetching,
  } = useQuery({
    queryKey: ["bundle-qrs", bundleId],
    queryFn: () => getBundleQrs(bundleId, headers),
    enabled: !!token && !!bundleId,
  });

  const qrs = bundleData?.qrs ?? [];
  const bundle = bundleData?.bundle;

  const canSellQr = (qr: SalesmanQR) => {
    return qr.qrStatus === "INACTIVE" && !qr.createdFor && !qr.isSold;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl sm:max-w-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bundle Details</DialogTitle>
          <DialogDescription>Bundle ID: {bundleId}</DialogDescription>
        </DialogHeader>

        {/* Bundle Info Card */}
        <Card className="bg-white shadow">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5 text-blue-600" />
              Bundle Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
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
          </CardContent>
        </Card>

        {/* QRs Grid */}
        <Card className="bg-white shadow">
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
                      <img
                        src={qr.qrUrl}
                        alt="QR Code"
                        className="w-full h-auto rounded border-2 border-gray-200"
                      />
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

                        {/* Status Badge */}
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

                        {/* Status Text */}
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

                        {canSellQr(qr) && (
                          <div className="text-xs text-green-600 mt-2 font-semibold">
                            Available for Sale
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
      </DialogContent>
    </Dialog>
  );
}
