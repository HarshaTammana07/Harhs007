import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandsList } from "@/components/properties/LandsList";

export default function LandsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Real Estate</h1>
              <p className="text-gray-600 mt-1">
                Manage land properties, plots, and agricultural land.
              </p>
            </div>
          </div>

          <LandsList />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
