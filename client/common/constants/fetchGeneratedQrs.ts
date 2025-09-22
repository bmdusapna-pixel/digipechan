import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { apiRequest } from "@/common/utils/apiClient";
import { IQR } from "@/types/qr.types";

export const fetchGeneratedQrs = async (createdFor: string) => {
  try {
    const res = await apiRequest<IQR[]>(
      API_METHODS.GET,
      `${API_ENDPOINTS.fetchGeneratedQrs}?createdFor=${createdFor}`
    );
    return res;
  } catch (error) {
    console.error("Error fetching generated QRs", error);
    throw error;
  }
};
