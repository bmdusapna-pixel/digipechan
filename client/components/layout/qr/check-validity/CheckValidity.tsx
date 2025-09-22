"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, X, Loader2 } from "lucide-react";
import { QRStatus } from "@/common/constants/enum";
import { IQR } from "@/types/qr.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { checkValidity } from "@/lib/api/qr/checkValidityOfQR";
import { updateQR } from "@/lib/api/qr/updateQr";
import {
  ScanText,
  CheckCircle2,
  XCircle,
  User2,
  User,
  Phone,
  Mail,
  Car,
  MapPin,
  Home,
  Map,
  Edit2,
  Edit3,
  Zap,
} from "lucide-react";
import { IPaymentTransaction } from "@/types/payment.types";
import { z } from "zod";
import { qrUpdateSchema } from "@/lib/schemas/qr";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";

const visibleFieldsOptions = [
  { id: "customerName", label: "Customer Name" },
  { id: "mobileNumber", label: "Mobile Number" },
  { id: "email", label: "Email" },
  { id: "vehicleNumber", label: "Vehicle Number" },
  { id: "address", label: "Address" },
];

export default function QRValidityChecker() {
  const [serialNumber, setSerialNumber] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof qrUpdateSchema>>({
    resolver: zodResolver(qrUpdateSchema),
    defaultValues: {
      serialNumber: "",
      customerName: "",
      mobileNumber: "",
      altMobileNumber: "",
      email: "",
      address: {
        houseNumber: "",
        locality: "",
        nearByAreaName: "",
        pincode: "",
        city: "",
        state: "",
        country: "",
      },
      vehicleNumber: "",
      visibleInfoFields: [],
      qrStatus: QRStatus.ACTIVE,
      textMessagesAllowed: false,
      voiceCallsAllowed: false,
      videoCallsAllowed: false,
    },
  });

  const {
    data: validationData,
    isLoading: isChecking,
    isError,
    refetch: checkQRValidity,
  } = useQuery<
    | {
        qrInfo: IQR;
        transaction: IPaymentTransaction;
      }
    | { qrStatus: QRStatus }
  >({
    queryKey: ["check-qr-validity", serialNumber],
    queryFn: () => checkValidity({ serialNumber }),
    staleTime: 0,
    enabled: false,
  });

  const { mutate: updateQRFn, isPending: isUpdating } = useMutation({
    mutationFn: (data: z.infer<typeof qrUpdateSchema>) => updateQR(data),
    onSuccess: () => {
      toast.success("QR updated successfully");
      setIsDialogOpen(false);
      checkQRValidity();
    },
    onError: () => {
      toast.error("Failed to update QR");
    },
  });

  const handleCheckValidity = () => {
    if (!serialNumber.trim()) {
      toast.error("Please enter a serial number");
      return;
    }
    checkQRValidity();
  };

  const handleSubmit = (data: z.infer<typeof qrUpdateSchema>) => {
    updateQRFn(data);
  };

  const initEditForm = () => {
    if (!validationData || !("qrInfo" in validationData)) return;

    form.reset({
      serialNumber: serialNumber,
      customerName: validationData.qrInfo.customerName || "",
      mobileNumber: validationData.qrInfo.mobileNumber || "",
      altMobileNumber: validationData.qrInfo.altMobileNumber || "",
      email: validationData.qrInfo.email || "",
      address: {
        houseNumber: validationData.qrInfo.address?.houseNumber || "",
        locality: validationData.qrInfo.address?.locality || "",
        nearByAreaName: validationData.qrInfo.address?.nearByAreaName || "",
        pincode: validationData.qrInfo.address?.pincode || "",
        city: validationData.qrInfo.address?.city || "",
        state: validationData.qrInfo.address?.state || "",
        country: validationData.qrInfo.address?.country || "",
      },
      vehicleNumber: validationData.qrInfo.vehicleNumber || "",
      visibleInfoFields: validationData.qrInfo.visibleInfoFields || [],
      qrStatus: validationData.qrInfo.qrStatus,
      textMessagesAllowed: validationData.qrInfo.textMessagesAllowed || false,
      voiceCallsAllowed: validationData.qrInfo.voiceCallsAllowed || false,
      videoCallsAllowed: validationData.qrInfo.videoCallsAllowed || false,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="mb-6 mt-10">
        <CardHeader>
          <CardTitle className="text-xl font-bold">Check QR Validity</CardTitle>

          <Image
            src="https://me-qr-scanner.com/assets/img/Mask-Group.png"
            alt="QR Code"
            className="items-center w-full rounded-full p-10"
            width={100}
            height={100}
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2 flex-col ">
              <Input
                placeholder="Enter QR Serial Number"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                disabled={isChecking}
                className="mb-10"
              />
              <Button
                onClick={handleCheckValidity}
                disabled={isChecking || !serialNumber.trim()}
              >
                {isChecking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Check Validity
              </Button>
            </div>

            {isError && (
              <div className="rounded-md bg-red-100 p-4 text-red-700">
                <div className="flex items-center">
                  <X className="mr-2 h-4 w-4" />
                  <span>Invalid QR code or not found</span>
                </div>
              </div>
            )}

            {isChecking && (
              <div className="space-y-4">
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            )}

            {validationData && "qrStatus" in validationData && (
              <div className="rounded-md bg-yellow-100 p-4 text-yellow-700">
                <div className="flex items-center">
                  <X className="mr-2 h-4 w-4" />
                                                                           <span>
                      {validationData.qrStatus === QRStatus.INACTIVE
                        ? "QR is inactive. Payment approved. Customer can now activate it."
                        : validationData.qrStatus === QRStatus.PENDING_PAYMENT
                        ? "QR is pending payment. Please wait for approval."
                        : validationData.qrStatus === QRStatus.REJECTED
                        ? "QR payment was rejected. Payment is required to activate."
                        : "QR is already active."}
                    </span>
                </div>
              </div>
            )}

            {((validationData && "qrInfo" in validationData) ||
              (validationData &&
                "qrStatus" in validationData &&
                validationData.qrStatus === QRStatus.INACTIVE)) && (
              <Card className="w-full">
                {"qrInfo" in validationData && (
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <ScanText className="text-primary h-5 w-5" />
                        QR Details
                      </CardTitle>
                      <Badge
                        variant={
                          validationData.qrInfo.qrStatus === QRStatus.ACTIVE
                            ? "default"
                            : "destructive"
                        }
                        className="flex items-center gap-1 text-xs"
                      >
                        {validationData.qrInfo.qrStatus === QRStatus.ACTIVE ? (
                          <CheckCircle2 className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        {validationData.qrInfo.qrStatus}
                      </Badge>
                    </div>
                  </CardHeader>
                )}

                <CardContent className="space-y-4 p-4">
                  {"qrInfo" in validationData && (
                    <>
                      <div className="bg-muted/50 space-y-3 rounded-lg p-3">
                        <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                          <User2 className="h-4 w-4" />
                          Customer Information
                        </h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2 text-sm">
                              <User className="h-3.5 w-3.5" />
                              Name
                            </span>
                            <span className="text-right font-medium">
                              {validationData.qrInfo.customerName || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2 text-sm">
                              <Phone className="h-3.5 w-3.5" />
                              Mobile
                            </span>
                            <span className="font-medium">
                              {validationData.qrInfo.mobileNumber || "N/A"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground flex items-center gap-2 text-sm">
                              <Mail className="h-3.5 w-3.5" />
                              Email
                            </span>
                            <span className="max-w-[150px] truncate text-sm font-medium">
                              {validationData.qrInfo.email || "N/A"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-muted/50 space-y-3 rounded-lg p-3">
                        <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                          <Car className="h-4 w-4" />
                          Vehicle Information
                        </h3>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground text-sm">
                            Number
                          </span>
                          <span className="font-medium">
                            {validationData.qrInfo.vehicleNumber || "N/A"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-muted/50 space-y-3 rounded-lg p-3">
                        <h3 className="text-muted-foreground flex items-center gap-2 text-sm font-medium">
                          <MapPin className="h-4 w-4" />
                          Address
                        </h3>
                        {validationData.qrInfo.address ? (
                          <div className="space-y-1">
                            <p className="flex items-start gap-2 text-sm">
                              <Home className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                              <span>
                                {validationData.qrInfo.address.houseNumber},{" "}
                                {validationData.qrInfo.address.locality}
                              </span>
                            </p>
                            <p className="flex items-start gap-2 text-sm">
                              <Map className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                              <span>
                                {validationData.qrInfo.address.city},{" "}
                                {validationData.qrInfo.address.pincode}
                              </span>
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm">N/A</p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex flex-col space-y-2 pt-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={initEditForm}
                          disabled={isUpdating}
                          className="w-full gap-2"
                        >
                          <Edit2 className="h-4 w-4" />
                          Update Info
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Edit3 className="h-5 w-5" />
                            Update QR Information
                          </DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(handleSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={form.control}
                              name="customerName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Customer Name
                                    <span className="text-destructive"> *</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Customer Name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="mobileNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Mobile Number
                                    <span className="text-destructive"> *</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Mobile Number"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="altMobileNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Alternate Mobile</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Alternate Mobile"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Email
                                    <span className="text-red-500"> *</span>
                                  </FormLabel>
                                  <FormControl>
                                    <Input placeholder="Email" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="vehicleNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Vehicle Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Vehicle Number"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <div className="space-y-2">
                              <FormLabel>Address</FormLabel>
                              <div className="grid grid-cols-2 gap-2">
                                <FormField
                                  control={form.control}
                                  name="address.houseNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="House No"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="address.locality"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="Locality"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="address.city"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input placeholder="City" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="address.pincode"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormControl>
                                        <Input
                                          placeholder="Pincode"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <FormLabel>Visible Fields</FormLabel>
                              <div className="grid grid-cols-2 gap-2">
                                {visibleFieldsOptions.map((field) => (
                                  <FormField
                                    key={field.id}
                                    control={form.control}
                                    name="visibleInfoFields"
                                    render={({ field: rhfField }) => {
                                      const isChecked =
                                        rhfField.value?.includes(field.id) ||
                                        false;
                                      return (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Checkbox
                                              checked={isChecked}
                                              onCheckedChange={(checked) => {
                                                if (checked) {
                                                  rhfField.onChange([
                                                    ...(rhfField.value || []),
                                                    field.id,
                                                  ]);
                                                } else {
                                                  rhfField.onChange(
                                                    rhfField.value?.filter(
                                                      (value: string) =>
                                                        value !== field.id
                                                    )
                                                  );
                                                }
                                              }}
                                            />
                                          </FormControl>
                                          <FormLabel className="!mt-0">
                                            {field.label}
                                          </FormLabel>
                                        </FormItem>
                                      );
                                    }}
                                  />
                                ))}
                              </div>
                            </div>

                            <Button
                              type="submit"
                              disabled={isUpdating}
                              className="w-full"
                            >
                              {isUpdating ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                "Update QR"
                              )}
                            </Button>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>

                    {"qrStatus" in validationData &&
                      validationData.qrStatus === QRStatus.INACTIVE && (
                        <Button
                          onClick={() => {
                            updateQR({
                              ...form.getValues(),
                              serialNumber: serialNumber,
                              qrStatus: QRStatus.ACTIVE,
                            } as IQR)
                              .then(() => {
                                toast.success("QR Activated successfully");
                                checkQRValidity();
                              })
                              .catch(() => {
                                toast.error("Failed to activate QR");
                              });
                          }}
                          className="w-full gap-2"
                        >
                          <Zap className="h-4 w-4" />
                          Activate QR
                        </Button>
                      )}

                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
