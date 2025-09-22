"use client";

import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  XCircle,
  QrCode,
  ScanLine,
  MessageSquareText,
  PhoneCall,
  Video,
  AlertCircle,
  Ghost,
  MessageCircle,
  ShieldOff,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { QRStatus } from "@/common/constants/enum";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { qrDetails } from "@/lib/api/qr/qrDetails";
import { toast } from "sonner";
import { useState } from "react";
import Image from "next/image";
export default function QRDisplayPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [callLoading, setCallLoading] = useState(false);
  const { qrId } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["qr-details", qrId],
    queryFn: () => qrDetails(qrId as string),
    retry: false,
  });
  const router = useRouter();

  // Utility function to extract last 10 digits from mobileNo string
  function extractMobileNumber(mobileNo: string | undefined) {
    if (!mobileNo) return "";
    const digitsOnly = mobileNo.replace(/\D/g, "");
    return digitsOnly.slice(-10);
  }

  // Extract vehicle owner mobile number safely
  const mobileNo = extractMobileNumber(data?.visibleData?.mobileNumber);

  async function handleCallConfirm(callerNo: string) {
    setCallLoading(true);
    // owner number: mobileNo from before
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/call-connect`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            callerNo: callerNo, // your new input
            mobileNo: mobileNo, // the owner number from QR
          }),
        }
      );
      const result = await response.json();
      if (response.ok && result.success) {
        toast.success("Call initiated successfully!");
        setModalOpen(false);
      } else {
        toast.error(
          `Call failed: ${result.message || "Unknown error, please try again."}`
        );
      }
    } catch (_error) {
      alert("Call failed due to network/server error.");
    } finally {
      setCallLoading(false);
    }
  }

  const handleMessage = () => {
    router.push("/message");
  };

  const _vehicalNo = data?.visibleData?.vehicleNumber;
  // useEffect(() => {
  //   if (!vehicalNo) return;
  //   async function fetchRtoData() {
  //     try {
  //       const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/rtoapi`, {
  //         method: 'POST',
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({ vehicalNo:vehicalNo}),
  //       });
  //       if (!response.ok) throw new Error('Network response was not ok');
  //       const result = await response.json();
  //     } catch (error) {
  //       console.error("Fetch failed", error);
  //     }
  //   }
  //   fetchRtoData();
  // }, [vehicalNo]);

  const result = {
    code: 200,
    status: "success",
    message: "Success",
    request_id: "88687e6a0959142",
    response: {
      request_id: "88687e6a0959142",
      license_plate: "CG15AC5243",
      owner_name: "MOIN RAZA",
      is_financed: null,
      insurance_company: "Magma HDI General Insurance Co. Ltd.",
      insurance_policy: null,
      insurance_expiry: "2025-09-19",
      class: "Goods Carrier",
      category: "HGV",
      registration_date: "2017-03-24",
      pucc_upto: "2025-09-20",
      fuel_type: "DIESEL",
      brand_name: "TATA MOTORS LTD",
      brand_model: "LPT 3718 BSIII",
      body_type: null,
      norms: "BHARAT STAGE II",
      tax_upto: "2025-08-31",
      tax_paid_upto: "2025-08-31",
      fit_up_to: "2026-02-03",
      permit_number: "CG2025-NP-2163A",
      permit_valid_upto: "2030-02-23",
      national_permit_number: null,
      national_permit_upto: null,
      rc_status: "ACTIVE",
      blacklist_status: null,
      rto_code: "CG15",
      rto: "AMBIKAPUR",
      state: "CHHATTISGARH",
    },
  };

  //TODO: Replace with actual data from backend

  const rtoDetails = result.response;
  // console.log(rtoDetails)
  if (isLoading) return <LoadingSkeleton />;
  if (isError || !data) return <NotFoundView />;

  const { visibleData: qrInfo, qrStatus } = data;
  const avatarUrl = (data as { createdByAvatar?: { avatar?: string } })
    .createdByAvatar?.avatar;
  const isActive = qrStatus === QRStatus.ACTIVE;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
      <div className="mx-auto max-w-md mt-10">
        <Card className="shadow-xl">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-xl">
                <QrCode className="text-primary h-6 w-6" />
                <span className="from-primary bg-gradient-to-r to-purple-600 bg-clip-text text-transparent">
                  QR Details
                </span>
              </CardTitle>
              <Badge
                variant={isActive ? "default" : "destructive"}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm shadow-sm"
              >
                {isActive ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                {qrStatus}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="divide-y divide-gray-100">
            {!isActive && <InactiveQR />}

            <Card className="my-6 mx-auto max-w-xs shadow-lg rounded-xl bg-white/90 backdrop-blur">
              <p className="ml-5 mb-1 text-sm bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent  text-center">
                Welcome to the vehicle details section.&nbsp; <br />
                Here you can find the responsible owner's information.
              </p>
              <div className="flex items-center ml-5 mt-2.5 gap-3">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-300 relative">
                  <Image
                    src={avatarUrl || "/logo.jpg"}
                    alt="Profile"
                    fill
                    sizes="64px"
                    className="object-cover object-center"
                  />
                </div>
                <h3 className="text-small font-extrabold tracking-wide uppercase from-primary bg-gradient-to-r to-purple-600 bg-clip-text text-transparent">
                  Responsible Vehicle Owner
                </h3>
              </div>

              <CardContent className="flex flex-col items-center py-6 gap-3">
                {/* Plate Number Template */}
                <div
                  className="w-full flex items-stretch border border-gray-300 bg-white rounded-lg overflow-hidden shadow-sm"
                  style={{ height: "70px" }}
                >
                  <div className="h-full flex items-center bg-white border-r border-gray-200 p-2">
                    <Image
                      src="/why-choose-us/india.png"
                      alt="Indian Number Plate"
                      width={70}
                      height={70}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                  <div className="flex-1 flex items-center justify-center h-full">
                    <span className="font-bold text-xl tracking-widest text-gray-800">
                      {rtoDetails.license_plate}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
            {
              <Section
                title="Contact Options"
                icon={<MessageCircle className="h-5 w-5 text-cyan-500 ml-5" />}
              >
                <div className="mx-auto w-full max-w-md">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <Button
                      aria-label="Send text message"
                      onClick={handleMessage}
                      className="w-full justify-center bg-blue-100 hover:bg-blue-200 focus-visible:ring-2 focus-visible:ring-blue-300"
                      variant="secondary"
                    >
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-2 bg-blue-100 px-3 py-2 text-blue-700"
                      >
                        <MessageSquareText className="h-5 w-5" />
                        <span className="font-medium">Text</span>
                      </Badge>
                    </Button>

                    <Button
                      aria-label="Start masked voice call"
                      onClick={() => setModalOpen(true)}
                      className="w-full justify-center bg-green-100 hover:bg-green-200 focus-visible:ring-2 focus-visible:ring-green-300"
                      variant="secondary"
                    >
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-2 bg-green-100 px-3 py-2 text-green-700"
                      >
                        <PhoneCall className="h-5 w-5" />
                        <span className="font-medium">Voice</span>
                      </Badge>
                    </Button>

                    <Button
                      aria-label="Start video call"
                      disabled
                      className="w-full justify-center bg-purple-100 text-purple-600 hover:bg-purple-200 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-purple-300"
                      variant="secondary"
                    >
                      <Badge
                        variant="secondary"
                        className="flex items-center gap-2 bg-purple-100 px-3 py-2 text-purple-700"
                      >
                        <Video className="h-5 w-5" />
                        <span className="font-medium">Video</span>
                      </Badge>
                    </Button>
                  </div>
                </div>
              </Section>
            }
          </CardContent>
        </Card>
        <CallInitiateModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={handleCallConfirm}
          loading={callLoading}
        />
      </div>
    </div>
  );
}
function InactiveQR() {
  return (
    <div className="from-destructive/5 to-destructive/10 border-destructive/20 mb-4 flex flex-col items-center gap-3 rounded-lg border bg-gradient-to-r p-4 text-center">
      <div className="relative">
        <ShieldOff className="text-destructive h-10 w-10" />
        <div className="bg-destructive absolute -top-1 -right-1 flex h-4 w-4 animate-pulse items-center justify-center rounded-full">
          <XCircle className="h-2 w-2 text-white" />
        </div>
      </div>
      <div>
        <h3 className="text-destructive text-lg font-bold">Inactive QR</h3>
        <p className="text-destructive/80 text-sm">
          Scan successful but QR is deactivated
        </p>
      </div>
    </div>
  );
}
function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-md animate-pulse space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <Skeleton className="h-7 w-48 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-4 w-full rounded-full" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function NotFoundView() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6 text-center">
      <div className="relative mb-6">
        <Ghost className="text-muted-foreground h-28 w-28 opacity-80" />
        <AlertCircle className="text-destructive absolute -top-2 -right-2 h-12 w-12 animate-pulse" />
      </div>
      <h1 className="mb-3 text-3xl font-bold text-gray-800">QR Not Found</h1>
      <p className="mb-8 max-w-md text-lg text-gray-600">
        The QR code you scanned doesn&apos;t exist in our system
      </p>
      <div className="flex gap-3">
        <Button
          onClick={() => window.location.reload()}
          size="lg"
          className="from-primary gap-2 bg-gradient-to-r to-blue-600 shadow-lg"
        >
          <ScanLine className="h-5 w-5" />
          Try Again
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={() => window.history.back()}
          className="border-gray-300"
        >
          Go Back
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="py-4">
      <div className="mb-3 flex items-center gap-2">
        {icon}
        <h3 className="text-sm font-semibold tracking-wider text-gray-500 uppercase">
          {title}
        </h3>
      </div>
      <div className="pl-7">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  icon,
  fullWidth = false,
  truncate = false,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  truncate?: boolean;
}) {
  return (
    <div className={`mb-3 last:mb-0 ${fullWidth ? "col-span-2" : ""}`}>
      <p className="mb-1 text-xs font-medium text-gray-400">{label}</p>
      <div className="flex items-center gap-2">
        {icon && <span>{icon}</span>}
        <p className={`text-gray-800 ${truncate ? "truncate" : ""}`}>{value}</p>
      </div>
    </div>
  );
}

function CallInitiateModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (callerNo: string) => void;
  loading: boolean;
}) {
  const [callerNo, setCallerNo] = useState("");
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      style={{ background: open ? "rgba(80,0,180,0.10)" : "transparent" }}
      aria-hidden={!open}
    >
      <div
        className={`
          w-full max-w-sm mx-4 sm:mx-0
          border border-gray-200 shadow-2xl rounded-xl transition-all
          bg-gradient-to-b from-white via-blue-50 to-purple-50
          p-6 ${open ? "" : "scale-95 opacity-0"}
        `}
      >
        <h2
          className="font-extrabold text-lg mb-5
            bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent text-center"
        >
          Enter your phone number to call Vehicle Owner
        </h2>
        <input
          type="tel"
          className="border-2 border-primary/40 rounded px-3 py-2 w-[90%] max-w-xs mb-7 outline-primary
          text-center
          focus:ring-2 focus:ring-primary focus:border-purple-500
          bg-blue-50 placeholder-gray-500 text-gray-900 transition
          mx-auto block"
          value={callerNo}
          placeholder="Enter your 10-digit number"
          maxLength={10}
          onChange={(e) => setCallerNo(e.target.value.replace(/\D/g, ""))}
        />
        <div className="flex gap-3 justify-center">
          <button
            className="px-4 py-1 rounded border border-gray-300 text-gray-700
            hover:bg-gray-100"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-1 rounded bg-gradient-to-t from-green-500 to-green-400 text-white font-semibold shadow
            hover:from-green-600 hover:to-green-500
            disabled:opacity-60 disabled:cursor-not-allowed`}
            onClick={() => onConfirm(callerNo)}
            disabled={callerNo.length !== 10 || loading}
          >
            {loading ? "Calling..." : "Call"}
          </button>
        </div>
      </div>
    </div>
  );
}
