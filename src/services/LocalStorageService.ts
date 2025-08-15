import {
  FamilyMember,
  RentalProperty,
  InsurancePolicy,
  Document,
} from "@/types";

/**
 * Error types for LocalStorage operations
 */
export class LocalStorageError extends Error {
  constructor(
    message: string,
    public code: string
  ) {
    super(message);
    this.name = "LocalStorageError";
  }
}

export const LocalStorageErrorCodes = {
  QUOTA_EXCEEDED: "QUOTA_EXCEEDED",
  PARSE_ERROR: "PARSE_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  STORAGE_UNAVAILABLE: "STORAGE_UNAVAILABLE",
} as const;

/**
 * Interface for storage quota information
 */
export interface StorageQuota {
  used: number;
  available: number;
  total: number;
  percentage: number;
}

/**
 * Interface for export data structure
 */
export interface ExportData {
  familyMembers: FamilyMember[];
  properties: RentalProperty[];
  insurancePolicies: InsurancePolicy[];
  documents: Document[];
  exportDate: string;
  version: string;
}

/**
 * LocalStorageService - Handles all localStorage operations for the Family Business Management System
 * Provides CRUD operations, data validation, error handling, and export/import functionality
 */
export class LocalStorageService {
  private static readonly KEYS = {
    FAMILY_MEMBERS: "family_members",
    PROPERTIES: "properties",
    INSURANCE_POLICIES: "insurance_policies",
    DOCUMENTS: "documents",
    USER_SESSION: "user_session",
    // Enhanced Property Management Keys
    BUILDINGS: "buildings",
    FLATS: "flats",
    LANDS: "lands",
    TENANTS: "tenants",
  } as const;

  private static readonly DATA_VERSION = "1.0.0";
  private static readonly MAX_STORAGE_SIZE = 5 * 1024 * 1024; // 5MB default limit

  constructor() {
    // Don't validate storage availability during construction
    // It will be validated when actually needed
  }

  /**
   * Validates if localStorage is available
   */
  private validateStorageAvailability(): void {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      throw new LocalStorageError(
        "localStorage is not available (SSR environment)",
        LocalStorageErrorCodes.STORAGE_UNAVAILABLE
      );
    }

