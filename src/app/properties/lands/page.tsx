import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandsList } from "@/components/properties/LandsList";

export default function LandsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <div className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Real Estate</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Manage land properties, plots, and agricultural land.
                </p>
              </div>
            </div>
          </div>

          <LandsList />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
