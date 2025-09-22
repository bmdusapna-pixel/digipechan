import React from "react";
import { UseFormReturn } from "react-hook-form";
import { ChevronLeft, Plus } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { FileInput } from "@/components/ui/file-input";
import { ProfessionType } from "@/common/constants/enum";
import { INewQRTypeFormSchema, professionLabels } from "@/lib/schemas/qrTypeFormSchema";

interface QRTypeMediaInputsProps {
    form: UseFormReturn<INewQRTypeFormSchema>;
    onPrev: () => void;
}

export function QRTypeMediaInputs({ form, onPrev }: QRTypeMediaInputsProps) {
    const formState = form.formState;
    console.log("Form errors:", formState.errors);
    console.log("Form is valid:", formState.isValid);
    console.log("Form values:", form.getValues());
    const watchProfessionBased = form.watch("professionBased");
    const watchProfessionsAllowed = form.watch("professionsAllowed");
    const loading = formState.isSubmitting;

    const handleProfessionToggle = (professionType: ProfessionType, checked: boolean) => {
        const currentProfessions = form.getValues("professionsAllowed") || [];

        if (checked) {
            if (!currentProfessions.some((p) => p.name === professionType)) {
                form.setValue("professionsAllowed", [
                    ...currentProfessions,
                    { name: professionType, logoUrl: undefined },
                ]);
            }
        } else {
            form.setValue(
                "professionsAllowed",
                currentProfessions.filter((p) => p.name !== professionType)
            );
        }
    };

    return (
        <div className="w-full max-w-none space-y-6">
            <div className="w-full space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Files & Configuration</h3>

                <FormField
                    control={form.control}
                    name="qrBackgroundImage"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className="text-sm font-medium text-gray-700">QR Background Image</FormLabel>
                            <FormControl>
                                <div className="w-full">
                                    <FileInput
                                        value={field.value}
                                        onChange={(file) => field.onChange(file)}
                                        acceptedFileTypes=".jpeg,.jpg,.png"
                                        maxFileSizeMB={5}
                                        className="w-full"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="qrIcon"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className="text-sm font-medium text-gray-700">QR Icon</FormLabel>
                            <FormControl>
                                <div className="w-full">
                                    <FileInput
                                        value={field.value}
                                        onChange={(file) => field.onChange(file)}
                                        acceptedFileTypes=".jpeg,.jpg,.png"
                                        maxFileSizeMB={5}
                                        className="w-full"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="productImage"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className="text-sm font-medium text-gray-700">Product Image</FormLabel>
                            <FormControl>
                                <div className="w-full">
                                    <FileInput
                                        value={field.value}
                                        onChange={(file) => field.onChange(file)}
                                        acceptedFileTypes=".jpeg,.jpg,.png"
                                        maxFileSizeMB={5}
                                        className="w-full"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="pdfTemplate"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel className="text-sm font-medium text-gray-700">PDF Template</FormLabel>
                            <FormControl>
                                <div className="w-full">
                                    <FileInput
                                        value={field.value}
                                        onChange={(file) => field.onChange(file)}
                                        acceptedFileTypes=".pdf"
                                        maxFileSizeMB={5}
                                        className="w-full"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Professional Settings</h3>

                <FormField
                    control={form.control}
                    name="professionBased"
                    render={({ field }) => (
                        <FormItem className="flex w-full items-center justify-between rounded-lg bg-gray-50 p-4">
                            <div className="flex-1">
                                <FormLabel className="text-sm font-medium text-gray-700">Profession Based</FormLabel>
                                <p className="text-xs text-gray-500">Enable profession-specific features</p>
                            </div>
                            <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {watchProfessionBased && (
                    <div className="w-full space-y-4 rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
                        <h4 className="text-md font-medium text-blue-900">Select Professions</h4>
                        <div className="space-y-3">
                            {Object.values(ProfessionType).map((profession) => (
                                <div key={profession} className="flex w-full items-center space-x-3">
                                    <Checkbox
                                        id={profession}
                                        checked={watchProfessionsAllowed?.some((p) => p.name === profession) || false}
                                        onCheckedChange={(checked) =>
                                            handleProfessionToggle(profession, checked as boolean)
                                        }
                                    />
                                    <label
                                        htmlFor={profession}
                                        className="flex-1 cursor-pointer text-sm font-medium text-gray-700"
                                    >
                                        {professionLabels[profession]}
                                    </label>
                                </div>
                            ))}
                        </div>

                        {watchProfessionsAllowed && watchProfessionsAllowed.length > 0 && (
                            <div className="mt-4 space-y-4">
                                <h5 className="text-sm font-medium text-blue-800">Upload Profession Logos</h5>
                                {watchProfessionsAllowed.map((professionEntry, index) => (
                                    <FormField
                                        key={professionEntry.name}
                                        control={form.control}
                                        name={`professionsAllowed.${index}.logoUrl`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-sm font-medium text-gray-700">
                                                    {professionLabels[professionEntry.name]} Logo
                                                </FormLabel>
                                                <FormControl>
                                                    <FileInput
                                                        value={field.value as File | undefined}
                                                        onChange={(file) => field.onChange(file)}
                                                        acceptedFileTypes=".jpeg,.jpg,.png"
                                                        maxFileSizeMB={2}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex w-full space-x-3">
                <Button type="button" onClick={onPrev} variant="outline" className="flex-1 py-6">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Previous
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-purple-400 to-blue-600 py-6 text-white hover:from-green-700 hover:to-blue-700"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Create QR Type
                </Button>
            </div>
        </div>
    );
}
