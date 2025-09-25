import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  User,
  Phone,
  MapPin,
  Package,
  QrCode,
  Users,
  Eye,
  Shuffle,
} from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiRequest } from "@/common/utils/apiClient";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { useQuery } from "@tanstack/react-query";

type SalespersonData = {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  territory?: string;
  bundlesAssigned: number;
  totalQRsAssigned: number;
  availableQRs: number;
  soldQRs: number;
  isVerified: boolean;
  bundles: Array<{
    bundleId: string;
    qrTypeName: string;
    qrCount: number;
    createdAt: string;
  }>;
};

type CustomerData = {
  qrId: string;
  serialNumber: string;
  qrTypeName: string;
  bundleId: string;
  customerName: string;
  mobileNumber: string;
  email: string;
  vehicleNumber: string;
  createdAt: string;
};

interface SalespersonTableProps {
  salespersonData: SalespersonData[];
  isLoading: boolean;
}

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent`;

export function SalespersonTable({
  salespersonData,
  isLoading,
}: SalespersonTableProps) {
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(
    null
  );
  const [isCustomersDialogOpen, setIsCustomersDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [isVerificationDialogOpen, setIsVerificationDialogOpen] =
    useState(false);
  const [transferBundleId, setTransferBundleId] = useState<string>("");
  const [transferToSalespersonId, setTransferToSalespersonId] =
    useState<string>("");
  const [isTransferring, setIsTransferring] = useState(false);

  const { data: customerData, isLoading: isLoadingCustomers } = useQuery({
    queryKey: ["salespersonCustomers", selectedSalesperson],
    queryFn: () =>
      selectedSalesperson
        ? apiRequest(
            "GET",
            API_ENDPOINTS.salespersonCustomers(selectedSalesperson)
          )
        : null,
    enabled: !!selectedSalesperson && isCustomersDialogOpen,
  });

  console.log("CUSTOMER DATA", customerData);
  const columns = [
    {
      accessorKey: "name",
      header: "Salesperson",
      cell: ({ row }: { row: { original: SalespersonData } }) => (
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
            <span className="text-sm font-semibold">
              {row.original.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-semibold text-gray-900">
              {row.original.name}
            </div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
            {row.original.phoneNumber && (
              <div className="flex items-center text-xs text-gray-500">
                <Phone className="mr-1 h-3 w-3" />
                {row.original.phoneNumber}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "territory",
      header: "District",
      cell: ({ row }: { row: { original: SalespersonData } }) => (
        <div className="flex items-center text-sm text-gray-900">
          {row.original.territory ? (
            <>
              <MapPin className="mr-2 h-4 w-4 text-gray-400" />
              {row.original.territory}
            </>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      accessorKey: "isVerified",
      header: "Verified",
      cell: ({ row }: { row: { original: SalespersonData } }) => (
        <div
          onClick={() => {
            setSelectedSalesperson(row.original._id);
            setIsVerificationDialogOpen(true);
          }}
        >
          {row.original.isVerified ? (
            <Badge className="bg-green-100 text-green-800">Verified</Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              Unverified
            </Badge>
          )}
        </div>
      ),
    },
    {
      accessorKey: "bundlesAssigned",
      header: "Bundles",
      cell: ({ row }: { row: { original: SalespersonData } }) => (
        <div className="flex items-center text-sm text-gray-900">
          <Package className="mr-2 h-4 w-4 text-gray-400" />
          <Badge variant="outline">
            {row.original.bundlesAssigned} Bundles
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "qrStats",
      header: "QR Status",
      cell: ({ row }: { row: { original: SalespersonData } }) => (
        <div className="space-y-1">
          <div className="flex items-center text-sm">
            <QrCode className="mr-2 h-4 w-4 text-gray-400" />
            <span className="font-medium">
              {row.original.totalQRsAssigned} Total
            </span>
          </div>
          <div className="flex space-x-2">
            <Badge variant="default" className="bg-green-100 text-green-800">
              {row.original.soldQRs} Sold
            </Badge>
            <Badge variant="secondary">
              {row.original.availableQRs} Available
            </Badge>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "assignmentDate",
      header: "Assignment Date",
      cell: ({ row }: { row: { original: SalespersonData } }) => {
        // Get the most recent bundle assignment date
        const latestBundle = row.original.bundles.reduce((latest, bundle) => {
          const bundleDate = new Date(bundle.createdAt);
          const latestDate = new Date(latest.createdAt);
          return bundleDate > latestDate ? bundle : latest;
        }, row.original.bundles[0]);

        return (
          <div className="text-sm text-gray-900">
            {row.original.bundles.length > 0 ? (
              <div>
                <div className="font-medium">
                  {new Date(latestBundle.createdAt).toLocaleDateString()}
                </div>
                <div className="text-xs text-gray-500">Latest assignment</div>
              </div>
            ) : (
              <span className="text-gray-400">No assignments</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: { row: { original: SalespersonData } }) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setSelectedSalesperson(row.original._id);
            setIsCustomersDialogOpen(true);
          }}
          className="flex items-center"
        >
          <Users className="mr-1 h-4 w-4" />
          View Customers
        </Button>
      ),
    },
    {
      accessorKey: "transfer",
      header: "Transfer",
      cell: ({ row }: { row: { original: SalespersonData } }) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setSelectedSalesperson(row.original._id);
            setIsTransferDialogOpen(true);
          }}
          className="flex items-center"
        >
          <Shuffle className="mr-1 h-4 w-4" />
          Transfer
        </Button>
      ),
    },
  ];

  const table = useReactTable({
    data: salespersonData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const skeletonRows = 5;

  return (
    <>
      <Card className="border-0 bg-white shadow-lg">
        <CardContent className="p-0">
          <div className="overflow-hidden">
            {isLoading ? (
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    {columns.map((column, index) => (
                      <TableHead
                        key={index}
                        className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase"
                      >
                        {column.header}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: skeletonRows }).map((_, rowIndex) => (
                    <TableRow key={`skeleton-${rowIndex}`}>
                      {columns.map((column, colIndex) => (
                        <TableCell
                          key={`skeleton-${rowIndex}-${colIndex}`}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          <div
                            className={`h-6 rounded bg-gray-100 ${shimmer}`}
                          ></div>
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : salespersonData.length > 0 ? (
              <Table>
                <TableHeader className="bg-gray-50">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                      {headerGroup.headers.map((header) => (
                        <TableHead
                          key={header.id}
                          className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="transition-colors duration-150 hover:bg-gray-50"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className="px-6 py-4 whitespace-nowrap"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-50">
                  <User className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No salespeople found
                </h3>
                <p className="mt-2 text-gray-500">
                  Create salespeople to start managing QR bundles.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Customers Dialog */}
      <Dialog
        open={isCustomersDialogOpen}
        onOpenChange={setIsCustomersDialogOpen}
      >
        <DialogContent className="sm:max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Customer Sales History
            </DialogTitle>
            <DialogDescription>
              QRs sold by{" "}
              {salespersonData.find((s) => s._id === selectedSalesperson)?.name}
            </DialogDescription>
          </DialogHeader>

          {isLoadingCustomers ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-16 rounded bg-gray-100 ${shimmer}`}
                ></div>
              ))}
            </div>
          ) : customerData &&
            Array.isArray(customerData) &&
            customerData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>QR Details</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Customer Info</TableHead>
                  <TableHead>Sale Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customerData.map((customer: CustomerData) => (
                  <TableRow key={customer.qrId}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {customer.serialNumber}
                        </div>
                        <div className="text-sm text-gray-500">
                          {customer.qrTypeName}
                        </div>
                        <div className="text-xs text-gray-400">
                          Bundle: {customer.bundleId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {customer.customerName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm text-gray-500">
                          <div className="text-sm text-gray-500">
                            {customer.mobileNumber}
                          </div>
                          <div className="text-xs text-gray-400">
                            {customer.email}
                          </div>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">
                No customers yet
              </h3>
              <p className="text-gray-500">
                This salesperson hasn't sold any QRs yet.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Bundle Dialog */}
      <Dialog
        open={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
      >
        <DialogContent className="sm:max-w-4xl w-[90vw] ">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Shuffle className="mr-2 h-5 w-5" />
              Transfer Bundle
            </DialogTitle>
            <DialogDescription>
              Select a bundle assigned to this salesperson and a target
              salesperson.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium mb-1">Bundle</div>
              <Select
                onValueChange={setTransferBundleId}
                value={transferBundleId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bundle" />
                </SelectTrigger>
                <SelectContent>
                  {salespersonData
                    .find((s) => s._id === selectedSalesperson)
                    ?.bundles?.map((b) => (
                      <SelectItem key={b.bundleId} value={b.bundleId}>
                        {b.bundleId} — {b.qrTypeName} ({b.qrCount} QRs)
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Transfer To</div>
              <Select
                onValueChange={setTransferToSalespersonId}
                value={transferToSalespersonId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select salesperson" />
                </SelectTrigger>
                <SelectContent>
                  {salespersonData
                    .filter((s) => s._id !== selectedSalesperson)
                    .map((s) => (
                      <SelectItem key={s._id} value={s._id}>
                        {s.name} ({s.phoneNumber})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsTransferDialogOpen(false)}
                disabled={isTransferring}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  if (!transferBundleId || !transferToSalespersonId) return;
                  try {
                    setIsTransferring(true);
                    await apiRequest(
                      "PUT",
                      API_ENDPOINTS.adminTransferBundle(transferBundleId),
                      { targetSalespersonId: transferToSalespersonId }
                    );
                    setIsTransferDialogOpen(false);
                    setTransferBundleId("");
                    setTransferToSalespersonId("");
                  } finally {
                    setIsTransferring(false);
                  }
                }}
                disabled={
                  isTransferring ||
                  !transferBundleId ||
                  !transferToSalespersonId
                }
              >
                {isTransferring ? "Transferring..." : "Transfer"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Is Verified Dialog */}
      <Dialog
        open={isVerificationDialogOpen}
        onOpenChange={setIsVerificationDialogOpen}
      >
        <DialogContent className="sm:max-w-md w-[90vw]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5" />
              Salesperson Verification
            </DialogTitle>
            <DialogDescription>
              {`Change verification status for ${
                salespersonData.find((s) => s._id === selectedSalesperson)?.name
              }`}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setIsVerificationDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!selectedSalesperson) return;
                try {
                  await apiRequest(
                    "PUT",
                    API_ENDPOINTS.salespersonToggleVerify(selectedSalesperson)
                  );
                } finally {
                  setIsVerificationDialogOpen(false);
                }
              }}
              variant={
                salespersonData.find((s) => s._id === selectedSalesperson)
                  ?.isVerified
                  ? "destructive"
                  : "default"
              }
            >
              {salespersonData.find((s) => s._id === selectedSalesperson)
                ?.isVerified
                ? "Deactivate"
                : "Activate"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
