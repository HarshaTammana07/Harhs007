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
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <div className="p-6">
            <Breadcrumb items={breadcrumbItems} />
            <ErrorBoundary>
              <RentManagement />
            </ErrorBoundary>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
