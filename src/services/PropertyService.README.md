# PropertyService Documentation

The PropertyService provides comprehensive CRUD operations for the hierarchical property management system in the Family Business Management application. It handles Buildings, Apartments, Flats, Lands, and Tenants with localStorage persistence.

## Overview

The PropertyService implements a hierarchical property management system with three main property types:

1. **Buildings** - Multi-unit residential buildings containing apartments
2. **Flats** - Standalone rental units (independent houses/flats)
3. **Lands** - Agricultural, commercial, or residential land properties

Each property type can have associated tenants with comprehensive rental agreement information.

## Architecture

```
PropertyService
├── Buildings (with nested Apartments)
├── Flats (standalone units)
├── Lands (with lease information)
└── Tenants (comprehensive tenant data)
```

## Data Models

### Building

```typescript
interface Building {
  id: string;
  type: "building";
  name: string;
  address: string;
  buildingCode: string; // A, B, C, etc.
  totalFloors: number;
  totalApartments: number;
  apartments: Apartment[];
  amenities: string[];
  constructionYear?: number;
  images: string[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Apartment

```typescript
interface Apartment {
  id: string;
  buildingId: string;
  doorNumber: string; // D-No: 500, 501, etc.
  floor: number;
  bedroomCount: number;
  bathroomCount: number;
  area: number; // in sq ft
  rentAmount: number;
  securityDeposit: number;
  isOccupied: boolean;
  currentTenant?: Tenant;
  specifications: ApartmentSpecifications;
  rentHistory: RentPayment[];
  maintenanceRecords: MaintenanceRecord[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Flat

```typescript
interface Flat {
  id: string;
  type: "flat";
  name: string;
  address: string;
  doorNumber: string;
  bedroomCount: number;
  bathroomCount: number;
  area: number;
  floor: number;
  totalFloors: number;
  rentAmount: number;
  securityDeposit: number;
  isOccupied: boolean;
  currentTenant?: Tenant;
  specifications: FlatSpecifications;
  rentHistory: RentPayment[];
  maintenanceRecords: MaintenanceRecord[];
  images: string[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Land

```typescript
interface Land {
  id: string;
  type: "land";
  name: string;
  address: string;
  surveyNumber?: string;
  area: number;
  areaUnit: "sqft" | "acres" | "cents";
  zoning: "residential" | "commercial" | "agricultural" | "industrial";
  soilType?: string;
  waterSource?: string;
  roadAccess: boolean;
  electricityConnection: boolean;
  isLeased: boolean;
  currentTenant?: Tenant;
  leaseTerms?: LandLeaseTerms;
  rentHistory: RentPayment[];
  maintenanceRecords: MaintenanceRecord[];
  images: string[];
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Tenant

```typescript
interface Tenant {
  id: string;
  personalInfo: TenantPersonalInfo;
  contactInfo: ContactInfo;
  emergencyContact: EmergencyContact;
  identification: TenantIdentification;
  rentalAgreement: RentalAgreement;
  references: TenantReference[];
  documents: Document[];
  moveInDate: Date;
  moveOutDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Usage Examples

### Basic CRUD Operations

#### Buildings

```typescript
import { propertyService } from "@/services/PropertyService";

// Create a new building
const building: Building = {
  id: "building-1",
  type: "building",
  name: "Satyanarayana Apartments A",
  address: "123 Main Street, Hyderabad",
  buildingCode: "A",
  totalFloors: 3,
  totalApartments: 6,
  apartments: [],
  amenities: ["parking", "security", "elevator"],
  constructionYear: 2020,
  images: [],
  documents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Save building
propertyService.saveBuilding(building);

// Get all buildings
const buildings = propertyService.getBuildings();

// Get building by ID
const building = propertyService.getBuildingById("building-1");

// Update building
propertyService.updateBuilding("building-1", {
  name: "Updated Building Name",
  totalFloors: 4,
});

// Delete building
propertyService.deleteBuilding("building-1");
```

#### Apartments

```typescript
// Add apartment to building
const apartment: Apartment = {
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
    additionalFeatures: ["modular kitchen"],
  },
  rentHistory: [],
  maintenanceRecords: [],
  documents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

propertyService.addApartmentToBuilding("building-1", apartment);

// Get apartments by building
const apartments = propertyService.getApartmentsByBuildingId("building-1");

// Update apartment
propertyService.updateApartment("building-1", "apt-1", {
  rentAmount: 16000,
  isOccupied: true,
});
```

#### Flats

```typescript
// Create standalone flat
const flat: Flat = {
  id: "flat-1",
  type: "flat",
  name: "Green Valley Independent House",
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
    maintenanceCharges: 2000,
    additionalFeatures: ["gym", "swimming pool"],
  },
  rentHistory: [],
  maintenanceRecords: [],
  images: [],
  documents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

propertyService.saveFlat(flat);
```

#### Lands

```typescript
// Create land property
const land: Land = {
  id: "land-1",
  type: "land",
  name: "Agricultural Land - Survey 123",
  address: "Survey No. 123, Village ABC, District XYZ",
  surveyNumber: "123",
  area: 5,
  areaUnit: "acres",
  zoning: "agricultural",
  soilType: "red soil",
  waterSource: "borewell",
  roadAccess: true,
  electricityConnection: false,
  isLeased: false,
  leaseTerms: {
    leaseType: "agricultural",
    rentAmount: 50000,
    rentFrequency: "yearly",
    securityDeposit: 100000,
    leaseDuration: 5,
    renewalTerms: "Renewable for additional 5 years",
    restrictions: ["No construction allowed", "Only agricultural use"],
  },
  rentHistory: [],
  maintenanceRecords: [],
  images: [],
  documents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

propertyService.saveLand(land);
```

#### Tenants

```typescript
// Create comprehensive tenant record
const tenant: Tenant = {
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
    religion: "Hindu",
  },
  contactInfo: {
    phone: "9876543210",
    email: "john.doe@email.com",
    address: "Current Address, City, State",
  },
  emergencyContact: {
    name: "Jane Doe",
    relationship: "spouse",
    phone: "9876543211",
    email: "jane.doe@email.com",
  },
  identification: {
    aadharNumber: "1234-5678-9012",
    panNumber: "ABCDE1234F",
    drivingLicense: "DL1234567890",
    voterIdNumber: "VOTER123456",
  },
  rentalAgreement: {
    agreementNumber: "AGR-001-2024",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2025-01-01"),
    rentAmount: 15000,
    securityDeposit: 30000,
    maintenanceCharges: 1000,
    rentDueDate: 5,
    paymentMethod: "bank_transfer",
    lateFeeAmount: 500,
    noticePeriod: 30,
    renewalTerms: "Renewable with 10% increase",
    specialConditions: ["No pets allowed", "No smoking"],
  },
  references: [
    {
      name: "Reference Person",
      relationship: "friend",
      phone: "9876543212",
      email: "reference@email.com",
      verified: true,
    },
  ],
  documents: [],
  moveInDate: new Date("2024-01-01"),
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

propertyService.saveTenant(tenant);
```

### Advanced Operations

#### Property Statistics

```typescript
// Get comprehensive property statistics
const stats = propertyService.getPropertyStatistics();
console.log(stats);
// Output:
// {
//   buildings: { total: 5, occupied: 3, vacant: 2 },
//   flats: { total: 10, occupied: 7, vacant: 3 },
//   lands: { total: 3, leased: 2, vacant: 1 },
//   totalUnits: 18,
//   totalOccupied: 12,
//   occupancyRate: 66.67
// }
```

#### Search Operations

```typescript
// Search all properties
const results = propertyService.searchProperties("Satyanarayana");

// Search by property type
const buildings = propertyService.searchProperties("", "building");
const flats = propertyService.searchProperties("", "flat");
const lands = propertyService.searchProperties("", "land");
```

#### Data Export/Import

```typescript
// Export all property data
const exportData = propertyService.exportPropertyData();

// Import property data
propertyService.importPropertyData({
  buildings: importedBuildings,
  flats: importedFlats,
  lands: importedLands,
  tenants: importedTenants,
});
```

## Utility Functions

The PropertyService works with utility functions from `propertyUtils.ts`:

```typescript
import {
  generatePropertyId,
  validateDoorNumber,
  calculateBuildingOccupancy,
  formatRentAmount,
  filterPropertiesByOccupancy,
  sortPropertiesByRent,
} from "@/utils/propertyUtils";

// Generate unique IDs
const buildingId = generatePropertyId("building");
const flatId = generatePropertyId("flat");
const landId = generatePropertyId("land");

// Validate data
const isValidDoor = validateDoorNumber("101"); // true
const isValidRent = validateRentAmount(15000); // true

// Calculate statistics
const occupancy = calculateBuildingOccupancy(building);

// Format display values
const formattedRent = formatRentAmount(15000); // ₹15,000
```

## Error Handling

The PropertyService includes comprehensive error handling:

```typescript
import {
  LocalStorageError,
  LocalStorageErrorCodes,
} from "./LocalStorageService";

try {
  propertyService.saveBuilding(building);
} catch (error) {
  if (error instanceof LocalStorageError) {
    switch (error.code) {
      case LocalStorageErrorCodes.VALIDATION_ERROR:
        console.error("Validation failed:", error.message);
        break;
      case LocalStorageErrorCodes.QUOTA_EXCEEDED:
        console.error("Storage quota exceeded:", error.message);
        break;
      case LocalStorageErrorCodes.NOT_FOUND:
        console.error("Item not found:", error.message);
        break;
      default:
        console.error("Storage error:", error.message);
    }
  }
}
```

## Storage Keys

The PropertyService uses the following localStorage keys:

- `buildings` - Building data
- `flats` - Flat data
- `lands` - Land data
- `tenants` - Tenant data

## Best Practices

1. **Always validate data** before saving using utility functions
2. **Handle errors gracefully** with try-catch blocks
3. **Use utility functions** for formatting and calculations
4. **Maintain relationships** between properties and tenants
5. **Regular backups** using export functionality
6. **Monitor storage usage** to avoid quota issues

## Testing

The PropertyService includes comprehensive unit tests covering:

- CRUD operations for all property types
- Data validation and error handling
- Search and filtering functionality
- Statistics calculations
- Export/import operations

Run tests with:

```bash
npm test PropertyService.test.ts
```

## Integration

The PropertyService integrates with:

- **LocalStorageService** - For data persistence
- **FileService** - For image and document handling
- **Property utilities** - For validation and formatting
- **React components** - For UI interactions

## Performance Considerations

- Data is stored in localStorage with automatic serialization
- Large datasets may impact performance
- Consider pagination for large property lists
- Use search and filtering to reduce data processing
- Monitor storage quota usage regularly
