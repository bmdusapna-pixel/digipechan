import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PaymentProofUpload } from "@/components/ui/payment-proof-upload";
import { createPaymentTicket } from "@/lib/api/paymentTicket";
import { ICreatePaymentTicketRequest } from "@/types/paymentTicket.types";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";

// Form schema without amount field - amount will be calculated automatically
const createPaymentTicketSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(10, "Valid phone number is required"),
  customerEmail: z.string().email().optional().or(z.literal("")),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE"]),
  qrIds: z.array(z.string()).min(1, "At least one QR must be selected"),
  bundleId: z.string().min(1, "Bundle is required"),
});

type CreatePaymentTicketFormData = z.infer<typeof createPaymentTicketSchema>;

interface CreatePaymentTicketFormProps {
  availableQrs: Array<{
    _id: string;
    serialNumber: string;
    price?: number;
    qrTypeId: {
      qrName: string;
      qrDescription: string;
    };
  }>;
  bundleId: string;
  bundlePricePerQr?: number | null;
  onSuccess?: () => void;
}

export function CreatePaymentTicketForm({ 
  availableQrs, 
  bundleId, 
  bundlePricePerQr,
  onSuccess 
}: CreatePaymentTicketFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedQrIds, setSelectedQrIds] = useState<string[]>([]);

  // Calculate total amount from selected QRs automatically
  const totalAmount = selectedQrIds.reduce((total, qrId) => {
    const qr = availableQrs.find(q => q._id === qrId);
    const qrPrice = qr?.price ?? bundlePricePerQr ?? 0;
    return total + qrPrice;
  }, 0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CreatePaymentTicketFormData>({
    resolver: zodResolver(createPaymentTicketSchema),
    defaultValues: {
      bundleId,
      qrIds: [],
    },
  });

  const watchedPaymentMethod = watch("paymentMethod");

  const handleQrSelection = (qrId: string, checked: boolean) => {
    if (checked) {
      const newSelectedQrIds = [...selectedQrIds, qrId];
      setSelectedQrIds(newSelectedQrIds);
      setValue("qrIds", newSelectedQrIds);
    } else {
      const newSelectedQrIds = selectedQrIds.filter(id => id !== qrId);
      setSelectedQrIds(newSelectedQrIds);
      setValue("qrIds", newSelectedQrIds);
    }
  };

  const onSubmit = async (data: CreatePaymentTicketFormData) => {
    try {
      console.log("=== FORM SUBMISSION STARTED ===");
      setIsSubmitting(true);
      
      console.log("=== PAYMENT TICKET DEBUG ===");
      console.log("Form Data:", data);
      console.log("Selected QR IDs:", selectedQrIds);
      console.log("Available QRs:", availableQrs);
      console.log("Bundle Price Per QR:", bundlePricePerQr);
      console.log("Total Amount:", totalAmount);
      console.log("Bundle ID:", bundleId);
      console.log("==========================");

      // Create the API request data with calculated amount
      const ticketData: ICreatePaymentTicketRequest = {
        ...data,
        amount: totalAmount, // Automatically calculated from QR prices
      };

      await createPaymentTicket(ticketData, selectedFile || undefined);
      
      toast.success("Payment ticket created successfully!");
      reset();
      setSelectedFile(null);
      setSelectedQrIds([]);
      onSuccess?.();
    } catch (error) {
      console.error("=== PAYMENT TICKET ERROR ===");
      console.error("Error creating payment ticket:", error);
      console.error("==========================");
      toast.error("Failed to create payment ticket. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      {/* <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Create Payment Ticket
        </CardTitle>
        <CardDescription>
          Create a payment ticket for offline sales. Select QRs and provide customer details.
        </CardDescription>
      </CardHeader> */}
      <CardContent>
        <form 
          onSubmit={handleSubmit(onSubmit)} 
          className="space-y-6"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.target !== e.currentTarget) {
              e.preventDefault();
            }
          }}
        >
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input
                id="customerName"
                {...register("customerName")}
                placeholder="Enter customer name"
              />
              {errors.customerName && (
                <p className="text-sm text-red-600">{errors.customerName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">Phone Number *</Label>
              <Input
                id="customerPhone"
                {...register("customerPhone")}
                placeholder="+91 9876543210"
              />
              {errors.customerPhone && (
                <p className="text-sm text-red-600">{errors.customerPhone.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email (Optional)</Label>
            <Input
              id="customerEmail"
              type="email"
              {...register("customerEmail")}
              placeholder="customer@example.com"
            />
            {errors.customerEmail && (
              <p className="text-sm text-red-600">{errors.customerEmail.message}</p>
            )}
          </div>

          {/* QR Selection */}
          <div className="space-y-3">
            <Label>Select QRs to Sell *</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-48 overflow-y-auto border rounded-lg p-3">
              {availableQrs.map((qr) => {
                const displayPrice = qr.price ?? bundlePricePerQr ?? 0;
                return (
                  <label
                    key={qr._id}
                    className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedQrIds.includes(qr._id)}
                      onChange={(e) => handleQrSelection(qr._id, e.target.checked)}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{qr.serialNumber}</p>
                      <p className="text-xs text-gray-500">{qr.qrTypeId.qrName}</p>
                      <p className="text-xs text-green-600 font-medium">₹{displayPrice}</p>
                    </div>
                  </label>
                );
              })}
            </div>
            {errors.qrIds && (
              <p className="text-sm text-red-600">{errors.qrIds.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Payment Method *</Label>
            <Select
              value={watchedPaymentMethod}
              onValueChange={(value) => setValue("paymentMethod", value as "CASH" | "UPI" | "BANK_TRANSFER" | "CHEQUE")}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="UPI">UPI</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-sm text-red-600">{errors.paymentMethod.message}</p>
            )}
          </div>

          {/* Payment Proof Upload */}
          <PaymentProofUpload
            onFileSelect={setSelectedFile}
            selectedFile={selectedFile}
          />

          {/* Summary */}
          {selectedQrIds.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Summary</h4>
              <div className="text-sm space-y-1">
                <p>QRs Selected: {selectedQrIds.length}</p>
                <p className="text-lg font-semibold text-green-600">Total Amount: ₹{totalAmount}</p>
                <p>Payment Method: {watchedPaymentMethod || "Not selected"}</p>
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || selectedQrIds.length === 0 || totalAmount === 0}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Ticket...
              </>
            ) : (
              "Create Payment Ticket"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
