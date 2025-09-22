"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { IPaymentTransaction } from "@/types/payment.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle2, XCircle, Clock } from "lucide-react";
import { PaymentTransactionStatus } from "@/common/constants/enum";
import { fetchPaymentStatus } from "@/lib/api/qr/fetchPaymentStatus";
import { useCartStore } from "@/store/cartStore";
export function PaymentStatus() {
  const searchParams = useSearchParams();
  const txnId = searchParams.get("transactionId");
  const clientId = searchParams.get("client_txn_id");
  const id = txnId || clientId;
  const key: "transactionId" | "client_txn_id" = txnId ? "transactionId" : "client_txn_id";

  const [status, setStatus] = useState<IPaymentTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const clearedRef = useRef(false);
  const { clearCart } = useCartStore.getState();

  useEffect(() => {
    if (!id) return;

    let attempts = 0;
    const maxAttempts = 30; // ~60s with 2s interval
    const poll = async () => {
      try {
        const res = await fetchPaymentStatus(id, key);
        setStatus(res);
        if (
          res?.paymentStatus !== PaymentTransactionStatus.INITIATED ||
          attempts >= maxAttempts
        ) {
          clearInterval(timer);
        }
      } catch (e) {
        console.log("Error is : ", e);
        setError("Failed to fetch payment status.");
        clearInterval(timer);
      } finally {
        setLoading(false);
        attempts += 1;
      }
    };

    const timer = setInterval(poll, 2000);
    poll();
    return () => clearInterval(timer);
  }, [id, key]);

  useEffect(() => {
    if (
      !clearedRef.current &&
      status?.paymentStatus === PaymentTransactionStatus.PAID
    ) {
      clearCart();
      clearedRef.current = true;
    }
  }, [status, clearCart]);

  const renderStatusIcon = (status?: PaymentTransactionStatus) => {
    const baseStyle = "w-16 h-16"; // larger icon
    switch (status) {
      case PaymentTransactionStatus.PAID:
        return <CheckCircle2 className={`${baseStyle} text-green-600`} />;
      case PaymentTransactionStatus.FAILED:
        return <XCircle className={`${baseStyle} text-red-600`} />;
      case PaymentTransactionStatus.INITIATED:
      default:
        return <Clock className={`${baseStyle} text-yellow-500`} />;
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      {loading ? (
        <div className="text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Fetching payment status...
        </div>
      ) : error ? (
        <Card className="border-red-400 bg-red-50">
          <CardHeader className="flex flex-row items-center gap-2">
            <XCircle className="text-red-500" />
            <CardTitle>Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      ) : status ? (
        <Card className="relative pt-4">
          <div className="flex items-center justify-center bg-white p-2">
            {renderStatusIcon(status.paymentStatus)}
          </div>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Payment Status</CardTitle>
            {status.paymentStatus === PaymentTransactionStatus.PAID && (
              <p className="mt-2 text-sm font-medium text-green-600">
                Payment successful. Check your inbox for your QR.
              </p>
            )}
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <span className="text-muted-foreground font-medium">
                Transaction ID:
              </span>
              <p>{id}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Amount:</span>
              <p>₹{status.amount}</p>
            </div>
            <div>
              <span className="text-muted-foreground font-medium">Status:</span>
              <p className="capitalize">{status.paymentStatus}</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-muted-foreground text-center">
          No transaction data available.
        </div>
      )}
    </div>
  );
}