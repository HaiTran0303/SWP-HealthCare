import { apiClient } from "./api";
export const PackageServiceService = {
  async getAll() {
    return apiClient.get("/package-services");
  },
  async getById(id: string) {
    return apiClient.get(`/package-services/${id}`);
  },
};
