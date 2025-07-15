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
    console.log("[PackageServiceService] Raw package services (before enrichment):", rawPackageServices); // Log raw data for debugging

    const results = await Promise.allSettled(
      rawPackageServices.map(async (rawPs) => {
        if (!rawPs.serviceId) {
          // Log the specific rawPs that is missing serviceId
          console.error(`[PackageServiceService] Missing serviceId in raw package service:`, rawPs);
          throw new Error(`serviceId is missing for raw package service ${rawPs.id}`);
        }
        if (!rawPs.packageId) {
          throw new Error(`packageId is missing for raw package service ${rawPs.id}`);
        }

        try {
          const service = await APIService.getById(rawPs.serviceId);
          const packageInfo = await apiClient.get<EnrichedServicePackage>(`/service-packages/${rawPs.packageId}`);

          return {
            ...rawPs,
            service: service,
            package: packageInfo,
          };
        } catch (error) {
          console.error(`Failed to enrich package service ${rawPs.id}:`, error);
          throw error; // Re-throw to be caught by Promise.allSettled
        }
      })
    );

    const enrichedServices: EnrichedPackageService[] = [];
    results.forEach((result) => {
      if (result.status === "fulfilled") {
        enrichedServices.push(result.value);
      } else {
        // Log rejected promises
        console.warn(`[PackageServiceService] Failed to enrich one or more package services:`, result.reason);
      }
    });

    return enrichedServices;
  },
  async getById(id: string): Promise<EnrichedPackageService> {
    const rawPs = await apiClient.get<RawPackageService>(`/package-services/${id}`);
    if (!rawPs) {
      console.warn(`[PackageServiceService] Raw package service with ID ${id} not found.`);
      throw new Error(`Package service with ID ${id} not found.`);
    }

    // Ensure serviceId and packageId exist before attempting to fetch
    if (!rawPs.serviceId) {
      const errorMessage = `serviceId is missing for raw package service ${rawPs.id}`;
      console.warn(`[PackageServiceService] ${errorMessage}`);
      throw new Error(errorMessage);
    }
    if (!rawPs.packageId) {
      const errorMessage = `packageId is missing for raw package service ${rawPs.id}`;
      console.warn(`[PackageServiceService] ${errorMessage}`);
      throw new Error(errorMessage);
    }

    try {
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
