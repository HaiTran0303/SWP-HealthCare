import { apiClient } from "./api";
import { APIService, Service } from "./service.service";

export interface RawPackageService {
  id: string;
  packageId: string; // Reverted to required
  serviceId: string; // Reverted to required
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

    const enrichmentPromises = rawPackageServices.map(async (rawPs: any) => { // Use any for rawPs here to handle inconsistent API response
      let serviceIdToUse = rawPs.serviceId || rawPs.service?.id;
      let packageIdToUse = rawPs.packageId || rawPs.package?.id;

      if (!serviceIdToUse || !packageIdToUse) {
        console.warn(`[PackageServiceService] Skipping raw package service due to missing serviceId or packageId after checking all possible fields:`, rawPs);
        return null; // Return null for invalid entries
      }

      let service: Service;
      let packageInfo: EnrichedServicePackage;

      // Check if service object is already present and complete
      if (rawPs.service && rawPs.service.id === serviceIdToUse && rawPs.service.name) {
        service = rawPs.service;
      } else {
        try {
          service = await APIService.getById(serviceIdToUse);
        } catch (error) {
          console.error(`[PackageServiceService] Failed to fetch service ${serviceIdToUse}:`, error);
          return null;
        }
      }

      // Check if package object is already present and complete
      if (rawPs.package && rawPs.package.id === packageIdToUse && rawPs.package.name) {
        packageInfo = rawPs.package;
      } else {
        try {
          packageInfo = await apiClient.get<EnrichedServicePackage>(`/service-packages/${packageIdToUse}`);
        } catch (error) {
          console.error(`[PackageServiceService] Failed to fetch package ${packageIdToUse}:`, error);
          return null;
        }
      }

      return {
        ...rawPs,
        serviceId: serviceIdToUse, // Ensure these are set on the returned object
        packageId: packageIdToUse, // Ensure these are set on the returned object
        service: service,
        package: packageInfo,
      } as EnrichedPackageService;
    });

    const results = await Promise.all(enrichmentPromises); // Use Promise.all
    const enrichedServices: EnrichedPackageService[] = results.filter(
      (result): result is EnrichedPackageService => result !== null
    );

    return enrichedServices;
  },
  async getById(id: string): Promise<EnrichedPackageService> {
    const rawPs: any = await apiClient.get<RawPackageService>(`/package-services/${id}`); // Use any here
    if (!rawPs) {
      console.warn(`[PackageServiceService] Raw package service with ID ${id} not found.`);
      throw new Error(`Package service with ID ${id} not found.`);
    }

    let serviceIdToUse = rawPs.serviceId || rawPs.service?.id;
    let packageIdToUse = rawPs.packageId || rawPs.package?.id;

    if (!serviceIdToUse) {
      const errorMessage = `serviceId is missing for raw package service ${rawPs.id}`;
      console.warn(`[PackageServiceService] ${errorMessage}`);
      throw new Error(errorMessage);
    }
    if (!packageIdToUse) {
      const errorMessage = `packageId is missing for raw package service ${rawPs.id}`;
      console.warn(`[PackageServiceService] ${errorMessage}`);
      throw new Error(errorMessage);
    }

    let service: Service;
    let packageInfo: EnrichedServicePackage;

    if (rawPs.service && rawPs.service.id === serviceIdToUse && rawPs.service.name) {
      service = rawPs.service;
    } else {
      try {
        service = await APIService.getById(serviceIdToUse);
      } catch (error) {
        console.error(`Failed to fetch service ${serviceIdToUse} for single package service ${rawPs.id}:`, error);
        throw error;
      }
    }

    if (rawPs.package && rawPs.package.id === packageIdToUse && rawPs.package.name) {
      packageInfo = rawPs.package;
    } else {
      try {
        packageInfo = await apiClient.get<EnrichedServicePackage>(`/service-packages/${packageIdToUse}`);
      } catch (error) {
        console.error(`Failed to fetch package ${packageIdToUse} for single package service ${rawPs.id}:`, error);
        throw error;
      }
    }

    return {
      ...rawPs,
      serviceId: serviceIdToUse,
      packageId: packageIdToUse,
      service: service,
      package: packageInfo,
    } as EnrichedPackageService;
  },
};
