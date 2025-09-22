import { apiRequest } from '@/common/utils/apiClient';
import { API_ENDPOINTS } from '@/common/constants/apiEndpoints';
import { 
  IPaymentTicket, 
  ICreatePaymentTicketRequest, 
  IUpdatePaymentTicketStatusRequest,
  IPaymentTicketWithDetails 
} from '@/types/paymentTicket.types';

// Create payment ticket (Salesperson)
export const createPaymentTicket = async (data: ICreatePaymentTicketRequest, file?: File): Promise<IPaymentTicket> => {
  let requestData: ICreatePaymentTicketRequest | FormData;
  
  if (file) {
    // If file is present, send as FormData
    const formData = new FormData();
    
    // Add all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'qrIds') {
        // Handle array of QR IDs
        (value as string[]).forEach(qrId => {
          formData.append('qrIds[]', qrId);
        });
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    
    // Add file
    formData.append('paymentProof', file);
    
    requestData = formData;
  } else {
    // If no file, send as JSON
    requestData = data;
  }
  
  const result = await apiRequest<IPaymentTicket>(
    'POST',
    API_ENDPOINTS.createPaymentTicket,
    requestData
  );
  if (!result) throw new Error('Failed to create payment ticket');
  return result;
};

// Get salesperson's payment tickets
export const getSalespersonTickets = async (status?: string): Promise<IPaymentTicketWithDetails[]> => {
  const url = status 
    ? `${API_ENDPOINTS.getSalespersonTickets}?status=${status}`
    : API_ENDPOINTS.getSalespersonTickets;
  
  const result = await apiRequest<IPaymentTicketWithDetails[]>(
    'GET',
    url
  );
  return result || [];
};

// Get all payment tickets (Admin)
export const getAllPaymentTickets = async (status?: string): Promise<IPaymentTicketWithDetails[]> => {
  const url = status 
    ? `${API_ENDPOINTS.getAllPaymentTickets}?status=${status}`
    : API_ENDPOINTS.getAllPaymentTickets;
  
  const result = await apiRequest<IPaymentTicketWithDetails[]>(
    'GET',
    url
  );
  return result || [];
};

// Update payment ticket status (Admin)
export const updatePaymentTicketStatus = async (
  ticketId: string, 
  data: IUpdatePaymentTicketStatusRequest
): Promise<IPaymentTicketWithDetails> => {
  const result = await apiRequest<IPaymentTicketWithDetails>(
    'PUT',
    API_ENDPOINTS.updatePaymentTicketStatus(ticketId),
    data
  );
  if (!result) throw new Error('Failed to update payment ticket status');
  return result;
};
