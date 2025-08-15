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

export default function EditApartmentPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.buildingId as string;
  const apartmentId = params.apartmentId as string;

  const [building, setBuilding] = useState<Building | null>(null);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, [buildingId, apartmentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const buildingData = propertyService.getBuildingById(buildingId);
      if (!buildingData) {
        toast.error("Building not found");
        router.push("/properties/buildings");
        return;
      }

      const apartmentData = propertyService.getApartmentById(
        buildingId,
        apartmentId
      );
      if (!apartmentData) {
        toast.error("Apartment not found");
        router.push(`/properties/buildings/${buildingId}/apartments`);
        return;
      }

      setBuilding(buildingData);
      setApartment(apartmentData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load apartment details");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (
    apartmentData: Omit<Apartment, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setIsSubmitting(true);

      propertyService.updateApartment(buildingId, apartmentId, {
        ...apartmentData,
        updatedAt: new Date(),
      });

      toast.success("Apartment updated successfully");
      router.push(
        `/properties/buildings/${buildingId}/apartments/${apartmentId}`
      );
    } catch (error) {
      console.error("Error updating apartment:", error);
      toast.error("Failed to update apartment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(
      `/properties/buildings/${buildingId}/apartments/${apartmentId}`
    );
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <LoadingState message="Loading apartment details..." />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (!building || !apartment) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-12">
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Apartment not found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The apartment you're looking for doesn't exist.
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
      label: `D-No: ${apartment.doorNumber}`,
      href: `/properties/buildings/${buildingId}/apartments/${apartmentId}`,
    },
    {
      label: "Edit",
      href: `/properties/buildings/${buildingId}/apartments/${apartmentId}/edit`,
    },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Editing apartment: D-No {apartment.doorNumber}
            </h2>
            <p className="text-gray-600">
              {building.name} • Building {building.buildingCode} • Floor{" "}
              {apartment.floor}
            </p>
          </div>

          <ApartmentForm
            building={building}
            apartment={apartment}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isSubmitting}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
