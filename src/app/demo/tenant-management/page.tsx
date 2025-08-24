"use client";

import { TenantManagement } from "@/components/tenants/TenantManagement";

export default function DemoTenantManagementPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Tenant Management System
            </h1>
            <p className="text-xl text-gray-600 mt-4">
              Complete CRUD operations for managing tenants
            </p>
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Features:</h3>
              <ul className="text-blue-800 space-y-1">
                <li>✅ Create new tenants with minimal form</li>
                <li>✅ View all tenants with search functionality</li>
                <li>✅ Edit existing tenant information</li>
                <li>✅ Delete tenants with confirmation</li>
                <li>✅ Real-time statistics and overview</li>
                <li>✅ Responsive design for all devices</li>
              </ul>
            </div>
          </div>

          {/* Tenant Management Component */}
          <TenantManagement />
        </div>
      </div>
    </div>
  );
}