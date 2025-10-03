import { apiRequest } from "@/common/utils/apiClient";
import { API_METHODS } from "@/common/constants/apiMethods";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";

export type SalesmanBundle = {
  bundleId: string;
  qrTypeId?: { qrName?: string };
  qrCount: number;
  createdAt: string;
  deliveryType?: string;
  pricePerQr?: number | null;
};
export type SalesmanQR = {
  _id: string;
  serialNumber: string;
  qrStatus: string;
  qrUrl: string;
  createdFor?: string | null;
  price?: number;
  isSold?: boolean;
  soldBySalesperson?: string;
  qrTypeId?: {
    _id?: string;
    qrName?: string;
    qrDescription?: string;
  };
};

export const getBundleQrs = (
  bundleId: string,
  headers?: Record<string, string>
) =>
  apiRequest<{
    bundle: {
      bundleId: string;
      qrCount: number;
      qrTypeName: unknown;
      deliveryType?: string;
      pricePerQr?: number | null;
    };
    qrs: SalesmanQR[];
  }>(API_METHODS.GET, API_ENDPOINTS.adminBundleQrs(bundleId), {}, {}, headers);
