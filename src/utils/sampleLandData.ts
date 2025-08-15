import { Land, Tenant } from "@/types";

// Sample tenant data for lands
const sampleTenant: Tenant = {
  id: "tenant_land_001",
  personalInfo: {
    firstName: "Ramesh",
    lastName: "Kumar",
    fullName: "Ramesh Kumar",
    dateOfBirth: new Date("1980-05-15"),
    occupation: "Farmer",
    employer: "Self Employed",
    monthlyIncome: 25000,
    maritalStatus: "married",
    familySize: 4,
    nationality: "Indian",
    religion: "Hindu",
  },
  contactInfo: {
    phone: "+91 9876543210",
    email: "ramesh.kumar@email.com",
    address:
      "Village Annavaram, Mandal Annavaram, District East Godavari, Andhra Pradesh",
  },
  emergencyContact: {
    name: "Lakshmi Kumar",
    relationship: "Wife",
    phone: "+91 9876543211",
    email: "lakshmi.kumar@email.com",
  },
  identification: {
    aadharNumber: "1234 5678 9012",
    panNumber: "ABCDE1234F",
    voterIdNumber: "ABC1234567",
  },
  rentalAgreement: {
    agreementNumber: "LAND-AGR-001",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2029-01-01"),
    rentAmount: 50000,
    securityDeposit: 100000,
    rentDueDate: 1,
    paymentMethod: "bank_transfer",
    noticePeriod: 30,
    renewalTerms: "Rent will be increased by 5% every year",
    specialConditions: [
      "No construction without permission",
      "Maintain soil quality",
    ],
  },
  references: [
    {
      name: "Suresh Reddy",
      relationship: "Village Head",
      phone: "+91 9876543212",
      verified: true,
    },
  ],
  documents: [],
  moveInDate: new Date("2024-01-01"),
  isActive: true,
  createdAt: new Date("2024-01-01"),
  updatedAt: new Date("2024-01-01"),
};

export const sampleLandData: Land[] = [
  {
    id: "land_001",
    type: "land",
    name: "Agricultural Land - Annavaram",
    address:
      "Survey No. 123/A, Village Annavaram, Mandal Annavaram, District East Godavari, Andhra Pradesh - 533406",
    description:
      "Fertile agricultural land suitable for paddy cultivation with good water source and road connectivity.",
    images: [],
    documents: [],
    surveyNumber: "123/A",
    area: 5,
    areaUnit: "acres",
    zoning: "agricultural",
    soilType: "Black soil",
    waterSource: "Canal irrigation",
    roadAccess: true,
    electricityConnection: true,
    isLeased: true,
    currentTenant: sampleTenant,
    leaseTerms: {
      leaseType: "agricultural",
      rentAmount: 50000,
      rentFrequency: "yearly",
      securityDeposit: 100000,
      leaseDuration: 5,
      renewalTerms: "Rent will be increased by 5% every year",
      restrictions: [
        "No construction without permission",
        "Maintain soil quality",
        "Use only organic fertilizers",
      ],
    },
    rentHistory: [
      {
        id: "rent_land_001",
        amount: 50000,
        dueDate: new Date("2024-01-01"),
        paidDate: new Date("2024-01-01"),
        status: "paid",
        paymentMethod: "bank_transfer",
      },
    ],
    maintenanceRecords: [],
    createdAt: new Date("2023-12-01"),
    updatedAt: new Date("2024-01-01"),
  },
  {
    id: "land_002",
    type: "land",
    name: "Commercial Plot - Rajahmundry",
    address:
      "Plot No. 45, Commercial Complex Area, Rajahmundry, East Godavari, Andhra Pradesh - 533101",
    description:
      "Prime commercial land in the heart of Rajahmundry city, suitable for retail or office development.",
    images: [],
    documents: [],
    surveyNumber: "45/B",
    area: 2400,
    areaUnit: "sqft",
    zoning: "commercial",
    soilType: "Red soil",
    waterSource: "Municipal water",
    roadAccess: true,
    electricityConnection: true,
    isLeased: false,
    rentHistory: [],
    maintenanceRecords: [],
    createdAt: new Date("2023-11-15"),
    updatedAt: new Date("2023-11-15"),
  },
  {
    id: "land_003",
    type: "land",
    name: "Residential Plot - Kakinada",
    address:
      "Plot No. 78, Residential Layout, Kakinada, East Godavari, Andhra Pradesh - 533001",
    description:
      "Residential plot in a well-developed layout with all amenities and good connectivity.",
    images: [],
    documents: [],
    surveyNumber: "78/C",
    area: 1800,
    areaUnit: "sqft",
    zoning: "residential",
    roadAccess: true,
    electricityConnection: true,
    isLeased: false,
    rentHistory: [],
    maintenanceRecords: [],
    createdAt: new Date("2023-10-20"),
    updatedAt: new Date("2023-10-20"),
  },
  {
    id: "land_004",
    type: "land",
    name: "Industrial Land - Kakinada Port",
    address:
      "Survey No. 234/D, Industrial Area, Near Kakinada Port, East Godavari, Andhra Pradesh - 533005",
    description:
      "Large industrial land near Kakinada port, suitable for manufacturing and logistics operations.",
    images: [],
    documents: [],
    surveyNumber: "234/D",
    area: 10,
    areaUnit: "acres",
    zoning: "industrial",
    soilType: "Sandy soil",
    waterSource: "Borewell",
    roadAccess: true,
    electricityConnection: true,
    isLeased: true,
    leaseTerms: {
      leaseType: "commercial",
      rentAmount: 200000,
      rentFrequency: "monthly",
      securityDeposit: 2400000,
      leaseDuration: 10,
      renewalTerms: "Rent review every 3 years with 10% increase",
      restrictions: [
        "Environmental compliance required",
        "No hazardous materials storage",
      ],
    },
    rentHistory: [],
    maintenanceRecords: [],
    createdAt: new Date("2023-09-10"),
    updatedAt: new Date("2023-09-10"),
  },
];

// Function to populate sample data
export const populateSampleLandData = () => {
  try {
    // Check if data already exists
    const existingLands = localStorage.getItem("lands");
    if (!existingLands || JSON.parse(existingLands).length === 0) {
      localStorage.setItem("lands", JSON.stringify(sampleLandData));
      console.log("Sample land data populated successfully");
      return true;
    }
    console.log("Land data already exists, skipping population");
    return false;
  } catch (error) {
    console.error("Error populating sample land data:", error);
    return false;
  }
};

// Function to clear sample data
export const clearSampleLandData = () => {
  try {
    localStorage.removeItem("lands");
    console.log("Sample land data cleared successfully");
    return true;
  } catch (error) {
    console.error("Error clearing sample land data:", error);
    return false;
  }
};
