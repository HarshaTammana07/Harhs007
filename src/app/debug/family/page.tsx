"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { ApiService } from "@/services/ApiService";

export default function FamilyDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    const results: any = {
      timestamp: new Date().toISOString(),
      environment: {},
      supabaseConnection: {},
      tableAccess: {},
      apiService: {},
      errors: []
    };

    try {
      // Check environment variables
      results.environment = {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing",
        nodeEnv: process.env.NODE_ENV || "development"
      };

      // Test Supabase connection
      try {
        const { data, error } = await supabase.from('family_members').select('count');
        if (error) {
          results.supabaseConnection = {
            status: "❌ Failed",
            error: error.message,
            code: error.code,
            details: error.details
          };
          results.errors.push(`Supabase connection: ${error.message}`);
        } else {
          results.supabaseConnection = {
            status: "✅ Connected",
            data: data
          };
        }
      } catch (err: any) {
        results.supabaseConnection = {
          status: "❌ Exception",
          error: err.message
        };
        results.errors.push(`Supabase exception: ${err.message}`);
      }

      // Test table access
      const tables = ['family_members', 'buildings', 'apartments', 'flats', 'lands', 'tenants'];
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*').limit(1);
          if (error) {
            results.tableAccess[table] = {
              status: "❌ Failed",
              error: error.message,
              code: error.code
            };
            results.errors.push(`Table ${table}: ${error.message}`);
          } else {
            results.tableAccess[table] = {
              status: "✅ Accessible",
              recordCount: data?.length || 0
            };
          }
        } catch (err: any) {
          results.tableAccess[table] = {
            status: "❌ Exception",
            error: err.message
          };
          results.errors.push(`Table ${table} exception: ${err.message}`);
        }
      }

      // Test ApiService
      try {
        const members = await ApiService.getFamilyMembers();
        results.apiService = {
          status: "✅ Working",
          memberCount: members.length
        };
      } catch (err: any) {
        results.apiService = {
          status: "❌ Failed",
          error: err.message
        };
        results.errors.push(`ApiService: ${err.message}`);
      }

    } catch (err: any) {
      results.errors.push(`General error: ${err.message}`);
    }

    setDebugInfo(results);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Running diagnostics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Family Management Debug
          </h1>
          <p className="text-lg text-gray-600">
            Diagnostic information for troubleshooting
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Environment */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
            <div className="space-y-2">
              {Object.entries(debugInfo.environment || {}).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="text-gray-600">{key}:</span>
                  <span className="font-mono text-sm">{value as string}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Supabase Connection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Supabase Connection</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-mono text-sm">{debugInfo.supabaseConnection?.status}</span>
              </div>
              {debugInfo.supabaseConnection?.error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800 text-sm font-medium">Error:</p>
                  <p className="text-red-700 text-sm">{debugInfo.supabaseConnection.error}</p>
                  {debugInfo.supabaseConnection.code && (
                    <p className="text-red-600 text-xs mt-1">Code: {debugInfo.supabaseConnection.code}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Table Access */}
          <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Table Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(debugInfo.tableAccess || {}).map(([table, info]: [string, any]) => (
                <div key={table} className="border rounded p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{table}</span>
                    <span className="text-sm">{info.status}</span>
                  </div>
                  {info.error && (
                    <p className="text-red-600 text-xs">{info.error}</p>
                  )}
                  {info.recordCount !== undefined && (
                    <p className="text-gray-500 text-xs">{info.recordCount} records</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* API Service */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">API Service</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className="font-mono text-sm">{debugInfo.apiService?.status}</span>
              </div>
              {debugInfo.apiService?.memberCount !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-mono text-sm">{debugInfo.apiService.memberCount}</span>
                </div>
              )}
              {debugInfo.apiService?.error && (
                <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-800 text-sm font-medium">Error:</p>
                  <p className="text-red-700 text-sm">{debugInfo.apiService.error}</p>
                </div>
              )}
            </div>
          </div>

          {/* Errors Summary */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Errors Summary</h2>
            {debugInfo.errors?.length > 0 ? (
              <div className="space-y-2">
                {debugInfo.errors.map((error: string, index: number) => (
                  <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {error}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-green-600">✅ No errors detected</p>
            )}
          </div>
        </div>

        {/* Raw Debug Data */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Raw Debug Data</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Actions */}
        <div className="mt-8 flex space-x-4">
          <button
            onClick={runDiagnostics}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Re-run Diagnostics
          </button>
          <button
            onClick={() => window.open('/demo/family', '_blank')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Test Demo Page
          </button>
          <button
            onClick={() => window.open('/status', '_blank')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            System Status
          </button>
        </div>
      </div>
    </div>
  );
}