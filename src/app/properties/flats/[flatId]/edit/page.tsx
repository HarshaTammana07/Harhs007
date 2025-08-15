"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { FlatForm } from "@/components/properties/FlatForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LoadingState } from "@/components/ui";
import { propertyService } from "@/services/PropertyService";
import { Flat } from "@/types";
import { toast } from "react-hot-toast";

export default function EditFlatPage() {
  const [flat, setFlat] = useState<Flat | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const params = useParams();
  const flatId = params.flatId as string;

  useEffect(() => {
    loadFlat();
  }, [flatId]);

  const loadFlat = async () => {
    try {
      setLoading(true);
      const flatData = propertyService.getFlatById(flatId);
      if (!flatData) {
        toast.error("Flat not found");
        router.push("/properties/flats");
        return;
      }
      setFlat(flatData);
    } catch (error) {
      console.error("Error loading flat:", error);
      toast.error("Failed to load flat details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    flatData: Omit<Flat, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setSaving(true);

      propertyService.updateFlat(flatId, {
        ...flatData,
        updatedAt: new Date(),
      });

      toast.success("Flat updated successfully!");
      router.push(`/properties/flats/${flatId}`);
    } catch (error) {
      console.error("Error updating flat:", error);
      toast.error("Failed to update flat. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/properties/flats/${flatId}`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <LoadingState message="Loading flat details..." />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (!flat) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-8">
            <p className="text-gray-600">Flat not found.</p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Flats", href: "/properties/flats" },
    { label: flat.name, href: `/properties/flats/${flatId}` },
    { label: "Edit", href: `/properties/flats/${flatId}/edit` },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900">Edit Flat</h1>
              <p className="text-gray-600 mt-1">
                Update the details for {flat.name}.
              </p>
            </div>
          </div>

          <FlatForm
            flat={flat}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={saving}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
