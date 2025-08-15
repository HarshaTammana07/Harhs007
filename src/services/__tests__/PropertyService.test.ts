import { PropertyService } from "../PropertyService";
import { Building, Apartment, Flat, Land, Tenant } from "@/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("PropertyService", () => {
  let propertyService: PropertyService;

  beforeEach(() => {
    propertyService = new PropertyService();
    localStorage.clear();
  });

  describe("Building Operations", () => {
    const mockBuilding: Building = {
      id: "building-1",
      type: "building",
      name: "Satyanarayana Apartments A",
      address: "123 Main Street, Hyderabad",
      buildingCode: "A",
      totalFloors: 3,
      totalApartments: 6,
      apartments: [],
      amenities: ["parking", "security"],
      images: [],
      documents: [],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    };

    test("should save and retrieve building", () => {
      propertyService.saveBuilding(mockBuilding);
      const buildings = propertyService.getBuildings();

      expect(buildings).toHaveLength(1);
      expect(buildings[0].id).toBe("building-1");
      expect(buildings[0].name).toBe("Satyanarayana Apartments A");
    });

    test("should get building by id", () => {
      propertyService.saveBuilding(mockBuilding);
      const building = propertyService.getBuildingById("building-1");

      expect(building).not.toBeNull();
      expect(building?.id).toBe("building-1");
    });

    test("should update building", () => {
      propertyService.saveBuilding(mockBuilding);
      propertyService.updateBuilding("building-1", {
        name: "Updated Building Name",
        totalFloors: 4,
      });

      const building = propertyService.getBuildingById("building-1");
      expect(building?.name).toBe("Updated Building Name");
      expect(building?.totalFloors).toBe(4);
    });

    test("should delete building", () => {
      propertyService.saveBuilding(mockBuilding);
      propertyService.deleteBuilding("building-1");

      const buildings = propertyService.getBuildings();
      expect(buildings).toHaveLength(0);
    });

    test("should throw error when building validation fails", () => {
      const invalidBuilding = { ...mockBuilding, name: "" };

      expect(() => {
        propertyService.saveBuilding(invalidBuilding as Building);
      }).toThrow("Building must have id, name, address, and buildingCode");
    });
  });

  describe("Apartment Operations", () => {
    const mockBuilding: Building = {
      id: "building-1",
      type: "building",
      name: "Test Building",
      address: "Test Address",
      buildingCode: "A",
      totalFloors: 3,
      totalApartments: 6,
      apartments: [],
      amenities: [],
      images: [],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockApartment: Apartment = {
      id: "apt-1",
      buildingId: "building-1",
      doorNumber: "101",
      floor: 1,
      bedroomCount: 2,
      bathroomCount: 2,
      area: 1200,
      rentAmount: 15000,
      securityDeposit: 30000,
      isOccupied: false,
      specifications: {
        furnished: true,
        parking: true,
        balcony: true,
        airConditioning: false,
        powerBackup: true,
        waterSupply: "24x7",
        internetReady: true,
        additionalFeatures: [],
      },
      rentHistory: [],
      maintenanceRecords: [],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    beforeEach(() => {
      propertyService.saveBuilding(mockBuilding);
    });

    test("should add apartment to building", () => {
      propertyService.addApartmentToBuilding("building-1", mockApartment);
      const apartments =
        propertyService.getApartmentsByBuildingId("building-1");

      expect(apartments).toHaveLength(1);
      expect(apartments[0].id).toBe("apt-1");
      expect(apartments[0].doorNumber).toBe("101");
    });

    test("should get apartment by id", () => {
      propertyService.addApartmentToBuilding("building-1", mockApartment);
      const apartment = propertyService.getApartmentById("building-1", "apt-1");

      expect(apartment).not.toBeNull();
      expect(apartment?.id).toBe("apt-1");
    });

    test("should update apartment", () => {
      propertyService.addApartmentToBuilding("building-1", mockApartment);
      propertyService.updateApartment("building-1", "apt-1", {
        rentAmount: 16000,
        isOccupied: true,
      });

      const apartment = propertyService.getApartmentById("building-1", "apt-1");
      expect(apartment?.rentAmount).toBe(16000);
      expect(apartment?.isOccupied).toBe(true);
    });

    test("should delete apartment", () => {
      propertyService.addApartmentToBuilding("building-1", mockApartment);
      propertyService.deleteApartment("building-1", "apt-1");

      const apartments =
        propertyService.getApartmentsByBuildingId("building-1");
      expect(apartments).toHaveLength(0);
    });
  });

  describe("Flat Operations", () => {
    const mockFlat: Flat = {
      id: "flat-1",
      type: "flat",
      name: "Independent Flat",
      address: "456 Oak Street, Hyderabad",
      doorNumber: "2A",
      bedroomCount: 3,
      bathroomCount: 2,
      area: 1500,
      floor: 2,
      totalFloors: 4,
      rentAmount: 20000,
      securityDeposit: 40000,
      isOccupied: false,
      specifications: {
        furnished: false,
        parking: true,
        balcony: true,
        airConditioning: true,
        powerBackup: false,
        waterSupply: "24x7",
        internetReady: true,
        societyName: "Green Valley Society",
        additionalFeatures: ["gym", "swimming pool"],
      },
      rentHistory: [],
      maintenanceRecords: [],
      images: [],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    test("should save and retrieve flat", () => {
      propertyService.saveFlat(mockFlat);
      const flats = propertyService.getFlats();

      expect(flats).toHaveLength(1);
      expect(flats[0].id).toBe("flat-1");
      expect(flats[0].name).toBe("Independent Flat");
    });

    test("should get flat by id", () => {
      propertyService.saveFlat(mockFlat);
      const flat = propertyService.getFlatById("flat-1");

      expect(flat).not.toBeNull();
      expect(flat?.id).toBe("flat-1");
    });

    test("should update flat", () => {
      propertyService.saveFlat(mockFlat);
      propertyService.updateFlat("flat-1", {
        rentAmount: 22000,
        isOccupied: true,
      });

      const flat = propertyService.getFlatById("flat-1");
      expect(flat?.rentAmount).toBe(22000);
      expect(flat?.isOccupied).toBe(true);
    });

    test("should delete flat", () => {
      propertyService.saveFlat(mockFlat);
      propertyService.deleteFlat("flat-1");

      const flats = propertyService.getFlats();
      expect(flats).toHaveLength(0);
    });
  });

  describe("Land Operations", () => {
    const mockLand: Land = {
      id: "land-1",
      type: "land",
      name: "Agricultural Land",
      address: "Survey No. 123, Village ABC",
      surveyNumber: "123",
      area: 5,
      areaUnit: "acres",
      zoning: "agricultural",
      soilType: "red soil",
      waterSource: "borewell",
      roadAccess: true,
      electricityConnection: false,
      isLeased: false,
      rentHistory: [],
      maintenanceRecords: [],
      images: [],
      documents: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    test("should save and retrieve land", () => {
      propertyService.saveLand(mockLand);
      const lands = propertyService.getLands();

      expect(lands).toHaveLength(1);
      expect(lands[0].id).toBe("land-1");
      expect(lands[0].name).toBe("Agricultural Land");
    });

    test("should get land by id", () => {
      propertyService.saveLand(mockLand);
      const land = propertyService.getLandById("land-1");

      expect(land).not.toBeNull();
      expect(land?.id).toBe("land-1");
    });

    test("should update land", () => {
      propertyService.saveLand(mockLand);
      propertyService.updateLand("land-1", {
        isLeased: true,
        electricityConnection: true,
      });

      const land = propertyService.getLandById("land-1");
      expect(land?.isLeased).toBe(true);
      expect(land?.electricityConnection).toBe(true);
    });

    test("should delete land", () => {
      propertyService.saveLand(mockLand);
      propertyService.deleteLand("land-1");

      const lands = propertyService.getLands();
      expect(lands).toHaveLength(0);
    });
  });

  describe("Tenant Operations", () => {
    const mockTenant: Tenant = {
      id: "tenant-1",
      personalInfo: {
        firstName: "John",
        lastName: "Doe",
        fullName: "John Doe",
        dateOfBirth: new Date("1990-01-01"),
        occupation: "Software Engineer",
        employer: "Tech Corp",
        monthlyIncome: 50000,
        maritalStatus: "married",
        familySize: 2,
        nationality: "Indian",
      },
      contactInfo: {
        phone: "9876543210",
        email: "john.doe@email.com",
        address: "Current Address",
      },
      emergencyContact: {
        name: "Jane Doe",
        relationship: "spouse",
        phone: "9876543211",
      },
      identification: {
        aadharNumber: "1234-5678-9012",
        panNumber: "ABCDE1234F",
      },
      rentalAgreement: {
        agreementNumber: "AGR-001",
        startDate: new Date("2024-01-01"),
        endDate: new Date("2025-01-01"),
        rentAmount: 15000,
        securityDeposit: 30000,
        rentDueDate: 5,
        paymentMethod: "bank_transfer",
        noticePeriod: 30,
      },
      references: [],
      documents: [],
      moveInDate: new Date("2024-01-01"),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    test("should save and retrieve tenant", () => {
      propertyService.saveTenant(mockTenant);
      const tenants = propertyService.getTenants();

      expect(tenants).toHaveLength(1);
      expect(tenants[0].id).toBe("tenant-1");
      expect(tenants[0].personalInfo.fullName).toBe("John Doe");
    });

    test("should get tenant by id", () => {
      propertyService.saveTenant(mockTenant);
      const tenant = propertyService.getTenantById("tenant-1");

      expect(tenant).not.toBeNull();
      expect(tenant?.id).toBe("tenant-1");
    });

    test("should update tenant", () => {
      propertyService.saveTenant(mockTenant);
      propertyService.updateTenant("tenant-1", {
        isActive: false,
        moveOutDate: new Date("2024-12-31"),
      });

      const tenant = propertyService.getTenantById("tenant-1");
      expect(tenant?.isActive).toBe(false);
      expect(tenant?.moveOutDate).toEqual(new Date("2024-12-31"));
    });

    test("should delete tenant", () => {
      propertyService.saveTenant(mockTenant);
      propertyService.deleteTenant("tenant-1");

      const tenants = propertyService.getTenants();
      expect(tenants).toHaveLength(0);
    });
  });

  describe("Property Statistics", () => {
    test("should calculate property statistics correctly", () => {
      // Add test data
      const building: Building = {
        id: "building-1",
        type: "building",
        name: "Test Building",
        address: "Test Address",
        buildingCode: "A",
        totalFloors: 2,
        totalApartments: 2,
        apartments: [
          {
            id: "apt-1",
            buildingId: "building-1",
            doorNumber: "101",
            floor: 1,
            bedroomCount: 2,
            bathroomCount: 1,
            area: 1000,
            rentAmount: 10000,
            securityDeposit: 20000,
            isOccupied: true,
            specifications: {
              furnished: false,
              parking: false,
              balcony: false,
              airConditioning: false,
              powerBackup: false,
              waterSupply: "24x7",
              internetReady: false,
              additionalFeatures: [],
            },
            rentHistory: [],
            maintenanceRecords: [],
            documents: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "apt-2",
            buildingId: "building-1",
            doorNumber: "102",
            floor: 1,
            bedroomCount: 2,
            bathroomCount: 1,
            area: 1000,
            rentAmount: 10000,
            securityDeposit: 20000,
            isOccupied: false,
            specifications: {
              furnished: false,
              parking: false,
              balcony: false,
              airConditioning: false,
              powerBackup: false,
              waterSupply: "24x7",
              internetReady: false,
              additionalFeatures: [],
            },
            rentHistory: [],
            maintenanceRecords: [],
            documents: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        amenities: [],
        images: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const flat: Flat = {
        id: "flat-1",
        type: "flat",
        name: "Test Flat",
        address: "Test Address",
        doorNumber: "1A",
        bedroomCount: 3,
        bathroomCount: 2,
        area: 1200,
        floor: 1,
        totalFloors: 3,
        rentAmount: 15000,
        securityDeposit: 30000,
        isOccupied: true,
        specifications: {
          furnished: false,
          parking: true,
          balcony: true,
          airConditioning: false,
          powerBackup: false,
          waterSupply: "24x7",
          internetReady: false,
          additionalFeatures: [],
        },
        rentHistory: [],
        maintenanceRecords: [],
        images: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const land: Land = {
        id: "land-1",
        type: "land",
        name: "Test Land",
        address: "Test Address",
        area: 1,
        areaUnit: "acres",
        zoning: "agricultural",
        roadAccess: true,
        electricityConnection: false,
        isLeased: false,
        rentHistory: [],
        maintenanceRecords: [],
        images: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      propertyService.saveBuilding(building);
      propertyService.saveFlat(flat);
      propertyService.saveLand(land);

      const stats = propertyService.getPropertyStatistics();

      expect(stats.totalUnits).toBe(4); // 2 apartments + 1 flat + 1 land
      expect(stats.totalOccupied).toBe(2); // 1 apartment + 1 flat occupied
      expect(stats.occupancyRate).toBe(50);
      expect(stats.buildings.total).toBe(1);
      expect(stats.flats.total).toBe(1);
      expect(stats.lands.total).toBe(1);
    });
  });

  describe("Search Operations", () => {
    beforeEach(() => {
      const building: Building = {
        id: "building-1",
        type: "building",
        name: "Satyanarayana Apartments",
        address: "Hyderabad",
        buildingCode: "A",
        totalFloors: 3,
        totalApartments: 6,
        apartments: [],
        amenities: [],
        images: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const flat: Flat = {
        id: "flat-1",
        type: "flat",
        name: "Green Valley Flat",
        address: "Bangalore",
        doorNumber: "2A",
        bedroomCount: 2,
        bathroomCount: 1,
        area: 1000,
        floor: 2,
        totalFloors: 4,
        rentAmount: 12000,
        securityDeposit: 24000,
        isOccupied: false,
        specifications: {
          furnished: false,
          parking: true,
          balcony: true,
          airConditioning: false,
          powerBackup: false,
          waterSupply: "24x7",
          internetReady: false,
          additionalFeatures: [],
        },
        rentHistory: [],
        maintenanceRecords: [],
        images: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      propertyService.saveBuilding(building);
      propertyService.saveFlat(flat);
    });

    test("should search properties by name", () => {
      const results = propertyService.searchProperties("Satyanarayana");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Satyanarayana Apartments");
    });

    test("should search properties by address", () => {
      const results = propertyService.searchProperties("Bangalore");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Green Valley Flat");
    });

    test("should filter search by property type", () => {
      const results = propertyService.searchProperties("", "building");
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("building");
    });
  });

  describe("Data Export/Import", () => {
    test("should export property data", () => {
      const building: Building = {
        id: "building-1",
        type: "building",
        name: "Test Building",
        address: "Test Address",
        buildingCode: "A",
        totalFloors: 2,
        totalApartments: 2,
        apartments: [],
        amenities: [],
        images: [],
        documents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      propertyService.saveBuilding(building);
      const exportData = propertyService.exportPropertyData();

      expect(exportData.buildings).toHaveLength(1);
      expect(exportData.buildings[0].id).toBe("building-1");
      expect(exportData.exportDate).toBeDefined();
    });

    test("should import property data", () => {
      const importData = {
        buildings: [
          {
            id: "imported-building",
            type: "building" as const,
            name: "Imported Building",
            address: "Imported Address",
            buildingCode: "B",
            totalFloors: 3,
            totalApartments: 6,
            apartments: [],
            amenities: [],
            images: [],
            documents: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      propertyService.importPropertyData(importData);
      const buildings = propertyService.getBuildings();

      expect(buildings).toHaveLength(1);
      expect(buildings[0].id).toBe("imported-building");
    });
  });
});
