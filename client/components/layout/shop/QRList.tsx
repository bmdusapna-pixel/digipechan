"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DeliveryType, UserRoles } from "@/common/constants/enum";
import { fetchQROnDeliveryTypeAPI } from "@/lib/api/qr/fetchQROnDeliveryTypeAPI";
import { INewQRType } from "@/types/newQRType.types";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { QRListItem } from "./QRListItem";
import useAuthStore from "@/store/authStore";

export default function QRList() {
    const isAdmin = useAuthStore((state) => state.hasRole(UserRoles.ADMIN));

    const availableTabs = useMemo(() => {
        const baseTabs = [
            { label: "E-Tag", value: DeliveryType.ETAG },
            { label: "Physical Ship", value: DeliveryType.PHYSICAL_SHIP },
        ];

        if (isAdmin) {
            baseTabs.push({ label: "Bulk Gen", value: DeliveryType.BULK_GENERATION });
        }

        return baseTabs;
    }, [isAdmin]);

    const [selectedDeliveryType, setSelectedDeliveryType] = useState(
        isAdmin ? DeliveryType.ETAG : DeliveryType.ETAG // default can stay same
    );

    const {
        data: qrTypes,
        isLoading,
        isError,
    } = useQuery<INewQRType[]>({
        queryKey: ["fetch-qr-based-on-deliveryType", selectedDeliveryType],
        queryFn: () => fetchQROnDeliveryTypeAPI({ deliveryType: selectedDeliveryType }),
    });

    return (
        <div className="space-y-4">
            <Tabs value={selectedDeliveryType} onValueChange={(v) => setSelectedDeliveryType(v as DeliveryType)}>
                <TabsList className={`grid w-full ${isAdmin ? "grid-cols-3" : "grid-cols-2"} gap-2`}>
                    {availableTabs.map((tab) => (
                        <TabsTrigger key={tab.value} value={tab.value} className="text-xs sm:text-sm">
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="space-y-4">
                {isLoading &&
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex flex-row items-start gap-4 rounded-2xl border p-4 shadow-sm">
                            <Skeleton className="h-24 w-24 rounded-xl" />
                            <div className="flex flex-1 flex-col justify-between gap-2 py-2 pr-2 pl-0">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-2/3" />
                                    <Skeleton className="h-3 w-full" />
                                    <Skeleton className="h-3 w-5/6" />
                                    <div className="flex gap-2 pt-1">
                                        <Skeleton className="h-4 w-16 rounded-full" />
                                        <Skeleton className="h-4 w-16 rounded-full" />
                                    </div>
                                </div>
                                <Skeleton className="h-8 w-full rounded-md" />
                            </div>
                        </div>
                    ))}

                {isError && <div className="text-center text-sm text-red-500">Something went wrong.</div>}

                {!isLoading && !isError && qrTypes?.length === 0 && (
                    <div className="text-muted-foreground flex w-full flex-col items-center justify-center py-8 text-center text-sm">
                        <svg
                            className="mb-3 h-16 w-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>No QR types available for this category.</span>
                    </div>
                )}

                {!isLoading && !isError && qrTypes?.map((qr) => <QRListItem key={qr._id} data={qr} />)}
            </div>
        </div>
    );
}
