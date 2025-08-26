import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { BuildingsList } from "@/components/properties/BuildingsList";

export default function BuildingsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Buildings</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage multi-unit apartment buildings with individual apartments.
            </p>
          </div>
          <BuildingsList />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
