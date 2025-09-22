import { INewQRTypeFormSchema } from "@/lib/schemas/qrTypeFormSchema";

export function formatNewQRPayload(values: INewQRTypeFormSchema): FormData {
    const formData = new FormData();

    formData.append("qrName", values.qrName);
    formData.append("qrDescription", values.qrDescription);
    formData.append("originalPrice", values.originalPrice.toString());
    formData.append("discountedPrice", values.discountedPrice.toString());

    formData.append("includeGST", (values.includeGST ?? false).toString());
    formData.append("professionBased", (values.professionBased ?? false).toString());

    if (values.qrFormatType) {
        formData.append("qrFormatType", values.qrFormatType);
    }

    if (values.stockCount !== undefined && values.stockCount !== null) {
        formData.append("stockCount", values.stockCount.toString());
    }

    if (values.qrUseCases && values.qrUseCases.length > 0) {
        formData.append("qrUseCases", JSON.stringify(values.qrUseCases));
    }

    if (values.deliveryType && values.deliveryType.length > 0) {
        formData.append("deliveryType", JSON.stringify(values.deliveryType));
    }

    // Files
    if (values.qrBackgroundImage && values.qrBackgroundImage instanceof File) {
        formData.append("qrBackgroundImage", values.qrBackgroundImage);
    }

    if (values.qrIcon && values.qrIcon instanceof File) {
        formData.append("qrIcon", values.qrIcon);
    }

    if (values.productImage && values.productImage instanceof File) {
        formData.append("productImage", values.productImage);
    }

    if (values.pdfTemplate && values.pdfTemplate instanceof File) {
        formData.append("pdfTemplate", values.pdfTemplate);
    }

    // Profession-based logic
    if (values.professionBased && values.professionsAllowed?.length) {
        // Remove the file from the professions array just keeping the name
        const professionsForJson = values.professionsAllowed.map(({ name }) => ({ name }));
        formData.append("professionsAllowed", JSON.stringify(professionsForJson));

        // Add logo files separately
        values.professionsAllowed.forEach(({ name, logoUrl }) => {
            if (logoUrl && logoUrl instanceof File) {
                formData.append(`logo_${name}`, logoUrl);
            }
        });
    }

    return formData;
}
