"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
import { Separator } from "@/components/ui/separator";
import {
  Phone,
  MessageSquare,
  Video,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { scanQR, QRScanResponse } from "@/lib/api/qr/scanQr";
import { QRTagQuestion } from "@/types/newQRType.types";
import { toast } from "sonner";

export default function QRScanPage() {
  const params = useParams();
  const qrId = params.qrId as string;
  const [selectedQuestion, setSelectedQuestion] =
    useState<QRTagQuestion | null>(null);
  const [showCommunicationOptions, setShowCommunicationOptions] =
    useState(false);

  const {
    data: qrData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["qr-scan", qrId],
    queryFn: () => scanQR(qrId),
    enabled: !!qrId,
  });

  const handleQuestionSelect = (question: QRTagQuestion) => {
    setSelectedQuestion(question);
    setShowCommunicationOptions(true);
    toast.success("Question selected! Choose how to contact the owner.");
  };

  const handleCommunication = (type: "call" | "message" | "video") => {
    if (!qrData?.qr?.createdFor) {
      toast.error("Owner information not available");
      return;
    }

    const owner = qrData.qr.createdFor;
    const ownerName = `${owner.firstName} ${owner.lastName}`;

    switch (type) {
      case "call":
        if (owner.mobileNumber) {
          window.open(`tel:${owner.mobileNumber}`, "_self");
        } else {
          toast.error("Phone number not available");
        }
        break;
      case "message":
        if (owner.mobileNumber) {
          window.open(`sms:${owner.mobileNumber}`, "_self");
        } else {
          toast.error("Phone number not available");
        }
        break;
      case "video":
        toast.info("Video calling feature coming soon!");
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QR information...</p>
        </div>
      </div>
    );
  }

  if (error || !qrData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle className="text-red-600">QR Code Not Found</CardTitle>
            <CardDescription>
              The QR code you scanned is invalid or has been removed.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const { qr } = qrData as QRScanResponse;
  const questions = qr.questions || qr.qrTypeId?.questions || [];
  const tagType = qr.qrTypeId?.tagType;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* QR Information Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-2xl">
              QR Code Scanned Successfully
            </CardTitle>
            <CardDescription>
              Serial Number:{" "}
              <span className="font-mono font-semibold">{qr.serialNumber}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">{qr.qrTypeId.qrName}</h3>
              {tagType && (
                <Badge variant="outline" className="text-sm">
                  {tagType.replace("_TAG", " Tag")}
                </Badge>
              )}
              <p>
                Name:{" "}
                <span className="font-mono font-semibold">
                  {qr.customerName}
                </span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Questions Section */}
        {questions.length > 0 && !showCommunicationOptions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">What's the issue?</CardTitle>
              <CardDescription>
                Please select the most appropriate option to help the owner
                understand the situation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questions.map((question) => (
                  <Button
                    key={question.id}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 text-left"
                    onClick={() => handleQuestionSelect(question)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium">{question.text}</span>
                      <Badge variant="secondary" className="mt-2 text-xs">
                        {question.category}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Communication Options */}
        {showCommunicationOptions && selectedQuestion && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Contact the Owner</CardTitle>
              <CardDescription>
                You selected:{" "}
                <span className="font-semibold">{selectedQuestion.text}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Choose how you'd like to contact the owner about this issue.
                  </p>
                </div>

                <div className="grid gap-3">
                  {qr.voiceCallsAllowed && (
                    <Button
                      onClick={() => handleCommunication("call")}
                      className="flex items-center gap-3 h-12"
                      variant="outline"
                    >
                      <Phone className="h-5 w-5" />
                      <span>Make a Phone Call</span>
                    </Button>
                  )}

                  {qr.textMessagesAllowed && (
                    <Button
                      onClick={() => handleCommunication("message")}
                      className="flex items-center gap-3 h-12"
                      variant="outline"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>Send a Text Message</span>
                    </Button>
                  )}

                  {qr.videoCallsAllowed && (
                    <Button
                      onClick={() => handleCommunication("video")}
                      className="flex items-center gap-3 h-12"
                      variant="outline"
                    >
                      <Video className="h-5 w-5" />
                      <span>Start Video Call</span>
                    </Button>
                  )}
                </div>

                <Separator />

                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowCommunicationOptions(false);
                    setSelectedQuestion(null);
                  }}
                  className="w-full"
                >
                  Back to Questions
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Owner Information */}
        {qr.createdFor && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Owner Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Name:</span>{" "}
                  {qr.createdFor.firstName} {qr.createdFor.lastName}
                </p>
                {qr.createdFor.mobileNumber && (
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {qr.createdFor.mobileNumber}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* No Questions Available */}
        {questions.length === 0 && !showCommunicationOptions && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Contact the Owner</CardTitle>
              <CardDescription>
                This QR code doesn't have specific questions configured. You can
                still contact the owner directly.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {qr.voiceCallsAllowed && (
                  <Button
                    onClick={() => handleCommunication("call")}
                    className="flex items-center gap-3 h-12"
                    variant="outline"
                  >
                    <Phone className="h-5 w-5" />
                    <span>Make a Phone Call</span>
                  </Button>
                )}

                {qr.textMessagesAllowed && (
                  <Button
                    onClick={() => handleCommunication("message")}
                    className="flex items-center gap-3 h-12"
                    variant="outline"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Send a Text Message</span>
                  </Button>
                )}

                {qr.videoCallsAllowed && (
                  <Button
                    onClick={() => handleCommunication("video")}
                    className="flex items-center gap-3 h-12"
                    variant="outline"
                  >
                    <Video className="h-5 w-5" />
                    <span>Start Video Call</span>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
