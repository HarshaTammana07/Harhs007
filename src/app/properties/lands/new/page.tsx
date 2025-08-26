import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandForm } from "@/components/properties/LandForm";
import { Breadcrumb } from "@/components/ui";

export default function NewLandPage() {
  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Real Estate", href: "/properties/lands" },
    { label: "Add New Land", href: "/properties/lands/new" },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <div className="p-6">
            <Breadcrumb items={breadcrumbItems} />

            <div className="mt-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Add New Land Property
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Register a new land property with details and lease information.
              </p>
            </div>

            <LandForm />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
