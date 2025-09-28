"use client";

import { useState } from "react";
import { Building, Apartment, Flat } from "@/types";
import { ApartmentForm } from "@/components/properties/ApartmentForm";
import { FlatForm } from "@/components/properties/FlatForm";
import { Button } from "@/components/ui";

// Mock building data for testing
const mockBuilding: Building = {
  id: "test-building-1",
  type: "building",
  name: "Test Building",
  buildingCode: "A",
  address: "123 Test Street",
  description: "Test building for service number testing",
  totalFloors: 5,
  totalApartments: 10,
  apartments: [],
  amenities: ["Parking", "Security"],
  constructionYear: 2020,
  images: [],
  documents: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

export default function TestServiceNumberPage() {
  const [showApartmentForm, setShowApartmentForm] = useState(false);
  const [showFlatForm, setShowFlatForm] = useState(false);
  const [createdApartment, setCreatedApartment] = useState<Apartment | null>(null);
  const [createdFlat, setCreatedFlat] = useState<Flat | null>(null);

  const handleApartmentSubmit = (apartmentData: Omit<Apartment, "id" | "createdAt" | "updatedAt">) => {
    console.log("Apartment data with service number:", apartmentData);
    const newApartment: Apartment = {
      ...apartmentData,
      id: "test-apartment-" + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCreatedApartment(newApartment);
    setShowApartmentForm(false);
  };

  const handleFlatSubmit = (flatData: Omit<Flat, "id" | "createdAt" | "updatedAt">) => {
    console.log("Flat data with service number:", flatData);
    const newFlat: Flat = {
      ...flatData,
      id: "test-flat-" + Date.now(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCreatedFlat(newFlat);
    setShowFlatForm(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Test Service Number Field
        </h1>

        <div className="space-y-6">
          {/* Test Controls */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test Controls
            </h2>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowApartmentForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Test Apartment Form
              </Button>
              <Button
                onClick={() => setShowFlatForm(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                Test Flat Form
              </Button>
            </div>
          </div>

          {/* Results */}
          {(createdApartment || createdFlat) && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Created Properties
              </h2>
              
              {createdApartment && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-300">Apartment Created:</h3>
                  <p><strong>Door Number:</strong> {createdApartment.doorNumber}</p>
                  <p><strong>Service Number:</strong> {createdApartment.serviceNumber || "Not provided"}</p>
                  <p><strong>Floor:</strong> {createdApartment.floor}</p>
                  <p><strong>Area:</strong> {createdApartment.area} sq ft</p>
                  <p><strong>Rent:</strong> ₹{createdApartment.rentAmount.toLocaleString()}/month</p>
                </div>
              )}

              {createdFlat && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded">
                  <h3 className="font-semibold text-green-900 dark:text-green-300">Flat Created:</h3>
                  <p><strong>Name:</strong> {createdFlat.name}</p>
                  <p><strong>Door Number:</strong> {createdFlat.doorNumber}</p>
                  <p><strong>Service Number:</strong> {createdFlat.serviceNumber || "Not provided"}</p>
                  <p><strong>Address:</strong> {createdFlat.address}</p>
                  <p><strong>Area:</strong> {createdFlat.area} sq ft</p>
                  <p><strong>Rent:</strong> ₹{createdFlat.rentAmount.toLocaleString()}/month</p>
                </div>
              )}
            </div>
          )}

          {/* Apartment Form Modal */}
          {showApartmentForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Test Apartment Form
                    </h2>
                    <Button
                      onClick={() => setShowApartmentForm(false)}
                      variant="outline"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </Button>
                  </div>
                  <ApartmentForm
                    building={mockBuilding}
                    onSubmit={handleApartmentSubmit}
                    onCancel={() => setShowApartmentForm(false)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Flat Form Modal */}
          {showFlatForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Test Flat Form
                    </h2>
                    <Button
                      onClick={() => setShowFlatForm(false)}
                      variant="outline"
                      className="text-gray-500 hover:text-gray-700"
                    >
                      ✕
                    </Button>
                  </div>
                  <FlatForm
                    onSubmit={handleFlatSubmit}
                    onCancel={() => setShowFlatForm(false)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
