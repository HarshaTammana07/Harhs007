"use client";

import { useState } from "react";
import { TenantManagement } from "@/components/tenants/TenantManagement";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { propertyService } from "@/services/PropertyService";
import { Tenant, Building, Flat } from "@/types";
import toast from "react-hot-toast";

export default function EnhancedTenantManagementPage() {
  const [loading, setLoading] = useState(false);

  const createSampleData = async () => {
    try {
      setLoading(true);
      
      // Create a sample building
      const sampleBuilding = {
        name: "Sunrise Apartments",
        buildingCode: "SA",
        address: "123 Main Street, City Center",
        description: "Modern apartment complex with all amenities",
        totalFloors: 3,
        totalApartments: 6,
        amenities: ["Parking", "Security", "Elevator"],
        constructionYear: 2020,
        images: [],
      };

      const building = await propertyService.saveBuilding(sampleBuilding);
      
      // Create sample apartments
      const apartments = [
        {
          doorNumber: "101",
          floor: 1,
          bedroomCount: 2,
          bathroomCount: 2,
          area: 1200,
          rentAmount: 25000,
          securityDeposit: 50000,
          specifications: {
            furnished: true,
            parking: true,
            balcony: true,
            airConditioning: true,
            powerBackup: true,
            waterSupply: "24x7" as const,
            internetReady: true,
            additionalFeatures: ["Modular Kitchen", "Wardrobe"],
          },
        },
        {
          doorNumber: "102",
          floor: 1,
          bedroomCount: 3,
          bathroomCount: 2,
          area: 1500,
          rentAmount: 30000,
          securityDeposit: 60000,
          specifications: {
            furnished: false,
            parking: true,
            balcony: true,
            airConditioning: false,
            powerBackup: true,
            waterSupply: "24x7" as const,
            internetReady: true,
            additionalFeatures: ["Spacious Rooms"],
          },
        },
      ];

      for (const apt of apartments) {
        await propertyService.addApartmentToBuilding(building.id, apt);
      }

      // Create a sample flat
      const sampleFlat = {
        name: "Green Valley Flat",
        doorNumber: "A-201",
        address: "456 Garden Road, Suburb",
        description: "Independent flat with garden view",
        bedroomCount: 2,
        bathroomCount: 2,
        area: 1100,
        floor: 2,
        totalFloors: 4,
        rentAmount: 22000,
        securityDeposit: 44000,
        specifications: {
          furnished: true,
          parking: true,
          balcony: true,
          airConditioning: true,
          powerBackup: false,
          waterSupply: "limited" as const,
          internetReady: true,
          societyName: "Green Valley Society",
          maintenanceCharges: 2000,
          additionalFeatures: ["Garden View", "Pet Friendly"],
        },
        images: [],
      };

      await propertyService.saveFlat(sampleFlat);

      toast.success("Sample properties created successfully!");
    } catch (error) {
      console.error("Error creating sample data:", error);
      toast.error("Failed to create sample data");
    } finally {
      setLoading(false);
    }
  };

  const createSampleTenant = async () => {
    try {
      setLoading(true);
      
      const sampleTenant: Omit<Tenant, "id" | "createdAt" | "updatedAt" | "references" | "documents"> = {
        personalInfo: {
          firstName: "Rajesh",
          lastName: "Kumar",
          fullName: "Rajesh Kumar",
          occupation: "Software Engineer",
          familySize: 3,
          nationality: "Indian",
          maritalStatus: "married",
          dateOfBirth: new Date("1985-06-15"),
          employer: "Tech Solutions Pvt Ltd",
          monthlyIncome: 85000,
        },
        contactInfo: {
          phone: "+91-9876543210",
          email: "rajesh.kumar@example.com",
          address: "Current Address: 789 Old Street, Previous City",
        },
        emergencyContact: {
          name: "Priya Kumar",
          relationship: "Spouse",
          phone: "+91-9876543211",
          email: "priya.kumar@example.com",
        },
        identification: {
          aadharNumber: "1234-5678-9012",
          panNumber: "ABCDE1234F",
          drivingLicense: "DL1234567890",
        },
        rentalAgreement: {
          agreementNumber: "AGR-2024-001",
          startDate: new Date(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
          rentAmount: 25000,
          securityDeposit: 50000,
          rentDueDate: 5,
          paymentMethod: "bank_transfer",
          noticePeriod: 30,
          specialConditions: ["No pets allowed", "No smoking"],
        },
        moveInDate: new Date(),
        isActive: true,
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
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Enhanced Tenant Management System
            </h1>
            <p className="text-xl text-gray-600 mt-4">
              Complete tenant management with property assignment
            </p>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">New Features:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-blue-800">
                <div>
                  <h4 className="font-medium mb-2">Property Assignment:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Choose property type (Building/Flat)</li>
                    <li>✅ Select specific building</li>
                    <li>✅ Choose apartment within building</li>
                    <li>✅ Select standalone flat</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Smart Features:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Auto-fill rent from property</li>
                    <li>✅ Show occupancy status</li>
                    <li>✅ Update property when tenant assigned</li>
                    <li>✅ Free property when tenant deleted</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Test Data Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={createSampleData}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? "Creating..." : "Create Sample Properties"}
                </Button>
                <Button 
                  onClick={createSampleTenant}
                  disabled={loading}
                  variant="outline"
                >
                  {loading ? "Creating..." : "Create Sample Tenant"}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                Create sample buildings, apartments, and flats to test the property assignment feature.
                Then create a sample tenant to see the complete workflow.
              </p>
            </CardContent>
          </Card>

          {/* Enhanced Tenant Management Component */}
          <TenantManagement />
        </div>
      </div>
    </div>
  );
}