import {
  Building,
  Apartment,
  Flat,
  Land,
  Tenant,
  PropertyType,
  BaseProperty,
  RentPayment,
  MaintenanceRecord,
} from "@/types";
import { ApiService } from "./ApiService";

/**
 * PropertyService - Handles all property management operations for the hierarchical property system
 * Manages Buildings, Apartments, Flats, Lands, and Tenants with Supabase database persistence
 */
export class PropertyService {
  constructor() {
    // No longer using localStorage - using ApiService (Supabase) instead
  }

  // Now using ApiService (Supabase) for all data operations

  // Building CRUD Operations - Now using ApiService (Supabase)
  public async getBuildings(): Promise<Building[]> {
    try {
      return await ApiService.getBuildings();
    } catch (error) {
      console.error("PropertyService.getBuildings error:", error);
      throw new Error(`Failed to fetch buildings: ${error.message}`);
    }
  }

  public async getBuildingById(id: string): Promise<Building | null> {
    try {
      return await ApiService.getBuildingById(id);
    } catch (error) {
      console.error("PropertyService.getBuildingById error:", error);
      throw new Error(`Failed to fetch building: ${error.message}`);
    }
  }

  public async saveBuilding(
    building: Omit<
      Building,
      "id" | "createdAt" | "updatedAt" | "apartments" | "documents"
    >
  ): Promise<Building> {
    try {
      this.validateBuildingData(building);
      return await ApiService.createBuilding(building);
    } catch (error) {
      console.error("PropertyService.saveBuilding error:", error);
      throw new Error(`Failed to create building: ${error.message}`);
    }
  }

  public async updateBuilding(
    id: string,
    updates: Partial<Building>
  ): Promise<Building> {
    try {
      if (updates.name || updates.buildingCode || updates.address) {
        this.validateBuildingData(updates as unknown);
      }
      return await ApiService.updateBuilding(id, updates);
    } catch (error) {
      console.error("PropertyService.updateBuilding error:", error);
      throw new Error(`Failed to update building: ${error.message}`);
    }
  }

  public async deleteBuilding(id: string): Promise<void> {
    try {
      await ApiService.deleteBuilding(id);
    } catch (error) {
      console.error("PropertyService.deleteBuilding error:", error);
      throw new Error(`Failed to delete building: ${error.message}`);
    }
  }

  private validateBuildingData(building: Partial<Building>): void {
    if (building.name && !building.name.trim()) {
      throw new Error("Building name is required");
    }
    if (building.buildingCode && !building.buildingCode.trim()) {
      throw new Error("Building code is required");
    }
    if (building.address && !building.address.trim()) {
      throw new Error("Building address is required");
    }
    if (building.totalFloors !== undefined && building.totalFloors < 1) {
      throw new Error("Total floors must be at least 1");
    }
    if (
      building.totalApartments !== undefined &&
      building.totalApartments < 1
    ) {
      throw new Error("Total apartments must be at least 1");
    }
  }

  // Apartment Operations (within buildings) - Now using ApiService
  public async getApartmentsByBuildingId(
    buildingId: string
  ): Promise<Apartment[]> {
    try {
      return await ApiService.getApartmentsByBuildingId(buildingId);
    } catch (error) {
      console.error("PropertyService.getApartmentsByBuildingId error:", error);
      throw new Error(`Failed to fetch apartments: ${error.message}`);
    }
  }

  public async getApartmentById(
    apartmentId: string
  ): Promise<Apartment | null> {
    try {
      return await ApiService.getApartmentById(apartmentId);
    } catch (error) {
      console.error("PropertyService.getApartmentById error:", error);
      throw new Error(`Failed to fetch apartment: ${error.message}`);
    }
  }

  public async addApartmentToBuilding(
    buildingId: string,
    apartmentData: Omit<
      Apartment,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "currentTenant"
      | "rentHistory"
      | "maintenanceRecords"
      | "documents"
    >
  ): Promise<Apartment> {
    try {
      this.validateApartmentData(apartmentData);
      const apartment = { ...apartmentData, buildingId };
      return await ApiService.createApartment(apartment);
    } catch (error) {
      console.error("PropertyService.addApartmentToBuilding error:", error);
      throw new Error(`Failed to create apartment: ${error.message}`);
    }
  }

