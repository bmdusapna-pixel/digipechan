"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";

import { DeliveryType, qrFormatType } from "@/common/constants/enum";
import { INewQRTypeFormSchema, newQRTypeFormSchema } from "@/lib/schemas/qrTypeFormSchema";
import { QRTypeBasicInputs } from "./QRTypeBasicInputs";
import { QRTypeMediaInputs } from "./QRTypeMediaInputs";
import { createNewQRTypeAPI } from "@/lib/api/qr/createNewQRTypeAPI";
import { toast } from "sonner";

export function CreateNewQRTypeForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 2;

    const form = useForm<INewQRTypeFormSchema>({
        resolver: zodResolver(newQRTypeFormSchema),
        defaultValues: {
            qrName: "",
            qrDescription: "",
            qrUseCases: [],
            originalPrice: 0,
            discountedPrice: 0,
            includeGST: false,
            professionBased: false,
            professionsAllowed: [],
            qrFormatType: qrFormatType.SQUARE,
            deliveryType: [DeliveryType.ETAG],
            stockCount: 0,
        },
    });

    const onSubmit = async (values: INewQRTypeFormSchema) => {
        console.log("Form submitted with data:", values);

        // Add client-side validation logging
        const validation = newQRTypeFormSchema.safeParse(values);
        if (!validation.success) {
            console.error("Client-side validation failed:", validation.error.errors);
            toast.error("Form validation failed. Check console for details.");
            return;
        }

        try {
            await createNewQRTypeAPI(values);
            toast.success("Successfully created QR.")
            window.location.href = "/shop";
        } catch (error) {
            console.error("Submission error:", error);
            toast.error("There is something wrong.")
        }
    };

    const nextStep = async () => {
        const fieldsToValidateStep1: Array<keyof INewQRTypeFormSchema> = [
            "qrName",
            "qrDescription",
            "qrUseCases",
            "originalPrice",
            "discountedPrice",
        ];

        const isValid = await form.trigger(fieldsToValidateStep1);

        if (isValid) {
            setCurrentStep(2);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <Card className="border-0 bg-white/80 shadow-xl backdrop-blur-sm">
            <CardHeader className="pb-6 text-center">
                <CardTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-2xl font-bold text-transparent">
                    Create New QR Type
                </CardTitle>

                <p className="mt-2 text-sm text-gray-600">
                    Step {currentStep} of {totalSteps}
                </p>
            </CardHeader>

            <CardContent className="mx-0 space-y-6">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {currentStep === 1 && <QRTypeBasicInputs form={form} onNext={nextStep} />}

                        {currentStep === 2 && <QRTypeMediaInputs form={form} onPrev={prevStep} />}
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
