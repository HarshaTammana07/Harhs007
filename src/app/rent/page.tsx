"use client";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { RentManagement } from "@/components/rent/RentManagement";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RentManagementPage() {
  const breadcrumbItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Rent Management", href: "/rent" },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />
          <ErrorBoundary>
            <RentManagement />
          </ErrorBoundary>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
