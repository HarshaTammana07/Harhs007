"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button, Card } from "@/components/ui";
import { loadSampleFlatData, clearFlatData } from "@/utils/sampleFlatData";
import { propertyService } from "@/services/PropertyService";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function TestFlatsPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLoadSampleData = async () => {
    try {
      setLoading(true);
      const loaded = loadSampleFlatData();
      if (loaded) {
        toast.success("Sample flat data loaded successfully!");
      } else {
        toast.info("Sample data already exists");
      }
    } catch (error) {
      console.error("Error loading sample data:", error);
      toast.error("Failed to load sample data");
    } finally {
      setLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!confirm("Are you sure you want to clear all flat data?")) {
      return;
    }

    try {
      setLoading(true);
      clearFlatData();
      toast.success("Flat data cleared successfully!");
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Failed to clear data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFlats = () => {
    router.push("/properties/flats");
  };

  const handleViewProperties = () => {
    router.push("/properties");
  };

  const getStats = () => {
    try {
      const flats = propertyService.getFlats();
      const occupied = flats.filter((f) => f.isOccupied).length;
      const vacant = flats.length - occupied;

      return {
        total: flats.length,
        occupied,
        vacant,
      };
    } catch (error) {
      return { total: 0, occupied: 0, vacant: 0 };
    }
  };

  const stats = getStats();

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Test Flats Management
            </h1>
            <p className="text-gray-600 mt-1">
              Load sample data and test the flats management interface.
            </p>
          </div>

          {/* Current Stats */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current Flats Data
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-600">Total Flats</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.occupied}
                  </div>
                  <div className="text-sm text-gray-600">Occupied</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {stats.vacant}
                  </div>
                  <div className="text-sm text-gray-600">Vacant</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Sample Data Management
                </h3>
                <div className="space-y-3">
                  <Button
                    onClick={handleLoadSampleData}
                    loading={loading}
                    className="w-full"
                  >
                    Load Sample Flat Data
                  </Button>
                  <Button
                    onClick={handleClearData}
                    loading={loading}
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Clear All Flat Data
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Sample data includes 5 flats with different configurations,
                  some occupied with tenant details and some vacant.
                </p>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Test Interface
                </h3>
                <div className="space-y-3">
                  <Button onClick={handleViewFlats} className="w-full">
                    View Flats Management
                  </Button>
                  <Button
                    onClick={handleViewProperties}
                    variant="outline"
                    className="w-full"
                  >
                    View Properties Overview
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-4">
                  Test the complete flats management interface including
                  listing, creating, editing, and tenant management.
                </p>
              </div>
            </Card>
          </div>

          {/* Sample Data Preview */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sample Data Preview
              </h3>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Green Valley Apartments (A-301):</strong> 2BHK,
                  ₹20,000/month, Occupied
                </p>
                <p>
                  <strong>Sunrise Residency (102):</strong> 3BHK, ₹25,000/month,
                  Vacant
                </p>
                <p>
                  <strong>Metro Heights (205):</strong> 1BHK, ₹12,000/month,
                  Occupied
                </p>
                <p>
                  <strong>Royal Enclave (Villa-12):</strong> 4BHK,
                  ₹45,000/month, Vacant
                </p>
                <p>
                  <strong>Tech Park Residency (501):</strong> 2BHK,
                  ₹22,000/month, Vacant
                </p>
              </div>
            </div>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
