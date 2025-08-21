"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSupabasePage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing Supabase connection...");
      
      // Test basic connection
      const { data, error } = await supabase
        .from("buildings")
        .select("count", { count: "exact" });

      console.log("Supabase test response:", { data, error });

      if (error) {
        throw new Error(`Supabase error: ${error.message}`);
      }

      setResult({
        connected: true,
        buildingsCount: data,
        message: "Supabase connection successful!"
      });
    } catch (err: any) {
      console.error("Supabase connection error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testInsert = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing direct insert...");
      
      const insertData = {
        name: "Direct Test Building " + Date.now(),
        building_code: "DTB" + Date.now(),
        address: "Direct Test Address",
        description: "Direct test description",
        total_floors: 3,
        total_apartments: 12,
        amenities: ["Test Amenity"],
        construction_year: 2023,
        images: [],
      };

      console.log("Direct insert data:", insertData);

      const { data, error } = await supabase
        .from("buildings")
        .insert(insertData)
        .select()
        .single();

      console.log("Direct insert response:", { data, error });

      if (error) {
        console.error("Detailed error:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Insert error: ${error.message} (Code: ${error.code})`);
      }

      setResult({
        success: true,
        insertedData: data,
        message: "Direct insert successful!"
      });
    } catch (err: any) {
      console.error("Direct insert error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testRLS = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing RLS policies...");
      
      // Test if we can read from buildings table
      const { data: readData, error: readError } = await supabase
        .from("buildings")
        .select("*")
        .limit(1);

      console.log("Read test:", { readData, readError });

      // Test if we can insert with minimal data
      const minimalData = {
        name: "RLS Test " + Date.now(),
        building_code: "RLS" + Date.now(),
        address: "RLS Test Address",
        total_floors: 1,
        total_apartments: 1,
      };

      const { data: insertData, error: insertError } = await supabase
        .from("buildings")
        .insert(minimalData)
        .select()
        .single();

      console.log("Insert test:", { insertData, insertError });

      setResult({
        readTest: { data: readData, error: readError },
        insertTest: { data: insertData, error: insertError },
        message: "RLS test completed - check console for details"
      });
    } catch (err: unknown) {
      console.error("RLS test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔌 Supabase Connection Test</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testConnection}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Connection"}
        </button>
        
        <button
          onClick={testInsert}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? "Inserting..." : "Test Direct Insert"}
        </button>
        
        <button
          onClick={testRLS}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 ml-4"
        >
          {loading ? "Testing..." : "Test RLS Policies"}
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
        <h3 className="font-semibold mb-2">Environment Check:</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</p>
          <p>Supabase Anon Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</p>
        </div>
      </div>
    </div>
  );
}