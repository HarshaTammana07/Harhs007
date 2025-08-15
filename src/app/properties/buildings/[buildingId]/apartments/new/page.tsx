"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Building, Apartment } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { LoadingState } from "@/components/ui";
import { ApartmentForm } from "@/components/properties/ApartmentForm";
import toast from "react-hot-toast";

export default function NewApartmentPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.buildingId as string;

  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadBuilding();
  }, [buildingId]);

  const loadBuilding = async () => {
    try {
      setLoading(true);
      const buildingData = propertyService.getBuildingById(buildingId);
      if (!buildingData) {
        toast.error("Building not found");
        router.push("/properties/buildings");
        return;
      }
      setBuilding(buildingData);
    } catch (error) {
      console.error("Error loading building:", error);
      toast.error("Failed to load building");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    apartmentData: Omit<Apartment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setIsSubmitting(true);

      const newApartment: Apartment = {
        ...apartmentData,
        id: `apartment_${Date.now()}`,
        buildingId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      propertyService.addApartmentToBuilding(buildingId, newApartment);
      toast.success("Apartment added successfully");
      router.push(`/properties/buildings/${buildingId}/apartments`);
    } catch (error) {
      console.error("Error creating apartment:", error);
      toast.error("Failed to create apartment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/properties/buildings/${buildingId}/apartments`);
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <LoadingState message="Loading building..." />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (!building) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Building not found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The building you're looking for doesn't exist.
            </p>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Buildings", href: "/properties/buildings" },
    {
      label: building.name,
      href: `/properties/buildings/${buildingId}/apartments`,
    },
    {
      label: "New Apartment",
      href: `/properties/buildings/${buildingId}/apartments/new`,
    },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Adding apartment to: {building.name}
            </h2>
            <p className="text-gray-600">
              Building {building.buildingCode} • {building.address}
            </p>
          </div>

          <ApartmentForm
            building={building}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
