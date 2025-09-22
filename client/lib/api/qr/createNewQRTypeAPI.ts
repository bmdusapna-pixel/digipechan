import { formatNewQRPayload } from "@/common/helpers/formData/formatNewQRPayload";
import { apiRequest } from "@/common/utils/apiClient";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { INewQRType } from "@/types/newQRType.types";
import { INewQRTypeFormSchema } from "@/lib/schemas/qrTypeFormSchema";

export const createNewQRTypeAPI = async (data: INewQRTypeFormSchema) => {
    const formData = formatNewQRPayload(data);

    // ------ Display the formdata for debugging ------
    // console.log("Formatted FormData:");
    // for (const [key, value] of formData.entries()) {
    //     if (value instanceof File) {
    //         console.log(key, `File: ${value.name} (${value.size} bytes, ${value.type})`);
    //     } else {
    //         console.log(key, value);
    //     }
    // }

    try {
        const res = await apiRequest<INewQRType>(API_METHODS.POST, API_ENDPOINTS.create_new_qr_type, formData);
        return res;
    } catch (error) {
        console.error("Error creating QR type:", error);
        throw error;
    }
};
