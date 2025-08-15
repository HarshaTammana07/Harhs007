/**
 * Example usage of LocalStorageService
 * This file demonstrates how to use the LocalStorageService for CRUD operations
 */

import { localStorageService } from "./LocalStorageService";
import {
  FamilyMember,
  RentalProperty,
  InsurancePolicy,
  Document,
} from "@/types";

// Example: Family Member Operations
export function exampleFamilyMemberOperations() {
  console.log("=== Family Member Operations Example ===");

  // Create a family member
  const familyMember: FamilyMember = {
    id: "member-001",
    fullName: "Tammana Manikyala Rao",
    nickname: "Ravi",
    relationship: "Father",
    dateOfBirth: new Date("1970-01-01"),
    contactInfo: {
      phone: "+91-9876543210",
      email: "ravi@family.com",
      address: "123 Family Street, City, State",
    },
    documents: [],
    insurancePolicies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save family member
  localStorageService.saveFamilyMember(familyMember);
  console.log("✓ Family member saved");

  // Retrieve family member
  const retrievedMember = localStorageService.getFamilyMemberById("member-001");
  console.log("✓ Family member retrieved:", retrievedMember?.fullName);

  // Update family member
  localStorageService.updateFamilyMember("member-001", {
    contactInfo: {
      ...familyMember.contactInfo,
      phone: "+91-9876543211", // Updated phone
    },
  });
  console.log("✓ Family member updated");

  // Get all family members
  const allMembers = localStorageService.getFamilyMembers();
  console.log("✓ Total family members:", allMembers.length);
}

// Example: Property Operations
export function examplePropertyOperations() {
  console.log("\n=== Property Operations Example ===");

  const property: RentalProperty = {
    id: "property-001",
    address: "456 Rental Avenue, City, State",
    propertyType: "apartment",
    rentAmount: 15000,
    currentTenant: {
      id: "tenant-001",
      name: "John Doe",
      contactInfo: {
        phone: "+91-9876543212",
        email: "john@example.com",
      },
      leaseStartDate: new Date("2024-01-01"),
      leaseEndDate: new Date("2024-12-31"),
      securityDeposit: 30000,
      documents: [],
    },
    rentHistory: [
      {
        id: "rent-001",
        amount: 15000,
        dueDate: new Date("2024-01-01"),
        paidDate: new Date("2024-01-02"),
        status: "paid",
        paymentMethod: "Bank Transfer",
      },
    ],
    maintenanceRecords: [],
    documents: [],
    isVacant: false,
    createdAt: new Date(),
  };

  // Save property
  localStorageService.saveProperty(property);
  console.log("✓ Property saved");

  // Retrieve property
  const retrievedProperty = localStorageService.getPropertyById("property-001");
  console.log("✓ Property retrieved:", retrievedProperty?.address);

  // Update property
  localStorageService.updateProperty("property-001", {
    rentAmount: 16000, // Rent increase
  });
  console.log("✓ Property updated");
}

// Example: Insurance Policy Operations
export function exampleInsurancePolicyOperations() {
  console.log("\n=== Insurance Policy Operations Example ===");

  const insurancePolicy: InsurancePolicy = {
    id: "policy-001",
    policyNumber: "LIC-123456789",
    type: "LIC",
    provider: "Life Insurance Corporation of India",
    familyMemberId: "member-001",
    premiumAmount: 12000,
    coverageAmount: 500000,
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-12-31"),
    renewalDate: new Date("2024-12-31"),
    status: "active",
    documents: [],
    premiumHistory: [
      {
        id: "premium-001",
        amount: 12000,
        paidDate: new Date("2024-01-01"),
        dueDate: new Date("2024-01-01"),
        paymentMethod: "Online Banking",
      },
    ],
  };

  // Save insurance policy
  localStorageService.saveInsurancePolicy(insurancePolicy);
  console.log("✓ Insurance policy saved");

  // Retrieve insurance policy
  const retrievedPolicy =
    localStorageService.getInsurancePolicyById("policy-001");
  console.log("✓ Insurance policy retrieved:", retrievedPolicy?.policyNumber);
}

// Example: Document Operations
export function exampleDocumentOperations() {
  console.log("\n=== Document Operations Example ===");

  const document: Document = {
    id: "doc-001",
    title: "Aadhar Card - Ravi",
    category: "aadhar",
    fileData:
      "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=",
    fileName: "aadhar-ravi.jpg",
    fileSize: 1024,
    mimeType: "image/jpeg",
    familyMemberId: "member-001",
    issuedDate: new Date("2020-01-01"),
    issuer: "UIDAI",
    documentNumber: "1234-5678-9012",
    tags: ["identity", "government"],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  // Save document
  localStorageService.saveDocument(document);
  console.log("✓ Document saved");

  // Retrieve document
  const retrievedDocument = localStorageService.getDocumentById("doc-001");
  console.log("✓ Document retrieved:", retrievedDocument?.title);
}

// Example: Storage Quota Monitoring
export function exampleStorageQuotaMonitoring() {
  console.log("\n=== Storage Quota Monitoring Example ===");

  const quota = localStorageService.getStorageQuota();
  console.log("✓ Storage quota information:");
  console.log(`  - Used: ${quota.used} bytes`);
  console.log(`  - Available: ${quota.available} bytes`);
  console.log(`  - Total: ${quota.total} bytes`);
  console.log(`  - Percentage used: ${quota.percentage}%`);

  const stats = localStorageService.getStorageStats();
  console.log("✓ Storage stats by type:");
  Object.entries(stats).forEach(([type, size]) => {
    console.log(`  - ${type}: ${size} bytes`);
  });
}

// Example: Data Export and Import
export function exampleDataExportImport() {
  console.log("\n=== Data Export/Import Example ===");

  // Export all data
  const exportData = localStorageService.exportAllData();
  console.log("✓ Data exported");
  console.log(`  - Family members: ${exportData.familyMembers.length}`);
  console.log(`  - Properties: ${exportData.properties.length}`);
  console.log(`  - Insurance policies: ${exportData.insurancePolicies.length}`);
  console.log(`  - Documents: ${exportData.documents.length}`);
  console.log(`  - Export date: ${exportData.exportDate}`);

  // Export as JSON string
  const jsonString = localStorageService.exportDataAsJSON();
  console.log("✓ Data exported as JSON string");
  console.log(`  - JSON size: ${jsonString.length} characters`);

  // Clear all data
  localStorageService.clearAllData();
  console.log("✓ All data cleared");

  // Verify data is cleared
  console.log(
    `  - Family members after clear: ${localStorageService.getFamilyMembers().length}`,
  );

  // Import data back
  localStorageService.importAllData(jsonString);
  console.log("✓ Data imported back");
  console.log(
    `  - Family members after import: ${localStorageService.getFamilyMembers().length}`,
  );
}

// Example: Error Handling
export function exampleErrorHandling() {
  console.log("\n=== Error Handling Example ===");

  try {
    // Try to get a non-existent family member
    localStorageService.updateFamilyMember("non-existent", {
      nickname: "Test",
    });
  } catch (error) {
    console.log(
      "✓ Caught expected error for non-existent family member:",
      error.message,
    );
  }

  try {
    // Try to save invalid data
    const invalidMember = {
      id: "",
      fullName: "",
      nickname: "",
    } as any;
    localStorageService.saveFamilyMember(invalidMember);
  } catch (error) {
    console.log("✓ Caught expected validation error:", error.message);
  }

  try {
    // Try to import invalid JSON
    localStorageService.importAllData("invalid json");
  } catch (error) {
    console.log("✓ Caught expected JSON parse error:", error.message);
  }
}

// Run all examples
export function runAllExamples() {
  console.log("LocalStorageService Examples\n");

  exampleFamilyMemberOperations();
  examplePropertyOperations();
  exampleInsurancePolicyOperations();
  exampleDocumentOperations();
  exampleStorageQuotaMonitoring();
  exampleDataExportImport();
  exampleErrorHandling();

  console.log("\n=== All Examples Completed ===");
}

// Uncomment the line below to run examples in browser console
// runAllExamples();
