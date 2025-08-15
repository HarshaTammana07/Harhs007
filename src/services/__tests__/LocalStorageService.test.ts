import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { expect } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { expect } from "vitest";
import { it } from "vitest";
import { describe } from "vitest";
import { beforeEach } from "vitest";
import { describe } from "vitest";
import {
  LocalStorageService,
  LocalStorageError,
  LocalStorageErrorCodes,
  localStorageService,
} from "../LocalStorageService";
import {
  FamilyMember,
  RentalProperty,
  InsurancePolicy,
  Document,
} from "@/types";

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("LocalStorageService", () => {
  let service: LocalStorageService;

  // Test data
  const mockFamilyMember: FamilyMember = {
    id: "test-member-1",
    fullName: "Test Member",
    nickname: "Test",
    relationship: "Son",
    contactInfo: {
      phone: "1234567890",
      email: "test@example.com",
    },
    documents: [],
    insurancePolicies: [],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  const mockProperty: RentalProperty = {
    id: "test-property-1",
    address: "123 Test Street",
    propertyType: "apartment",
    rentAmount: 1000,
    rentHistory: [],
    maintenanceRecords: [],
    documents: [],
    isVacant: false,
    createdAt: new Date("2024-01-01"),
  };

  const mockInsurancePolicy: InsurancePolicy = {
    id: "test-policy-1",
    policyNumber: "POL123456",
    type: "health",
    provider: "Test Insurance",
    familyMemberId: "test-member-1",
    premiumAmount: 500,
    coverageAmount: 100000,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    renewalDate: new Date("2024-12-31"),
    status: "active",
    documents: [],
    premiumHistory: [],
  };

  const mockDocument: Document = {
    id: "test-doc-1",
    title: "Test Document",
    category: "aadhar",
    fileData: "data:text/plain;base64,dGVzdA==",
    fileName: "test.txt",
    fileSize: 4,
    mimeType: "text/plain",
    tags: ["test"],
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
  };

  beforeEach(() => {
    localStorageMock.clear();
    jest.clearAllMocks();
    service = new LocalStorageService();
  });

  describe("Constructor and Storage Availability", () => {
    it("should initialize successfully when localStorage is available", () => {
      expect(() => new LocalStorageService()).not.toThrow();
    });

    it("should throw error when localStorage is not available", () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem.mockImplementation(() => {
        throw new Error("localStorage not available");
      });

      expect(() => new LocalStorageService()).toThrow(LocalStorageError);
      expect(() => new LocalStorageService()).toThrow(
        "localStorage is not available",
      );

      localStorageMock.setItem = originalSetItem;
    });
  });

  describe("Family Members CRUD Operations", () => {
    it("should return empty array when no family members exist", () => {
      const members = service.getFamilyMembers();
      expect(members).toEqual([]);
    });

    it("should save and retrieve family member", () => {
      service.saveFamilyMember(mockFamilyMember);
      const members = service.getFamilyMembers();

      expect(members).toHaveLength(1);
      expect(members[0]).toEqual(mockFamilyMember);
    });

    it("should get family member by id", () => {
      service.saveFamilyMember(mockFamilyMember);
      const member = service.getFamilyMemberById("test-member-1");

      expect(member).toEqual(mockFamilyMember);
    });

    it("should return null for non-existent family member", () => {
      const member = service.getFamilyMemberById("non-existent");
      expect(member).toBeNull();
    });

    it("should update family member", () => {
      service.saveFamilyMember(mockFamilyMember);

      const updates = { nickname: "Updated Test" };
      service.updateFamilyMember("test-member-1", updates);

      const updatedMember = service.getFamilyMemberById("test-member-1");
      expect(updatedMember?.nickname).toBe("Updated Test");
      expect(updatedMember?.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error when updating non-existent family member", () => {
      expect(() => {
        service.updateFamilyMember("non-existent", { nickname: "Test" });
      }).toThrow(LocalStorageError);
    });

    it("should delete family member", () => {
      service.saveFamilyMember(mockFamilyMember);
      service.deleteFamilyMember("test-member-1");

      const members = service.getFamilyMembers();
      expect(members).toHaveLength(0);
    });

    it("should throw error when deleting non-existent family member", () => {
      expect(() => {
        service.deleteFamilyMember("non-existent");
      }).toThrow(LocalStorageError);
    });

    it("should validate family member data", () => {
      const invalidMember = { ...mockFamilyMember, fullName: "" };

      expect(() => {
        service.saveFamilyMember(invalidMember);
      }).toThrow(LocalStorageError);
    });
  });

  describe("Properties CRUD Operations", () => {
    it("should save and retrieve property", () => {
      service.saveProperty(mockProperty);
      const properties = service.getProperties();

      expect(properties).toHaveLength(1);
      expect(properties[0]).toEqual(mockProperty);
    });

    it("should get property by id", () => {
      service.saveProperty(mockProperty);
      const property = service.getPropertyById("test-property-1");

      expect(property).toEqual(mockProperty);
    });

    it("should update property", () => {
      service.saveProperty(mockProperty);

      const updates = { rentAmount: 1200 };
      service.updateProperty("test-property-1", updates);

      const updatedProperty = service.getPropertyById("test-property-1");
      expect(updatedProperty?.rentAmount).toBe(1200);
    });

    it("should delete property", () => {
      service.saveProperty(mockProperty);
      service.deleteProperty("test-property-1");

      const properties = service.getProperties();
      expect(properties).toHaveLength(0);
    });

    it("should validate property data", () => {
      const invalidProperty = { ...mockProperty, address: "" };

      expect(() => {
        service.saveProperty(invalidProperty);
      }).toThrow(LocalStorageError);
    });
  });

  describe("Insurance Policies CRUD Operations", () => {
    it("should save and retrieve insurance policy", () => {
      service.saveInsurancePolicy(mockInsurancePolicy);
      const policies = service.getInsurancePolicies();

      expect(policies).toHaveLength(1);
      expect(policies[0]).toEqual(mockInsurancePolicy);
    });

    it("should get insurance policy by id", () => {
      service.saveInsurancePolicy(mockInsurancePolicy);
      const policy = service.getInsurancePolicyById("test-policy-1");

      expect(policy).toEqual(mockInsurancePolicy);
    });

    it("should update insurance policy", () => {
      service.saveInsurancePolicy(mockInsurancePolicy);

      const updates = { premiumAmount: 600 };
      service.updateInsurancePolicy("test-policy-1", updates);

      const updatedPolicy = service.getInsurancePolicyById("test-policy-1");
      expect(updatedPolicy?.premiumAmount).toBe(600);
    });

    it("should delete insurance policy", () => {
      service.saveInsurancePolicy(mockInsurancePolicy);
      service.deleteInsurancePolicy("test-policy-1");

      const policies = service.getInsurancePolicies();
      expect(policies).toHaveLength(0);
    });

    it("should validate insurance policy data", () => {
      const invalidPolicy = { ...mockInsurancePolicy, policyNumber: "" };

      expect(() => {
        service.saveInsurancePolicy(invalidPolicy);
      }).toThrow(LocalStorageError);
    });
  });

  describe("Documents CRUD Operations", () => {
    it("should save and retrieve document", () => {
      service.saveDocument(mockDocument);
      const documents = service.getDocuments();

      expect(documents).toHaveLength(1);
      expect(documents[0]).toEqual(mockDocument);
    });

    it("should get document by id", () => {
      service.saveDocument(mockDocument);
      const document = service.getDocumentById("test-doc-1");

      expect(document).toEqual(mockDocument);
    });

    it("should update document", () => {
      service.saveDocument(mockDocument);

      const updates = { title: "Updated Document" };
      service.updateDocument("test-doc-1", updates);

      const updatedDocument = service.getDocumentById("test-doc-1");
      expect(updatedDocument?.title).toBe("Updated Document");
      expect(updatedDocument?.updatedAt).toBeInstanceOf(Date);
    });

    it("should delete document", () => {
      service.saveDocument(mockDocument);
      service.deleteDocument("test-doc-1");

      const documents = service.getDocuments();
      expect(documents).toHaveLength(0);
    });

    it("should validate document data", () => {
      const invalidDocument = { ...mockDocument, title: "" };

      expect(() => {
        service.saveDocument(invalidDocument);
      }).toThrow(LocalStorageError);
    });
  });

  describe("Data Serialization and Deserialization", () => {
    it("should properly serialize and deserialize Date objects", () => {
      const memberWithDate = {
        ...mockFamilyMember,
        createdAt: new Date("2024-01-01T10:30:00Z"),
        updatedAt: new Date("2024-01-02T15:45:00Z"),
      };

      service.saveFamilyMember(memberWithDate);
      const retrievedMember = service.getFamilyMemberById("test-member-1");

      expect(retrievedMember?.createdAt).toBeInstanceOf(Date);
      expect(retrievedMember?.updatedAt).toBeInstanceOf(Date);
      expect(retrievedMember?.createdAt.toISOString()).toBe(
        "2024-01-01T10:30:00.000Z",
      );
      expect(retrievedMember?.updatedAt.toISOString()).toBe(
        "2024-01-02T15:45:00.000Z",
      );
    });

    it("should handle nested Date objects in arrays", () => {
      const propertyWithDates = {
        ...mockProperty,
        rentHistory: [
          {
            id: "rent-1",
            amount: 1000,
            dueDate: new Date("2024-01-01"),
            paidDate: new Date("2024-01-02"),
            status: "paid" as const,
          },
        ],
      };

      service.saveProperty(propertyWithDates);
      const retrievedProperty = service.getPropertyById("test-property-1");

      expect(retrievedProperty?.rentHistory[0].dueDate).toBeInstanceOf(Date);
      expect(retrievedProperty?.rentHistory[0].paidDate).toBeInstanceOf(Date);
    });
  });

  describe("Storage Quota Management", () => {
    it("should return storage quota information", () => {
      const quota = service.getStorageQuota();

      expect(quota).toHaveProperty("used");
      expect(quota).toHaveProperty("available");
      expect(quota).toHaveProperty("total");
      expect(quota).toHaveProperty("percentage");
      expect(typeof quota.used).toBe("number");
      expect(typeof quota.percentage).toBe("number");
    });

    it("should calculate storage stats correctly", () => {
      service.saveFamilyMember(mockFamilyMember);
      service.saveProperty(mockProperty);

      const stats = service.getStorageStats();

      expect(stats).toHaveProperty("FAMILY_MEMBERS");
      expect(stats).toHaveProperty("PROPERTIES");
      expect(stats.FAMILY_MEMBERS).toBeGreaterThan(0);
      expect(stats.PROPERTIES).toBeGreaterThan(0);
    });
  });

  describe("Data Export and Import", () => {
    beforeEach(() => {
      service.saveFamilyMember(mockFamilyMember);
      service.saveProperty(mockProperty);
      service.saveInsurancePolicy(mockInsurancePolicy);
      service.saveDocument(mockDocument);
    });

    it("should export all data", () => {
      const exportData = service.exportAllData();

      expect(exportData).toHaveProperty("familyMembers");
      expect(exportData).toHaveProperty("properties");
      expect(exportData).toHaveProperty("insurancePolicies");
      expect(exportData).toHaveProperty("documents");
      expect(exportData).toHaveProperty("exportDate");
      expect(exportData).toHaveProperty("version");

      expect(exportData.familyMembers).toHaveLength(1);
      expect(exportData.properties).toHaveLength(1);
      expect(exportData.insurancePolicies).toHaveLength(1);
      expect(exportData.documents).toHaveLength(1);
    });

    it("should export data as JSON string", () => {
      const jsonString = service.exportDataAsJSON();

      expect(typeof jsonString).toBe("string");
      expect(() => JSON.parse(jsonString)).not.toThrow();

      const parsed = JSON.parse(jsonString);
      expect(parsed).toHaveProperty("familyMembers");
      expect(parsed).toHaveProperty("exportDate");
    });

    it("should import data from JSON string", () => {
      const exportData = service.exportAllData();
      const jsonString = JSON.stringify(exportData);

      // Clear existing data
      service.clearAllData();
      expect(service.getFamilyMembers()).toHaveLength(0);

      // Import data
      service.importAllData(jsonString);

      expect(service.getFamilyMembers()).toHaveLength(1);
      expect(service.getProperties()).toHaveLength(1);
      expect(service.getInsurancePolicies()).toHaveLength(1);
      expect(service.getDocuments()).toHaveLength(1);
    });

    it("should throw error for invalid JSON during import", () => {
      expect(() => {
        service.importAllData("invalid json");
      }).toThrow(LocalStorageError);
      expect(() => {
        service.importAllData("invalid json");
      }).toThrow("Invalid JSON format");
    });

    it("should validate import data structure", () => {
      expect(() => {
        service.importAllData("{}");
      }).toThrow(LocalStorageError);
      expect(() => {
        service.importAllData("{}");
      }).toThrow("Import data must contain at least one valid data array");
    });
  });

  describe("Error Handling", () => {
    it("should handle localStorage parse errors", () => {
      // Manually set invalid JSON in localStorage
      localStorageMock.setItem("family_members", "invalid json");

      expect(() => {
        service.getFamilyMembers();
      }).toThrow(LocalStorageError);
      expect(() => {
        service.getFamilyMembers();
      }).toThrow("Invalid JSON data in localStorage");
    });

    it("should handle localStorage quota exceeded", () => {
      const originalSetItem = localStorageMock.setItem;
      localStorageMock.setItem.mockImplementation(() => {
        const error = new DOMException("QuotaExceededError");
        (error as any).code = 22;
        throw error;
      });

      expect(() => {
        service.saveFamilyMember(mockFamilyMember);
      }).toThrow(LocalStorageError);
      expect(() => {
        service.saveFamilyMember(mockFamilyMember);
      }).toThrow("Storage quota exceeded");

      localStorageMock.setItem = originalSetItem;
    });

    it("should return empty array for corrupted data", () => {
      // Set non-array data
      localStorageMock.setItem(
        "family_members",
        JSON.stringify({ invalid: "data" }),
      );

      const members = service.getFamilyMembers();
      expect(members).toEqual([]);
    });
  });

  describe("Utility Operations", () => {
    beforeEach(() => {
      service.saveFamilyMember(mockFamilyMember);
      service.saveProperty(mockProperty);
    });

    it("should clear all data", () => {
      service.clearAllData();

      expect(service.getFamilyMembers()).toHaveLength(0);
      expect(service.getProperties()).toHaveLength(0);
      expect(service.getInsurancePolicies()).toHaveLength(0);
      expect(service.getDocuments()).toHaveLength(0);
    });

    it("should clear data by type", () => {
      service.clearDataByType("FAMILY_MEMBERS");

      expect(service.getFamilyMembers()).toHaveLength(0);
      expect(service.getProperties()).toHaveLength(1); // Should remain
    });

    it("should return all storage keys", () => {
      const keys = service.getAllStorageKeys();

      expect(keys).toContain("family_members");
      expect(keys).toContain("properties");
      expect(keys).toContain("insurance_policies");
      expect(keys).toContain("documents");
      expect(keys).toContain("user_session");
    });
  });

  describe("Singleton Instance", () => {
    it("should export a singleton instance", () => {
      expect(localStorageService).toBeInstanceOf(LocalStorageService);
    });
  });
});
