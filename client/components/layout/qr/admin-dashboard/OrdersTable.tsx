import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useReactTable, getCoreRowModel, flexRender } from "@tanstack/react-table";
import { Calendar, Phone, QrCode, Truck, User } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { DeliveryType, QRStatus, OrderStatus, PaymentTransactionStatus } from "@/types/statistics.types";

type OrderData = {
    qrId: string;
    serialNumber: string;
    qrStatus: QRStatus;
    orderStatus: OrderStatus;
    paymentStatus: PaymentTransactionStatus;
    vehicleNumber?: string;
    orderDate: string;
    customerName?: string;
    phoneNumber?: string;
    deliveryType: DeliveryType;
    transactionID: string;
};

interface OrdersTableProps {
    ordersData: OrderData[];
    isLoading: boolean;
    handleRowClick: (order: OrderData) => void;
    search?: string;
}

const shimmer = `relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/50 before:to-transparent`;

export function OrdersTable({ ordersData, isLoading, handleRowClick, search }: OrdersTableProps) {
    const columns = [
        {
            accessorKey: "serialNumber",
            header: "Serial Number",
            cell: ({ row }: { row: { original: OrderData } }) => (
                <div className="flex items-center">
                    <QrCode className="mr-2 h-4 w-4 text-gray-400" />
                    <span className="font-mono text-sm font-medium text-gray-900">{row.original.serialNumber}</span>
                </div>
            ),
        },
        {
            accessorKey: "deliveryType",
            header: "QR Type",
            cell: ({ row }: { row: { original: OrderData } }) => (
                <StatusBadge status={row.original.deliveryType} type="delivery" />
            ),
        },
        {
            accessorKey: "qrStatus",
            header: "QR Status",
            cell: ({ row }: { row: { original: OrderData } }) => (
                <StatusBadge status={row.original.qrStatus} type="qr" />
            ),
        },
        {
            accessorKey: "orderStatus",
            header: "Order Status",
            cell: ({ row }: { row: { original: OrderData } }) => (
                <StatusBadge status={row.original.orderStatus} type="order" />
            ),
        },
        {
            accessorKey: "paymentStatus",
            header: "Payment",
            cell: ({ row }: { row: { original: OrderData } }) => (
                <StatusBadge status={row.original.paymentStatus} type="payment" />
            ),
        },
        {
            accessorKey: "vehicleNumber",
            header: "Vehicle",
            cell: ({ row }: { row: { original: OrderData } }) => (
                <div className="flex items-center text-sm text-gray-900">
                    {row.original.vehicleNumber ? (
                        <>
                            <Truck className="mr-2 h-4 w-4 text-gray-400" />
                            {row.original.vehicleNumber}
                        </>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "orderDate",
            header: "Date",
            cell: ({ row }: { row: { original: OrderData } }) => (
                <div className="flex items-center text-sm text-gray-900">
                    <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                    {row.original.orderDate}
                </div>
            ),
        },
        {
            accessorKey: "customerName",
            header: "Customer",
            cell: ({ row }: { row: { original: OrderData } }) => (
                <div className="text-sm text-gray-900">
                    {row.original.customerName ? (
                        <div className="flex items-center">
                            <User className="mr-2 h-4 w-4 text-gray-400" />
                            <div>
                                <div className="font-medium">{row.original.customerName}</div>
                                {row.original.phoneNumber && (
                                    <div className="mt-1 flex items-center text-xs text-gray-500">
                                        <Phone className="mr-1 h-3 w-3" />
                                        {row.original.phoneNumber}
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <span className="text-gray-400">-</span>
                    )}
                </div>
            ),
        },
    ];

    const table = useReactTable({
        data: ordersData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    const skeletonRows = 5;

    return (
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
                                                <div className={`h-6 rounded bg-gray-100 ${shimmer}`}></div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : ordersData.length > 0 ? (
                        <Table>
                            <TableHeader className="bg-gray-50">
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => (
                                            <TableHead
                                                key={header.id}
                                                className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-gray-600 uppercase"
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                            </TableHead>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableHeader>
                            <TableBody>
                                {table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        className="cursor-pointer transition-colors duration-150 hover:bg-gray-50"
                                        onClick={() => handleRowClick(row.original)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="px-6 py-4 whitespace-nowrap">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="py-16 text-center">
                            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gray-50">
                                <QrCode className="h-12 w-12 text-gray-400" />
                            </div>
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No orders found</h3>
                            <p className="mt-2 text-gray-500">
                                {search ? (
                                    <>
                                        No orders match your search for <span className="font-medium">"{search}"</span>.
                                    </>
                                ) : (
                                    "Get started by creating a new order."
                                )}
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
