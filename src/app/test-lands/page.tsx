"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button, Card, CardContent } from "@/components/ui";
import { propertyService } from "@/services/PropertyService";
import {
  populateSampleLandData,
  clearSampleLandData,
} from "@/utils/sampleLandData";
import { Land } from "@/types";
import { toast } from "react-hot-toast";

export default function TestLandsPage() {
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLands();
  }, []);

  const loadLands = () => {
    try {
      const landsData = propertyService.getLands();
      setLands(landsData);
    } catch (error) {
      console.error("Error loading lands:", error);
      toast.error("Failed to load lands");
    }
  };

  const handlePopulateData = () => {
    setLoading(true);
    try {
      const populated = populateSampleLandData();
      if (populated) {
        toast.success("Sample land data populated successfully");
        loadLands();
      } else {
        toast.info("Sample data already exists");
      }
    } catch (error) {
      console.error("Error populating data:", error);
      toast.error("Failed to populate sample data");
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = () => {
    if (!confirm("Are you sure you want to clear all land data?")) {
      return;
    }

    setLoading(true);
    try {
      clearSampleLandData();
      toast.success("Land data cleared successfully");
      loadLands();
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Failed to clear data");
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = lands.length;
    const leased = lands.filter((land) => land.isLeased).length;
    const vacant = total - leased;
    const totalArea = lands.reduce((sum, land) => sum + land.area, 0);

    return { total, leased, vacant, totalArea };
  };

  const stats = getStats();

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Test Lands Management
            </h1>
            <p className="text-gray-600 mt-1">
              Test page for lands management functionality with sample data.
            </p>
          </div>

          {/* Controls */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Test Controls
              </h3>
              <div className="flex space-x-4">
                <Button
                  onClick={handlePopulateData}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <span>Populate Sample Data</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClearData}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <span>Clear All Data</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={loadLands}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <span>Refresh Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Statistics */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Land Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-600">Total Properties</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.leased}
                  </div>
                  <div className="text-sm text-gray-600">Leased</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.vacant}
                  </div>
                  <div className="text-sm text-gray-600">Vacant</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.totalArea.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    Total Area (mixed units)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Land List */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Lands ({lands.length})
              </h3>
              {lands.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No land properties found.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Click "Populate Sample Data" to add test data.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {lands.map((land) => (
                    <div
                      key={land.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {land.name}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {land.address}
                          </p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm text-gray-500">
                              {land.area.toLocaleString()} {land.areaUnit}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                land.zoning === "residential"
                                  ? "bg-blue-100 text-blue-800"
                                  : land.zoning === "commercial"
                                    ? "bg-green-100 text-green-800"
                                    : land.zoning === "agricultural"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-purple-100 text-purple-800"
                              }`}
                            >
                              {land.zoning}
                            </span>
                            <span
                              className={`px-2 py-1 text-xs font-medium rounded-full ${
                                land.isLeased
                                  ? "bg-green-100 text-green-800"
                                  : "bg-orange-100 text-orange-800"
                              }`}
                            >
                              {land.isLeased ? "Leased" : "Vacant"}
                            </span>
                          </div>
                          {land.isLeased && land.leaseTerms && (
                            <div className="mt-2 text-sm text-gray-600">
                              Rent: ₹
                              {land.leaseTerms.rentAmount.toLocaleString()}/
                              {land.leaseTerms.rentFrequency}
                            </div>
                          )}
                          {land.currentTenant && (
                            <div className="mt-1 text-sm text-gray-600">
                              Tenant: {land.currentTenant.personalInfo.fullName}
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(
                                `/properties/lands/${land.id}`,
                                "_blank"
                              )
                            }
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              window.open(
                                `/properties/lands/${land.id}/edit`,
                                "_blank"
                              )
                            }
                          >
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Links */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Quick Navigation
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open("/properties/lands", "_blank")}
                  className="justify-start"
                >
                  View All Lands
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open("/properties/lands/new", "_blank")}
                  className="justify-start"
                >
                  Add New Land
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.open("/properties", "_blank")}
                  className="justify-start"
                >
                  Properties Overview
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
