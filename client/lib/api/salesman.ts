import { apiRequest } from '@/common/utils/apiClient';
import { API_ENDPOINTS } from '@/common/constants/apiEndpoints';

// Get salesman statistics
export const getSalesmanStats = async () => {
  return apiRequest<any>({
    url: API_ENDPOINTS.salesmanStats,
    method: 'GET',
  });
};

// Get salesman assigned bundles
export const getSalesmanBundles = async () => {
  return apiRequest<any[]>({
    url: API_ENDPOINTS.salesmanBundles,
    method: 'GET',
  });
};

// Get QRs in a specific bundle
export const getBundleQRs = async (bundleId: string) => {
  return apiRequest<any>({
    url: API_ENDPOINTS.salesmanBundleQrs(bundleId),
    method: 'GET',
  });
};

// Get sold QRs for salesman
export const getSoldQrsForSalesman = async (status?: string) => {
  const url = status 
    ? `${API_ENDPOINTS.salesmanSoldQrs}?status=${status}`
    : API_ENDPOINTS.salesmanSoldQrs;
  
  return apiRequest<any[]>({
    url,
    method: 'GET',
  });
};
