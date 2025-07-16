import axios from "axios"; // Import Axios
import { API_ENDPOINTS, buildApiUrl } from "@/config/api";

export interface Service {
  id: string;
  name: string;
  description: string;
  htmlDescription?: string;
  price: number | null;
  duration: number;
  categoryId: string;
  requiresConsultant: boolean;
  imageUrl?: string;
  shortDescription?: string;
  prerequisites?: string;
  postInstructions?: string;
  featured?: boolean;
  location?: "online" | "office";
  type?: string; // Added type property
}

export const APIService = {
  async getAll(params: Record<string, any> = {}): Promise<Service[]> {
    const query = new URLSearchParams(params).toString();
    const endpoint = `${API_ENDPOINTS.SERVICES.BASE}${query ? `?${query}` : ""}`;
    const response = await axios.get<any>(buildApiUrl(endpoint));
    console.log("[APIService] getAll raw response:", response); // Added log
    const resultData = response.data?.data?.data || response.data?.data || response.data;
    console.log("[APIService] getAll processed data:", resultData); // Added log
    return Array.isArray(resultData) ? resultData : [];
  },
  async getById(id: string): Promise<Service> { // Added return type
    try {
      const response = await axios.get<any>(buildApiUrl(API_ENDPOINTS.SERVICES.BY_ID(id))); // Changed generic type to any
      console.log("[APIService] getById response.data:", response.data); // Log response.data explicitly
      return response.data.data; // Return the actual service data nested inside 'data'
    } catch (error) {
      console.error("[APIService] Error in getById:", error);
      throw error;
    }
  },
  async getStiServices(): Promise<Service[]> {
    const url = buildApiUrl(API_ENDPOINTS.SERVICES.STI);
    console.log("[APIService] Fetching STI services from URL:", url);
    try {
      const response = await axios.get<any>(url);
      console.log("[APIService] getStiServices raw response:", response);
      const data = response.data && Array.isArray(response.data.data) ? response.data.data : (Array.isArray(response.data) ? response.data : []);
      console.log("[APIService] getStiServices processed data:", data);
      return data;
    } catch (error) {
      console.error("[APIService] Error in getStiServices:", error); // Added error log
      throw error;
    }
  },
};
