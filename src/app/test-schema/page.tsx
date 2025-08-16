"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestSchemaPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testSchema = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing database schema...");
      
      // Test if buildings table exists and get its structure
      const { data, error } = await supabase
        .from("buildings")
        .select("*")
        .limit(0); // Get no rows, just test the table structure

      console.log("Schema test response:", { data, error });

      if (error) {
        throw new Error(`Schema error: ${error.message}`);
      }

      // Try to get table info (this might not work depending on RLS)
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: 'buildings' })
        .single();

      console.log("Table info:", { tableInfo, tableError });

      setResult({
        schemaTest: { success: true, error: null },
        tableInfo: tableInfo || "Could not retrieve table info",
        message: "Schema test completed successfully!"
      });
    } catch (err: any) {
      console.error("Schema test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testMinimalInsert = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing minimal insert...");
      
      // Try with absolute minimal required fields
      const minimalData = {
        name: "Minimal Test",
        building_code: "MIN001",
        address: "Test Address",
        total_floors: 1,
        total_apartments: 1
      };

      console.log("Minimal insert data:", minimalData);

      const { data, error } = await supabase
        .from("buildings")
        .insert(minimalData)
        .select()
        .single();

      console.log("Minimal insert response:", { data, error });

      if (error) {
        console.error("Minimal insert error details:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw new Error(`Minimal insert failed: ${error.message}`);
      }

      setResult({
        success: true,
        insertedData: data,
        message: "Minimal insert successful!"
      });
    } catch (err: any) {
      console.error("Minimal insert error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testFieldByField = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log("Testing field by field...");
      
      const tests = [];
      
      // Test 1: Only required fields
      try {
        const test1Data = {
          name: "Test1",
          building_code: "T001",
          address: "Test Address 1",
          total_floors: 1,
          total_apartments: 1
        };
        
        const { data: data1, error: error1 } = await supabase
          .from("buildings")
          .insert(test1Data)
          .select()
          .single();
          
        tests.push({ test: "Required fields only", success: !error1, data: data1, error: error1 });
      } catch (e) {
        tests.push({ test: "Required fields only", success: false, error: e });
      }

      // Test 2: Add optional fields one by one
      try {
        const test2Data = {
          name: "Test2",
          building_code: "T002", 
          address: "Test Address 2",
          total_floors: 2,
          total_apartments: 4,
          description: "Test description"
        };
        
        const { data: data2, error: error2 } = await supabase
          .from("buildings")
          .insert(test2Data)
          .select()
          .single();
          
        tests.push({ test: "With description", success: !error2, data: data2, error: error2 });
      } catch (e) {
        tests.push({ test: "With description", success: false, error: e });
      }

      // Test 3: Add amenities array
      try {
        const test3Data = {
          name: "Test3",
          building_code: "T003",
          address: "Test Address 3", 
          total_floors: 3,
          total_apartments: 6,
          amenities: ["Parking", "Elevator"]
        };
        
        const { data: data3, error: error3 } = await supabase
          .from("buildings")
          .insert(test3Data)
          .select()
          .single();
          
        tests.push({ test: "With amenities array", success: !error3, data: data3, error: error3 });
      } catch (e) {
        tests.push({ test: "With amenities array", success: false, error: e });
      }

      setResult({
        tests,
        message: "Field by field testing completed!"
      });
    } catch (err: any) {
      console.error("Field by field test error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🔍 Database Schema Test</h1>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testSchema}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Schema"}
        </button>
        
        <button
          onClick={testMinimalInsert}
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 ml-4"
        >
          {loading ? "Inserting..." : "Test Minimal Insert"}
        </button>
        
        <button
          onClick={testFieldByField}
          disabled={loading}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 ml-4"
        >
          {loading ? "Testing..." : "Test Field by Field"}
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
        <h3 className="font-semibold mb-2">Debug Steps:</h3>
        <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
          <li>Test Schema - Verify buildings table exists and is accessible</li>
          <li>Test Minimal Insert - Try inserting with only required fields</li>
          <li>Test Field by Field - Test each field type individually</li>
          <li>Check browser console for detailed error messages</li>
        </ol>
      </div>
    </div>
  );
}