    try {
      const testKey = "__localStorage_test__";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
    } catch (error) {
      throw new LocalStorageError(
        "localStorage is not available",
        LocalStorageErrorCodes.STORAGE_UNAVAILABLE
      );
    }
  }

  /**
   * Generic method to get data from localStorage with error handling
   */
  private getFromStorage<T>(key: string): T[] {
    this.validateStorageAvailability();

    try {
      const item = localStorage.getItem(key);
      if (!item) return [];

      const parsed = JSON.parse(item);
      return this.validateAndDeserialize<T>(parsed, key);
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      if (error instanceof SyntaxError) {
        throw new LocalStorageError(
          `Invalid JSON data in localStorage for key "${key}"`,
          LocalStorageErrorCodes.PARSE_ERROR
        );
      }
      throw error;
    }
  }

  /**
   * Generic method to save data to localStorage with error handling
   */
  private saveToStorage<T>(key: string, data: T[]): void {
    this.validateStorageAvailability();

    try {
      const serialized = this.serializeData(data);
      const jsonString = JSON.stringify(serialized);

      // Check storage quota before saving
      this.checkStorageQuota(jsonString.length);

      localStorage.setItem(key, jsonString);
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

  /**
   * Validates and deserializes data from localStorage
   */
  private validateAndDeserialize<T>(data: any, key: string): T[] {
    if (!Array.isArray(data)) {
      console.warn(
        `Data for key "${key}" is not an array, returning empty array`
      );
      return [];
    }

    return data.map((item) => this.deserializeItem(item));
  }

  /**
   * Serializes data for storage (handles Date objects)
   */
  private serializeData<T>(data: T[]): any[] {
    return data.map((item) => this.serializeItem(item));
  }

  /**
   * Serializes individual item (converts Date objects to ISO strings)
   */
  private serializeItem(item: any): any {
    if (item === null || item === undefined) return item;

    if (item instanceof Date) {
      return { __type: "Date", value: item.toISOString() };
    }

    if (Array.isArray(item)) {
      return item.map((subItem) => this.serializeItem(subItem));
    }

    if (typeof item === "object") {
      const serialized: any = {};
      for (const [key, value] of Object.entries(item)) {
        serialized[key] = this.serializeItem(value);
      }
      return serialized;
    }

    return item;
  }

  /**
   * Deserializes individual item (converts ISO strings back to Date objects)
   */
  private deserializeItem(item: any): any {
    if (item === null || item === undefined) return item;

    if (typeof item === "object" && item.__type === "Date") {
      return new Date(item.value);
    }

    if (Array.isArray(item)) {
      return item.map((subItem) => this.deserializeItem(subItem));
    }

    if (typeof item === "object") {
      const deserialized: any = {};
      for (const [key, value] of Object.entries(item)) {
        deserialized[key] = this.deserializeItem(value);
      }
      return deserialized;
    }

    return item;
  }

  /**
   * Checks storage quota and throws error if exceeded
   */
  private checkStorageQuota(additionalSize: number): void {
    const quota = this.getStorageQuota();
    const projectedUsage = quota.used + additionalSize;

    if (projectedUsage > LocalStorageService.MAX_STORAGE_SIZE) {
      throw new LocalStorageError(
        `Storage quota would be exceeded. Current: ${quota.used} bytes, Additional: ${additionalSize} bytes, Limit: ${LocalStorageService.MAX_STORAGE_SIZE} bytes`,
        LocalStorageErrorCodes.QUOTA_EXCEEDED
      );
    }
  }

  /**
   * Gets current storage quota information
   */
  public getStorageQuota(): StorageQuota {
    this.validateStorageAvailability();

    let used = 0;

    // Calculate used storage
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage.getItem(key)?.length || 0;
      }
    }

    const total = LocalStorageService.MAX_STORAGE_SIZE;
    const available = total - used;
    const percentage = (used / total) * 100;

    return {
      used,
      available,
      total,
      percentage: Math.round(percentage * 100) / 100,
    };
  }

  // Family Members CRUD Operations
  public getFamilyMembers(): FamilyMember[] {
    return this.getFromStorage<FamilyMember>(
      LocalStorageService.KEYS.FAMILY_MEMBERS
    );
  }

  public getFamilyMemberById(id: string): FamilyMember | null {
    const members = this.getFamilyMembers();
    return members.find((member) => member.id === id) || null;
  }

  public saveFamilyMember(member: FamilyMember): void {
    this.validateFamilyMember(member);
    const members = this.getFamilyMembers();
    members.push(member);
    this.saveToStorage(LocalStorageService.KEYS.FAMILY_MEMBERS, members);
  }

  public updateFamilyMember(id: string, updates: Partial<FamilyMember>): void {
    const members = this.getFamilyMembers();
    const index = members.findIndex((member) => member.id === id);

    if (index === -1) {
      throw new LocalStorageError(
        `Family member with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedMember = {
      ...members[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.validateFamilyMember(updatedMember);

    members[index] = updatedMember;
    this.saveToStorage(LocalStorageService.KEYS.FAMILY_MEMBERS, members);
  }

  public deleteFamilyMember(id: string): void {
    const members = this.getFamilyMembers();
    const filteredMembers = members.filter((member) => member.id !== id);

    if (members.length === filteredMembers.length) {
      throw new LocalStorageError(
        `Family member with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    this.saveToStorage(
      LocalStorageService.KEYS.FAMILY_MEMBERS,
      filteredMembers
    );
  }

  private validateFamilyMember(member: FamilyMember): void {
    if (!member.id || !member.fullName || !member.nickname) {
      throw new LocalStorageError(
        "Family member must have id, fullName, and nickname",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // Properties CRUD Operations
  public getProperties(): RentalProperty[] {
    return this.getFromStorage<RentalProperty>(
      LocalStorageService.KEYS.PROPERTIES
    );
  }

  public getPropertyById(id: string): RentalProperty | null {
    const properties = this.getProperties();
    return properties.find((property) => property.id === id) || null;
  }

  public saveProperty(property: RentalProperty): void {
    this.validateProperty(property);
    const properties = this.getProperties();
    properties.push(property);
    this.saveToStorage(LocalStorageService.KEYS.PROPERTIES, properties);
  }

  public updateProperty(id: string, updates: Partial<RentalProperty>): void {
    const properties = this.getProperties();
    const index = properties.findIndex((property) => property.id === id);

    if (index === -1) {
      throw new LocalStorageError(
        `Property with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedProperty = { ...properties[index], ...updates };
    this.validateProperty(updatedProperty);

    properties[index] = updatedProperty;
    this.saveToStorage(LocalStorageService.KEYS.PROPERTIES, properties);
  }

  public deleteProperty(id: string): void {
    const properties = this.getProperties();
    const filteredProperties = properties.filter(
      (property) => property.id !== id
    );

    if (properties.length === filteredProperties.length) {
      throw new LocalStorageError(
        `Property with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    this.saveToStorage(LocalStorageService.KEYS.PROPERTIES, filteredProperties);
  }

  private validateProperty(property: RentalProperty): void {
    if (!property.id || !property.address || property.rentAmount < 0) {
      throw new LocalStorageError(
        "Property must have id, address, and non-negative rent amount",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // Insurance Policies CRUD Operations
  public getInsurancePolicies(): InsurancePolicy[] {
    return this.getFromStorage<InsurancePolicy>(
      LocalStorageService.KEYS.INSURANCE_POLICIES
    );
  }

  public getInsurancePolicyById(id: string): InsurancePolicy | null {
    const policies = this.getInsurancePolicies();
    return policies.find((policy) => policy.id === id) || null;
  }

  public saveInsurancePolicy(policy: InsurancePolicy): void {
    this.validateInsurancePolicy(policy);
    const policies = this.getInsurancePolicies();
    policies.push(policy);
    this.saveToStorage(LocalStorageService.KEYS.INSURANCE_POLICIES, policies);
  }

  public updateInsurancePolicy(
    id: string,
    updates: Partial<InsurancePolicy>
  ): void {
    const policies = this.getInsurancePolicies();
    const index = policies.findIndex((policy) => policy.id === id);

    if (index === -1) {
      throw new LocalStorageError(
        `Insurance policy with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedPolicy = { ...policies[index], ...updates };
    this.validateInsurancePolicy(updatedPolicy);

    policies[index] = updatedPolicy;
    this.saveToStorage(LocalStorageService.KEYS.INSURANCE_POLICIES, policies);
  }

  public deleteInsurancePolicy(id: string): void {
    const policies = this.getInsurancePolicies();
    const filteredPolicies = policies.filter((policy) => policy.id !== id);

    if (policies.length === filteredPolicies.length) {
      throw new LocalStorageError(
        `Insurance policy with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    this.saveToStorage(
      LocalStorageService.KEYS.INSURANCE_POLICIES,
      filteredPolicies
    );
  }

  private validateInsurancePolicy(policy: InsurancePolicy): void {
    if (!policy.id || !policy.policyNumber || !policy.familyMemberId) {
      throw new LocalStorageError(
        "Insurance policy must have id, policyNumber, and familyMemberId",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // Documents CRUD Operations
  public getDocuments(): Document[] {
    return this.getFromStorage<Document>(LocalStorageService.KEYS.DOCUMENTS);
  }

  public getDocumentById(id: string): Document | null {
    const documents = this.getDocuments();
    return documents.find((document) => document.id === id) || null;
  }

  public saveDocument(document: Document): void {
    this.validateDocument(document);
    const documents = this.getDocuments();
    documents.push(document);
    this.saveToStorage(LocalStorageService.KEYS.DOCUMENTS, documents);
  }

  public updateDocument(id: string, updates: Partial<Document>): void {
    const documents = this.getDocuments();
    const index = documents.findIndex((document) => document.id === id);

    if (index === -1) {
      throw new LocalStorageError(
        `Document with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedDocument = {
      ...documents[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.validateDocument(updatedDocument);

    documents[index] = updatedDocument;
    this.saveToStorage(LocalStorageService.KEYS.DOCUMENTS, documents);
  }

  public deleteDocument(id: string): void {
    const documents = this.getDocuments();
    const filteredDocuments = documents.filter(
      (document) => document.id !== id
    );

    if (documents.length === filteredDocuments.length) {
      throw new LocalStorageError(
        `Document with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    this.saveToStorage(LocalStorageService.KEYS.DOCUMENTS, filteredDocuments);
  }

  private validateDocument(document: Document): void {
    if (
      !document.id ||
      !document.title ||
      !document.fileName ||
      !document.fileData
    ) {
      throw new LocalStorageError(
        "Document must have id, title, fileName, and fileData",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // Enhanced Property Management Methods
  public getBuildings(): any[] {
    return this.getFromStorage(LocalStorageService.KEYS.BUILDINGS);
  }

  public getFlats(): any[] {
    return this.getFromStorage(LocalStorageService.KEYS.FLATS);
  }

  public getLands(): any[] {
    return this.getFromStorage(LocalStorageService.KEYS.LANDS);
  }

  public getTenants(): any[] {
    return this.getFromStorage(LocalStorageService.KEYS.TENANTS);
  }

  public saveBuildings(buildings: any[]): void {
    this.saveToStorage(LocalStorageService.KEYS.BUILDINGS, buildings);
  }

  public saveFlats(flats: any[]): void {
    this.saveToStorage(LocalStorageService.KEYS.FLATS, flats);
  }

  public saveLands(lands: any[]): void {
    this.saveToStorage(LocalStorageService.KEYS.LANDS, lands);
  }

  public saveTenants(tenants: any[]): void {
    this.saveToStorage(LocalStorageService.KEYS.TENANTS, tenants);
  }

  // Data Export/Import Operations
  public exportAllData(): ExportData {
    return {
      familyMembers: this.getFamilyMembers(),
      properties: this.getProperties(),
      insurancePolicies: this.getInsurancePolicies(),
      documents: this.getDocuments(),
      exportDate: new Date().toISOString(),
      version: LocalStorageService.DATA_VERSION,
    };
  }

  public exportDataAsJSON(): string {
    const data = this.exportAllData();
    return JSON.stringify(data, null, 2);
  }

  public importAllData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      this.validateImportData(data);

      if (data.familyMembers) {
        this.saveToStorage(
          LocalStorageService.KEYS.FAMILY_MEMBERS,
          data.familyMembers
        );
      }
      if (data.properties) {
        this.saveToStorage(
          LocalStorageService.KEYS.PROPERTIES,
          data.properties
        );
      }
      if (data.insurancePolicies) {
        this.saveToStorage(
          LocalStorageService.KEYS.INSURANCE_POLICIES,
          data.insurancePolicies
        );
      }
      if (data.documents) {
        this.saveToStorage(LocalStorageService.KEYS.DOCUMENTS, data.documents);
      }
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new LocalStorageError(
          "Invalid JSON format",
          LocalStorageErrorCodes.PARSE_ERROR
        );
      }
      throw error;
    }
  }

  private validateImportData(data: any): void {
    if (!data || typeof data !== "object") {
      throw new LocalStorageError(
        "Import data must be a valid object",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }

    // Validate data structure
    const requiredFields = [
      "familyMembers",
      "properties",
      "insurancePolicies",
      "documents",
    ];
    const hasValidStructure = requiredFields.some((field) =>
      Array.isArray(data[field])
    );

    if (!hasValidStructure) {
      throw new LocalStorageError(
        "Import data must contain at least one valid data array",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  // Utility Operations
  public clearAllData(): void {
    this.validateStorageAvailability();
    Object.values(LocalStorageService.KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  public clearDataByType(type: keyof typeof LocalStorageService.KEYS): void {
    this.validateStorageAvailability();
    localStorage.removeItem(LocalStorageService.KEYS[type]);
  }

  public getAllStorageKeys(): string[] {
    return Object.values(LocalStorageService.KEYS);
  }

  public getStorageStats(): { [key: string]: number } {
    this.validateStorageAvailability();
    const stats: { [key: string]: number } = {};

    Object.entries(LocalStorageService.KEYS).forEach(([name, key]) => {
      const data = localStorage.getItem(key);
      stats[name] = data ? data.length : 0;
    });

    return stats;
  }
}

// Export singleton instance
export const localStorageService = new LocalStorageService();
