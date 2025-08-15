import { Building, Apartment, ApartmentSpecifications } from "@/types";

// Sample building data for testing the Buildings Management Interface
export const sampleBuildings: Building[] = [
  {
    id: "building_1",
    type: "building",
    name: "Satyanarayana Apartments A",
    buildingCode: "A",
    address: "123 Main Street, Hyderabad, Telangana 500001",
    description: "Modern apartment building with excellent amenities",
    totalFloors: 4,
    totalApartments: 8,
    constructionYear: 2020,
    images: [],
    amenities: [
      "Parking",
      "Elevator",
      "Security",
      "Water Tank",
      "Power Backup",
    ],
    apartments: [
      {
        id: "apt_1",
        buildingId: "building_1",
        doorNumber: "101",
        floor: 1,
        bedroomCount: 2,
        bathroomCount: 2,
        area: 1200,
        rentAmount: 15000,
        securityDeposit: 30000,
        isOccupied: true,
        specifications: {
          furnished: false,
          parking: true,
          balcony: true,
          airConditioning: false,
          powerBackup: true,
          waterSupply: "24x7",
          internetReady: true,
          additionalFeatures: ["Garden View"],
        },
        rentHistory: [],
        maintenanceRecords: [],
        documents: [],
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
      {
        id: "apt_2",
        buildingId: "building_1",
        doorNumber: "102",
        floor: 1,
        bedroomCount: 3,
        bathroomCount: 2,
        area: 1500,
        rentAmount: 18000,
        securityDeposit: 36000,
        isOccupied: false,
        specifications: {
          furnished: true,
          parking: true,
          balcony: true,
          airConditioning: true,
          powerBackup: true,
          waterSupply: "24x7",
          internetReady: true,
          additionalFeatures: ["Corner Unit", "Extra Storage"],
        },
        rentHistory: [],
        maintenanceRecords: [],
        documents: [],
        createdAt: new Date("2024-01-15"),
        updatedAt: new Date("2024-01-15"),
      },
    ],
    documents: [],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "building_2",
    type: "building",
    name: "Satyanarayana Apartments B",
    buildingCode: "B",
    address: "456 Park Avenue, Hyderabad, Telangana 500002",
    description: "Premium apartment building with luxury amenities",
    totalFloors: 5,
    totalApartments: 10,
    constructionYear: 2022,
    images: [],
    amenities: [
      "Parking",
      "Elevator",
      "Security",
      "Gym",
      "Swimming Pool",
      "Garden",
    ],
    apartments: [
      {
        id: "apt_3",
        buildingId: "building_2",
        doorNumber: "201",
        floor: 2,
        bedroomCount: 3,
        bathroomCount: 3,
        area: 1800,
        rentAmount: 25000,
        securityDeposit: 50000,
        isOccupied: true,
        specifications: {
          furnished: true,
          parking: true,
          balcony: true,
          airConditioning: true,
          powerBackup: true,
          waterSupply: "24x7",
          internetReady: true,
          additionalFeatures: ["Pool View", "Premium Fixtures"],
        },
        rentHistory: [],
        maintenanceRecords: [],
        documents: [],
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-01"),
      },
    ],
    documents: [],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
];

// Function to load sample data into localStorage for testing
export function loadSampleBuildingData() {
  try {
    const existingBuildings = localStorage.getItem("buildings");
    if (!existingBuildings || JSON.parse(existingBuildings).length === 0) {
      localStorage.setItem("buildings", JSON.stringify(sampleBuildings));
      console.log("Sample building data loaded successfully");
      return true;
    }
    console.log("Buildings already exist, skipping sample data load");
    return false;
  } catch (error) {
    console.error("Error loading sample building data:", error);
    return false;
  }
}

// Function to clear all building data
export function clearBuildingData() {
  try {
    localStorage.removeItem("buildings");
    console.log("Building data cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing building data:", error);
    return false;
  }
}
