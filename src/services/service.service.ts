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
  shortDescription?: string;
  prerequisites?: string;
  postInstructions?: string;
  featured?: boolean;
  location?: "online" | "office";
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
  async getById(id: string) {
    try {
      const response = await axios.get<Service>(buildApiUrl(API_ENDPOINTS.SERVICES.BY_ID(id)));
      console.log("[APIService] getById raw response:", response); // Added log
      return response.data; // Return the actual service data
    } catch (error) {
      console.error("[APIService] Error in getById:", error); // Added error log
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
