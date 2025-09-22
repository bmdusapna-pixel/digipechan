import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { apiRequest } from "@/common/utils/apiClient";
import { IPaymentTransaction } from "@/types/payment.types";

export const initiatePayment = async (data: IPaymentTransaction) => {
  try {
    const res = await apiRequest<string>(
      API_METHODS.POST,
      API_ENDPOINTS.initiatePayment,
      data
    )
    return res
  } catch (error) {
    console.log("Error while initiating payment: ", error);
    throw error;
  }
}
