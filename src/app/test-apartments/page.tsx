"use client";

import { useState } from "react";
import { ApiService } from "@/services/ApiService";
import { buildingService } from "@/services/BuildingService";

export default function TestApartmentsPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buildingId, setBuildingId] = useState("");

  const testApartmentFlow = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("=== APARTMENT DEBUG TEST ===");
      
      // Step 1: Get all buildings
      console.log("1. Getting all buildings...");
      const buildings = await ApiService.getBuildings();
      console.log("Buildings found:", buildings.length);
      console.log("Buildings:", buildings.map(b => ({ id: b.id, name: b.name })));

      if (buildings.length === 0) {
        throw new Error("No buildings found. Create a building first.");
      }

      const testBuilding = buildings[0];
      console.log("Using building:", testBuilding.name, "ID:", testBuilding.id);

      // Step 2: Check existing apartments for this building
      console.log("2. Getting existing apartments for building...");
      const existingApartments = await ApiService.getApartmentsByBuildingId(testBuilding.id);
      console.log("Existing apartments:", existingApartments.length);
      console.log("Apartments:", existingApartments);

      // Step 3: Create a test apartment
      console.log("3. Creating test apartment...");
      const apartmentData = {
        buildingId: testBuilding.id,
        doorNumber: "TEST-" + Date.now(),
        floor: 1,
        bedroomCount: 2,
        bathroomCount: 1,
        area: 1000,
        rentAmount: 15000,
        securityDeposit: 30000,
        isOccupied: false,
        specifications: {
          furnished: false,
          parking: true,
          balcony: true,
          airConditioning: false,
          powerBackup: true,
          waterSupply: "24/7",
          internetReady: true,
          additionalFeatures: ["Test Feature"]
        }
      };

      console.log("Creating apartment with data:", apartmentData);
      const createdApartment = await ApiService.createApartment(apartmentData);
      console.log("Created apartment:", createdApartment);

      // Step 4: Fetch apartments again to see if it appears
      console.log("4. Fetching apartments again...");
      const updatedApartments = await ApiService.getApartmentsByBuildingId(testBuilding.id);
      console.log("Updated apartments count:", updatedApartments.length);
      console.log("Updated apartments:", updatedApartments);

      // Step 5: Test with PropertyService
      console.log("5. Testing with PropertyService...");
      const propertyServiceApartments = await buildingService.getApartmentsByBuildingId(testBuilding.id);
      console.log("PropertyService apartments:", propertyServiceApartments.length);

      setResult({
        buildingUsed: { id: testBuilding.id, name: testBuilding.name },
        existingApartments: existingApartments.length,
        createdApartment: { id: createdApartment.id, doorNumber: createdApartment.doorNumber },
        updatedApartmentsCount: updatedApartments.length,
        propertyServiceCount: propertyServiceApartments.length,
        success: true,
        message: "Apartment test completed successfully!"
      });

    } catch (err: any) {
      console.error("Apartment test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testSpecificBuilding = async () => {
    if (!buildingId.trim()) {
      setError("Please enter a building ID");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("=== SPECIFIC BUILDING TEST ===");
      console.log("Testing building ID:", buildingId);

      // Test 1: Get building details
      const building = await ApiService.getBuildingById(buildingId);
      console.log("Building found:", building);

      if (!building) {
        throw new Error("Building not found with ID: " + buildingId);
      }

      // Test 2: Get apartments for this building
      const apartments = await ApiService.getApartmentsByBuildingId(buildingId);
      console.log("Apartments for building:", apartments);

      // Test 3: Check database directly
      console.log("3. Checking database directly...");
      const { supabase } = await import("@/lib/supabase");
      const { data: rawApartments, error } = await supabase
        .from("apartments")
        .select("*")
        .eq("building_id", buildingId);

      console.log("Raw database query result:", { rawApartments, error });

      setResult({
        buildingId,
        building: building ? { id: building.id, name: building.name } : null,
        apartmentsCount: apartments.length,
        apartments: apartments.map(a => ({ 
          id: a.id, 
          doorNumber: a.doorNumber, 
          buildingId: a.buildingId 
        })),
        rawDatabaseCount: rawApartments?.length || 0,
        rawDatabaseData: rawApartments?.map(a => ({ 
          id: a.id, 
          door_number: a.door_number, 
          building_id: a.building_id 
        })) || [],
        message: "Specific building test completed!"
      });

    } catch (err: any) {
      console.error("Specific building test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🏠 Apartment Debug Test</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testApartmentFlow}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Full Apartment Flow"}
        </button>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={buildingId}
            onChange={(e) => setBuildingId(e.target.value)}
            placeholder="Enter Building ID to test"
            className="flex-1 px-3 py-2 border border-gray-300 rounded"
          />
          <button
            onClick={testSpecificBuilding}
            disabled={loading || !buildingId.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Specific Building"}
          </button>
        </div>
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
          <pre className="text-sm text-green-700 overflow-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded p-4">
        <h3 className="font-semibold mb-2">Debug Steps:</h3>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li><strong>Test Full Flow</strong> - Creates apartment and checks if it appears</li>
          <li><strong>Test Specific Building</strong> - Debug a specific building ID</li>
          <li><strong>Check Console</strong> - Detailed logs of all operations</li>
          <li><strong>Compare Results</strong> - API vs Database direct query</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800">Common Issues:</h4>
          <ul className="text-sm text-yellow-700 mt-1 space-y-1">
            <li>• <strong>Building ID Mismatch:</strong> UUID vs String format</li>
            <li>• <strong>Foreign Key Issue:</strong> building_id not linking properly</li>
            <li>• <strong>Transform Error:</strong> Data transformation failing</li>
            <li>• <strong>Query Issue:</strong> SQL query not finding records</li>
          </ul>
        </div>
      </div>
    </div>
  );
}