"use client";

import { useState } from "react";
import { TenantManagement } from "@/components/tenants/TenantManagement";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { propertyService } from "@/services/PropertyService";
import { Tenant } from "@/types";
import toast from "react-hot-toast";

export default function TestTenantManagementPage() {
  const [loading, setLoading] = useState(false);

  const createSampleTenant = async () => {
    try {
      setLoading(true);
      
      const sampleTenant: Omit<Tenant, "id" | "createdAt" | "updatedAt" | "references" | "documents"> = {
        personalInfo: {
          firstName: "John",
          lastName: "Doe",
          fullName: "John Doe",
          occupation: "Software Engineer",
          familySize: 2,
          nationality: "Indian",
          maritalStatus: "married",
          dateOfBirth: new Date("1990-01-15"),
          employer: "Tech Corp",
          monthlyIncome: 75000,
        },
        contactInfo: {
          phone: "+91-9876543210",
          email: "john.doe@example.com",
          address: "123 Sample Street, City",
        },
        emergencyContact: {
          name: "Jane Doe",
          relationship: "Spouse",
          phone: "+91-9876543211",
          email: "jane.doe@example.com",
        },
        identification: {
          aadharNumber: "1234-5678-9012",
          panNumber: "ABCDE1234F",
        },
        rentalAgreement: {
          agreementNumber: "AGR-001",
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          rentAmount: 25000,
          securityDeposit: 50000,
          rentDueDate: 5,
          paymentMethod: "bank_transfer",
          noticePeriod: 30,
          specialConditions: [],
        },
        moveInDate: new Date(),
        isActive: true,
        propertyType: "apartment",
      };

      await propertyService.saveTenant(sampleTenant);
      toast.success("Sample tenant created successfully!");
    } catch (error) {
      console.error("Error creating sample tenant:", error);
      toast.error("Failed to create sample tenant");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Test Tenant Management System
            </h1>
            <p className="text-gray-600 mt-2">
              Test the complete tenant management functionality with CRUD operations
            </p>
          </div>

          {/* Test Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-4">
                <Button 
                  onClick={createSampleTenant}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Sample Tenant"}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Create a sample tenant to test the management interface
              </p>
            </CardContent>
          </Card>

          {/* Tenant Management Component */}
          <TenantManagement />
        </div>
      </div>
    </div>
  );
}