"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Building, Apartment, Tenant } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  Button,
  LoadingState,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  ArrowLeftIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { TenantDetail, TenantForm } from "@/components/tenants";
import toast from "react-hot-toast";

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.buildingId as string;
  const apartmentId = params.apartmentId as string;

  const [building, setBuilding] = useState<Building | null>(null);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

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

      if (!apartmentData.currentTenant) {
        toast.error("No tenant found for this apartment");
        router.push(
          `/properties/buildings/${buildingId}/apartments/${apartmentId}`
        );
        return;
      }

      setBuilding(buildingData);
      setApartment(apartmentData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load tenant details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(
      `/properties/buildings/${buildingId}/apartments/${apartmentId}`
    );
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowEditForm(true);
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (
      !confirm(
        `Are you sure you want to remove tenant ${tenant.personalInfo.fullName}?`
      )
    ) {
      return;
    }

    try {
      // Update apartment to remove tenant
      propertyService.updateApartment(buildingId, apartmentId, {
        currentTenant: undefined,
        isOccupied: false,
      });

      toast.success("Tenant removed successfully");
      router.push(
        `/properties/buildings/${buildingId}/apartments/${apartmentId}`
      );
    } catch (error) {
      console.error("Error removing tenant:", error);
      toast.error("Failed to remove tenant");
    }
  };

  const handleTenantSubmit = async (
    tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editingTenant) {
        // Update existing tenant
        const updatedTenant: Tenant = {
          ...editingTenant,
          ...tenantData,
          updatedAt: new Date(),
        };

        // Update tenant in property service
        propertyService.updateTenant(editingTenant.id, updatedTenant);

        // Update apartment with updated tenant
        propertyService.updateApartment(buildingId, apartmentId, {
          currentTenant: updatedTenant,
        });

        toast.success("Tenant updated successfully");
        setShowEditForm(false);
        setEditingTenant(null);
        loadData();
      }
    } catch (error) {
      console.error("Error updating tenant:", error);
      throw error;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <LoadingState message="Loading tenant details..." />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (!building || !apartment || !apartment.currentTenant) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Tenant not found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No tenant information available for this apartment.
            </p>
            <div className="mt-6">
              <Button onClick={handleBack}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Apartment
              </Button>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const tenant = apartment.currentTenant;
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
      label: "Tenant Details",
      href: `/properties/buildings/${buildingId}/apartments/${apartmentId}/tenant`,
    },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />

          {/* Back Button */}
          <div className="flex justify-start">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Back to Apartment
            </Button>
          </div>

          {/* Tenant Detail Component */}
          <TenantDetail
            tenant={tenant}
            onEdit={handleEditTenant}
            onDelete={handleDeleteTenant}
            propertyInfo={{
              propertyName: building.name,
              propertyType: "Building",
              unitInfo: `D-No: ${apartment.doorNumber}`,
            }}
          />

          {/* Edit Tenant Form Modal */}
          {showEditForm && editingTenant && (
            <TenantForm
              tenant={editingTenant}
              onSubmit={handleTenantSubmit}
              onCancel={() => {
                setShowEditForm(false);
                setEditingTenant(null);
              }}
              isOpen={showEditForm}
              title="Edit Tenant"
            />
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
