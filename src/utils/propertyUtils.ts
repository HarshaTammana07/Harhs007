import { Building, Apartment, Flat, Land, Tenant, PropertyType } from "@/types";

/**
 * Utility functions for property management operations
 */

// ID Generation
export const generatePropertyId = (type: PropertyType): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `${type}-${timestamp}-${random}`;
};

export const generateApartmentId = (buildingId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 3);
  return `apt-${buildingId}-${timestamp}-${random}`;
};

export const generateTenantId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 5);
  return `tenant-${timestamp}-${random}`;
};

// Property Validation
export const validateDoorNumber = (doorNumber: string): boolean => {
  // Allow formats like: 101, 2A, D-500, etc.
  const doorNumberRegex = /^[A-Za-z0-9\-]+$/;
  return doorNumberRegex.test(doorNumber) && doorNumber.length > 0;
};

export const validateRentAmount = (amount: number): boolean => {
  return amount >= 0 && Number.isFinite(amount);
};

export const validateArea = (area: number): boolean => {
  return area > 0 && Number.isFinite(area);
};

export const validateFloorNumber = (
  floor: number,
  totalFloors: number
): boolean => {
  return floor >= 0 && floor <= totalFloors && Number.isInteger(floor);
};

// Property Statistics
export const calculateBuildingOccupancy = (
  building: Building
): {
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
} => {
  const totalUnits = building.apartments?.length || 0;
  const occupiedUnits =
    building.apartments?.filter((apt) => apt.isOccupied).length || 0;
  const vacantUnits = totalUnits - occupiedUnits;
  const occupancyRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0;

  return {
    totalUnits,
    occupiedUnits,
    vacantUnits,
    occupancyRate: Math.round(occupancyRate * 100) / 100,
  };
};

export const calculateTotalRentForBuilding = (building: Building): number => {
  return (
    building.apartments?.reduce((total, apartment) => {
      return apartment.isOccupied ? total + apartment.rentAmount : total;
    }, 0) || 0
  );
};

export const calculateTotalRentForFlats = (flats: Flat[]): number => {
  return flats.reduce((total, flat) => {
    return flat.isOccupied ? total + flat.rentAmount : total;
  }, 0);
};

export const calculateTotalRentForLands = (lands: Land[]): number => {
  return lands.reduce((total, land) => {
    return land.isLeased && land.leaseTerms
      ? total + land.leaseTerms.rentAmount
      : total;
  }, 0);
};

// Property Filtering and Sorting
export const filterPropertiesByOccupancy = <
  T extends { isOccupied?: boolean; isLeased?: boolean },
>(
  properties: T[],
  occupancyFilter: "all" | "occupied" | "vacant"
): T[] => {
  if (occupancyFilter === "all") return properties;

  return properties.filter((property) => {
    const isOccupied = property.isOccupied || property.isLeased || false;
    return occupancyFilter === "occupied" ? isOccupied : !isOccupied;
  });
};

export const filterPropertiesByBedroomCount = <
  T extends { bedroomCount?: number },
>(
  properties: T[],
  bedroomCount: number | null
): T[] => {
  if (bedroomCount === null) return properties;
  return properties.filter(
    (property) => property.bedroomCount === bedroomCount
  );
};

export const filterPropertiesByRentRange = <T extends { rentAmount?: number }>(
  properties: T[],
  minRent: number | null,
  maxRent: number | null
): T[] => {
  return properties.filter((property) => {
    if (!property.rentAmount) return false;
    if (minRent !== null && property.rentAmount < minRent) return false;
    if (maxRent !== null && property.rentAmount > maxRent) return false;
    return true;
  });
};

export const sortPropertiesByRent = <T extends { rentAmount?: number }>(
  properties: T[],
  order: "asc" | "desc" = "asc"
): T[] => {
  return [...properties].sort((a, b) => {
    const rentA = a.rentAmount || 0;
    const rentB = b.rentAmount || 0;
    return order === "asc" ? rentA - rentB : rentB - rentA;
  });
};

export const sortPropertiesByName = <T extends { name: string }>(
  properties: T[],
  order: "asc" | "desc" = "asc"
): T[] => {
  return [...properties].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name);
    return order === "asc" ? comparison : -comparison;
  });
};

// Apartment-specific utilities
export const getApartmentsByFloor = (
  apartments: Apartment[],
  floor: number
): Apartment[] => {
  return apartments.filter((apartment) => apartment.floor === floor);
};

export const getAvailableApartments = (
  apartments: Apartment[]
): Apartment[] => {
  return apartments.filter((apartment) => !apartment.isOccupied);
};

export const getOccupiedApartments = (apartments: Apartment[]): Apartment[] => {
  return apartments.filter((apartment) => apartment.isOccupied);
};

