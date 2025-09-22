"use client";
import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { apiRequest } from "@/common/utils/apiClient";
import { fetchQROnDeliveryTypeAPI } from "@/lib/api/qr/fetchQROnDeliveryTypeAPI";
import { DeliveryType } from "@/common/constants/enum";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Download,
  ExternalLink,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import useAuthStore from "@/store/authStore";
import { useRouter } from "next/navigation";
import { SalespersonTable } from "./SalespersonTable";
import {
  getAllPaymentTickets,
  updatePaymentTicketStatus,
} from "@/lib/api/paymentTicket";
import { IPaymentTicket } from "@/types/paymentTicket.types";
import { CheckCircle, XCircle, Clock, Eye, FileText, RefreshCw } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import TagTypeQuestionSelector from "./TagTypeQuestionSelector";
import { QRTagType, QRTagQuestion } from "@/types/newQRType.types";

export default function BulkGenerationForm() {
  const router = useRouter();
  const [qrTypeId, setQrTypeId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [selectedBundle, setSelectedBundle] = useState("");
  const [salespersonId, setSalespersonId] = useState("");
  const [deliveryType, setDeliveryType] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [downloadingBundle, setDownloadingBundle] = useState<string | null>(
    null
  );
  const [salespersonComboboxOpen, setSalespersonComboboxOpen] = useState(false);
  const [newSalesperson, setNewSalesperson] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    territory: "",
    altMobileNumber: "",
  });

  // Payment ticket management state
  const [selectedTicket, setSelectedTicket] = useState<IPaymentTicket | null>(
    null
  );
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  const [isApprovingTicket, setIsApprovingTicket] = useState(false);
  const [isRejectingTicket, setIsRejectingTicket] = useState(false);

  // Tag type and questions state
  const [selectedTagType, setSelectedTagType] = useState<QRTagType | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<QRTagQuestion[]>([]);

  const { data: qrTypes, isLoading: isLoadingTypes, refetch: refetchQrTypes, isFetching: isFetchingQrTypes } = useQuery({
    queryKey: ["qrTypes"],
    queryFn: () =>
      fetchQROnDeliveryTypeAPI({ deliveryType: DeliveryType.ETAG }),
    enabled: true,
  });

  const {
    data: bundles,
    isLoading: isLoadingBundles,
    refetch: refetchBundles,
  } = useQuery({
    queryKey: ["bundles"],
    queryFn: () => apiRequest("GET", API_ENDPOINTS.bundles),
  });

  const {
    data: salesmen,
    isLoading: isLoadingSalesmen,
    refetch: refetchSalesmen,
  } = useQuery({
    queryKey: ["salesmen"],
    queryFn: () => apiRequest("GET", API_ENDPOINTS.salesmen),
  });

  const {
    data: salespersonManagement,
    isLoading: isLoadingSalespersonManagement,
    refetch: refetchSalespersonManagement,
    isFetching: isFetchingSalespersonManagement,
  } = useQuery({
    queryKey: ["salespersonManagement"],
    queryFn: () => apiRequest("GET", API_ENDPOINTS.salespersonManagement),
  });

  // Payment tickets query
  const {
    data: paymentTickets,
    isLoading: isLoadingPaymentTickets,
    refetch: refetchPaymentTickets,
    isFetching: isFetchingPaymentTickets,
  } = useQuery({
    queryKey: ["paymentTickets"],
    queryFn: () => getAllPaymentTickets(),
  });

  console.log(paymentTickets);

  const createSalespersonMutation = useMutation({
    mutationFn: (body: {
      firstName: string;
      lastName: string;
      email: string;
      phoneNumber: string;
      password: string;
      territory?: string;
      altMobileNumber?: string;
    }) => apiRequest("POST", API_ENDPOINTS.createSalesperson, body),
    onSuccess: (_data) => {
      toast.success("Salesperson created successfully");
      setIsCreateDialogOpen(false);
      setNewSalesperson({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        territory: "",
        altMobileNumber: "",
      });
      refetchSalesmen();
    },
    onError: (_error) => toast.error("Failed to create salesperson"),
  });

  const generateMutation = useMutation({
    mutationFn: (body: { 
      quantity: number; 
      price: number; 
      qrTypeId: string;
      tagType?: QRTagType;
      questions?: QRTagQuestion[];
    }) =>
      apiRequest("POST", API_ENDPOINTS.bulkGenerate, body),
    onSuccess: (_data) => {
      toast.success(`Successfully generated bundle with ${quantity} QR codes`);
      setQuantity("");
      setPrice("");
      setSelectedTagType(null);
      setSelectedQuestions([]);
      refetchBundles();
    },
    onError: (_error) => toast.error("Failed to generate QRs"),
  });

  const assignMutation = useMutation({
    mutationFn: (body: {
      bundleId: string;
      salespersonId: string;
      deliveryType: string;
    }) => apiRequest("PUT", API_ENDPOINTS.assignBundle, body),
    onSuccess: (_data) => {
      toast.success("Bundle assigned successfully");
      setSelectedBundle("");
      setSalespersonId("");
      setDeliveryType("");
      refetchBundles();
    },
    onError: (_error) => toast.error("Failed to assign bundle"),
  });

  // Payment ticket update mutation
  const updateTicketMutation = useMutation({
    mutationFn: ({
      ticketId,
      status,
      adminNotes,
    }: {
      ticketId: string;
      status: "APPROVED" | "REJECTED";
      adminNotes?: string;
    }) => updatePaymentTicketStatus(ticketId, { status, adminNotes }),
    onSuccess: (_data) => {
      toast.success("Payment ticket status updated successfully");
      setIsTicketDialogOpen(false);
      setSelectedTicket(null);
      setAdminNotes("");
      refetchPaymentTickets();
    },
    onError: (_error) => toast.error("Failed to update payment ticket status"),
    onSettled: () => {
      setIsApprovingTicket(false);
      setIsRejectingTicket(false);
    }
  });

  const handleGenerate = () => {
    if (!qrTypeId || !quantity || !price)
      return toast.error("All fields required");
    const num = parseInt(quantity);
    const unitPrice = parseFloat(price);
    if (isNaN(num) || num <= 0 || num > 100)
      return toast.error("Quantity must be 1-100");
    if (isNaN(unitPrice) || unitPrice <= 0)
      return toast.error("Price must be greater than 0");
    generateMutation.mutate({
      quantity: num,
      price: unitPrice,
      qrTypeId,
      tagType: selectedTagType || undefined,
      questions: selectedQuestions.length > 0 ? selectedQuestions : undefined,
    });
  };

  const handleAssign = () => {
    if (!selectedBundle || !salespersonId || !deliveryType)
      return toast.error("All fields required for assignment");
    assignMutation.mutate({
      bundleId: selectedBundle,
      salespersonId,
      deliveryType,
    });
  };

  const handleCreateSalesperson = () => {
    if (
      !newSalesperson.firstName ||
      !newSalesperson.lastName ||
      !newSalesperson.email ||
      !newSalesperson.phoneNumber ||
      !newSalesperson.password
    ) {
      return toast.error("All required fields must be filled");
    }

    createSalespersonMutation.mutate(newSalesperson);
  };

  const handleSalespersonInputChange = (field: string, value: string) => {
    setNewSalesperson((prev) => ({ ...prev, [field]: value }));
  };

  const handleDownloadBundle = async (bundleId: string) => {
    try {
      setDownloadingBundle(bundleId);

      // Get the auth token
      const state = useAuthStore.getState();
      const accessToken = state.user?.accessToken;

      if (!accessToken) {
        toast.error("Authentication required");
        return;
      }

      // Make the download request
      const response = await fetch(API_ENDPOINTS.downloadBundleQRs(bundleId), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = `bundle_${bundleId}_qrs.pdf`;

      // Trigger the download
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success(`Bundle ${bundleId} QRs PDF downloaded successfully!`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download bundle QRs PDF");
    } finally {
      setDownloadingBundle(null);
    }
  };

  // Payment ticket handlers
  const handleViewTicket = (ticket: IPaymentTicket) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
  };

  const handleApproveTicket = () => {
    if (!selectedTicket) return;
    setIsApprovingTicket(true);
    updateTicketMutation.mutate({
      ticketId: selectedTicket.ticketId,
      status: "APPROVED",
      adminNotes: adminNotes || undefined,
    });
  };

  const handleRejectTicket = () => {
    if (!selectedTicket) return;
    setIsRejectingTicket(true);
    updateTicketMutation.mutate({
      ticketId: selectedTicket.ticketId,
      status: "REJECTED",
      adminNotes: adminNotes || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 bg-gray-50 border p-3 rounded-md shadow">
      <Tabs defaultValue="generate" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList className="p-3 border ">
          <TabsTrigger value="generate" className="p-3">
            Generate QRs
          </TabsTrigger>
          <TabsTrigger value="manage" className="p-3">
            Manage Bulk QRs
          </TabsTrigger>
          <TabsTrigger value="salespeople" className="p-3">
            Manage Salespeople
          </TabsTrigger>
          <TabsTrigger value="payment-tickets" className="p-3">
            Payment Tickets
          </TabsTrigger>
          </TabsList>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchQrTypes();
              refetchBundles();
              refetchSalesmen();
              refetchSalespersonManagement();
              refetchPaymentTickets();
            }}
            className="flex items-center gap-2"
            disabled={
              isFetchingQrTypes ||
              isLoadingTypes ||
              isLoadingBundles ||
              isLoadingSalesmen ||
              isLoadingSalespersonManagement ||
              isFetchingPaymentTickets
            }
          >
            <RefreshCw className={`h-4 w-4 ${(
              isFetchingQrTypes ||
              isLoadingBundles ||
              isLoadingSalesmen ||
              isLoadingSalespersonManagement ||
              isFetchingPaymentTickets
            ) ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
        </div>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Bulk QR Codes</CardTitle>
              <CardDescription>
                Create multiple QR codes for later assignment to salespersons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 ">
              <div className="flex gap-5 items-center">
                <div>
                  <Label htmlFor="qrType">QR Type</Label>
                  <Select
                    value={qrTypeId}
                    onValueChange={setQrTypeId}
                    disabled={isLoadingTypes}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select QR type" />
                    </SelectTrigger>
                    <SelectContent>
                      {qrTypes?.map((type) => (
                        <SelectItem key={type._id} value={type._id}>
                          {type.qrName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-5 shadow p-3 border-2 rounded-md">
                  <p className="text-sm text-gray-500">
                    Qr type not found?{" "}
                    <span
                      className="text-blue-500 cursor-pointer flex items-center"
                      onClick={() => router.push("/qr/type_create")}
                    >
                      Create new one
                    </span>
                  </p>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center"
                    onClick={() => router.push("/qr/type_create")}
                  >
                    Create New QrType
                    <ExternalLink size={10} className="ml-1" />
                  </Button>
                </div>
              </div>

              <div>
                <Label htmlFor="quantity">Quantity (1-100)</Label>
                <Input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="Enter number of QRs"
                  min="1"
                  max="100"
                />
              </div>

              <div>
                <Label htmlFor="price">Price per QR (₹)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Enter price per QR"
                  min="0"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generateMutation.isPending}
                className="flex items-center"
              >
                {generateMutation.isPending
                  ? "Generating..."
                  : "Generate Bulk QRs"}
              </Button>
            </CardContent>
          </Card>

          {/* Tag Type and Questions Configuration */}
          <TagTypeQuestionSelector
            selectedTagType={selectedTagType}
            selectedQuestions={selectedQuestions}
            onTagTypeChange={setSelectedTagType}
            onQuestionsChange={setSelectedQuestions}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>QR Bundles</CardTitle>
                  <CardDescription>
                    Assign unassigned bundles to salespersons
                  </CardDescription>
                </div>
                <Dialog
                  open={isCreateDialogOpen}
                  onOpenChange={setIsCreateDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Salesperson
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>Create New Salesperson</DialogTitle>
                      <DialogDescription>
                        Add a new salesperson to assign bundles to.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={newSalesperson.firstName}
                            onChange={(e) =>
                              handleSalespersonInputChange(
                                "firstName",
                                e.target.value
                              )
                            }
                            placeholder="Enter first name"
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={newSalesperson.lastName}
                            onChange={(e) =>
                              handleSalespersonInputChange(
                                "lastName",
                                e.target.value
                              )
                            }
                            placeholder="Enter last name"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newSalesperson.email}
                          onChange={(e) =>
                            handleSalespersonInputChange(
                              "email",
                              e.target.value
                            )
                          }
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phoneNumber">Phone Number *</Label>
                          <Input
                            id="phoneNumber"
                            value={newSalesperson.phoneNumber}
                            onChange={(e) =>
                              handleSalespersonInputChange(
                                "phoneNumber",
                                e.target.value
                              )
                            }
                            placeholder="+91 9876543210"
                          />
                        </div>
                        <div>
                          <Label htmlFor="altMobileNumber">Alt Phone</Label>
                          <Input
                            id="altMobileNumber"
                            value={newSalesperson.altMobileNumber}
                            onChange={(e) =>
                              handleSalespersonInputChange(
                                "altMobileNumber",
                                e.target.value
                              )
                            }
                            placeholder="+91 9876543211"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="territory">District</Label>
                        <Input
                          id="territory"
                          value={newSalesperson.territory}
                          onChange={(e) =>
                            handleSalespersonInputChange(
                              "territory",
                              e.target.value
                            )
                          }
                          placeholder="e.g., Pune, Nashik , Konkan etc"
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Password *</Label>
                        <Input
                          id="password"
                          minLength={4}
                          type="password"
                          value={newSalesperson.password}
                          onChange={(e) =>
                            handleSalespersonInputChange(
                              "password",
                              e.target.value
                            )
                          }
                          placeholder="Enter password"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateSalesperson}
                        disabled={createSalespersonMutation.isPending}
                      >
                        {createSalespersonMutation.isPending
                          ? "Creating..."
                          : "Create Salesperson"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBundles ? (
                <div>Loading...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bundle ID</TableHead>
                      <TableHead>QR Type</TableHead>
                      <TableHead>QR Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                      <TableHead>Download PDF</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Array.isArray(bundles) &&
                      bundles.map(
                        (bundle: {
                          _id: string;
                          bundleId: string;
                          qrTypeId: { qrName: string };
                          qrCount: number;
                          status: string;
                          createdBy: { firstName: string; lastName: string };
                          createdAt: string;
                        }) => (
                          <TableRow key={bundle._id}>
                            <TableCell className="font-mono text-sm">
                              {bundle.bundleId}
                            </TableCell>
                            <TableCell>{bundle.qrTypeId?.qrName}</TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {bundle.qrCount} QRs
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{bundle.status}</Badge>
                            </TableCell>
                            <TableCell>
                              {bundle.createdBy?.firstName}{" "}
                              {bundle.createdBy?.lastName}
                            </TableCell>
                            <TableCell>
                              {new Date(bundle.createdAt).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    setSelectedBundle(bundle.bundleId)
                                  }
                                  variant={
                                    selectedBundle === bundle.bundleId
                                      ? "default"
                                      : "outline"
                                  }
                                >
                                  {selectedBundle === bundle.bundleId
                                    ? "Selected"
                                    : "Select"}
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  handleDownloadBundle(bundle.bundleId)
                                }
                                disabled={downloadingBundle === bundle.bundleId}
                              >
                                <Download className="h-4 w-4" />
                                {downloadingBundle === bundle.bundleId
                                  ? "..."
                                  : ""}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      )}
                  </TableBody>
                </Table>
              )}

              {selectedBundle && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <h3 className="text-lg font-semibold">
                    Assign Selected Bundle
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label>Select Salesperson</Label>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-2"
                          onClick={() => setIsCreateDialogOpen(true)}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add New
                        </Button>
                      </div>

                      <Popover
                        open={salespersonComboboxOpen}
                        onOpenChange={setSalespersonComboboxOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={salespersonComboboxOpen}
                            className="w-full justify-between"
                            disabled={isLoadingSalesmen}
                          >
                            {(() => {
                              const selected = Array.isArray(salesmen)
                                ? salesmen.find(
                                    (s: any) => s._id === salespersonId
                                  )
                                : null;
                              return selected
                                ? `${selected.firstName} ${selected.lastName} · ${selected.email}`
                                : "Select salesperson";
                            })()}
                            <ChevronsUpDown className="opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[420px] p-0">
                          <Command>
                            <CommandInput
                              placeholder="Search salesperson..."
                              className="h-9"
                            />
                            <CommandList>
                              <CommandEmpty>No salesperson found.</CommandEmpty>
                              <CommandGroup>
                                {Array.isArray(salesmen) &&
                                  salesmen.map((salesman: any) => (
                                    <CommandItem
                                      key={salesman._id}
                                      value={`${salesman.firstName} ${salesman.lastName} ${salesman.email} ${salesman.territory ?? ""}`}
                                      onSelect={() => {
                                        setSalespersonId(salesman._id);
                                        setSalespersonComboboxOpen(false);
                                      }}
                                    >
                                      <div className="flex flex-col">
                                        <span className="font-medium ">
                                          {salesman.firstName}{" "}
                                          {salesman.lastName}
                                        </span>
                                        <span className="text-sm ">
                                          {salesman.phoneNumber}
                                        </span>
                                        {/* {salesman.territory && (
                                          <span className="text-xs ">{salesman.territory}</span>
                                        )} */}
                                      </div>
                                      {salespersonId === salesman._id && (
                                        <Check className="ml-auto" />
                                      )}
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label>Delivery Type</Label>
                      <Select
                        value={deliveryType}
                        onValueChange={setDeliveryType}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select delivery type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ETAG">ETAG</SelectItem>
                          <SelectItem value="PHYSICAL_SHIP">
                            PHYSICAL_SHIP
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={handleAssign}
                    disabled={assignMutation.isPending}
                  >
                    {assignMutation.isPending
                      ? "Assigning..."
                      : "Assign Bundle"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="salespeople" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Salesperson Management</CardTitle>
              <CardDescription>
                Monitor salesperson performance and customer assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalespersonTable
                salespersonData={
                  Array.isArray(salespersonManagement)
                    ? salespersonManagement
                    : []
                }
                isLoading={isLoadingSalespersonManagement}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment-tickets" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Ticket Management</CardTitle>
                  <CardDescription>
                    Review and approve/reject offline payment tickets from
                    salespeople
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetchPaymentTickets()}
                  disabled={isFetchingPaymentTickets}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isFetchingPaymentTickets ? 'animate-spin' : ''}`} />
                  {isFetchingPaymentTickets ? 'Refreshing' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingPaymentTickets ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">
                    Loading payment tickets...
                  </p>
                </div>
              ) : paymentTickets && paymentTickets.length > 0 ? (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Salesperson</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Bundle</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>QRs</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paymentTickets.map((ticket: any) => (
                        <TableRow key={ticket._id}>
                          <TableCell className="font-mono text-sm">
                            {ticket.ticketId}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {ticket.salespersonId?.firstName}{" "}
                                {ticket.salespersonId?.lastName}
                              </span>
                              <span className="text-sm text-gray-500">
                                {ticket.salespersonId?.email}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {ticket.customerName}
                              </span>
                              <span className="text-sm text-gray-500">
                                {ticket.customerPhone}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-mono text-sm font-medium">
                                {ticket.bundleId}
                              </span>
                              <span className="text-xs text-gray-500">
                                {ticket.bundleInfo?.qrTypeName ||
                                  "Unknown Type"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            ₹{ticket.amount}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm">
                                {ticket.qrIds?.length || 0} QRs
                              </span>
                              <span className="text-xs text-gray-500">
                                {ticket.qrIds
                                  ?.map((qr: any) => qr.serialNumber)
                                  .join(", ")}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(ticket.createdAt).toLocaleDateString()}
                              <br />
                              <span className="text-gray-500">
                                {new Date(
                                  ticket.createdAt
                                ).toLocaleTimeString()}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {(ticket.status === "PENDING" || ticket.status === "REJECTED") ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleViewTicket(ticket)}
                                className="flex items-center gap-1"
                              >
                                <Eye className="h-3 w-3" />
                                Review
                              </Button>
                            ) : (
                              <span className="text-sm text-gray-500">
                                {ticket.status === "APPROVED"
                                  ? "Approved"
                                  : "Rejected"}
                                {ticket.approvedAt && (
                                  <>
                                    <br />
                                    <span className="text-xs">
                                      {new Date(
                                        ticket.approvedAt
                                      ).toLocaleDateString()}
                                    </span>
                                  </>
                                )}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No payment tickets found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Ticket Review Dialog */}
      <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Payment Ticket</DialogTitle>
            <DialogDescription>
              Review payment details and approve or reject the ticket
            </DialogDescription>
          </DialogHeader>

          {selectedTicket && (
            <div className="space-y-6">
              {/* Ticket Details */}
              <div className="grid grid-cols-2 gap-20">
                <div>
                  <h4 className="font-medium text-sm text-gray-500">
                    Ticket ID
                  </h4>
                  <p className="font-mono text-sm">{selectedTicket.ticketId}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Amount</h4>
                  <p className="font-medium">₹{selectedTicket.amount}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">
                    Payment Method
                  </h4>
                  <p>{selectedTicket.paymentMethod}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-gray-500">Status</h4>
                  {getStatusBadge(selectedTicket.status)}
                </div>
              </div>

              {/* Bundle Information */}
              <div className="">
                <h4 className="font-medium mb-2">Bundle Information</h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium">Bundle ID:</span>
                      </p>
                      <p className="font-mono text-sm">
                        {selectedTicket.bundleId}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p>
                        <span className="font-medium">QR Type:</span>
                      </p>
                      <p className="text-sm">
                        {selectedTicket.bundleInfo?.qrTypeName ||
                          "Unknown Type"}
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Total QRs:</span>
                      </p>
                      <p className="text-sm">
                        {selectedTicket.qrIds?.length || 0} QRs
                      </p>
                    </div>
                    <div>
                      <p>
                        <span className="font-medium">Price per QR:</span>
                      </p>
                      <p className="text-sm">
                        ₹{selectedTicket.bundleInfo?.pricePerQr || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-amber-50 p-10 rounded-md border-gray-300 border-1">
                <h4 className="font-medium mb-2">Customer Information</h4>
                <div className="bg-gray-50 p-3 rounded-md border">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedTicket.customerName}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedTicket.customerPhone}
                  </p>
                  {selectedTicket.customerEmail && (
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedTicket.customerEmail}
                    </p>
                  )}
                </div>
              </div>

              {/* salesperson details */}
              <div className="bg-amber-50 p-10 rounded-md border-gray-300 border-1">
                <h4 className="font-medium mb-2">Salesperson Information</h4>
                <div className="bg-gray-50 p-3 rounded-md border">
                  <p>
                    <span className="font-medium">Name:</span>{" "}
                    {selectedTicket.salespersonId?.firstName} {selectedTicket.salespersonId?.lastName}
                  </p>
                  <p>
                    <span className="font-medium">Phone:</span>{" "}
                    {selectedTicket.salespersonId?.phoneNumber}
                  </p>
                  {selectedTicket.customerEmail && (
                    <p>
                      <span className="font-medium">Email:</span>{" "}
                      {selectedTicket.salespersonId?.email}
                    </p>
                  )}
                </div>
              </div>

              {/* QR Details */}
              <div>
                <h4 className="font-medium mb-2">
                  QR Codes ({selectedTicket.qrIds?.length || 0})
                </h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  {selectedTicket.qrIds?.map((qr: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center py-1"
                    >
                      <span className="font-mono text-sm">
                        {qr.serialNumber || qr}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Proof */}
              {selectedTicket.paymentProof && (
                <div>
                  <h4 className="font-medium mb-2">Payment Proof</h4>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <a
                      href={selectedTicket.paymentProof}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      View Payment Proof
                    </a>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              <div>
                <h4 className="font-medium mb-2">Admin Notes (Optional)</h4>
                <Textarea
                  placeholder="Add any notes about this payment ticket..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {(selectedTicket.status === "PENDING" || selectedTicket.status === "REJECTED") && (
                  <Button
                    onClick={handleApproveTicket}
                    disabled={isApprovingTicket}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {isApprovingTicket ? "Approving..." : selectedTicket.status === "REJECTED" ? "Mark as Paid & Approve" : "Approve"}
                  </Button>
                )}
                {selectedTicket.status === "PENDING" && (
                  <Button
                    onClick={handleRejectTicket}
                    disabled={isRejectingTicket}
                    variant="destructive"
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    {isRejectingTicket ? "Rejecting..." : "Reject"}
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={() => setIsTicketDialogOpen(false)}
                  disabled={isApprovingTicket || isRejectingTicket}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
