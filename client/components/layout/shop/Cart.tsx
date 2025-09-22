"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, ShoppingCart, CreditCard, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cartStore";
import { DeliveryType } from "@/common/constants/enum";
import { toast } from "sonner";
import { initiatePayment } from "@/lib/api/qr/initiatePayment";

interface ShippingAddress {
  houseNumber?: string;
  locality?: string;
  nearByAreaName?: string;
  pincode?: string;
  city?: string;
  state?: string;
  country?: string;
}

interface CreatedForOption {
  _id: string;
  name: string;
}

const createdForOptions: CreatedForOption[] = [
  { _id: "64f1a2b3c4d5e6f7a8b9c0d1", name: "John Doe" },
  { _id: "64f1a2b3c4d5e6f7a8b9c0d2", name: "Jane Smith" },
  { _id: "64f1a2b3c4d5e6f7a8b9c0d3", name: "Mike Johnson" },
  { _id: "64f1a2b3c4d5e6f7a8b9c0d4", name: "Sarah Wilson" },
];

export function Cart() {
  const { items, increaseQty, decreaseQty, removeFromCart, clearCart } =
    useCartStore();
  console.log(items);
  const [deliveryType, setDeliveryType] = useState<DeliveryType | "">("");
  const [createdFor, setCreatedFor] = useState<string>("");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    houseNumber: "",
    locality: "",
    nearByAreaName: "",
    pincode: "",
    city: "",
    state: "",
    country: "India",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = items.reduce(
    (sum, item) => sum + item.discountedPrice * item.quantity,
    0
  );
  const originalTotal = items.reduce(
    (sum, item) => sum + item.originalPrice * item.quantity,
    0
  );
  const savings = originalTotal - subtotal;

  const isDeliveryTypeValid = useCallback(
    (type: DeliveryType) => {
      if (!type || items.length === 0) return false;
      return items.every(
        (item) => item.deliveryType && item.deliveryType.includes(type)
      );
    },
    [items]
  );

  const getAvailableDeliveryTypes = (): DeliveryType[] => {
    if (items.length === 0) return [];

    const hasDeliveryTypes = items.every(
      (item) => item.deliveryType && item.deliveryType.length > 0
    );
    if (!hasDeliveryTypes) {
      return [
        DeliveryType.ETAG,
        DeliveryType.PHYSICAL_SHIP,
        DeliveryType.BULK_GENERATION,
      ];
    }

    const firstItemTypes = items[0].deliveryType || [];
    return firstItemTypes.filter((type) =>
      items.every(
        (item) => item.deliveryType && item.deliveryType.includes(type)
      )
    );
  };

  const availableDeliveryTypes = getAvailableDeliveryTypes();

  useEffect(() => {
    if (deliveryType !== "" && !isDeliveryTypeValid(deliveryType)) {
      const incompatibleItems = items.filter(
        (item) =>
          !item.deliveryType || !item.deliveryType.includes(deliveryType)
      );

      if (items.length > 0 && incompatibleItems.length > 0) {
        toast.error(
          `Selected delivery type "${deliveryType}" is not supported by ${incompatibleItems.length} item(s) in your cart.`
        );
      }
    }
  }, [deliveryType, items, isDeliveryTypeValid]);

  const handleShippingAddressChange = (
    field: keyof ShippingAddress,
    value: string
  ) => {
    setShippingAddress((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!deliveryType) {
      newErrors.deliveryType = "Please select a delivery type";
    } else if (!isDeliveryTypeValid(deliveryType)) {
      newErrors.deliveryType =
        "Selected delivery type is not supported by all items in cart";
    }

    if (deliveryType === DeliveryType.BULK_GENERATION && !createdFor) {
      newErrors.createdFor = "Please select who this is created for";
    }

    if (
      deliveryType === DeliveryType.PHYSICAL_SHIP ||
      deliveryType === DeliveryType.BULK_GENERATION
    ) {
      const requiredFields = [
        "houseNumber",
        "locality",
        "pincode",
        "city",
        "state",
      ];
      requiredFields.forEach((field) => {
        if (!shippingAddress[field as keyof ShippingAddress]?.trim()) {
          newErrors[field] =
            `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }
      });

      if (shippingAddress.pincode && !/^\d{6}$/.test(shippingAddress.pincode)) {
        newErrors.pincode = "Please enter a valid 6-digit pincode";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCheckout = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      const payload = {
        items: items.map((item) => ({
          qrTypeId: item.qrTypeId,
          quantity: item.quantity,
        })),
        deliveryType: deliveryType as DeliveryType,
        ...(deliveryType === DeliveryType.BULK_GENERATION && { createdFor }),
        ...((deliveryType === DeliveryType.PHYSICAL_SHIP ||
          deliveryType === DeliveryType.BULK_GENERATION) && {
          shippingAddress: {
            ...shippingAddress,
            ...Object.fromEntries(
              Object.entries(shippingAddress).filter(([_, value]) =>
                value?.trim()
              )
            ),
          },
        }),
      };

      console.log("Payment payload:", payload);

      // Call payment API
      const paymentUrl = await initiatePayment(payload);

      // Redirect to payment URL or handle response
      if (paymentUrl) {
        // clearCart();
        window.location.href = paymentUrl;
      }
    } catch (error) {
      console.error("Payment initiation failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getDeliveryTypeDisplayName = (type: DeliveryType) => {
    switch (type) {
      case DeliveryType.ETAG:
        return "Digital E-Tag";
      case DeliveryType.PHYSICAL_SHIP:
        return "Physical Shipping";
      case DeliveryType.BULK_GENERATION:
        return "Bulk Generation";
      default:
        return type;
    }
  };

  const isCheckoutDisabled =
    isProcessing ||
    items.length === 0 ||
    (deliveryType && !isDeliveryTypeValid(deliveryType));

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center mt-20">
        <ShoppingCart className="text-muted-foreground mb-4 h-12 w-12" />
        <h3 className="text-foreground mb-2 text-lg font-semibold">
          Your cart is empty
        </h3>
        <p className="text-muted-foreground">
          Add some QR codes to get started!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 px-2 py-5 mt-10">
        <Card>
          <CardHeader className="flex items-center justify-between ">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <ShoppingCart className="h-5 w-5" />
              Cart Items ({items.length})
            </CardTitle>
            <Button variant="destructive" size="sm" onClick={clearCart}>
              Clear All
            </Button>
          </CardHeader>

          <CardContent className="space-y-4 p-2 ">
            {items.map((item, index) => (
              <motion.div
                key={item.qrTypeId}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`group flex flex-row items-stretch gap-4 rounded-2xl border p-4 shadow-sm transition-shadow hover:shadow-md ${
                    deliveryType &&
                    !isDeliveryTypeValid(deliveryType) &&
                    (!item.deliveryType ||
                      !item.deliveryType.includes(deliveryType))
                      ? "border-red-300 bg-red-50"
                      : "bg-white"
                  }`}
                >
                  {/* Image */}
                  <div className="bg-muted md:w-28 flex-shrink-0 overflow-hidden rounded-md border shadow-sm">
                    <Image
                      src={item.productImage || "/landscape-placeholder.webp"}
                      alt={item.qrName}
                      width={112}
                      height={112}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>

                  {/* Info and Actions */}
                  <CardContent className="flex flex-1 flex-col justify-between gap-2 py-2 pr-2 pl-0">
                    <div className="space-y-1">
                      <h4 className="text-foreground text-sm font-semibold">
                        {item.qrName}
                      </h4>

                      <div className="flex items-center gap-2 text-sm">
                        {item.discountedPrice < item.originalPrice ? (
                          <>
                            <span className="text-muted-foreground line-through">
                              ₹{item.originalPrice.toFixed(2)}
                            </span>
                            <span className="font-medium text-green-600">
                              ₹{item.discountedPrice.toFixed(2)}
                            </span>
                          </>
                        ) : (
                          <span className="text-foreground font-medium">
                            ₹{item.discountedPrice.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Delivery Type Tags */}
                      <div className="pt-1">
                        <p className="text-muted-foreground text-xs font-medium">
                          Available Delivery:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {item.deliveryType?.length &&
                          item.deliveryType?.length > 0 ? (
                            item.deliveryType?.map((type, i) => (
                              <span
                                key={i}
                                className={`rounded-full border px-2 py-0.5 text-xs font-medium ${
                                  deliveryType === type
                                    ? "border-green-200 bg-green-100 text-green-800"
                                    : deliveryType
                                      ? "border-gray-200 bg-gray-100 text-gray-600"
                                      : "border-blue-200 bg-blue-100 text-blue-800"
                                }`}
                              >
                                {getDeliveryTypeDisplayName(type)}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                              No delivery options
                            </span>
                          )}
                        </div>

                        {deliveryType &&
                          (!item.deliveryType ||
                            !item.deliveryType.includes(deliveryType)) && (
                            <div className="mt-1 flex items-center gap-1 text-xs text-red-600">
                              <AlertTriangle className="h-3 w-3" />
                              Not compatible with selected delivery type
                            </div>
                          )}
                      </div>
                    </div>

                    {/* Quantity + Remove */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          className="h-6 w-6 text-sm"
                          onClick={() => decreaseQty(item.qrTypeId)}
                        >
                          −
                        </Button>
                        <span className="text-sm">{item.quantity}</span>
                        <Button
                          size="icon"
                          className="h-6 w-6 text-sm"
                          onClick={() => increaseQty(item.qrTypeId)}
                        >
                          +
                        </Button>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-red-500 hover:text-red-600"
                        onClick={() => removeFromCart(item.qrTypeId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Delivery Options */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="deliveryType">Select Delivery Type *</Label>
              <p className="text-muted-foreground -mt-1 text-sm">
                Only delivery types common across all items are shown.
              </p>
              <Select
                value={deliveryType}
                onValueChange={(value: DeliveryType) => setDeliveryType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose delivery method" />
                </SelectTrigger>
                <SelectContent>
                  {availableDeliveryTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {getDeliveryTypeDisplayName(type)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.deliveryType && (
                <p className="text-sm text-red-500">{errors.deliveryType}</p>
              )}
              {availableDeliveryTypes.length === 0 && items.length > 0 && (
                <p className="text-sm text-amber-600">
                  No common delivery types found between all cart items.
                </p>
              )}
            </div>

            {/* Created For - Only for BULK_GENERATION */}
            {deliveryType === DeliveryType.BULK_GENERATION && (
              <div className="space-y-2">
                <Label htmlFor="createdFor">Created For *</Label>
                <Select value={createdFor} onValueChange={setCreatedFor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select person" />
                  </SelectTrigger>
                  <SelectContent>
                    {createdForOptions.map((option) => (
                      <SelectItem key={option._id} value={option._id}>
                        {option.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.createdFor && (
                  <p className="text-sm text-red-500">{errors.createdFor}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Shipping Address - For PHYSICAL_SHIP and BULK_GENERATION */}
        {(deliveryType === DeliveryType.PHYSICAL_SHIP ||
          deliveryType === DeliveryType.BULK_GENERATION) && (
          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="houseNumber">House Number *</Label>
                  <Input
                    id="houseNumber"
                    value={shippingAddress.houseNumber}
                    onChange={(e) =>
                      handleShippingAddressChange("houseNumber", e.target.value)
                    }
                    placeholder="House/Flat number"
                  />
                  {errors.houseNumber && (
                    <p className="text-sm text-red-500">{errors.houseNumber}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locality">Locality *</Label>
                  <Input
                    id="locality"
                    value={shippingAddress.locality}
                    onChange={(e) =>
                      handleShippingAddressChange("locality", e.target.value)
                    }
                    placeholder="Area/Locality"
                  />
                  {errors.locality && (
                    <p className="text-sm text-red-500">{errors.locality}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nearByAreaName">Nearby Area</Label>
                  <Input
                    id="nearByAreaName"
                    value={shippingAddress.nearByAreaName}
                    onChange={(e) =>
                      handleShippingAddressChange(
                        "nearByAreaName",
                        e.target.value
                      )
                    }
                    placeholder="Nearby landmark"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode *</Label>
                  <Input
                    id="pincode"
                    value={shippingAddress.pincode}
                    onChange={(e) =>
                      handleShippingAddressChange("pincode", e.target.value)
                    }
                    placeholder="6-digit pincode"
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <p className="text-sm text-red-500">{errors.pincode}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      handleShippingAddressChange("city", e.target.value)
                    }
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      handleShippingAddressChange("state", e.target.value)
                    }
                    placeholder="State"
                  />
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state}</p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={shippingAddress.country}
                    onChange={(e) =>
                      handleShippingAddressChange("country", e.target.value)
                    }
                    placeholder="Country"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Original Total:</span>
                <span className="text-muted-foreground line-through">
                  ₹{originalTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>You Save:</span>
                <span className="font-medium text-green-600">
                  ₹{savings.toFixed(2)}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Amount:</span>
                <span className="text-lg">₹{subtotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Incompatibility Warning */}
            {deliveryType && !isDeliveryTypeValid(deliveryType) && (
              <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3">
                <AlertTriangle className="h-4 w-4 flex-shrink-0 text-red-600" />
                <p className="text-sm text-red-700">
                  Some items in your cart dont support the selected delivery
                  type. Please choose a different delivery method or remove
                  incompatible items.
                </p>
              </div>
            )}

            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={!!isCheckoutDisabled}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              {isProcessing
                ? "Processing..."
                : isCheckoutDisabled &&
                    deliveryType &&
                    !isDeliveryTypeValid(deliveryType)
                  ? "Fix delivery compatibility to proceed"
                  : `Proceed to Payment (₹${subtotal.toFixed(2)})`}
            </Button>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
