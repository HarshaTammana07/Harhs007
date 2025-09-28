"use client";

import { useState } from "react";
import { TenantManagement } from "@/components/tenants/TenantManagement";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { propertyService } from "@/services/PropertyService";
import { Tenant, Building, Apartment, Flat } from "@/types";
import toast from "react-hot-toast";

export default function TenantCardsWithMetadataPage() {
  const [loading, setLoading] = useState(false);

  const createCompleteTestData = async () => {
    try {
      setLoading(true);
      
      // Create sample building
      const buildingData = {
        name: "Skyline Towers",
        buildingCode: "ST",
        address: "456 Business District, Metro City",
        description: "Premium apartment complex with modern amenities",
        totalFloors: 5,
        totalApartments: 10,
        amenities: ["Swimming Pool", "Gym", "Security", "Parking", "Elevator"],
        constructionYear: 2022,
        images: [],
      };

      const building = await propertyService.saveBuilding(buildingData);
      
      // Create apartments in the building
      const apartments = [
        {
          doorNumber: "501",
          floor: 5,
          bedroomCount: 3,
          bathroomCount: 2,
          area: 1800,
          rentAmount: 35000,
          securityDeposit: 70000,
          specifications: {
            furnished: true,
            parking: true,
            balcony: true,
            airConditioning: true,
            powerBackup: true,
            waterSupply: "24x7" as const,
            internetReady: true,
            additionalFeatures: ["Premium Fixtures", "City View"],
          },
        },
        {
          doorNumber: "302",
          floor: 3,
          bedroomCount: 2,
          bathroomCount: 2,
          area: 1400,
          rentAmount: 28000,
          securityDeposit: 56000,
          specifications: {
            furnished: false,
            parking: true,
            balcony: true,
            airConditioning: true,
            powerBackup: true,
            waterSupply: "24x7" as const,
            internetReady: true,
            additionalFeatures: ["Spacious Layout"],
          },
        },
      ];

      const createdApartments = [];
      for (const apt of apartments) {
        const apartment = await propertyService.addApartmentToBuilding(building.id, apt);
        createdApartments.push(apartment);
      }

      // Create standalone flat
      const flatData = {
        name: "Garden View Villa",
        doorNumber: "B-101",
        address: "789 Green Gardens, Peaceful Suburb",
        description: "Independent villa with private garden",
        bedroomCount: 4,
        bathroomCount: 3,
        area: 2200,
        floor: 1,
        totalFloors: 2,
        rentAmount: 45000,
        securityDeposit: 90000,
        specifications: {
          furnished: true,
          parking: true,
          balcony: true,
          airConditioning: true,
          powerBackup: true,
          waterSupply: "24x7" as const,
          internetReady: true,
          societyName: "Green Gardens Society",
          maintenanceCharges: 3000,
          additionalFeatures: ["Private Garden", "Terrace", "Study Room"],
        },
        images: [],
      };

      const flat = await propertyService.saveFlat(flatData);

      // Create tenants assigned to properties
      const tenants = [
        {
          personalInfo: {
            firstName: "Amit",
            lastName: "Sharma",
            fullName: "Amit Sharma",
            occupation: "Senior Software Engineer",
            familySize: 4,
            nationality: "Indian",
            maritalStatus: "married" as const,
            dateOfBirth: new Date("1988-03-20"),
            employer: "Microsoft India",
            monthlyIncome: 120000,
          },
          contactInfo: {
            phone: "+91-9876543210",
            email: "amit.sharma@example.com",
            address: "Previous: 123 Old Colony, Previous City",
          },
          emergencyContact: {
            name: "Priya Sharma",
            relationship: "Spouse",
            phone: "+91-9876543211",
            email: "priya.sharma@example.com",
          },
          identification: {
            aadharNumber: "1234-5678-9012",
            panNumber: "ABCDE1234F",
            drivingLicense: "DL1234567890",
          },
          rentalAgreement: {
            agreementNumber: "ST-501-2024",
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            rentAmount: 35000,
            securityDeposit: 70000,
            rentDueDate: 5,
            paymentMethod: "bank_transfer" as const,
            noticePeriod: 60,
            specialConditions: ["No pets", "No alterations without permission"],
          },
          moveInDate: new Date(),
          isActive: true,
          propertyId: createdApartments[0].id,
          propertyType: "apartment",
          buildingId: building.id,
        },
        {
          personalInfo: {
            firstName: "Ravi",
            lastName: "Patel",
            fullName: "Ravi Patel",
            occupation: "Business Analyst",
            familySize: 2,
            nationality: "Indian",
            maritalStatus: "married" as const,
            dateOfBirth: new Date("1990-07-15"),
            employer: "Infosys Limited",
            monthlyIncome: 85000,
          },
          contactInfo: {
            phone: "+91-9876543220",
            email: "ravi.patel@example.com",
            address: "Previous: 456 Tech Park, IT City",
          },
          emergencyContact: {
            name: "Meera Patel",
            relationship: "Spouse",
            phone: "+91-9876543221",
            email: "meera.patel@example.com",
          },
          identification: {
            aadharNumber: "2345-6789-0123",
            panNumber: "BCDEF2345G",
          },
          rentalAgreement: {
            agreementNumber: "ST-302-2024",
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Started 30 days ago
            endDate: new Date(Date.now() + 335 * 24 * 60 * 60 * 1000),
            rentAmount: 28000,
            securityDeposit: 56000,
            rentDueDate: 1,
            paymentMethod: "upi" as const,
            noticePeriod: 30,
            specialConditions: ["Maintenance included"],
          },
          moveInDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          isActive: true,
          propertyId: createdApartments[1].id,
          propertyType: "apartment",
          buildingId: building.id,
        },
        {
          personalInfo: {
            firstName: "Sunita",
            lastName: "Reddy",
            fullName: "Sunita Reddy",
            occupation: "Marketing Director",
            familySize: 3,
            nationality: "Indian",
            maritalStatus: "married" as const,
            dateOfBirth: new Date("1985-11-10"),
            employer: "Unilever India",
            monthlyIncome: 150000,
          },
          contactInfo: {
            phone: "+91-9876543230",
            email: "sunita.reddy@example.com",
            address: "Previous: 789 Executive Heights, Business District",
          },
          emergencyContact: {
            name: "Rajesh Reddy",
            relationship: "Spouse",
            phone: "+91-9876543231",
            email: "rajesh.reddy@example.com",
          },
          identification: {
            aadharNumber: "3456-7890-1234",
            panNumber: "CDEFG3456H",
            drivingLicense: "DL2345678901",
            passport: "P1234567",
          },
          rentalAgreement: {
            agreementNumber: "GV-B101-2024",
            startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // Started 60 days ago
            endDate: new Date(Date.now() + 305 * 24 * 60 * 60 * 1000),
            rentAmount: 45000,
            securityDeposit: 90000,
            rentDueDate: 10,
            paymentMethod: "bank_transfer" as const,
            noticePeriod: 90,
            specialConditions: ["Garden maintenance included", "Pet friendly"],
          },
          moveInDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
          isActive: true,
          propertyId: flat.id,
          propertyType: "flat",
        },
      ];

      // Create tenants
      for (const tenantData of tenants) {
        await propertyService.saveTenant(tenantData);
        
        // Update property occupancy
        if (tenantData.propertyType === "apartment") {
          await propertyService.updateApartment(tenantData.propertyId, { isOccupied: true });
        } else if (tenantData.propertyType === "flat") {
          await propertyService.updateFlat(tenantData.propertyId, { isOccupied: true });
        }
      }

      toast.success("Complete test data created successfully!");
    } catch (error) {
      console.error("Error creating test data:", error);
      toast.error("Failed to create test data");
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
              Tenant Cards with Property Metadata
            </h1>
            <p className="text-xl text-gray-600 mt-4">
              Enhanced tenant cards showing complete property information
            </p>
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">Enhanced Display Features:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
                <div>
                  <h4 className="font-medium mb-2">Building Tenants Show:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Building name and code</li>
                    <li>✅ Apartment door number</li>
                    <li>✅ Floor information</li>
                    <li>✅ Building address</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Flat Tenants Show:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Flat name</li>
                    <li>✅ Door number</li>
                    <li>✅ Complete address</li>
                    <li>✅ Property type indicator</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 text-sm text-green-700">
                <strong>Enhanced Search:</strong> Search by tenant name, phone, occupation, building name, apartment door number, or flat name!
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Create Complete Test Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={createCompleteTestData}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Building + Apartments + Flat + Tenants"}
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                This will create a complete test scenario with:
                <br />• 1 Building (Skyline Towers) with 2 apartments
                <br />• 1 Standalone flat (Garden View Villa)  
                <br />• 3 Tenants assigned to these properties
                <br />• All property metadata will be displayed in tenant cards
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