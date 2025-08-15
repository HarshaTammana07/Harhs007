"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { propertyService } from "@/services/PropertyService";
import {
  loadSampleBuildingData,
  clearBuildingData,
} from "@/utils/sampleBuildingData";
import { Building } from "@/types";
import Link from "next/link";
import toast from "react-hot-toast";

export default function TestApartmentsPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = () => {
    try {
      const buildingData = propertyService.getBuildings();
      setBuildings(buildingData);
    } catch (error) {
      console.error("Error loading buildings:", error);
      toast.error("Failed to load buildings");
    } finally {
      setLoading(false);
    }
  };

  const handleLoadSampleData = () => {
    const loaded = loadSampleBuildingData();
    if (loaded) {
      toast.success("Sample data loaded successfully");
      loadBuildings();
    } else {
      toast.info("Sample data already exists");
    }
  };

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to clear all building data?")) {
      clearBuildingData();
      toast.success("Building data cleared");
      loadBuildings();
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Loading...</p>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">
              Apartment Management Test
            </h1>
            <div className="flex space-x-3">
              <Button onClick={handleLoadSampleData} variant="outline">
                Load Sample Data
              </Button>
              <Button onClick={handleClearData} variant="outline">
                Clear Data
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Test Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Buildings loaded:
                  </span>
                  <span className="font-medium">{buildings.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total apartments:
                  </span>
                  <span className="font-medium">
                    {buildings.reduce(
                      (total, building) =>
                        total + (building.apartments?.length || 0),
                      0
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Occupied apartments:
                  </span>
                  <span className="font-medium">
                    {buildings.reduce(
                      (total, building) =>
                        total +
                        (building.apartments?.filter((apt) => apt.isOccupied)
                          .length || 0),
                      0
                    )}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {buildings.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Available Buildings
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {buildings.map((building) => (
                  <Card
                    key={building.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {building.name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Building {building.buildingCode}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {building.address}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {building.apartments?.length || 0} units
                        </span>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Floors:</span>
                          <span className="font-medium">
                            {building.totalFloors}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Apartments:</span>
                          <span className="font-medium">
                            {building.apartments?.length || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Occupied:</span>
                          <span className="font-medium text-green-600">
                            {building.apartments?.filter(
                              (apt) => apt.isOccupied
                            ).length || 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Vacant:</span>
                          <span className="font-medium text-gray-600">
                            {(building.apartments?.length || 0) -
                              (building.apartments?.filter(
                                (apt) => apt.isOccupied
                              ).length || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200">
                        <Link
                          href={`/properties/buildings/${building.id}/apartments`}
                        >
                          <Button size="sm" className="w-full">
                            View Apartments
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {buildings.length === 0 && (
            <Card>
              <CardContent className="text-center py-12">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Buildings Found
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Load sample data to test the apartment management
                  functionality.
                </p>
                <Button onClick={handleLoadSampleData}>Load Sample Data</Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Test Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    ✅ Apartment listing with search and filters
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    ✅ Apartment cards with door numbers and bedroom counts
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    ✅ Apartment CRUD operations (create, edit, delete)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    ✅ Occupancy status indicators (occupied, vacant)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    ✅ Navigation to apartment and tenant details
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    ✅ Search and filtering within buildings
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
