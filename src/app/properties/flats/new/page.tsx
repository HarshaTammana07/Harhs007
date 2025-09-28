"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { FlatForm } from "@/components/properties/FlatForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { propertyService } from "@/services/PropertyService";
import { Flat } from "@/types";
import { toast } from "react-hot-toast";

export default function NewFlatPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Flats", href: "/properties/flats" },
    { label: "New Flat", href: "/properties/flats/new" },
  ];

  const handleSubmit = async (
    flatData: Omit<Flat, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setLoading(true);

      const newFlat: Flat = {
        ...flatData,
        id: `flat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      propertyService.saveFlat(newFlat);
      toast.success("Flat created successfully!");
      router.push("/properties/flats");
    } catch (error) {
      console.error("Error creating flat:", error);
      toast.error("Failed to create flat. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/properties/flats");
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <div className="p-6">
            <div>
              <Breadcrumb items={breadcrumbItems} />
              <div className="mt-4">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Add New Flat</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  Create a new standalone rental unit or individual apartment.
                </p>
              </div>
            </div>

            <FlatForm
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
