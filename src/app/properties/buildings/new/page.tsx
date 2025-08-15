"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { BuildingForm } from "@/components/properties/BuildingForm";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Building } from "@/types";
import { propertyService } from "@/services/PropertyService";
import toast from "react-hot-toast";

export default function NewBuildingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Buildings", href: "/properties/buildings" },
    { label: "New Building", href: "/properties/buildings/new" },
  ];

  const handleSubmit = async (
    buildingData: Omit<Building, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setIsLoading(true);

      const newBuilding: Building = {
        ...buildingData,
        id: `building_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      propertyService.saveBuilding(newBuilding);
      toast.success("Building created successfully");
      router.push("/properties/buildings");
    } catch (error) {
      console.error("Error creating building:", error);
      toast.error("Failed to create building");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/properties/buildings");
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />
          <BuildingForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
