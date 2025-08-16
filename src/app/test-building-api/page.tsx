"use client";

import { useState } from "react";
import { buildingService } from "@/services/BuildingService";

export default function TestBuildingApiPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testCreateBuilding = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing building creation...");
      
      const buildingData = {
        type: "building" as const,
        name: "Test Building " + Date.now(),
        buildingCode: "TB" + Date.now(),
        address: "123 Test Street, Test City",
        description: "A test building for API testing",
        totalFloors: 5,
        totalApartments: 20,
        amenities: ["Parking", "Elevator", "Security"],
        constructionYear: 2020,
        images: [],
      };

      console.log("Building data:", buildingData);
      
      const newBuilding = await ApiService.createBuilding(buildingData);
      console.log("Created building:", newBuilding);
      
      setResult(newBuilding);
    } catch (err: any) {
      console.error("Error creating building:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testGetBuildings = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing get buildings...");
      const buildings = await ApiService.getBuildings();
      console.log("Fetched buildings:", buildings);
      setResult(buildings);
    } catch (err: unknown) {
      console.error("Error fetching buildings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🧪 Building API Test</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testCreateBuilding}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating..." : "Test Create Building"}
        </button>
        
        <button
          onClick={testGetBuildings}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? "Loading..." : "Test Get Buildings"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
          <h3 className="font-semibold text-red-800">Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="font-semibold text-green-800 mb-2">Result:</h3>
          <pre className="text-sm text-green-700 overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded p-4">
        <h3 className="font-semibold mb-2">Debug Info:</h3>
        <p className="text-sm text-gray-600">
          Check the browser console for detailed logs of API calls and responses.
        </p>
      </div>
    </div>
  );
}