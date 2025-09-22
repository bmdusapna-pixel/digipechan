"use client";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import useAuthStore from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PaymentTicketList } from "@/components/layout/salesman/PaymentTicketList";
import { CreatePaymentTicketForm } from "@/components/layout/salesman/CreatePaymentTicketForm";
import { UserRoles } from "@/common/constants/enum";
import {
  getAssignedBundles,
  getSalesmanStats,
  getSoldQrs,
  getBundleQrs,
} from "@/types/salesman";
import { Package, TrendingUp, Users, Eye, Plus, Receipt, LoaderPinwheel } from "lucide-react";
import { SalesmanBundle } from "@/types/salesman";

export default function SalesmanDashboard() {
  const router = useRouter();
  const token = useAuthStore((s) => s.user?.accessToken);
  const isSales = useAuthStore((s) =>
    s.user?.roles?.includes?.(UserRoles.SALESPERSON)
  );

  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [availableQrs, setAvailableQrs] = useState<any[]>([]);

  useEffect(() => {
    // Wait until token is present to avoid false logout on hard refresh
    if (token && !isSales) window.location.href = "/auth/login";
  }, [token, isSales]);

  const headers = useMemo(
    () => ({ Authorization: `Bearer ${token ?? ""}` }),
    [token]
  );

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["salesman-stats"],
    queryFn: () => getSalesmanStats(headers),
    enabled: !!token,
  });

  const { data: bundlesRes, isLoading: bundlesLoading } = useQuery({
    queryKey: ["salesman-bundles"],
    queryFn: () => getAssignedBundles(headers),
    enabled: !!token,
  });

  console.log("BUNDLE DATAL",bundlesRes)

  const [soldStatus, setSoldStatus] = useState<string | undefined>(undefined);
  const { data: soldRes, isLoading: soldLoading, refetch: refetchSoldQrs } = useQuery({
    queryKey: ["sold-qrs", soldStatus],
    queryFn: () => getSoldQrs(soldStatus, headers),
    enabled: !!token,
  });

  const handleViewBundle = (bundleId: string) => {
    router.push(`/salesman/bundle/${bundleId}`);
  };

  const handleCreateTicket = async (bundleId: string) => {
    try {
      const qrs = await getBundleQrs(bundleId, headers);
      const availableQrs =
        qrs?.qrs?.filter((qr: any) => qr.qrStatus === "INACTIVE") || [];
      setAvailableQrs(availableQrs);
      setSelectedBundle(bundleId);
      setShowCreateTicket(true);
    } catch (error) {
      console.error("Error fetching bundle QRs:", error);
    }
  };

  const handleTicketCreated = async () => {
    setShowCreateTicket(false);
    setSelectedBundle(null);
    setAvailableQrs([]);
    
    // Refetch sold QRs to show updated data
    try {
      await refetchSoldQrs();
    } catch (error) {
      console.error("Failed to refetch sold QRs:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 mt-10">
            Sales Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your QR bundles and track sales
          </p>
        </div>

        {/* KPI Cards - Mobile Friendly */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Package className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Bundles Assigned
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading
                      ? "..."
                      : (stats?.inventory?.totalBundles ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Available QRs
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading
                      ? "..."
                      : (stats?.inventory?.availableQRs ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg border-0">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Sold QRs</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statsLoading ? "..." : (stats?.inventory?.soldQRs ?? 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="bundles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 md:text-sm ">
            <TabsTrigger value="bundles" className="text-xsfont-medium p-2">
              My Bundles
            </TabsTrigger>
            <TabsTrigger value="sold" className="text-xs font-medium">
              Sold QRs
            </TabsTrigger>
            <TabsTrigger value="tickets" className="text-xs font-medium">
              Payment Tickets
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bundles" className="space-y-4">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Package className="h-5 w-5 text-blue-600" />
                  Assigned Bundles
                </CardTitle>
              </CardHeader>
              <CardContent>
                {bundlesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoaderPinwheel className="animate-spin text-blue-500 "/>
                    <p className="mt-2 text-gray-600">Loading bundles...</p>
                  </div>
                ) : (bundlesRes?.data ?? bundlesRes)?.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No bundles assigned yet</p>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {(bundlesRes?.data ?? bundlesRes)?.map((bundle: any) => (
                      <div
                        key={bundle.bundleId}
                        className="bg-gray-50 rounded-lg p-4 border hover:shadow-md transition-shadow"
                      >
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-gray-900 truncate">
                              {bundle.bundleId}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {(bundle.qrTypeId as any)?.qrName ??
                                "Unknown Type"}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">
                              {bundle.qrCount} QRs
                            </span>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleViewBundle(bundle.bundleId)
                                }
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-4 w-4" />
                                View
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sold" className="space-y-4">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Sold QRs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filter Buttons */}
                {/* <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={soldStatus === undefined ? "default" : "outline"}
                    onClick={() => setSoldStatus(undefined)}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant={soldStatus === "ACTIVE" ? "default" : "outline"}
                    onClick={() => setSoldStatus("ACTIVE")}
                  >
                    Active
                  </Button>
                  <Button
                    size="sm"
                    variant={soldStatus === "INACTIVE" ? "default" : "outline"}
                    onClick={() => setSoldStatus("INACTIVE")}
                  >
                    Inactive
                  </Button>
                </div> */}

                {/* Sold QRs Grid */}
                {soldLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading sold QRs...</p>
                  </div>
                ) : (soldRes?.qrs ?? soldRes?.data?.qrs ?? []).length === 0 ? (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No sold QRs found</p>
                  </div>
                ) : (
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {(soldRes?.qrs ?? soldRes?.data?.qrs ?? []).map(
                      (qr: any) => (
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
                              <div
                                className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  qr.qrStatus === "ACTIVE"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {qr.qrStatus}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-4">
            <Card className="bg-white shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  {/* <CardTitle className="flex items-center gap-2 text-xl"> */}
                    {/* <Receipt className="h-5 w-5 text-purple-600" />
                    Payment Tickets
                  </CardTitle> */}
                  {/* <Button
                    onClick={() => setShowCreateTicket(true)}
                    disabled={
                      !bundlesRes ||
                      (bundlesRes?.data ?? bundlesRes)?.length === 0
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Ticket
                  </Button> */}
                </div>
              </CardHeader>
              <CardContent>
                <PaymentTicketList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Payment Ticket Dialog */}
      <Dialog open={showCreateTicket} onOpenChange={setShowCreateTicket}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Payment Ticket</DialogTitle>
            <DialogDescription>
              Create a payment ticket for offline sales
            </DialogDescription>
          </DialogHeader>

          {selectedBundle && availableQrs.length > 0 ? (
            <CreatePaymentTicketForm
              availableQrs={availableQrs}
              bundleId={selectedBundle}
              bundlePricePerQr={bundlesRes?.find((b: SalesmanBundle) => b.bundleId === selectedBundle)?.pricePerQr}
              onSuccess={handleTicketCreated}
            />
          ) : (
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No QRs Available
              </h3>
              <p className="text-gray-500">
                All QRs in this bundle have been sold or are not available for
                offline sales.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
