import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { FlatsList } from "@/components/properties/FlatsList";

export default function FlatsPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Flats</h1>
              <p className="text-gray-600 mt-1">
                Manage standalone rental units and individual apartments.
              </p>
            </div>
          </div>

          <FlatsList />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
