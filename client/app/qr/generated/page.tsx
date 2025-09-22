"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchGeneratedQrs } from "@/common/constants/fetchGeneratedQrs";
import useAuthStore from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { QrCode, AlertCircle } from "lucide-react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function GeneratedQRs() {
  const userId = useAuthStore((state) => state.user?.id?.toString());
  const createdFor = userId; // Assuming self-generated; adjust if needed for createdFor others

  const { data, isLoading, isError } = useQuery({
    queryKey: ["generated-qrs", createdFor],
    queryFn: () => fetchGeneratedQrs(createdFor!),
    enabled: !!userId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Generated QRs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="container mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Generated QRs</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <p className="text-red-500">Failed to load generated QRs. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>My Generated QRs</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <QrCode className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p>No generated QRs found. Start by purchasing some in the shop!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>My Generated QRs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.map((qr) => (
              <Card key={qr.serialNumber} className="p-4 flex items-center gap-4">
                <div className="w-24 h-24 relative">
                  <Image
                    src={qr.qrUrl || "/landscape-placeholder.webp"}
                    alt={qr.serialNumber}
                    fill
                    className="object-cover rounded-md"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{qr.serialNumber}</h3>
                  <p className="text-sm text-gray-500">Type ID: {qr.qrTypeId}</p>
                  <p className="text-sm text-gray-500">Status: {qr.qrStatus}</p>
                  <Badge variant="secondary" className="mt-2">
                    <a href={qr.qrUrl} target="_blank" rel="noopener noreferrer">
                      View QR
                    </a>
                  </Badge>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}