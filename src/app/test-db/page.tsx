"use client";

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TestDbPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    const testResults: any = {};

    try {
      // Test 1: Basic connection
      console.log("Testing basic connection...");
      const { data: healthData, error: healthError } = await supabase
        .from('family_members')
        .select('count');
      
      testResults.basicConnection = {
        success: !healthError,
        error: healthError?.message,
        data: healthData
      };

      // Test 2: Try to create the table if it doesn't exist
      if (healthError && healthError.code === '42P01') {
        console.log("Table doesn't exist, this is the issue!");
        testResults.tableExists = false;
        testResults.solution = "You need to run the database schema in Supabase";
      } else {
        testResults.tableExists = true;
      }

      // Test 3: List all tables
      try {
        const { data: tablesData, error: tablesError } = await supabase
          .rpc('get_schema_tables');
        
        testResults.availableTables = {
          success: !tablesError,
          error: tablesError?.message,
          tables: tablesData
        };
      } catch (err) {
        // This RPC might not exist, that's okay
        testResults.availableTables = {
          success: false,
          error: "RPC function not available"
        };
      }

      // Test 4: Try a simple query
      try {
        const { data: queryData, error: queryError } = await supabase
          .from('family_members')
          .select('*')
          .limit(1);
        
        testResults.simpleQuery = {
          success: !queryError,
          error: queryError?.message,
          data: queryData
        };
      } catch (err: any) {
        testResults.simpleQuery = {
          success: false,
          error: err.message
        };
      }

    } catch (err: any) {
      testResults.generalError = err.message;
    }

    setResults(testResults);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Database Connection Test</h1>
        
        <div className="mb-6">
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Database Connection"}
          </button>
        </div>

        {results && (
          <div className="space-y-6">
            {/* Basic Connection */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Basic Connection</h2>
              <div className="space-y-2">
                <p>Status: {results.basicConnection?.success ? "✅ Success" : "❌ Failed"}</p>
                {results.basicConnection?.error && (
                  <div className="bg-red-50 border border-red-200 p-3 rounded">
                    <p className="text-red-800 font-medium">Error:</p>
                    <p className="text-red-700">{results.basicConnection.error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Table Existence */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Table Status</h2>
              <div className="space-y-2">
                <p>family_members table exists: {results.tableExists ? "✅ Yes" : "❌ No"}</p>
                {results.solution && (
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                    <p className="text-yellow-800 font-medium">Solution:</p>
                    <p className="text-yellow-700">{results.solution}</p>
                    <div className="mt-3">
                      <p className="text-sm text-yellow-600">Steps to fix:</p>
                      <ol className="list-decimal list-inside text-sm text-yellow-600 mt-1">
                        <li>Go to your Supabase dashboard</li>
                        <li>Navigate to SQL Editor</li>
                        <li>Copy the content from database/supabase-schema.sql</li>
                        <li>Paste and run the SQL</li>
                        <li>Refresh this page and test again</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Simple Query */}
            {results.simpleQuery && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Simple Query Test</h2>
                <div className="space-y-2">
                  <p>Status: {results.simpleQuery.success ? "✅ Success" : "❌ Failed"}</p>
                  {results.simpleQuery.error && (
                    <div className="bg-red-50 border border-red-200 p-3 rounded">
                      <p className="text-red-800 font-medium">Error:</p>
                      <p className="text-red-700">{results.simpleQuery.error}</p>
                    </div>
                  )}
                  {results.simpleQuery.data && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded">
                      <p className="text-green-800 font-medium">Data:</p>
                      <pre className="text-green-700 text-sm">
                        {JSON.stringify(results.simpleQuery.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Environment Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Environment Info</h2>
              <div className="space-y-2 text-sm">
                <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing"}</p>
                <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}</p>
                <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}</p>
                <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...</p>
              </div>
            </div>

            {/* Raw Results */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Raw Results</h2>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}