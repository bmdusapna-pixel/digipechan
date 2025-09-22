"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Scanner, IDetectedBarcode } from "@yudiel/react-qr-scanner";
import { CameraOff, ScanEye, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function QRScannerPage() {
    const router = useRouter();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scannedData, setScannedData] = useState<string | null>(null);
    const [cameraActive, setCameraActive] = useState(true);
    const scanCountRef = useRef(0);

    useEffect(() => {
        const checkPermissions = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                stream.getTracks().forEach((track) => track.stop());
                setHasPermission(true);
            } catch (err) {
                console.error("Camera permission error:", err);
                setHasPermission(false);
                toast.error("Camera access denied", {
                    description: "Please enable camera permissions to scan QR codes",
                });
            }
        };

        checkPermissions();
    }, []);

    const handleScan = (detectedCodes: IDetectedBarcode[]) => {
        if (!detectedCodes || detectedCodes.length === 0) return;

        const result = detectedCodes[0]?.rawValue || detectedCodes[0]?.format || "";
        if (!result) return;

        scanCountRef.current++;
        if (scanCountRef.current === 1) {
            setScannedData(result);
            setCameraActive(false);

            try {
                new URL(result);
                toast.success("QR Code Scanned!", {
                    action: {
                        label: "Visit Link",
                        onClick: () => window.open(result, "_blank"),
                    },
                });
            } catch {
                toast.success("QR Code Scanned!", {
                    description: result,
                });
            }
        }
    };

    const handleError = (error: unknown) => {
        let message = "Unknown error";
        if (error instanceof Error) {
            message = error.message;
            console.error(error);
        } else {
            console.error(error);
        }
        toast.error("Scanner error", {
            description: message,
        });
    };

    const toggleCamera = () => {
        setCameraActive(!cameraActive);
        if (!cameraActive) {
            scanCountRef.current = 0;
            setScannedData(null);
        }
    };

    const resetScanner = () => {
        scanCountRef.current = 0;
        setScannedData(null);
        setCameraActive(true);
    };

    if (hasPermission === false) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-6 p-4 text-center">
                <div className="rounded-full bg-red-100 p-4">
                    <CameraOff className="h-12 w-12 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold">Camera Access Required</h1>
                <p className="text-muted-foreground max-w-md">
                    Please enable camera permissions in your browser settings to use the QR scanner.
                </p>
                <div className="flex gap-3">
                    <Button onClick={() => router.back()} variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Go Back
                    </Button>
                    <Button onClick={() => window.location.reload()}>
                        <ScanEye className="mr-2 h-4 w-4" />
                        Try Again
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full overflow-hidden">
            <div className="absolute top-0 right-0 left-0 z-10 flex items-center justify-between bg-black/50 p-4 text-white">
                <Button
                    onClick={() => router.back()}
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10"
                >
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-lg font-medium">QR Code Scanner</h1>
                <div className="w-10"></div>
            </div>

            {hasPermission && cameraActive && (
                <div className="h-full w-full">
                    <Scanner
                        formats={[
                            "qr_code",
                            "micro_qr_code",
                            "rm_qr_code",
                            "maxi_code",
                            "pdf417",
                            "aztec",
                            "data_matrix",
                            "matrix_codes",
                            "dx_film_edge",
                            "databar",
                            "databar_expanded",
                            "codabar",
                            "code_39",
                            "code_93",
                            "code_128",
                            "ean_8",
                            "ean_13",
                            "itf",
                            "linear_codes",
                            "upc_a",
                            "upc_e",
                        ]}
                        styles={{
                            container: {
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                position: "absolute",
                                top: 0,
                                left: 0,
                            },
                        }}
                        allowMultiple={true}
                        scanDelay={2000}
                        onScan={handleScan}
                        onError={handleError}
                        constraints={{
                            facingMode: "environment",
                        }}
                    />
                    <div className="absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center bg-black/20">
                        <div className="relative h-64 w-64">
                            <div className="absolute h-full w-full rounded-lg border-4 border-white/50">
                                <div className="absolute -top-1 -left-1 h-12 w-12 border-t-4 border-l-4 border-white"></div>
                                <div className="absolute -top-1 -right-1 h-12 w-12 border-t-4 border-r-4 border-white"></div>
                                <div className="absolute -bottom-1 -left-1 h-12 w-12 border-b-4 border-l-4 border-white"></div>
                                <div className="absolute -right-1 -bottom-1 h-12 w-12 border-r-4 border-b-4 border-white"></div>
                            </div>
                            <div className="animate-scan absolute top-1/2 right-0 left-0 h-1 rounded-full bg-white/80 shadow-lg"></div>
                        </div>
                        <p className="mt-8 text-white/80">Align QR code within the frame</p>
                    </div>
                </div>
            )}

            {scannedData && (
                <div className="flex h-full flex-col items-center justify-center gap-6 bg-white p-6 text-center">
                    <div className="rounded-full bg-green-100 p-4">
                        <ScanEye className="h-12 w-12 text-green-500" />
                    </div>
                    <h2 className="text-2xl font-bold">Scan Successful!</h2>

                    <div className="w-full max-w-md overflow-hidden rounded-lg border bg-gray-50 p-4">
                        <p className="truncate font-mono text-sm">{scannedData}</p>
                    </div>

                    <div className="flex w-full max-w-md gap-3">
                        <Button onClick={resetScanner} variant="outline" className="flex-1">
                            Scan Another
                        </Button>
                        {isValidUrl(scannedData) && (
                            <Button onClick={() => window.open(scannedData, "_blank")} className="flex-1 gap-2">
                                Open Link
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {hasPermission && !scannedData && (
                <div className="absolute right-0 bottom-8 left-0 flex justify-center">
                    <Button
                        onClick={toggleCamera}
                        variant="secondary"
                        size="lg"
                        className="rounded-full bg-white/90 px-6 shadow-lg backdrop-blur-sm hover:bg-white"
                    >
                        {cameraActive ? "Turn Off Camera" : "Turn On Camera"}
                    </Button>
                </div>
            )}
        </div>
    );
}

function isValidUrl(string: string) {
    try {
        new URL(string);
        return true;
    } catch {
        return false;
    }
}
