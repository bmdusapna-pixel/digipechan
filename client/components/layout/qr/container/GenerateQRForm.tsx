"use client";

import { IEtagFormSchema, IOfflineShipFormSchema, eTagFormSchema, offlineShipQRFormSchema } from "@/lib/schemas/qr";
import { QRType, VehicleType } from "@/types/qr";
import { useParams } from "next/navigation";
import { useState } from "react";
import { QRSelectionCard, qrTypes } from "../presentational/QRSelectionCards";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { QRCodeSVG } from "qrcode.react";
import { encode } from "@/common/utils/encoders";
import { toast } from "sonner";
import { ZodError } from "zod";

const steps = ["Your Details", "QR Configuration", "Generate QR"];

export default function GenerateQRForm() {
    const { type } = useParams();
    const qrType = type as QRType;
    const isOfflineShip = qrType === QRType.OFFLINE_SHIP;
    const cardData = qrTypes.find((item) => item.type === qrType);
    const [currentStep, setCurrentStep] = useState(1);
    const [qrLink, setQrLink] = useState("");

    const [formData, setFormData] = useState<IOfflineShipFormSchema | IEtagFormSchema>(
        isOfflineShip
            ? {
                  name: "",
                  phoneNumber: "",
                  email: "",
                  altPhoneNumber: "",
                  houseNumber: 0,
                  locality: "",
                  nearByArea: "",
                  zipCode: 0,
                  state: "",
                  city: "",
                  vehicleNumber: "",
                  gstNumber: "",
              }
            : {
                  name: "",
                  phoneNumber: "",
                  email: "",
                  vehicleType: VehicleType.CAR,
              }
    );

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [fieldsToInclude, setFieldsToInclude] = useState<Record<string, boolean>>(() => {
        const initialFields: Record<string, boolean> = {};
        Object.keys(formData).forEach((key) => {
            initialFields[key] = true;
        });
        return initialFields;
    });

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setFormErrors((prev) => ({ ...prev, [field]: "" }));
    };

    const getSchema = () => (isOfflineShip ? offlineShipQRFormSchema : eTagFormSchema);

    const validateCurrentStep = () => {
        try {
            const schema = getSchema();
            schema.parse(formData);
            setFormErrors({});
            return true;
        } catch (err) {
            if (err instanceof ZodError) {
                const errors: Record<string, string> = {};
                err.errors.forEach((e) => {
                    if (e.path[0]) errors[e.path[0] as string] = e.message;
                });
                setFormErrors(errors);
            }
            return false;
        }
    };

    const handleNext = () => {
        if (currentStep === 1 && !validateCurrentStep()) return;
        if (currentStep === 2) generateQR();
        setCurrentStep((s) => s + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep((s) => s - 1);
    };

    const handleCheckboxChange = (field: string, checked: boolean) => {
        setFieldsToInclude((prev) => ({ ...prev, [field]: checked }));
    };

    const formatFieldLabel = (key: string) => {
        return key
            .replace(/([A-Z])/g, " $1")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const getFilteredData = () => {
        return Object.fromEntries(Object.entries(formData).filter(([key]) => fieldsToInclude[key]));
    };

    const generateQR = () => {
        const filteredData = getFilteredData();
        const encodedData = encode(
            JSON.stringify({
                type: qrType,
                data: filteredData,
            })
        );
        const link = `${window.location.origin}/qr/${encodedData}`;
        setQrLink(link);
    };

    const downloadQR = () => {
        try {
            const svg = document.getElementById("qr-canvas");
            if (!svg) throw new Error("QR code not found");

            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const data = new XMLSerializer().serializeToString(svg);
            const img = new Image();

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx?.drawImage(img, 0, 0);

                const pngUrl = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.href = pngUrl;
                downloadLink.download = `${formData.name}'s ${qrType}`;
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                toast.success("QR code downloaded successfully!");
            };

            img.src = `data:image/svg+xml;base64,${btoa(data)}`;
        } catch (error) {
            console.error("Download failed:", error);
            toast.error("Failed to download QR code");
        }
    };

    return (
        <div className="from-muted/30 to-background min-h-screen bg-gradient-to-br lg:px-10">
            {/* Mobile Layout */}
            <div className="flex flex-col lg:hidden">
                <div className="bg-card p-4 shadow-sm">
                    <div className="mb-4">{cardData && <QRSelectionCard {...cardData} />}</div>

                    <div className="mb-4 flex items-center justify-between">
                        {steps.map((step, index) => (
                            <div key={index} className="flex flex-1 flex-col items-center">
                                <div
                                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                                        index + 1 === currentStep
                                            ? "bg-primary text-primary-foreground"
                                            : index + 1 < currentStep
                                              ? "border border-[var(--chart-2)]/50 bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
                                              : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {index + 1 < currentStep ? "✓" : index + 1}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="bg-border mt-4 hidden h-px w-full sm:block"></div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <span className="text-primary text-sm font-medium">{steps[currentStep - 1]}</span>
                    </div>

                    <div className="mt-4 flex justify-center">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                            {isOfflineShip ? "Offline Ship QR" : "E-Tag QR"}
                        </Badge>
                    </div>
                </div>

                <div className="flex-1 p-4">
                    <h2 className="text-foreground mb-2 text-xl font-bold">{steps[currentStep - 1]}</h2>
                    <p className="text-muted-foreground mb-4 text-sm">
                        {currentStep === 1 && "Fill in your personal details to get started."}
                        {currentStep === 2 && "Choose your preferred QR code configuration options."}
                        {currentStep === 3 && "Your QR code is ready to be generated."}
                    </p>

                    <Separator className="bg-border mb-4" />

                    <Card className="bg-card border-[var(--border)] shadow-sm">
                        <CardContent className="p-4">
                            {currentStep === 1 && (
                                <div className="space-y-4">
                                    {Object.entries(formData).map(([key, value]) => (
                                        <div key={key} className="space-y-2">
                                            <Label htmlFor={key} className="text-card-foreground text-sm">
                                                {formatFieldLabel(key)}
                                            </Label>
                                            {key === "vehicleType" ? (
                                                <Select
                                                    value={value as string}
                                                    onValueChange={(val) => handleInputChange(key, val)}
                                                >
                                                    <SelectTrigger
                                                        className={`${formErrors[key] ? "border-destructive" : "border-[var(--input)]"} bg-background text-foreground focus:ring-[var(--ring)]`}
                                                    >
                                                        <SelectValue placeholder="Select vehicle type" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-popover text-popover-foreground">
                                                        <SelectItem value={VehicleType.CAR}>Car</SelectItem>
                                                        <SelectItem value={VehicleType.BIKE}>Bike</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    id={key}
                                                    type={typeof value === "number" ? "number" : "text"}
                                                    value={value}
                                                    onChange={(e) =>
                                                        handleInputChange(
                                                            key,
                                                            typeof value === "number"
                                                                ? parseInt(e.target.value)
                                                                : e.target.value
                                                        )
                                                    }
                                                    className={`${formErrors[key] ? "border-destructive" : "border-[var(--input)]"} bg-background text-foreground focus-visible:ring-[var(--ring)]`}
                                                    placeholder={`Enter ${formatFieldLabel(key).toLowerCase()}`}
                                                />
                                            )}
                                            {formErrors[key] && (
                                                <span className="text-destructive text-xs">{formErrors[key]}</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="space-y-2">
                                    {Object.keys(formData).map((field) => (
                                        <div
                                            key={field}
                                            className="hover:bg-muted/50 flex items-center space-x-3 rounded-lg p-3"
                                        >
                                            <Checkbox
                                                id={`include-${field}`}
                                                checked={fieldsToInclude[field]}
                                                onCheckedChange={(checked) =>
                                                    handleCheckboxChange(field, checked as boolean)
                                                }
                                                className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-muted-foreground"
                                            />
                                            <Label
                                                htmlFor={`include-${field}`}
                                                className="text-card-foreground flex-1 cursor-pointer text-sm font-medium"
                                            >
                                                {formatFieldLabel(field)}
                                            </Label>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {currentStep === 3 && qrLink && (
                                <div className="space-y-4">
                                    <div className="flex flex-col items-center">
                                        <div className="border-border bg-background mb-4 flex h-48 w-48 items-center justify-center rounded-lg border p-4 sm:h-64 sm:w-64">
                                            <QRCodeSVG
                                                id="qr-canvas"
                                                value={qrLink}
                                                size={window.innerWidth < 640 ? 180 : 200}
                                                level="H"
                                                includeMargin={true}
                                                fgColor="var(--foreground)"
                                                bgColor="var(--background)"
                                            />
                                        </div>
                                        <Button
                                            variant="outline"
                                            onClick={() => window.open(qrLink, "_blank")}
                                            className="border-primary text-primary hover:bg-primary/10 mb-4 w-full sm:w-auto"
                                        >
                                            View QR Details
                                        </Button>
                                    </div>
                                    <div className="border-border bg-muted/50 rounded-lg border p-4">
                                        <h3 className="text-foreground mb-2 text-sm font-medium">Details Summary</h3>
                                        <pre className="text-muted-foreground overflow-auto text-xs break-all whitespace-pre-wrap">
                                            {JSON.stringify(getFilteredData(), null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-between">
                        {currentStep > 1 && (
                            <Button
                                variant="outline"
                                onClick={handleBack}
                                className="border-border text-muted-foreground hover:bg-muted w-full sm:w-auto"
                            >
                                Back
                            </Button>
                        )}
                        {currentStep < 3 ? (
                            <Button
                                onClick={handleNext}
                                className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:ml-auto sm:w-auto"
                            >
                                Continue
                            </Button>
                        ) : (
                            <Button
                                onClick={downloadQR}
                                className="text-primary-foreground w-full bg-[var(--chart-2)] hover:bg-[var(--chart-2)]/90 sm:ml-auto sm:w-auto"
                            >
                                Download QR Code
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden min-h-screen justify-center px-8 pt-8 pb-8 lg:flex">
                <div className="border-border bg-card flex w-80 flex-col rounded-2xl border-r p-6 pt-16 shadow-md">
                    <div className="mb-8">{cardData && <QRSelectionCard {...cardData} />}</div>
                    <h3 className="text-muted-foreground mb-4 text-sm font-semibold">PROGRESS</h3>
                    <div className="space-y-4">
                        {steps.map((step, index) => (
                            <div key={index} className="flex items-center">
                                <div
                                    className={`mr-3 flex h-8 w-8 items-center justify-center rounded-full ${
                                        index + 1 === currentStep
                                            ? "bg-primary text-primary-foreground"
                                            : index + 1 < currentStep
                                              ? "border border-[var(--chart-2)]/50 bg-[var(--chart-2)]/10 text-[var(--chart-2)]"
                                              : "bg-muted text-muted-foreground"
                                    }`}
                                >
                                    {index + 1 < currentStep ? "✓" : index + 1}
                                </div>
                                <span
                                    className={`text-sm ${index + 1 === currentStep ? "text-primary font-medium" : "text-muted-foreground"}`}
                                >
                                    {step}
                                </span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-auto">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                            {isOfflineShip ? "Offline Ship QR" : "E-Tag QR"}
                        </Badge>
                    </div>
                </div>

                <div className="flex-1 p-8">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="text-foreground mb-2 text-2xl font-bold">{steps[currentStep - 1]}</h2>
                        <p className="text-muted-foreground mb-6">
                            {currentStep === 1 && "Fill in your personal details to get started."}
                            {currentStep === 2 && "Choose your preferred QR code configuration options."}
                            {currentStep === 3 && "Your QR code is ready to be generated."}
                        </p>

                        <Separator className="bg-border mb-6" />

                        <Card className="bg-card border-[var(--border)] shadow-sm">
                            <CardContent className="p-6">
                                {currentStep === 1 && (
                                    <div className="grid gap-6 md:grid-cols-2">
                                        {Object.entries(formData).map(([key, value]) => (
                                            <div key={key} className="space-y-2">
                                                <Label htmlFor={key} className="text-card-foreground text-sm">
                                                    {formatFieldLabel(key)}
                                                </Label>
                                                {key === "vehicleType" ? (
                                                    <Select
                                                        value={value as string}
                                                        onValueChange={(val) => handleInputChange(key, val)}
                                                    >
                                                        <SelectTrigger
                                                            className={`${formErrors[key] ? "border-destructive" : "border-[var(--input)]"} bg-background text-foreground focus:ring-[var(--ring)]`}
                                                        >
                                                            <SelectValue placeholder="Select vehicle type" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-popover text-popover-foreground">
                                                            <SelectItem value={VehicleType.CAR}>Car</SelectItem>
                                                            <SelectItem value={VehicleType.BIKE}>Bike</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                ) : (
                                                    <Input
                                                        id={key}
                                                        type={typeof value === "number" ? "number" : "text"}
                                                        value={value}
                                                        onChange={(e) =>
                                                            handleInputChange(
                                                                key,
                                                                typeof value === "number"
                                                                    ? parseInt(e.target.value)
                                                                    : e.target.value
                                                            )
                                                        }
                                                        className={`${formErrors[key] ? "border-destructive" : "border-[var(--input)]"} bg-background text-foreground focus-visible:ring-[var(--ring)]`}
                                                        placeholder={`Enter ${formatFieldLabel(key).toLowerCase()}`}
                                                    />
                                                )}
                                                {formErrors[key] && (
                                                    <span className="text-destructive text-xs">{formErrors[key]}</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {currentStep === 2 && (
                                    <div className="p-4">
                                        <div className="grid gap-4 md:grid-cols-2">
                                            {Object.keys(formData).map((field) => (
                                                <div
                                                    key={field}
                                                    className="hover:bg-muted/50 flex items-center space-x-2 rounded-md p-2"
                                                >
                                                    <Checkbox
                                                        id={`desktop-include-${field}`}
                                                        checked={fieldsToInclude[field]}
                                                        onCheckedChange={(checked) =>
                                                            handleCheckboxChange(field, checked as boolean)
                                                        }
                                                        className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-muted-foreground"
                                                    />
                                                    <Label
                                                        htmlFor={`desktop-include-${field}`}
                                                        className="text-card-foreground cursor-pointer text-sm font-medium"
                                                    >
                                                        {formatFieldLabel(field)}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {currentStep === 3 && qrLink && (
                                    <div className="p-4">
                                        <div className="mb-6 flex flex-col items-center">
                                            <div className="border-border bg-background mb-4 flex h-64 w-64 items-center justify-center rounded-lg border p-4">
                                                <QRCodeSVG
                                                    id="qr-canvas"
                                                    value={qrLink}
                                                    size={200}
                                                    level="H"
                                                    includeMargin={true}
                                                    fgColor="var(--foreground)"
                                                    bgColor="var(--background)"
                                                />
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => window.open(qrLink, "_blank")}
                                                className="border-primary text-primary hover:bg-primary/10 mb-4"
                                            >
                                                View QR Details
                                            </Button>
                                        </div>
                                        <div className="border-border bg-muted/50 rounded-lg border p-4">
                                            <h3 className="text-foreground mb-2 text-sm font-medium">
                                                Details Summary
                                            </h3>
                                            <pre className="text-muted-foreground overflow-auto text-xs">
                                                {JSON.stringify(getFilteredData(), null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="mt-8 flex justify-between">
                            {currentStep > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="border-border text-muted-foreground hover:bg-muted"
                                >
                                    Back
                                </Button>
                            )}
                            {currentStep < 3 ? (
                                <Button
                                    onClick={handleNext}
                                    className="bg-primary text-primary-foreground hover:bg-primary/90 ml-auto"
                                >
                                    Continue
                                </Button>
                            ) : (
                                <Button
                                    onClick={downloadQR}
                                    className="text-primary-foreground ml-auto bg-[var(--chart-2)] hover:bg-[var(--chart-2)]/90"
                                >
                                    Download QR Code
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
