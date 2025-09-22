import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";
import { API_METHODS } from "@/common/constants/apiMethods";
import { IPaymentTransaction } from "@/types/payment.types";

export const fetchPaymentStatus = async (
  id: string,
  key: "transactionId" | "client_txn_id" = "transactionId"
) => {
  try {
    const response = await fetch(`${API_ENDPOINTS.fetchPaymentStatus}?${key}=${id}`, {
      method: API_METHODS.GET,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const responseBody = await response.json();
    
    if (!responseBody.SUCCESS) {
      throw new Error(responseBody.MESSAGE || responseBody.ERROR || "Something went wrong.");
    }

    return responseBody.DATA as IPaymentTransaction;
  } catch (error) {
    console.error("Error fetching transaction:", error);
    throw error;
  }
};