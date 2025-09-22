import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ChevronRight } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { INewQRTypeFormSchema } from "@/lib/schemas/qrTypeFormSchema";
import { DeliveryType, deliveryTypeLabels } from "@/common/constants/enum";

interface QRTypeBasicProps {
    form: UseFormReturn<INewQRTypeFormSchema>;
    onNext: () => void;
}

export function QRTypeBasicInputs({ form, onNext }: QRTypeBasicProps) {
    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                <FormField
                    control={form.control}
                    name="qrName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">QR Name</FormLabel>
                            <FormControl>
                                <Input
                                    {...field}
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Enter QR name"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="qrDescription"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Description</FormLabel>
                            <FormControl>
                                <Textarea
                                    {...field}
                                    className="min-h-20 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    placeholder="Describe your QR type"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="qrUseCases"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-700">Use Cases</FormLabel>
                            <FormControl>
                                <Input
                                    defaultValue={field.value?.join(", ") ?? ""}
                                    onBlur={(e) => {
                                        const processed = e.target.value
                                            .split(",")
                                            .map((s) => s.trim())
                                            .filter(Boolean);
                                        field.onChange(processed);
                                    }}
                                    placeholder="Use cases (comma separated)"
                                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
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
                            <FormLabel className="text-sm font-medium text-gray-700">Delivery Types</FormLabel>
                            <div className="space-y-2">
                                {Object.entries(deliveryTypeLabels).map(([value, label]) => (
                                    <label key={value} className="flex items-center space-x-2 text-sm text-gray-800">
                                        <input
                                            type="checkbox"
                                            value={value}
                                            checked={field.value?.includes(value as DeliveryType)}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                const val = value as DeliveryType;
                                                const newValue = checked
                                                    ? [...(field.value || []), val]
                                                    : (field.value || []).filter((v) => v !== val);
                                                field.onChange(newValue);
                                            }}
                                            className="accent-blue-600"
                                        />
                                        <span>{label}</span>
                                    </label>
                                ))}
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Pricing</h3>

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="originalPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Original Price</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        value={field.value ?? ""}
                                        className="border-red-300 focus:border-red-500 focus:ring-red-500"
                                        placeholder="0"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="discountedPrice"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel className="text-sm font-medium text-gray-700">Discounted Price</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        inputMode="decimal"
                                        {...field}
                                        onChange={(e) => field.onChange(e.target.value)}
                                        value={field.value ?? ""}
                                        className="border-red-300 focus:border-red-500 focus:ring-red-500"
                                        placeholder="0"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="includeGST"
                    render={({ field }) => (
                        <FormItem className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                            <div>
                                <FormLabel className="text-sm font-medium text-gray-700">Include GST</FormLabel>
                                <p className="text-xs text-gray-500">Add GST to the pricing</p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <Button
                type="button"
                onClick={onNext}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-6 text-white hover:from-blue-700 hover:to-purple-700"
            >
                Next Step
                <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
        </div>
    );
}
