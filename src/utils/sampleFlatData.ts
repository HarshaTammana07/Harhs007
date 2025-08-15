import { Flat, FlatSpecifications, Tenant } from "@/types";

// Sample tenant data
const sampleTenant: Tenant = {
  id: "tenant_1",
  personalInfo: {
    firstName: "Rajesh",
    lastName: "Kumar",
    fullName: "Rajesh Kumar",
    dateOfBirth: new Date("1985-06-15"),
    occupation: "Software Engineer",
    employer: "Tech Solutions Pvt Ltd",
    monthlyIncome: 75000,
    maritalStatus: "married",
    familySize: 3,
    nationality: "Indian",
    religion: "Hindu",
  },
  contactInfo: {
    phone: "+91 9876543210",
    email: "rajesh.kumar@email.com",
    address: "Previous Address: 789 Old Street, Bangalore",
  },
  emergencyContact: {
    name: "Priya Kumar",
    relationship: "Wife",
    phone: "+91 9876543211",
    email: "priya.kumar@email.com",
  },
  identification: {
    aadharNumber: "1234 5678 9012",
    panNumber: "ABCDE1234F",
    drivingLicense: "TN01 20230001234",
  },
  rentalAgreement: {
    agreementNumber: "AGR-2024-001",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    rentAmount: 20000,
    securityDeposit: 40000,
    maintenanceCharges: 2000,
    rentDueDate: 5,
    paymentMethod: "bank_transfer",
    lateFeeAmount: 500,
    noticePeriod: 30,
    renewalTerms: "Rent increase of 5% annually",
    specialConditions: ["No pets allowed", "No smoking"],
  },
  references: [
    {
      name: "Suresh Reddy",
      relationship: "Previous Landlord",
      phone: "+91 9876543212",
      email: "suresh.reddy@email.com",
      verified: true,
    },
  ],
  documents: [],
  moveInDate: new Date("2024-01-01"),
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

// Sample flat data for testing the Flats Management Interface
export const sampleFlats: Flat[] = [
  {
    id: "flat_1",
    type: "flat",
    name: "Green Valley Apartments",
    address:
      "Plot No. 45, Green Valley Society, Gachibowli, Hyderabad, Telangana 500032",
    doorNumber: "A-301",
    bedroomCount: 2,
    bathroomCount: 2,
    area: 1100,
    floor: 3,
    totalFloors: 5,
    rentAmount: 20000,
    securityDeposit: 40000,
    description:
      "Spacious 2BHK apartment with modern amenities in a gated community",
    images: [],
    documents: [],
    isOccupied: true,
    currentTenant: sampleTenant,
    specifications: {
      furnished: true,
      parking: true,
      balcony: true,
      airConditioning: true,
      powerBackup: true,
      waterSupply: "24x7",
      internetReady: true,
      societyName: "Green Valley Society",
      maintenanceCharges: 2000,
      additionalFeatures: [
        "Swimming Pool Access",
        "Gym Access",
        "Children's Play Area",
      ],
    },
    rentHistory: [],
    maintenanceRecords: [],
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-01-15"),
  },
  {
    id: "flat_2",
    type: "flat",
    name: "Sunrise Residency",
    address:
      "Flat No. 102, Sunrise Residency, Kondapur, Hyderabad, Telangana 500084",
    doorNumber: "102",
    bedroomCount: 3,
    bathroomCount: 2,
    area: 1350,
    floor: 1,
    totalFloors: 4,
    rentAmount: 25000,
    securityDeposit: 50000,
    description:
      "Ground floor 3BHK flat with garden access and premium fittings",
    images: [],
    documents: [],
    isOccupied: false,
    specifications: {
      furnished: false,
      parking: true,
      balcony: true,
      airConditioning: false,
      powerBackup: true,
      waterSupply: "24x7",
      internetReady: true,
      societyName: "Sunrise Residency",
      maintenanceCharges: 1500,
      additionalFeatures: [
        "Garden Access",
        "Separate Entrance",
        "Storage Room",
      ],
    },
    rentHistory: [],
    maintenanceRecords: [],
    createdAt: new Date("2024-02-01"),
    updatedAt: new Date("2024-02-01"),
  },
  {
    id: "flat_3",
    type: "flat",
    name: "Metro Heights",
    address: "Unit 205, Metro Heights, Miyapur, Hyderabad, Telangana 500049",
    doorNumber: "205",
    bedroomCount: 1,
    bathroomCount: 1,
    area: 650,
    floor: 2,
    totalFloors: 8,
    rentAmount: 12000,
    securityDeposit: 24000,
    description:
      "Compact 1BHK apartment perfect for bachelors or small families",
    images: [],
    documents: [],
    isOccupied: true,
    currentTenant: {
      ...sampleTenant,
      id: "tenant_2",
      personalInfo: {
        ...sampleTenant.personalInfo,
        fullName: "Anita Sharma",
        firstName: "Anita",
        lastName: "Sharma",
        maritalStatus: "single",
        familySize: 1,
        occupation: "Marketing Executive",
        monthlyIncome: 45000,
      },
      contactInfo: {
        phone: "+91 9876543213",
        email: "anita.sharma@email.com",
        address: "Previous Address: 123 Park Street, Mumbai",
      },
      rentalAgreement: {
        ...sampleTenant.rentalAgreement,
        agreementNumber: "AGR-2024-002",
        rentAmount: 12000,
        securityDeposit: 24000,
        maintenanceCharges: 1000,
      },
    },
    specifications: {
      furnished: true,
      parking: false,
      balcony: true,
      airConditioning: true,
      powerBackup: true,
      waterSupply: "limited",
      internetReady: true,
      societyName: "Metro Heights",
      maintenanceCharges: 1000,
      additionalFeatures: ["Metro Connectivity", "Shopping Mall Nearby"],
    },
    rentHistory: [],
    maintenanceRecords: [],
    createdAt: new Date("2024-02-15"),
    updatedAt: new Date("2024-02-15"),
  },
  {
    id: "flat_4",
    type: "flat",
    name: "Royal Enclave",
    address:
      "Villa 12, Royal Enclave, Jubilee Hills, Hyderabad, Telangana 500033",
    doorNumber: "Villa-12",
    bedroomCount: 4,
    bathroomCount: 3,
    area: 2200,
    floor: 1,
    totalFloors: 2,
    rentAmount: 45000,
    securityDeposit: 90000,
    description:
      "Luxury duplex villa with private garden and premium amenities",
    images: [],
    documents: [],
    isOccupied: false,
    specifications: {
      furnished: true,
      parking: true,
      balcony: true,
      airConditioning: true,
      powerBackup: true,
      waterSupply: "24x7",
      internetReady: true,
      societyName: "Royal Enclave",
      maintenanceCharges: 5000,
      additionalFeatures: [
        "Private Garden",
        "Duplex Layout",
        "Premium Location",
        "Security Guard",
        "Club House Access",
      ],
    },
    rentHistory: [],
    maintenanceRecords: [],
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-01"),
  },
  {
    id: "flat_5",
    type: "flat",
    name: "Tech Park Residency",
    address:
      "Flat 501, Tech Park Residency, HITEC City, Hyderabad, Telangana 500081",
    doorNumber: "501",
    bedroomCount: 2,
    bathroomCount: 2,
    area: 1000,
    floor: 5,
    totalFloors: 12,
    rentAmount: 22000,
    securityDeposit: 44000,
    description: "Modern apartment in IT corridor with excellent connectivity",
    images: [],
    documents: [],
    isOccupied: false,
    specifications: {
      furnished: false,
      parking: true,
      balcony: true,
      airConditioning: false,
      powerBackup: true,
      waterSupply: "24x7",
      internetReady: true,
      societyName: "Tech Park Residency",
      maintenanceCharges: 1800,
      additionalFeatures: [
        "IT Park Proximity",
        "Metro Station Nearby",
        "Food Court",
      ],
    },
    rentHistory: [],
    maintenanceRecords: [],
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-10"),
  },
];

// Function to load sample data into localStorage for testing
export function loadSampleFlatData() {
  try {
    const existingFlats = localStorage.getItem("flats");
    if (!existingFlats || JSON.parse(existingFlats).length === 0) {
      localStorage.setItem("flats", JSON.stringify(sampleFlats));
      console.log("Sample flat data loaded successfully");
      return true;
    }
    console.log("Flats already exist, skipping sample data load");
    return false;
  } catch (error) {
    console.error("Error loading sample flat data:", error);
    return false;
  }
}

// Function to clear all flat data
export function clearFlatData() {
  try {
    localStorage.removeItem("flats");
    console.log("Flat data cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing flat data:", error);
    return false;
  }
}

// Function to load sample data for development/testing
export function loadSampleDataForDevelopment() {
  const flatsLoaded = loadSampleFlatData();

  if (flatsLoaded) {
    console.log("Sample data loaded for development:");
    console.log(`- ${sampleFlats.length} flats`);
    console.log("You can now test the flats management interface!");
  }

  return flatsLoaded;
}
