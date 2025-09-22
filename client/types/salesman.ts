import { apiRequest } from "@/common/utils/apiClient";
import { API_METHODS } from "@/common/constants/apiMethods";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";

// Minimal response types (refine later as needed)
export type SalesmanStats = {
  inventory?: { totalBundles?: number; availableQRs?: number; soldQRs?: number };
};
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

// FIX: use the correct endpoint keys added in apiEndpoints.ts
export const getSalesmanStats = (headers?: Record<string, string>) =>
  apiRequest<SalesmanStats>(API_METHODS.GET, API_ENDPOINTS.salesmanStats, {}, {}, headers);

export const getAssignedBundles = (headers?: Record<string, string>) =>
  apiRequest<SalesmanBundle[]>(API_METHODS.GET, API_ENDPOINTS.salesmanBundles, {}, {}, headers);

// FIX: use salesmanBundleQrs(bundleId)
export const getBundleQrs = (bundleId: string, headers?: Record<string, string>) =>
  apiRequest<{ 
    bundle: {
      bundleId: string;
      qrCount: number;
      qrTypeName: unknown;
      deliveryType?: string;
      pricePerQr?: number | null;
    };
    qrs: SalesmanQR[] 
  }>(
    API_METHODS.GET,
    API_ENDPOINTS.salesmanBundleQrs(bundleId),
    {},
    {},
    headers
  );

export const getSoldQrs = (status: string | undefined, headers?: Record<string, string>) =>
  apiRequest<{ qrs: SalesmanQR[] }>(
    API_METHODS.GET,
    API_ENDPOINTS.salesmanSoldQrs(status),
    {},
    {},
    headers
  );