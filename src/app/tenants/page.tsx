"use client";

import { useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { TenantList } from "@/components/tenants/TenantList";
import { TenantDetail } from "@/components/tenants/TenantDetail";
import { TenantDashboard } from "@/components/tenants/TenantDashboard";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Tenant } from "@/types";

export default function TenantsPage() {
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [currentView, setCurrentView] = useState<"dashboard" | "list">(
    "dashboard"
  );

  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tenants", href: "/tenants" },
  ];

  const handleTenantSelect = (tenant: Tenant) => {
    setSelectedTenant(tenant);
  };

  const handleCloseTenantDetail = () => {
    setSelectedTenant(null);
  };

  const handleManageTenants = () => {
    setCurrentView("list");
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />

          {/* View Toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentView("dashboard")}
              className={`px-4 py-2 rounded-md font-medium ${
                currentView === "dashboard"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView("list")}
              className={`px-4 py-2 rounded-md font-medium ${
                currentView === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Manage Tenants
            </button>
          </div>

          {/* Content based on current view */}
          {currentView === "dashboard" ? (
            <TenantDashboard
              onViewTenant={handleTenantSelect}
              onManageTenants={handleManageTenants}
            />
          ) : (
            <TenantList
              onTenantSelect={handleTenantSelect}
              showAddButton={true}
              showFilters={true}
            />
          )}

          {/* Tenant Detail Modal */}
          {selectedTenant && (
            <TenantDetail
              tenant={selectedTenant}
              onClose={handleCloseTenantDetail}
              isModal={true}
            />
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
