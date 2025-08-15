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
import {
  LocalStorageService,
  LocalStorageError,
  LocalStorageErrorCodes,
} from "./LocalStorageService";

/**
 * PropertyService - Handles all property management operations for the hierarchical property system
 * Manages Buildings, Apartments, Flats, Lands, and Tenants with localStorage persistence
 */
export class PropertyService {
  private static readonly KEYS = {
    BUILDINGS: "buildings",
    FLATS: "flats",
    LANDS: "lands",
    TENANTS: "tenants",
  } as const;

  private localStorageService: LocalStorageService;

  constructor() {
    this.localStorageService = new LocalStorageService();
  }

  // Generic property operations
  private getFromStorage<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key);
      if (!item) return [];
      return JSON.parse(item, this.dateReviver);
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data, this.dateReplacer));
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new LocalStorageError(
          "Storage quota exceeded",
          LocalStorageErrorCodes.QUOTA_EXCEEDED
        );
      }
      throw error;
    }
  }

  // Date serialization helpers
  private dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }
    return value;
  }

  private dateReviver(key: string, value: any): any {
    if (
      typeof value === "object" &&
      value !== null &&
      value.__type === "Date"
    ) {
      return new Date(value.value);
    }
    return value;
  }

  // Building CRUD Operations
  public getBuildings(): Building[] {
    return this.getFromStorage<Building>(PropertyService.KEYS.BUILDINGS);
  }

  public getBuildingById(id: string): Building | null {
    const buildings = this.getBuildings();
    return buildings.find((building) => building.id === id) || null;
  }

  public saveBuilding(building: Building): void {
    this.validateBuilding(building);
    const buildings = this.getBuildings();
    buildings.push(building);
    this.saveToStorage(PropertyService.KEYS.BUILDINGS, buildings);
  }

  public updateBuilding(id: string, updates: Partial<Building>): void {
    const buildings = this.getBuildings();
    const index = buildings.findIndex((building) => building.id === id);

    if (index === -1) {
      throw new LocalStorageError(
        `Building with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedBuilding = {
      ...buildings[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.validateBuilding(updatedBuilding);

    buildings[index] = updatedBuilding;
    this.saveToStorage(PropertyService.KEYS.BUILDINGS, buildings);
  }

  public deleteBuilding(id: string): void {
    const buildings = this.getBuildings();
    const filteredBuildings = buildings.filter(
      (building) => building.id !== id
    );

    if (buildings.length === filteredBuildings.length) {
      throw new LocalStorageError(
        `Building with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    // Also remove all apartments in this building
    const allBuildings = this.getBuildings();
    const building = allBuildings.find((b) => b.id === id);
    if (building && building.apartments) {
      building.apartments.forEach((apartment) => {
        if (apartment.currentTenant) {
          this.deleteTenant(apartment.currentTenant.id);
        }
      });
    }

    this.saveToStorage(PropertyService.KEYS.BUILDINGS, filteredBuildings);
  }

  private validateBuilding(building: Building): void {
    if (
      !building.id ||
      !building.name ||
      !building.address ||
      !building.buildingCode
    ) {
      throw new LocalStorageError(
        "Building must have id, name, address, and buildingCode",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // Apartment Operations (within buildings)
  public getApartmentsByBuildingId(buildingId: string): Apartment[] {
    const building = this.getBuildingById(buildingId);
    return building?.apartments || [];
  }

  public getApartmentById(
    buildingId: string,
    apartmentId: string
  ): Apartment | null {
    const apartments = this.getApartmentsByBuildingId(buildingId);
    return apartments.find((apartment) => apartment.id === apartmentId) || null;
  }

  public addApartmentToBuilding(
    buildingId: string,
    apartment: Apartment
  ): void {
    this.validateApartment(apartment);
    const buildings = this.getBuildings();
    const buildingIndex = buildings.findIndex(
      (building) => building.id === buildingId
    );

    if (buildingIndex === -1) {
      throw new LocalStorageError(
        `Building with id "${buildingId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    apartment.buildingId = buildingId;
    if (!buildings[buildingIndex].apartments) {
      buildings[buildingIndex].apartments = [];
    }
    buildings[buildingIndex].apartments.push(apartment);
    buildings[buildingIndex].updatedAt = new Date();

    this.saveToStorage(PropertyService.KEYS.BUILDINGS, buildings);
  }

  public updateApartment(
    buildingId: string,
    apartmentId: string,
    updates: Partial<Apartment>
  ): void {
    const buildings = this.getBuildings();
    const buildingIndex = buildings.findIndex(
      (building) => building.id === buildingId
    );

    if (buildingIndex === -1) {
      throw new LocalStorageError(
        `Building with id "${buildingId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const apartmentIndex =
      buildings[buildingIndex].apartments?.findIndex(
        (apartment) => apartment.id === apartmentId
      ) ?? -1;

    if (apartmentIndex === -1) {
      throw new LocalStorageError(
        `Apartment with id "${apartmentId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedApartment = {
      ...buildings[buildingIndex].apartments[apartmentIndex],
      ...updates,
      updatedAt: new Date(),
    };
    this.validateApartment(updatedApartment);

    buildings[buildingIndex].apartments[apartmentIndex] = updatedApartment;
    buildings[buildingIndex].updatedAt = new Date();

    this.saveToStorage(PropertyService.KEYS.BUILDINGS, buildings);
  }

  public deleteApartment(buildingId: string, apartmentId: string): void {
    const buildings = this.getBuildings();
    const buildingIndex = buildings.findIndex(
      (building) => building.id === buildingId
    );

    if (buildingIndex === -1) {
      throw new LocalStorageError(
        `Building with id "${buildingId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const apartment = buildings[buildingIndex].apartments?.find(
      (apt) => apt.id === apartmentId
    );
    if (apartment?.currentTenant) {
      this.deleteTenant(apartment.currentTenant.id);
    }

    buildings[buildingIndex].apartments =
      buildings[buildingIndex].apartments?.filter(
        (apartment) => apartment.id !== apartmentId
      ) || [];
    buildings[buildingIndex].updatedAt = new Date();

    this.saveToStorage(PropertyService.KEYS.BUILDINGS, buildings);
  }

  private validateApartment(apartment: Apartment): void {
    if (!apartment.id || !apartment.doorNumber || apartment.bedroomCount < 0) {
      throw new LocalStorageError(
        "Apartment must have id, doorNumber, and non-negative bedroom count",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // Flat CRUD Operations
  public getFlats(): Flat[] {
    return this.getFromStorage<Flat>(PropertyService.KEYS.FLATS);
  }

  public getFlatById(id: string): Flat | null {
    const flats = this.getFlats();
    return flats.find((flat) => flat.id === id) || null;
  }

  public saveFlat(flat: Flat): void {
    this.validateFlat(flat);
    const flats = this.getFlats();
    flats.push(flat);
    this.saveToStorage(PropertyService.KEYS.FLATS, flats);
  }

  public updateFlat(id: string, updates: Partial<Flat>): void {
    const flats = this.getFlats();
    const index = flats.findIndex((flat) => flat.id === id);

    if (index === -1) {
      throw new LocalStorageError(
        `Flat with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedFlat = {
      ...flats[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.validateFlat(updatedFlat);

    flats[index] = updatedFlat;
    this.saveToStorage(PropertyService.KEYS.FLATS, flats);
  }

  public deleteFlat(id: string): void {
    const flats = this.getFlats();
    const flat = flats.find((f) => f.id === id);

    if (flat?.currentTenant) {
      this.deleteTenant(flat.currentTenant.id);
    }

    const filteredFlats = flats.filter((flat) => flat.id !== id);

    if (flats.length === filteredFlats.length) {
      throw new LocalStorageError(
        `Flat with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    this.saveToStorage(PropertyService.KEYS.FLATS, filteredFlats);
  }

  private validateFlat(flat: Flat): void {
    if (!flat.id || !flat.name || !flat.address || !flat.doorNumber) {
      throw new LocalStorageError(
        "Flat must have id, name, address, and doorNumber",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // Land CRUD Operations
  public getLands(): Land[] {
    return this.getFromStorage<Land>(PropertyService.KEYS.LANDS);
  }

  public getLandById(id: string): Land | null {
    const lands = this.getLands();
    return lands.find((land) => land.id === id) || null;
  }

  public saveLand(land: Land): void {
    this.validateLand(land);
    const lands = this.getLands();
    lands.push(land);
    this.saveToStorage(PropertyService.KEYS.LANDS, lands);
  }

  public updateLand(id: string, updates: Partial<Land>): void {
    const lands = this.getLands();
    const index = lands.findIndex((land) => land.id === id);

    if (index === -1) {
      throw new LocalStorageError(
        `Land with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedLand = {
      ...lands[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.validateLand(updatedLand);

    lands[index] = updatedLand;
    this.saveToStorage(PropertyService.KEYS.LANDS, lands);
  }

  public deleteLand(id: string): void {
    const lands = this.getLands();
    const land = lands.find((l) => l.id === id);

    if (land?.currentTenant) {
      this.deleteTenant(land.currentTenant.id);
    }

    const filteredLands = lands.filter((land) => land.id !== id);

    if (lands.length === filteredLands.length) {
      throw new LocalStorageError(
        `Land with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    this.saveToStorage(PropertyService.KEYS.LANDS, filteredLands);
  }

  private validateLand(land: Land): void {
    if (!land.id || !land.name || !land.address || land.area <= 0) {
      throw new LocalStorageError(
        "Land must have id, name, address, and positive area",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // Tenant CRUD Operations
  public getTenants(): Tenant[] {
    return this.getFromStorage<Tenant>(PropertyService.KEYS.TENANTS);
  }

  public getTenantById(id: string): Tenant | null {
    const tenants = this.getTenants();
    return tenants.find((tenant) => tenant.id === id) || null;
  }

  public saveTenant(tenant: Tenant): void {
    this.validateTenant(tenant);
    const tenants = this.getTenants();
    tenants.push(tenant);
    this.saveToStorage(PropertyService.KEYS.TENANTS, tenants);
  }

  public updateTenant(id: string, updates: Partial<Tenant>): void {
    const tenants = this.getTenants();
    const index = tenants.findIndex((tenant) => tenant.id === id);

    if (index === -1) {
      throw new LocalStorageError(
        `Tenant with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedTenant = {
      ...tenants[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.validateTenant(updatedTenant);

    tenants[index] = updatedTenant;
    this.saveToStorage(PropertyService.KEYS.TENANTS, tenants);
  }

  public deleteTenant(id: string): void {
    const tenants = this.getTenants();
    const filteredTenants = tenants.filter((tenant) => tenant.id !== id);

    if (tenants.length === filteredTenants.length) {
      throw new LocalStorageError(
        `Tenant with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    this.saveToStorage(PropertyService.KEYS.TENANTS, filteredTenants);
  }

  private validateTenant(tenant: Tenant): void {
    if (
      !tenant.id ||
      !tenant.personalInfo?.fullName ||
      !tenant.contactInfo?.phone
    ) {
      throw new LocalStorageError(
        "Tenant must have id, full name, and phone number",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // Property Statistics and Analytics
  public getPropertyStatistics(): {
    buildings: { total: number; occupied: number; vacant: number };
    flats: { total: number; occupied: number; vacant: number };
    lands: { total: number; leased: number; vacant: number };
    totalUnits: number;
    totalOccupied: number;
    occupancyRate: number;
  } {
    const buildings = this.getBuildings();
    const flats = this.getFlats();
    const lands = this.getLands();

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

    return {
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
  }

  // Search and Filter Operations
  public searchProperties(
    query: string,
    type?: PropertyType
  ): (Building | Flat | Land)[] {
    const results: (Building | Flat | Land)[] = [];
    const searchTerm = query.toLowerCase();

    if (!type || type === "building") {
      const buildings = this.getBuildings().filter(
        (building) =>
          building.name.toLowerCase().includes(searchTerm) ||
          building.address.toLowerCase().includes(searchTerm) ||
          building.buildingCode.toLowerCase().includes(searchTerm)
      );
      results.push(...buildings);
    }

    if (!type || type === "flat") {
      const flats = this.getFlats().filter(
        (flat) =>
          flat.name.toLowerCase().includes(searchTerm) ||
          flat.address.toLowerCase().includes(searchTerm) ||
          flat.doorNumber.toLowerCase().includes(searchTerm)
      );
      results.push(...flats);
    }

    if (!type || type === "land") {
      const lands = this.getLands().filter(
        (land) =>
          land.name.toLowerCase().includes(searchTerm) ||
          land.address.toLowerCase().includes(searchTerm) ||
          land.surveyNumber?.toLowerCase().includes(searchTerm)
      );
      results.push(...lands);
    }

    return results;
  }

  // Data Export/Import
  public exportPropertyData(): {
    buildings: Building[];
    flats: Flat[];
    lands: Land[];
    tenants: Tenant[];
    exportDate: string;
  } {
    return {
      buildings: this.getBuildings(),
      flats: this.getFlats(),
      lands: this.getLands(),
      tenants: this.getTenants(),
      exportDate: new Date().toISOString(),
    };
  }

  public importPropertyData(data: {
    buildings?: Building[];
    flats?: Flat[];
    lands?: Land[];
    tenants?: Tenant[];
  }): void {
    if (data.buildings) {
      this.saveToStorage(PropertyService.KEYS.BUILDINGS, data.buildings);
    }
    if (data.flats) {
      this.saveToStorage(PropertyService.KEYS.FLATS, data.flats);
    }
    if (data.lands) {
      this.saveToStorage(PropertyService.KEYS.LANDS, data.lands);
    }
    if (data.tenants) {
      this.saveToStorage(PropertyService.KEYS.TENANTS, data.tenants);
    }
  }

  // Utility Methods
  public clearAllPropertyData(): void {
    Object.values(PropertyService.KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  public getStorageStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    Object.entries(PropertyService.KEYS).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      stats[name] = data ? data.length : 0;
    });
    return stats;
  }
}

// Export singleton instance
export const propertyService = new PropertyService();