  public async updateApartment(
    apartmentId: string,
    updates: Partial<Apartment>
  ): Promise<Apartment> {
    try {
      return await ApiService.updateApartment(apartmentId, updates);
    } catch (error) {
      console.error("PropertyService.updateApartment error:", error);
      throw new Error(`Failed to update apartment: ${error.message}`);
    }
  }

  public async deleteApartment(apartmentId: string): Promise<void> {
    try {
      await ApiService.deleteApartment(apartmentId);
    } catch (error) {
      console.error("PropertyService.deleteApartment error:", error);
      throw new Error(`Failed to delete apartment: ${error.message}`);
    }
  }

  private validateApartmentData(apartment: Partial<Apartment>): void {
    if (apartment.doorNumber && !apartment.doorNumber.trim()) {
      throw new Error("Door number is required");
    }
    if (apartment.bedroomCount !== undefined && apartment.bedroomCount < 0) {
      throw new Error("Bedroom count cannot be negative");
    }
    if (apartment.bathroomCount !== undefined && apartment.bathroomCount < 0) {
      throw new Error("Bathroom count cannot be negative");
    }
    if (apartment.area !== undefined && apartment.area <= 0) {
      throw new Error("Area must be greater than 0");
    }
  }

  // Flat CRUD Operations - Now using ApiService
  public async getFlats(): Promise<Flat[]> {
    try {
      return await ApiService.getFlats();
    } catch (error) {
      console.error("PropertyService.getFlats error:", error);
      throw new Error(`Failed to fetch flats: ${error.message}`);
    }
  }

  public async getFlatById(id: string): Promise<Flat | null> {
    try {
      return await ApiService.getFlatById(id);
    } catch (error) {
      console.error("PropertyService.getFlatById error:", error);
      throw new Error(`Failed to fetch flat: ${error.message}`);
    }
  }

  public async saveFlat(
    flatData: Omit<
      Flat,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "currentTenant"
      | "rentHistory"
      | "maintenanceRecords"
      | "documents"
    >
  ): Promise<Flat> {
    try {
      this.validateFlatData(flatData);
      return await ApiService.createFlat(flatData);
    } catch (error) {
      console.error("PropertyService.saveFlat error:", error);
      throw new Error(`Failed to create flat: ${error.message}`);
    }
  }

  public async updateFlat(id: string, updates: Partial<Flat>): Promise<Flat> {
    try {
      return await ApiService.updateFlat(id, updates);
    } catch (error) {
      console.error("PropertyService.updateFlat error:", error);
      throw new Error(`Failed to update flat: ${error.message}`);
    }
  }

  public async deleteFlat(id: string): Promise<void> {
    try {
      await ApiService.deleteFlat(id);
    } catch (error) {
      console.error("PropertyService.deleteFlat error:", error);
      throw new Error(`Failed to delete flat: ${error.message}`);
    }
  }

  private validateFlatData(flat: Partial<Flat>): void {
    if (flat.name && !flat.name.trim()) {
      throw new Error("Flat name is required");
    }
    if (flat.address && !flat.address.trim()) {
      throw new Error("Flat address is required");
    }
    if (flat.doorNumber && !flat.doorNumber.trim()) {
      throw new Error("Door number is required");
    }
  }

  // Land CRUD Operations - Now using ApiService
  public async getLands(): Promise<Land[]> {
    try {
      return await ApiService.getLands();
    } catch (error) {
      console.error("PropertyService.getLands error:", error);
      throw new Error(`Failed to fetch lands: ${error.message}`);
    }
  }

  public async getLandById(id: string): Promise<Land | null> {
    try {
      return await ApiService.getLandById(id);
    } catch (error) {
      console.error("PropertyService.getLandById error:", error);
      throw new Error(`Failed to fetch land: ${error.message}`);
    }
  }

  public async saveLand(
    landData: Omit<
      Land,
      | "id"
      | "createdAt"
      | "updatedAt"
      | "currentTenant"
      | "rentHistory"
      | "maintenanceRecords"
      | "documents"
    >
  ): Promise<Land> {
    try {
      this.validateLandData(landData);
      return await ApiService.createLand(landData);
    } catch (error) {
      console.error("PropertyService.saveLand error:", error);
      throw new Error(`Failed to create land: ${error.message}`);
    }
  }

