"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { TenantManagement } from "@/components/tenants/TenantManagement";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

export default function TenantsPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Tenants", href: "/tenants" },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />
          <TenantManagement />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
