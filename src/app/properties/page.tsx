import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { PropertyTypeOverview } from "@/components/properties/PropertyTypeOverview";

export default function PropertiesPage() {
  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Properties</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage rental properties and tenant information.
            </p>
          </div>

          <PropertyTypeOverview />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
