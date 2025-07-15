import axios from "axios"; // Import Axios
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  categoryId: string;
  requiresConsultant: boolean;
  imageUrl?: string; 
}

export const APIService = {
  async getAll(params: Record<string, any> = {}): Promise<Service[]> {
    const query = new URLSearchParams(params).toString();
    const endpoint = `${API_ENDPOINTS.SERVICES.BASE}${query ? `?${query}` : ""}`;
    const response = await axios.get<any>(buildApiUrl(endpoint)); // Use axios.get
    // Ensure response is always an array, handling cases where API might return { data: [...] }
    return response.data && Array.isArray(response.data) ? response.data : (Array.isArray(response) ? response : []);
  },
  async getById(id: string) {
    return axios.get<Service>(buildApiUrl(API_ENDPOINTS.SERVICES.BY_ID(id))); // Use axios.get
  },
  async getStiServices(): Promise<Service[]> { // New function to get STI services
    const url = buildApiUrl(API_ENDPOINTS.SERVICES.STI);
    console.log("[APIService] Fetching STI services from URL:", url); // Log the full URL
    const response = await axios.get<any>(url);
    console.log("[APIService] getStiServices raw response:", response); // Log raw response
    const data = response.data && Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []); // Access response.data.data
    console.log("[APIService] getStiServices processed data:", data); // Log processed data
    return data;
  },
};