  public async updateLand(id: string, updates: Partial<Land>): Promise<Land> {
    try {
      return await ApiService.updateLand(id, updates);
    } catch (error) {
      console.error("PropertyService.updateLand error:", error);
      throw new Error(`Failed to update land: ${error.message}`);
    }
  }

  public async deleteLand(id: string): Promise<void> {
    try {
      await ApiService.deleteLand(id);
    } catch (error) {
      console.error("PropertyService.deleteLand error:", error);
      throw new Error(`Failed to delete land: ${error.message}`);
    }
  }

  private validateLandData(land: Partial<Land>): void {
    if (land.name && !land.name.trim()) {
      throw new Error("Land name is required");
    }
    if (land.address && !land.address.trim()) {
      throw new Error("Land address is required");
    }
    if (land.area !== undefined && land.area <= 0) {
      throw new Error("Land area must be greater than 0");
    }
  }

  // Tenant CRUD Operations - Now using ApiService
  public async getTenants(): Promise<Tenant[]> {
    try {
      return await ApiService.getTenants();
    } catch (error) {
      console.error("PropertyService.getTenants error:", error);
      throw new Error(`Failed to fetch tenants: ${error.message}`);
    }
  }

  public async getTenantByProperty(
    propertyId: string,
    propertyType: string
  ): Promise<Tenant | null> {
    try {
      return await ApiService.getTenantByProperty(propertyId, propertyType);
    } catch (error) {
      console.error("PropertyService.getTenantByProperty error:", error);
      throw new Error(`Failed to fetch tenant: ${error.message}`);
    }
  }

  public async updateTenantPropertyLink(
    tenantId: string,
    propertyId: string,
    propertyType: string,
    buildingId?: string
  ): Promise<void> {
    try {
      const updateData: any = {
        property_id: propertyId,
        property_type: propertyType,
      };

      if (buildingId) {
        updateData.building_id = buildingId;
      }

      const { error } = await ApiService.supabase
        .from("tenants")
        .update(updateData)
        .eq("id", tenantId);

      if (error) {
        throw new Error(
          `Failed to update tenant property link: ${error.message}`
        );
      }
    } catch (error) {
      console.error("PropertyService.updateTenantPropertyLink error:", error);
      throw error;
    }
  }

  public async getTenantById(id: string): Promise<Tenant | null> {
    try {
      // Note: ApiService doesn't have getTenantById yet, so we'll get all and filter
      const tenants = await this.getTenants();
      return tenants.find((tenant) => tenant.id === id) || null;
    } catch (error) {
      console.error("PropertyService.getTenantById error:", error);
      throw new Error(`Failed to fetch tenant: ${error.message}`);
    }
  }

  public async saveTenant(
    tenantData: Omit<
      Tenant,
      "id" | "createdAt" | "updatedAt" | "references" | "documents"
    >
  ): Promise<Tenant> {
    try {
      this.validateTenantData(tenantData);
      return await ApiService.createTenant(tenantData);
    } catch (error) {
      console.error("PropertyService.saveTenant error:", error);
      throw new Error(`Failed to create tenant: ${error.message}`);
    }
  }

  public async updateTenant(
    id: string,
    updates: Partial<Tenant>
  ): Promise<Tenant> {
    try {
      return await ApiService.updateTenant(id, updates);
    } catch (error) {
      console.error("PropertyService.updateTenant error:", error);
      throw new Error(`Failed to update tenant: ${error.message}`);
    }
  }

  public async deleteTenant(id: string): Promise<void> {
    try {
      await ApiService.deleteTenant(id);
    } catch (error) {
      console.error("PropertyService.deleteTenant error:", error);
      throw new Error(`Failed to delete tenant: ${error.message}`);
    }
  }

  private validateTenantData(tenant: Partial<Tenant>): void {
    if (tenant.personalInfo?.fullName && !tenant.personalInfo.fullName.trim()) {
      throw new Error("Tenant full name is required");
    }
    if (tenant.contactInfo?.phone && !tenant.contactInfo.phone.trim()) {
      throw new Error("Tenant phone number is required");
    }
  }

