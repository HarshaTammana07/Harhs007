"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Land } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LandForm } from "@/components/properties/LandForm";
import { Breadcrumb, LoadingState } from "@/components/ui";
import { toast } from "react-hot-toast";

export default function EditLandPage() {
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const landId = params.landId as string;

  useEffect(() => {
    if (landId) {
      loadLand();
    }
  }, [landId]);

  const loadLand = async () => {
    try {
      setLoading(true);
      const landData = propertyService.getLandById(landId);
      if (landData) {
        setLand(landData);
      } else {
        toast.error("Land property not found");
        router.push("/properties/lands");
      }
    } catch (error) {
      console.error("Error loading land:", error);
      toast.error("Failed to load land property");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (updatedLand: Land) => {
    router.push(`/properties/lands/${landId}`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <LoadingState message="Loading land property..." />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (!land) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">
              Land Property Not Found
            </h2>
            <p className="text-gray-600 mt-2">
              The requested land property could not be found.
            </p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Real Estate", href: "/properties/lands" },
    { label: land.name, href: `/properties/lands/${landId}` },
    { label: "Edit", href: `/properties/lands/${landId}/edit` },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />

          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Edit Land Property
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Update the details and lease information for {land.name}.
            </p>
          </div>

          <LandForm land={land} onSubmit={handleSubmit} />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
