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
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Add New Land Property
            </h1>
            <p className="text-gray-600 mt-1">
              Register a new land property with details and lease information.
            </p>
          </div>

          <LandForm />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
