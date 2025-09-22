import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, Edit, Save, X, Box } from "lucide-react";
import { fetchOrders, updateOrder } from "@/lib/api/analytics/analyticsData";
import { OrdersTable } from "./OrdersTable";
import { StatusBadge } from "./StatusBadge";

import {
    OrderManagementSchema,
    PaymentTransactionStatus,
    OrderStatus,
    QRStatus,
    DeliveryType,
} from "@/types/statistics.types";
import { OrderData } from "@/types/statistics.types";
import { OrderDateField } from "./OrderDate";
import { toast } from "sonner";

type OrderFormData = z.infer<typeof OrderManagementSchema>;
const StatusSelectItem = ({
    value,
    type,
}: {
    value: PaymentTransactionStatus | OrderStatus | QRStatus | DeliveryType;
    type: "qr" | "order" | "payment" | "delivery";
}) => (
    <SelectItem value={value} className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <StatusBadge status={value} type={type} />
        </div>
    </SelectItem>
);

export default function OrderManagement() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const queryClient = useQueryClient();

    const form = useForm<OrderFormData>({
        resolver: zodResolver(OrderManagementSchema),
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, 300);
        return () => clearTimeout(timer);
    }, [search]);

    const {
        data: ordersData,
        refetch,
        isRefetching,
        isLoading,
    } = useQuery({
        queryKey: ["orders", debouncedSearch],
        queryFn: () => fetchOrders(debouncedSearch),
        refetchOnWindowFocus: false,
    });

    useEffect(() => {
        if (debouncedSearch) {
            refetch();
        }
    }, [debouncedSearch, refetch]);

    const updateOrderMutation = useMutation({
        mutationFn: updateOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            setIsEditMode(false);
            setIsSheetOpen(false);
            setSelectedOrder(null);
            form.reset();
            toast.success("Order updated successfully!");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update order");
        },
    });

    const handleRowClick = (order: OrderData) => {
        setSelectedOrder(order);
        form.reset({
            qrId: order.qrId,
            serialNumber: order.serialNumber,
            qrStatus: order.qrStatus,
            orderStatus: order.orderStatus,
            transactionID: order.transactionID,
            deliveryType: order.deliveryType,
            orderDate: order.orderDate,
            paymentStatus: order.paymentStatus,
            vehicleNumber: order.vehicleNumber || "",
            customerName: order.customerName || "",
            phoneNumber: order.phoneNumber || "",
        });
        setIsSheetOpen(true);
    };

    const onSubmit = (data: OrderFormData) => {
        updateOrderMutation.mutate(data);
    };

    const handleCancel = () => {
        setIsEditMode(false);
        if (selectedOrder) {
            form.reset({
                qrId: selectedOrder.qrId,
                serialNumber: selectedOrder.serialNumber,
                qrStatus: selectedOrder.qrStatus,
                orderStatus: selectedOrder.orderStatus,
                transactionID: selectedOrder.transactionID,
                deliveryType: selectedOrder.deliveryType,
                orderDate: selectedOrder.orderDate,
                paymentStatus: selectedOrder.paymentStatus,
                vehicleNumber: selectedOrder.vehicleNumber || "",
            });
        }
    };

    return (
        <div className="space-y-6">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        <Box className="mr-2 inline-block h-6 w-6 text-blue-600" />
                        Order Management
                    </h2>
                    <div className="relative w-[500px]">
                        <Input
                            placeholder="Search orders by serial number, vehicle, customer..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="h-12 rounded-lg border border-gray-200 bg-gray-50 pr-4 pl-12 text-base shadow-sm transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                        <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400">
                            <Search className="h-5 w-5" />
                        </span>
                    </div>
                </div>
            </CardHeader>

            {
                <OrdersTable
                    isLoading={isLoading || isRefetching}
                    ordersData={ordersData as OrderData[]}
                    handleRowClick={handleRowClick}
                    search={search}
                />
            }

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[1000px] overflow-y-auto bg-white p-6" side="right">
                    <SheetHeader className="border-b border-gray-100 pb-4">
                        <SheetTitle className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                            <Edit className="h-5 w-5 text-blue-600" />
                            Order Details
                        </SheetTitle>
                    </SheetHeader>

                    {selectedOrder && (
                        <div className="space-y-6 py-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Order Information</h3>
                                <Button
                                    variant={isEditMode ? "outline" : "default"}
                                    size="sm"
                                    onClick={() => setIsEditMode(!isEditMode)}
                                    className="flex items-center gap-2"
                                >
                                    {isEditMode ? (
                                        <>
                                            <X className="h-4 w-4" />
                                            Cancel
                                        </>
                                    ) : (
                                        <>
                                            <Edit className="h-4 w-4" />
                                            Edit
                                        </>
                                    )}
                                </Button>
                            </div>

                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                    <div className="grid grid-cols-1 gap-4">
                                        <FormField
                                            control={form.control}
                                            disabled={true}
                                            name="serialNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Serial Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        {isEditMode ? (
                                                            <Input {...field} className="mt-1" />
                                                        ) : (
                                                            <div className="mt-1 rounded border bg-gray-50 p-2 font-mono text-sm">
                                                                {field.value}
                                                            </div>
                                                        )}
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name="qrStatus"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-gray-700">
                                                            QR Status
                                                        </FormLabel>
                                                        <FormControl>
                                                            {isEditMode ? (
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="mt-1">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Object.values(QRStatus).map((status) => (
                                                                            <StatusSelectItem
                                                                                key={status}
                                                                                value={status}
                                                                                type="qr"
                                                                            />
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <div className="mt-1">
                                                                    <StatusBadge
                                                                        status={field.value as QRStatus}
                                                                        type="qr"
                                                                    />
                                                                </div>
                                                            )}
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="deliveryType"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-gray-700">
                                                            Delivery Type
                                                        </FormLabel>
                                                        <FormControl>
                                                            {isEditMode ? (
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="mt-1">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Object.values(DeliveryType).map(
                                                                            (deliveryType) => (
                                                                                <StatusSelectItem
                                                                                    key={deliveryType}
                                                                                    value={deliveryType}
                                                                                    type="delivery"
                                                                                />
                                                                            )
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <div className="mt-1">
                                                                    <StatusBadge
                                                                        status={field.value as DeliveryType}
                                                                        type="delivery"
                                                                    />
                                                                </div>
                                                            )}
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="orderStatus"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-gray-700">
                                                            Order Status
                                                        </FormLabel>
                                                        <FormControl>
                                                            {isEditMode ? (
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="mt-1">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Object.values(OrderStatus).map((status) => (
                                                                            <StatusSelectItem
                                                                                key={status}
                                                                                value={status}
                                                                                type="order"
                                                                            />
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <div className="mt-1">
                                                                    <StatusBadge
                                                                        status={field.value as OrderStatus}
                                                                        type="order"
                                                                    />
                                                                </div>
                                                            )}
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="paymentStatus"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-sm font-medium text-gray-700">
                                                            Payment Status
                                                        </FormLabel>
                                                        <FormControl>
                                                            {isEditMode ? (
                                                                <Select
                                                                    value={field.value}
                                                                    onValueChange={field.onChange}
                                                                >
                                                                    <SelectTrigger className="mt-1">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {Object.values(PaymentTransactionStatus).map(
                                                                            (status) => (
                                                                                <StatusSelectItem
                                                                                    key={status}
                                                                                    value={status}
                                                                                    type="payment"
                                                                                />
                                                                            )
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            ) : (
                                                                <div className="mt-1">
                                                                    <StatusBadge
                                                                        status={field.value as PaymentTransactionStatus}
                                                                        type="payment"
                                                                    />
                                                                </div>
                                                            )}
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="vehicleNumber"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-sm font-medium text-gray-700">
                                                        Vehicle Number
                                                    </FormLabel>
                                                    <FormControl>
                                                        {isEditMode ? (
                                                            <Input
                                                                {...field}
                                                                placeholder="Enter vehicle number (e.g., MH12AB1234)"
                                                                className="mt-1"
                                                            />
                                                        ) : (
                                                            <div className="mt-1 rounded border bg-gray-50 p-2 text-sm">
                                                                {field.value || "Not provided"}
                                                            </div>
                                                        )}
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <div className="grid grid-cols-2 gap-4">
                                            <OrderDateField isEditMode={isEditMode} form={form} />
                                        </div>

                                        <div>
                                            <Label className="text-sm font-medium text-gray-700">Transaction ID</Label>
                                            <div className="mt-1 rounded border bg-gray-50 p-2 font-mono text-sm text-gray-600">
                                                {selectedOrder.transactionID}
                                            </div>
                                        </div>

                                        <div className="border-t pt-4">
                                            <h4 className="text-md mb-3 font-medium text-gray-900">
                                                Customer Information
                                            </h4>
                                            <div className="space-y-3">
                                                <FormField
                                                    control={form.control}
                                                    name="customerName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Customer Name
                                                            </FormLabel>
                                                            <FormControl>
                                                                {isEditMode ? (
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Enter customer name"
                                                                        className="mt-1"
                                                                    />
                                                                ) : (
                                                                    <div className="mt-1 rounded border bg-gray-50 p-2 text-sm">
                                                                        {field.value || "Not provided"}
                                                                    </div>
                                                                )}
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="phoneNumber"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-sm font-medium text-gray-700">
                                                                Phone Number
                                                            </FormLabel>
                                                            <FormControl>
                                                                {isEditMode ? (
                                                                    <Input
                                                                        {...field}
                                                                        placeholder="Enter phone number"
                                                                        className="mt-1"
                                                                    />
                                                                ) : (
                                                                    <div className="mt-1 rounded border bg-gray-50 p-2 text-sm">
                                                                        {field.value || "Not provided"}
                                                                    </div>
                                                                )}
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {isEditMode && (
                                        <div className="flex gap-3 border-t pt-4">
                                            <Button
                                                type="submit"
                                                disabled={updateOrderMutation.isPending}
                                                className="flex-1 bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                {updateOrderMutation.isPending ? (
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                                        Saving...
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Save className="h-4 w-4" />
                                                        Save Changes
                                                    </div>
                                                )}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={handleCancel}
                                                disabled={updateOrderMutation.isPending}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                </form>
                            </Form>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
