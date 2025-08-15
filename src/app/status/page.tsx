"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  database: "connected" | "disconnected";
  responseTime?: string;
  error?: string;
  services: {
    supabase: "operational" | "error";
    apiService: "operational" | "error";
  };
}

export default function StatusPage() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/health");
      const data = await response.json();
      setHealthStatus(data);
      setLastChecked(new Date());
    } catch (error) {
      console.error("Failed to check health:", error);
      setHealthStatus({
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "Failed to connect to health endpoint",
        services: {
          supabase: "error",
          apiService: "error",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    // Auto-refresh every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
      case "connected":
        return "text-green-600 bg-green-100";
      case "unhealthy":
      case "error":
      case "disconnected":
        return "text-red-600 bg-red-100";
      default:
        return "text-yellow-600 bg-yellow-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "operational":
      case "connected":
        return "✅";
      case "unhealthy":
      case "error":
      case "disconnected":
        return "❌";
      default:
        return "⚠️";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            System Status
          </h1>
          <p className="text-lg text-gray-600">
            Monitor the health of your Family Business Management System
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Overall Status */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                Overall Status
              </h2>
              <Button
                onClick={checkHealth}
                disabled={loading}
                size="sm"
                variant="outline"
              >
                {loading ? "Checking..." : "Refresh"}
              </Button>
            </div>

            {healthStatus ? (
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {getStatusIcon(healthStatus.status)}
                  </span>
                  <div>
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(healthStatus.status)}`}
                    >
                      {healthStatus.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {healthStatus.responseTime && (
                  <div className="text-sm text-gray-600">
                    <strong>Response Time:</strong> {healthStatus.responseTime}
                  </div>
                )}

                {healthStatus.error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    <strong>Error:</strong> {healthStatus.error}
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  Last checked: {lastChecked?.toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Checking system status...</p>
              </div>
            )}
          </Card>

          {/* Service Status */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Service Status
            </h2>

            {healthStatus ? (
              <div className="space-y-4">
                {/* Database */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {getStatusIcon(healthStatus.database)}
                    </span>
                    <span className="font-medium">Database</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthStatus.database)}`}
                  >
                    {healthStatus.database}
                  </span>
                </div>

                {/* Supabase */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {getStatusIcon(healthStatus.services.supabase)}
                    </span>
                    <span className="font-medium">Supabase</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthStatus.services.supabase)}`}
                  >
                    {healthStatus.services.supabase}
                  </span>
                </div>

                {/* API Service */}
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {getStatusIcon(healthStatus.services.apiService)}
                    </span>
                    <span className="font-medium">API Service</span>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthStatus.services.apiService)}`}
                  >
                    {healthStatus.services.apiService}
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-12 bg-gray-200 rounded-md animate-pulse"
                  ></div>
                ))}
              </div>
            )}
          </Card>

          {/* Environment Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Environment
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Environment:</span>
                <span className="font-medium">
                  {process.env.NODE_ENV || "development"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Supabase URL:</span>
                <span className="font-medium text-xs">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL
                    ? "✅ Configured"
                    : "❌ Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Supabase Key:</span>
                <span className="font-medium text-xs">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? "✅ Configured"
                    : "❌ Missing"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Build Time:</span>
                <span className="font-medium text-xs">
                  {new Date().toLocaleString()}
                </span>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                onClick={() => window.open("/demo/family", "_blank")}
                className="w-full"
                variant="outline"
              >
                🏠 Test Family Management
              </Button>
              <Button
                onClick={() => window.open("/api/health", "_blank")}
                className="w-full"
                variant="outline"
              >
                🔍 View Raw Health Data
              </Button>
              <Button
                onClick={() =>
                  window.open(
                    process.env.NEXT_PUBLIC_SUPABASE_URL + "/dashboard",
                    "_blank"
                  )
                }
                className="w-full"
                variant="outline"
                disabled={!process.env.NEXT_PUBLIC_SUPABASE_URL}
              >
                📊 Open Supabase Dashboard
              </Button>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Family Business Management System • API-Driven with Supabase
          </p>
          <p className="mt-1">
            Status page auto-refreshes every 30 seconds
          </p>
        </div>
      </div>
    </div>
  );
}