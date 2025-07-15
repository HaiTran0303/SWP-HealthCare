import { apiClient } from "./api";
import { APIService, Service } from "./service.service";

export interface RawPackageService {
  id: string;
  packageId: string;
  serviceId: string;
  quantityLimit: number;
  discountPercentage: number;
}

export interface EnrichedServicePackage {
  id: string;
  name: string;
  price: number;
  durationMonths: number;
  maxServicesPerMonth?: number;
  isActive: boolean;
}

export interface EnrichedPackageService extends RawPackageService {
  service: Service;
  package: EnrichedServicePackage;
}

export const PackageServiceService = {
  async getAll(): Promise<EnrichedPackageService[]> {
    const rawPackageServices = await apiClient.get<RawPackageService[]>("/package-services");
    console.log("[PackageServiceService] Raw package services:", rawPackageServices); // Added log

    const enrichedServices: EnrichedPackageService[] = [];

    // Use Promise.all to fetch all service and package details concurrently
    const promises = rawPackageServices.map(async (rawPs) => {
      try {
        const service = await APIService.getById(rawPs.serviceId); // Directly get the service object
        const packageInfo = await apiClient.get<EnrichedServicePackage>(`/service-packages/${rawPs.packageId}`); // Directly get the package object

        return {
          ...rawPs,
          service: service,
          package: packageInfo,
        };
      } catch (error) {
        console.error(`Failed to enrich package service ${rawPs.id}:`, error);
        return null; // Return null for failed enrichments
      }
    });

    const results = await Promise.all(promises);
    return results.filter(Boolean) as EnrichedPackageService[]; // Filter out nulls
  },
  async getById(id: string) {
    // This function might also need enrichment if it's used to display details
    const rawPs = await apiClient.get<RawPackageService>(`/package-services/${id}`);
    if (!rawPs) {
      console.warn(`[PackageServiceService] Raw package service with ID ${id} not found.`);
      throw new Error(`Package service with ID ${id} not found.`);
    }
    try {
      // Ensure serviceId and packageId exist before attempting to fetch
      if (!rawPs.serviceId) {
        console.warn(`[PackageServiceService] serviceId is undefined for raw package service ${rawPs.id}. Skipping service enrichment.`);
        // Optionally, return a partially enriched object or throw an error
        throw new Error(`serviceId is missing for package service ${rawPs.id}`);
      }
      if (!rawPs.packageId) {
        console.warn(`[PackageServiceService] packageId is undefined for raw package service ${rawPs.id}. Skipping package enrichment.`);
        // Optionally, return a partially enriched object or throw an error
        throw new Error(`packageId is missing for package service ${rawPs.id}`);
      }

      const service = await APIService.getById(rawPs.serviceId);
      const packageInfo = await apiClient.get<EnrichedServicePackage>(`/service-packages/${rawPs.packageId}`);

      return {
        ...rawPs,
        service: service,
        package: packageInfo,
      } as EnrichedPackageService;
    } catch (error) {
      console.error(`Failed to enrich single package service ${rawPs.id}:`, error);
      throw error;
    }
  },
};