// Tenant utilities
export const calculateTenantAge = (tenant: Tenant): number | null => {
  if (!tenant.personalInfo.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(tenant.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

export const isLeaseExpiringSoon = (
  tenant: Tenant,
  daysThreshold: number = 30
): boolean => {
  const today = new Date();
  const leaseEndDate = new Date(tenant.rentalAgreement.endDate);
  const timeDiff = leaseEndDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

  return daysDiff <= daysThreshold && daysDiff > 0;
};

export const isLeaseExpired = (tenant: Tenant): boolean => {
  const today = new Date();
  const leaseEndDate = new Date(tenant.rentalAgreement.endDate);
  return leaseEndDate < today;
};

export const getActiveTenants = (tenants: Tenant[]): Tenant[] => {
  return tenants.filter((tenant) => tenant.isActive);
};

export const getInactiveTenants = (tenants: Tenant[]): Tenant[] => {
  return tenants.filter((tenant) => !tenant.isActive);
};

// Property search utilities
export const searchPropertiesByText = <
  T extends { name: string; address: string },
>(
  properties: T[],
  searchTerm: string
): T[] => {
  if (!searchTerm.trim()) return properties;

  const term = searchTerm.toLowerCase();
  return properties.filter(
    (property) =>
      property.name.toLowerCase().includes(term) ||
      property.address.toLowerCase().includes(term)
  );
};

export const searchApartmentsByDoorNumber = (
  apartments: Apartment[],
  doorNumber: string
): Apartment[] => {
  if (!doorNumber.trim()) return apartments;

  const term = doorNumber.toLowerCase();
  return apartments.filter((apartment) =>
    apartment.doorNumber.toLowerCase().includes(term)
  );
};

// Property formatting utilities
export const formatRentAmount = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatArea = (area: number, unit: string = "sq ft"): string => {
  return `${area.toLocaleString()} ${unit}`;
};

export const formatBedroomCount = (count: number): string => {
  if (count === 1) return "1 Bedroom";
  return `${count} Bedrooms`;
};

export const formatPropertyAddress = (
  address: string,
  maxLength: number = 50
): string => {
  if (address.length <= maxLength) return address;
  return address.substring(0, maxLength - 3) + "...";
};

// Property status utilities
export const getPropertyStatusColor = (isOccupied: boolean): string => {
  return isOccupied ? "text-green-600" : "text-red-600";
};

export const getPropertyStatusText = (isOccupied: boolean): string => {
  return isOccupied ? "Occupied" : "Vacant";
};

export const getLeaseStatusColor = (tenant: Tenant): string => {
  if (!tenant.isActive) return "text-gray-600";
  if (isLeaseExpired(tenant)) return "text-red-600";
  if (isLeaseExpiringSoon(tenant)) return "text-yellow-600";
  return "text-green-600";
};

export const getLeaseStatusText = (tenant: Tenant): string => {
  if (!tenant.isActive) return "Inactive";
  if (isLeaseExpired(tenant)) return "Expired";
  if (isLeaseExpiringSoon(tenant)) return "Expiring Soon";
  return "Active";
};

// Data validation utilities
export const validateBuildingData = (building: Partial<Building>): string[] => {
  const errors: string[] = [];

  if (!building.name?.trim()) errors.push("Building name is required");
  if (!building.address?.trim()) errors.push("Building address is required");
  if (!building.buildingCode?.trim()) errors.push("Building code is required");
  if (!building.totalFloors || building.totalFloors < 1)
    errors.push("Total floors must be at least 1");

  return errors;
};

export const validateApartmentData = (
  apartment: Partial<Apartment>
): string[] => {
  const errors: string[] = [];

  if (!apartment.doorNumber?.trim()) errors.push("Door number is required");
  if (!apartment.bedroomCount || apartment.bedroomCount < 0)
    errors.push("Bedroom count must be 0 or more");
  if (!apartment.bathroomCount || apartment.bathroomCount < 0)
    errors.push("Bathroom count must be 0 or more");
  if (!apartment.area || apartment.area <= 0)
    errors.push("Area must be greater than 0");
  if (!apartment.rentAmount || apartment.rentAmount < 0)
    errors.push("Rent amount must be 0 or more");
  if (!apartment.securityDeposit || apartment.securityDeposit < 0)
    errors.push("Security deposit must be 0 or more");

  return errors;
};

export const validateFlatData = (flat: Partial<Flat>): string[] => {
  const errors: string[] = [];

  if (!flat.name?.trim()) errors.push("Flat name is required");
  if (!flat.address?.trim()) errors.push("Flat address is required");
  if (!flat.doorNumber?.trim()) errors.push("Door number is required");
  if (!flat.bedroomCount || flat.bedroomCount < 0)
    errors.push("Bedroom count must be 0 or more");
  if (!flat.area || flat.area <= 0) errors.push("Area must be greater than 0");
  if (!flat.rentAmount || flat.rentAmount < 0)
    errors.push("Rent amount must be 0 or more");

  return errors;
};

export const validateLandData = (land: Partial<Land>): string[] => {
  const errors: string[] = [];

  if (!land.name?.trim()) errors.push("Land name is required");
  if (!land.address?.trim()) errors.push("Land address is required");
  if (!land.area || land.area <= 0) errors.push("Area must be greater than 0");
  if (!land.areaUnit?.trim()) errors.push("Area unit is required");
  if (!land.zoning?.trim()) errors.push("Zoning information is required");

  return errors;
};

export const validateTenantData = (tenant: Partial<Tenant>): string[] => {
  const errors: string[] = [];

  if (!tenant.personalInfo?.fullName?.trim())
    errors.push("Full name is required");
  if (!tenant.contactInfo?.phone?.trim())
    errors.push("Phone number is required");
  if (!tenant.rentalAgreement?.agreementNumber?.trim())
    errors.push("Agreement number is required");
  if (!tenant.rentalAgreement?.startDate)
    errors.push("Lease start date is required");
  if (!tenant.rentalAgreement?.endDate)
    errors.push("Lease end date is required");
  if (
    !tenant.rentalAgreement?.rentAmount ||
    tenant.rentalAgreement.rentAmount < 0
  ) {
    errors.push("Rent amount must be 0 or more");
  }

  return errors;
};
