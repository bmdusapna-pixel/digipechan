import { apiRequest } from "@/common/utils/apiClient";
import { API_ENDPOINTS } from "@/common/constants/apiEndpoints";

export const upsertQrTypeQuestions = (qrTypeId: string, questions: string[]) =>
  apiRequest("POST", API_ENDPOINTS.upsertQuestions, { qrTypeId, questions });

export const fetchScanQuestions = (qrId: string) =>
  apiRequest<{ questions: string[] }>("GET", API_ENDPOINTS.scanQuestions(qrId));

export const fetchTypeQuestions = (qrTypeId: string) =>
  apiRequest<string[]>("POST", API_ENDPOINTS.getTypeQuestions, { qrTypeId });


