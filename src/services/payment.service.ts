import { apiClient } from "@/services/api";
import { API_ENDPOINTS } from "@/config/api";
import { PaymentListResponse, PaymentGetAllParams } from "@/types/payment";

export const PaymentService = {
  getAll: async (params?: PaymentGetAllParams): Promise<PaymentListResponse> => {
    try {
      const response = await apiClient.get<PaymentListResponse>(API_ENDPOINTS.PAYMENTS.GET_ALL, { params });
      return response;
    } catch (error) {
      console.error("Error fetching payments:", error);
      throw error;
    }
  },

  // Add other payment-related service methods here (e.g., getById, updateStatus)
};
