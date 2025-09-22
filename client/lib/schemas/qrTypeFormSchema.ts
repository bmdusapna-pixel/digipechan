import { z } from "zod";
import { DeliveryType, ProfessionType, qrFormatType } from "@/common/constants/enum";

export const professionLabels = {
    [ProfessionType.DOCTOR]: "Doctor",
    [ProfessionType.LAWYER]: "Lawyer",
};

const fileValidation = z.any().refine((file) => !file || file instanceof File, { message: "Must be a valid file" });

export const professionEntrySchema = z.object({
    name: z.nativeEnum(ProfessionType),
    logoUrl: z.union([z.instanceof(File), z.undefined(), z.null()]).optional(),
});

export const newQRTypeFormSchema = z.object({
    qrName: z
        .string()
        .min(3, "QR name must be at least 3 characters")
        .max(100, "Name cannot be more than 100 characters long"),
    qrDescription: z.string().min(10, "Description is too short"),
    qrUseCases: z.array(z.string().min(1, "Use case cannot be empty")).min(1, "At least one use case is required"),
    originalPrice: z.coerce.number().nonnegative("Price must be 0 or more"),
    discountedPrice: z.coerce.number().nonnegative("Discounted price must be 0 or more"),
    includeGST: z.boolean().optional(),

    professionBased: z.boolean().optional(),
    professionsAllowed: z.array(professionEntrySchema).optional(),

    qrBackgroundImage: fileValidation.optional(),
    qrIcon: fileValidation.optional(),
    productImage: fileValidation.optional(),
    pdfTemplate: fileValidation.optional(),

    qrFormatType: z.nativeEnum(qrFormatType).optional(),

    deliveryType: z.array(z.nativeEnum(DeliveryType)).min(1, "At least one delivery type must be selected."),
    stockCount: z.coerce.number().int().min(0).optional(),
});

export type INewQRTypeFormSchema = z.infer<typeof newQRTypeFormSchema>;
export type IProfessionEntrySchema = z.infer<typeof professionEntrySchema>;
