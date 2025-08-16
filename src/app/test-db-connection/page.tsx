"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestDbConnectionPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testBasicConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing basic Supabase connection...");
      
      // Test 1: Check if we can connect to Supabase
      const { data: healthCheck, error: healthError } = await supabase
        .from("buildings")
        .select("count", { count: "exact", head: true });

      console.log("Health check result:", { healthCheck, healthError });

      if (healthError) {
        throw new Error(`Health check failed: ${healthError.message}`);
      }

      // Test 2: Try to read buildings table
      const { data: buildings, error: buildingsError } = await supabase
        .from("buildings")
        .select("*")
        .limit(5);

      console.log("Buildings query result:", { buildings, buildingsError });

      setResult({
        healthCheck: { success: !healthError, error: healthError },
        buildingsQuery: { 
          success: !buildingsError, 
          data: buildings, 
          error: buildingsError,
          count: buildings?.length || 0
        },
        message: buildingsError ? "Database connection failed" : "Database connection successful!"
      });

    } catch (err: any) {
      console.error("Connection test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testRLSPolicies = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing RLS policies...");
      
      // Test different operations to see which ones are blocked
      const tests = [];

      // Test 1: SELECT
      try {
        const { data, error } = await supabase
          .from("buildings")
          .select("id, name")
          .limit(1);
        tests.push({ 
          operation: "SELECT", 
          success: !error, 
          error: error?.message,
          data: data?.length || 0
        });
      } catch (e: any) {
        tests.push({ operation: "SELECT", success: false, error: e.message });
      }

      // Test 2: INSERT
      try {
        const { data, error } = await supabase
          .from("buildings")
          .insert({
            name: "RLS Test Building",
            building_code: "RLS001",
            address: "RLS Test Address",
            total_floors: 1,
            total_apartments: 1
          })
          .select()
          .single();
        
        tests.push({ 
          operation: "INSERT", 
          success: !error, 
          error: error?.message,
          data: data?.id || null
        });

        // Clean up test data if insert succeeded
        if (!error && data?.id) {
          await supabase.from("buildings").delete().eq("id", data.id);
        }
      } catch (e: any) {
        tests.push({ operation: "INSERT", success: false, error: e.message });
      }

      setResult({
        tests,
        message: "RLS policy test completed - check individual operations"
      });

    } catch (err: any) {
      console.error("RLS test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testApiService = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing ApiService methods...");
      
      // Import ApiService dynamically to avoid SSR issues
      const { ApiService } = await import("@/services/ApiService");
      
      const tests = [];

      // Test getBuildings
      try {
        const buildings = await ApiService.getBuildings();
        tests.push({
          method: "getBuildings",
          success: true,
          count: buildings.length,
          data: buildings.slice(0, 2) // First 2 buildings for preview
        });
      } catch (e: any) {
        tests.push({
          method: "getBuildings",
          success: false,
          error: e.message
        });
      }

      // Test createBuilding
      try {
        const testBuilding = {
          type: "building" as const,
          name: "API Test Building",
          buildingCode: "API001",
          address: "API Test Address",
          totalFloors: 2,
          totalApartments: 4,
          amenities: ["Test"],
          images: []
        };

        const created = await ApiService.createBuilding(testBuilding);
        tests.push({
          method: "createBuilding",
          success: true,
          data: { id: created.id, name: created.name }
        });

        // Clean up
        if (created.id) {
          await ApiService.deleteBuilding(created.id);
        }
      } catch (e: any) {
        tests.push({
          method: "createBuilding",
          success: false,
          error: e.message
        });
      }

      setResult({
        tests,
        message: "ApiService test completed"
      });

    } catch (err: any) {
      console.error("ApiService test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Database Connection Test</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testBasicConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Basic Connection"}
        </button>
        
        <button
          onClick={testRLSPolicies}
          disabled={loading}
          className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 disabled:opacity-50 ml-4"
        >
          {loading ? "Testing..." : "Test RLS Policies"}
        </button>
        
        <button
          onClick={testApiService}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? "Testing..." : "Test ApiService"}
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
          <pre className="text-sm text-green-700 overflow-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}

      <div className="mt-8 bg-gray-50 border border-gray-200 rounded p-4">
        <h3 className="font-semibold mb-2">Troubleshooting Steps:</h3>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li><strong>Test Basic Connection</strong> - Check if Supabase is accessible</li>
          <li><strong>Test RLS Policies</strong> - Check if Row Level Security is blocking operations</li>
          <li><strong>Test ApiService</strong> - Check if our service layer is working</li>
          <li><strong>Check Console</strong> - Look for detailed error messages</li>
        </ol>
        
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-semibold text-yellow-800">Common Issues:</h4>
          <ul className="text-sm text-yellow-700 mt-1 space-y-1">
            <li>• <strong>RLS Enabled:</strong> Row Level Security might be blocking reads</li>
            <li>• <strong>Missing Policies:</strong> No policies allowing SELECT operations</li>
            <li>• <strong>Wrong Environment:</strong> Check .env.local file</li>
            <li>• <strong>Table Missing:</strong> Buildings table might not exist</li>
          </ul>
        </div>
      </div>
    </div>
  );
}