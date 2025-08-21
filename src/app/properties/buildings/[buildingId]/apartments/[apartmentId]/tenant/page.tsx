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
import { TenantDetail } from "@/components/tenants";
import { SimpleTenantForm } from "@/components/tenants/SimpleTenantForm";
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
      const buildingData = await propertyService.getBuildingById(buildingId);
      if (!buildingData) {
        toast.error("Building not found");
        router.push("/properties/buildings");
        return;
      }

      const apartmentData = await propertyService.getApartmentById(apartmentId);
      if (!apartmentData) {
        toast.error("Apartment not found");
        router.push(`/properties/buildings/${buildingId}/apartments`);
        return;
      }

      // Fetch tenant data for this apartment
      let tenantData = null;
      try {
        tenantData = await propertyService.getTenantByProperty(
          apartmentId,
          "apartment"
        );
      } catch (error) {
        console.log("Failed to fetch tenant, trying fallback method:", error);
        try {
          const allTenants = await propertyService.getTenants();
          tenantData = allTenants.find(
            (tenant) =>
              tenant.propertyId === apartmentId &&
              tenant.propertyType === "apartment"
          );
        } catch (fallbackError) {
          console.error("Both methods failed to fetch tenant:", fallbackError);
        }
      }

      if (!tenantData) {
        toast.error("No tenant found for this apartment");
        router.push(
          `/properties/buildings/${buildingId}/apartments/${apartmentId}`
        );
        return;
      }

      // Create apartment object with tenant data
      const apartmentWithTenant = {
        ...apartmentData,
        currentTenant: tenantData,
      };

      setBuilding(buildingData);
      setApartment(apartmentWithTenant);
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
        `Are you sure you want to delete tenant ${tenant.personalInfo.fullName}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      console.log("Deleting tenant:", tenant.id);

      // Delete tenant from database
      await propertyService.deleteTenant(tenant.id);
      console.log("Tenant deleted from database");

      // Update apartment to mark as vacant
      await propertyService.updateApartment(apartmentId, {
        isOccupied: false,
      });
      console.log("Apartment marked as vacant");

      toast.success("Tenant deleted successfully");
      router.push(
        `/properties/buildings/${buildingId}/apartments/${apartmentId}`
      );
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error(`Failed to delete tenant: ${error.message}`);
    }
  };

  const handleTenantSubmit = async (tenantData: Tenant) => {
    try {
      if (editingTenant) {
        console.log("Updating tenant with data:", tenantData);

        // Update existing tenant
        const updatedTenant = await propertyService.updateTenant(
          editingTenant.id,
          tenantData
        );
        console.log("Tenant updated successfully:", updatedTenant);

        toast.success("Tenant updated successfully");
        setShowEditForm(false);
        setEditingTenant(null);
        await loadData(); // Reload data to show updates
      }
    } catch (error) {
      console.error("Error updating tenant:", error);
      toast.error(`Failed to update tenant: ${error.message}`);
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
            <SimpleTenantForm
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
