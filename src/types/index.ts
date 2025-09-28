// Core type definitions for the Family Business Management System

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  familyMemberId?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
}

export interface FamilyMember {
  id: string;
  fullName: string;
  nickname: string;
  profilePhoto?: string; // Base64 encoded image
  relationship: string;
  dateOfBirth?: Date;
  contactInfo: ContactInfo;
  documents: Document[];
  insurancePolicies: InsurancePolicy[];
  createdAt: Date;
  updatedAt: Date;
}

// Enhanced Property Management Types

export type PropertyType = "building" | "flat" | "land";

// Base Property Interface
export interface BaseProperty {
  id: string;
  type: PropertyType;
  name: string;
  address: string;
  description?: string;
  images: string[]; // Base64 encoded images
  documents: Document[];
  createdAt: Date;
  updatedAt: Date;
}

// Building Model - Contains multiple apartments
export interface Building extends BaseProperty {
  type: "building";
  buildingCode: string; // A, B, C, etc.
  totalFloors: number;
  totalApartments: number;
  apartments: Apartment[];
  amenities: string[];
  constructionYear?: number;
}

// Apartment Model - Individual units within buildings
export interface Apartment {
  id: string;
  buildingId: string;
  doorNumber: string; // D-No: 500, 501, etc.
  serviceNumber?: string; // Service number for utilities
  floor: number;
  bedroomCount: number; // 1, 2, 3 bedroom
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

export interface ApartmentSpecifications {
  furnished: boolean;
  parking: boolean;
  balcony: boolean;
  airConditioning: boolean;
  powerBackup: boolean;
  waterSupply: "24x7" | "limited" | "tanker";
  internetReady: boolean;
  additionalFeatures: string[];
}

// Flat Model - Standalone rental units
export interface Flat extends BaseProperty {
  type: "flat";
  doorNumber: string;
  serviceNumber?: string; // Service number for utilities
  bedroomCount: number;
  bathroomCount: number;
  area: number; // in sq ft
  floor: number;
  totalFloors: number;
  rentAmount: number;
  securityDeposit: number;
  isOccupied: boolean;
  currentTenant?: Tenant;
  specifications: FlatSpecifications;
  rentHistory: RentPayment[];
  maintenanceRecords: MaintenanceRecord[];
}

export interface FlatSpecifications {
  furnished: boolean;
  parking: boolean;
  balcony: boolean;
  airConditioning: boolean;
  powerBackup: boolean;
  waterSupply: "24x7" | "limited" | "tanker";
  internetReady: boolean;
  societyName?: string;
  maintenanceCharges?: number;
  additionalFeatures: string[];
}

// Land/Real Estate Model
export interface Land extends BaseProperty {
  type: "land";
  surveyNumber?: string;
  area: number; // in sq ft or acres
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
}

export interface LandLeaseTerms {
  leaseType: "agricultural" | "commercial" | "residential";
  rentAmount: number;
  rentFrequency: "monthly" | "quarterly" | "yearly";
  securityDeposit: number;
  leaseDuration: number; // in years
  renewalTerms?: string;
  restrictions?: string[];
}

// Enhanced Tenant Model with comprehensive information
export interface Tenant {
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
  propertyId?: string;
  propertyType?: string;
  buildingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TenantPersonalInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth?: Date;
  occupation: string;
  employer?: string;
  monthlyIncome?: number;
  maritalStatus: "single" | "married" | "divorced" | "widowed";
  familySize: number;
  nationality: string;
  religion?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface TenantIdentification {
  aadharNumber?: string;
  panNumber?: string;
  drivingLicense?: string;
  passport?: string;
  voterIdNumber?: string;
}

export interface RentalAgreement {
  agreementNumber: string;
  startDate: Date;
  endDate: Date;
  rentAmount: number;
  securityDeposit: number;
  maintenanceCharges?: number;
  rentDueDate: number; // day of month (1-31)
  paymentMethod: "cash" | "bank_transfer" | "cheque" | "upi";
  lateFeeAmount?: number;
  noticePeriod: number; // in days
  renewalTerms?: string;
  specialConditions?: string[];
}

export interface TenantReference {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  address?: string;
  verified: boolean;
}

// Legacy RentalProperty interface for backward compatibility
export interface RentalProperty {
  id: string;
  address: string;
  propertyType: "apartment" | "house" | "commercial";
  rentAmount: number;
  currentTenant?: Tenant;
  rentHistory: RentPayment[];
  maintenanceRecords: MaintenanceRecord[];
  documents: Document[];
  isVacant: boolean;
  createdAt: Date;
}

export interface RentPayment {
  id: string;
  tenantId: string;
  propertyId: string;
  propertyType: "building" | "flat" | "land";
  unitId?: string; // For apartments within buildings
  amount: number;
  dueDate: Date;
  paidDate?: Date;
  status: "pending" | "paid" | "overdue" | "partial";
  paymentMethod: "cash" | "bank_transfer" | "cheque" | "upi" | "card";
  transactionId?: string;
  receiptNumber?: string;
  notes?: string;
  lateFee?: number;
  discount?: number;
  actualAmountPaid?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface RentReceipt {
  id: string;
  receiptNumber: string;
  paymentId: string;
  tenantId: string;
  propertyId: string;
  propertyType: "building" | "flat" | "land";
  unitId?: string;
  tenantName: string;
  propertyAddress: string;
  rentPeriod: {
    startDate: Date;
    endDate: Date;
  };
  amount: number;
  lateFee?: number;
  discount?: number;
  totalAmount: number;
  paymentMethod: string;
  transactionId?: string;
  paidDate: Date;
  generatedDate: Date;
  generatedBy: string;
}

export interface RentCollectionReport {
  id: string;
  reportType: "monthly" | "quarterly" | "yearly" | "custom";
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalExpectedRent: number;
  totalCollectedRent: number;
  totalOutstandingRent: number;
  collectionRate: number;
  propertyBreakdown: PropertyRentBreakdown[];
  tenantBreakdown: TenantRentBreakdown[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  generatedDate: Date;
  generatedBy: string;
}

export interface PropertyRentBreakdown {
  propertyId: string;
  propertyName: string;
  propertyType: "building" | "flat" | "land";
  expectedRent: number;
  collectedRent: number;
  outstandingRent: number;
  collectionRate: number;
  tenantCount: number;
}

export interface TenantRentBreakdown {
  tenantId: string;
  tenantName: string;
  propertyId: string;
  propertyName: string;
  expectedRent: number;
  collectedRent: number;
  outstandingRent: number;
  paymentHistory: RentPayment[];
  lastPaymentDate?: Date;
  daysPastDue: number;
}

export interface PaymentMethodBreakdown {
  method: "cash" | "bank_transfer" | "cheque" | "upi" | "card";
  count: number;
  totalAmount: number;
  percentage: number;
}

export interface MaintenanceRecord {
  id: string;
  description: string;
  cost: number;
  date: Date;
  contractor?: string;
  documents: Document[];
}

export interface InsurancePolicy {
  id: string;
  policyNumber: string;
  type: "LIC" | "health" | "car" | "bike" | "property";
  provider: string;
  familyMemberId: string;
  premiumAmount: number;
  coverageAmount: number;
  startDate: Date;
  endDate: Date;
  renewalDate: Date;
  status: "active" | "expired" | "lapsed";
  documents: Document[];
  premiumHistory: PremiumPayment[];
}

export interface PremiumPayment {
  id: string;
  amount: number;
  paidDate: Date;
  dueDate: Date;
  paymentMethod: string;
}

export type DocumentCategory =
  | "aadhar"
  | "pan"
  | "driving_license"
  | "passport"
  | "house_documents"
  | "business_documents"
  | "insurance_documents"
  | "bank_documents"
  | "educational_certificates"
  | "medical_records";

export interface Document {
  id: string;
  title: string;
  category: DocumentCategory;
  fileData: string; // Base64 encoded file data
  fileName: string;
  fileSize: number;
  mimeType: string;
  familyMemberId?: string;
  propertyId?: string;
  insurancePolicyId?: string;
  expiryDate?: Date;
  issuedDate?: Date;
  issuer?: string;
  documentNumber?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DashboardData {
  summary: {
    totalProperties: number;
    totalRentDue: number;
    upcomingRenewals: number;
    expiringDocuments: number;
  };
  alerts: Alert[];
  recentActivities: Activity[];
  upcomingDeadlines: Deadline[];
}

export interface Alert {
  id: string;
  type: "urgent" | "warning" | "info";
  title: string;
  description: string;
  actionUrl?: string;
  createdAt: Date;
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  relatedId?: string;
}

export interface Deadline {
  id: string;
  title: string;
  date: Date;
  type: "insurance_renewal" | "document_expiry" | "rent_due";
  relatedId: string;
}