  // Property Statistics and Analytics - Now async using ApiService
  public async getPropertyStatistics(): Promise<{
    buildings: { total: number; occupied: number; vacant: number };
    flats: { total: number; occupied: number; vacant: number };
    lands: { total: number; leased: number; vacant: number };
    totalUnits: number;
    totalOccupied: number;
    occupancyRate: number;
  }> {
    try {
      console.log("PropertyService: Getting property statistics...");

      // Try to get data, but handle failures gracefully
      let buildings = [];
      let flats = [];
      let lands = [];

      try {
        buildings = await this.getBuildings();
        console.log("PropertyService: Got buildings:", buildings.length);
      } catch (error) {
        console.error("PropertyService: Failed to get buildings:", error);
        buildings = [];
      }

      try {
        flats = await this.getFlats();
        console.log("PropertyService: Got flats:", flats.length);
      } catch (error) {
        console.error("PropertyService: Failed to get flats:", error);
        flats = [];
      }

      try {
        lands = await this.getLands();
        console.log("PropertyService: Got lands:", lands.length);
      } catch (error) {
        console.error("PropertyService: Failed to get lands:", error);
        lands = [];
      }

      // Building statistics
      let totalApartments = 0;
      let occupiedApartments = 0;
      buildings.forEach((building) => {
        if (building.apartments) {
          totalApartments += building.apartments.length;
          occupiedApartments += building.apartments.filter(
            (apt) => apt.isOccupied
          ).length;
        }
      });

      // Flat statistics
      const totalFlats = flats.length;
      const occupiedFlats = flats.filter((flat) => flat.isOccupied).length;

      // Land statistics
      const totalLands = lands.length;
      const leasedLands = lands.filter((land) => land.isLeased).length;

      const totalUnits = totalApartments + totalFlats + totalLands;
      const totalOccupied = occupiedApartments + occupiedFlats + leasedLands;
      const occupancyRate =
        totalUnits > 0 ? (totalOccupied / totalUnits) * 100 : 0;

      const stats = {
        buildings: {
          total: buildings.length,
          occupied: buildings.filter((b) =>
            b.apartments?.some((apt) => apt.isOccupied)
          ).length,
          vacant: buildings.filter(
            (b) => !b.apartments?.some((apt) => apt.isOccupied)
          ).length,
        },
        flats: {
          total: totalFlats,
          occupied: occupiedFlats,
          vacant: totalFlats - occupiedFlats,
        },
        lands: {
          total: totalLands,
          leased: leasedLands,
          vacant: totalLands - leasedLands,
        },
        totalUnits,
        totalOccupied,
        occupancyRate: Math.round(occupancyRate * 100) / 100,
      };

      console.log("PropertyService: Calculated statistics:", stats);
      return stats;
    } catch (error) {
      console.error("PropertyService.getPropertyStatistics error:", error);
      // Return empty stats instead of throwing
      return {
        buildings: { total: 0, occupied: 0, vacant: 0 },
        flats: { total: 0, occupied: 0, vacant: 0 },
        lands: { total: 0, leased: 0, vacant: 0 },
        totalUnits: 0,
        totalOccupied: 0,
        occupancyRate: 0,
      };
    }
  }

  // Search and Filter Operations - Now async using ApiService
  public async searchProperties(
    query: string,
    type?: PropertyType
  ): Promise<(Building | Flat | Land)[]> {
    try {
      return await ApiService.searchProperties(query, type);
    } catch (error) {
      console.error("PropertyService.searchProperties error:", error);
      throw new Error(`Failed to search properties: ${error.message}`);
    }
  }

  // Data Export/Import - Now async using ApiService
  public async exportPropertyData(): Promise<{
    buildings: Building[];
    flats: Flat[];
    lands: Land[];
    tenants: Tenant[];
    exportDate: string;
  }> {
    try {
      const [buildings, flats, lands, tenants] = await Promise.all([
        this.getBuildings(),
        this.getFlats(),
        this.getLands(),
        this.getTenants(),
      ]);

      return {
        buildings,
        flats,
        lands,
        tenants,
        exportDate: new Date().toISOString(),
      };
    } catch (error) {
      console.error("PropertyService.exportPropertyData error:", error);
      throw new Error(`Failed to export property data: ${error.message}`);
    }
  }

  // Note: Import functionality would need to be implemented with individual API calls
  // since we're now using Supabase instead of localStorage
}

// Export singleton instance
export const propertyService = new PropertyService();
