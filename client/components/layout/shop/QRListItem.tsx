"use client";

import { INewQRType } from "@/types/newQRType.types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";

export function QRListItem({ data }: { data: INewQRType }) {
    const { addToCart, increaseQty, decreaseQty, removeFromCart, items } = useCartStore();
    const itemInCart = items.find((i) => i.qrTypeId === data._id);
    const quantity = itemInCart?.quantity || 0;

    console.log(data);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
        >
            <Card className="group dark:hover:shadow-primary/30 flex h-full flex-row items-stretch gap-4 rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md">
                <div className="bg-muted w-32 flex-shrink-0 overflow-hidden rounded-md border shadow-sm">
                    <Image
                        src={data.productImage || "/landscape-placeholder.webp"}
                        alt={data.qrName}
                        width={128}
                        height={128}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                </div>
                <CardContent className="flex flex-1 flex-col justify-between gap-2 py-2 pr-2 pl-0">
                    <div className="space-y-2">
                        <h4 className="text-foreground text-base font-semibold">{data.qrName}</h4>
                        <p className="text-muted-foreground line-clamp-2 text-sm break-words">{data.qrDescription}</p>
                        <div className="flex flex-wrap gap-1">
                            {data.qrUseCases?.map((tag, i) => (
                                <span
                                    key={i}
                                    className="text-muted-foregroun rounded-full bg-purple-500/20 px-2 py-0.5 text-xs"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* This need to be changed, need original price from the be */}

                        <div className="text-sm">
                            <div className="flex items-center gap-2">
                                {data.discountedPrice < data.originalPrice ? (
                                    <>
                                        <span className="text-muted-foreground line-through">
                                            ₹{data.originalPrice.toFixed(2)}
                                        </span>
                                        <span className="font-medium text-green-600">
                                            ₹{data.discountedPrice.toFixed(2)}
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-foreground font-medium">
                                        ₹{data.discountedPrice.toFixed(2)}
                                    </span>
                                )}
                            </div>

                            {data.discountedPrice < data.originalPrice && (
                                <div className="mt-2 flex items-center gap-2">
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600 dark:bg-green-900/30">
                                        {Math.round(
                                            ((data.originalPrice - data.discountedPrice) / data.originalPrice) * 100
                                        )}
                                        % OFF
                                    </span>

                                    {data.includeGST && (
                                        <span className="text-muted-foreground text-[10px]">
                                            (Incl. GST)
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>

                    {quantity === 0 ? (
                        <Button
                            variant="default"
                            className="bg-primary hover:bg-primary/90 mt-1 w-full gap-1 px-4 py-1.5 text-xs font-medium text-white"
                            onClick={() =>
                                addToCart({
                                    qrTypeId: data._id,
                                    qrName: data.qrName,
                                    productImage: data.productImage,
                                    originalPrice: data.originalPrice,
                                    discountedPrice: data.discountedPrice,
                                    deliveryType: data.deliveryType,
                                })
                            }
                        >
                            <ShoppingCart size={14} />
                            Add to Cart
                        </Button>
                    ) : (
                        <div className="mt-1 flex w-full items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <Button size="icon" className="h-6 w-6 text-sm" onClick={() => decreaseQty(data._id)}>
                                    −
                                </Button>
                                <span className="text-sm">{quantity}</span>
                                <Button size="icon" className="h-6 w-6 text-sm" onClick={() => increaseQty(data._id)}>
                                    +
                                </Button>
                            </div>

                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-red-500 hover:text-red-600"
                                onClick={() => removeFromCart(data._id)}
                            >
                                <Trash2 />
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
