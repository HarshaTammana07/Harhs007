import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PropertyTypeOverview } from "@/components/properties/PropertyTypeOverview";

export default function PropertiesPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600 mt-1">
              Manage rental properties and tenant information.
            </p>
          </div>

          <PropertyTypeOverview />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
