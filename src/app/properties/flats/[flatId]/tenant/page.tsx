"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Flat, Tenant } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, LoadingState } from "@/components/ui";
import { ArrowLeftIcon, UsersIcon } from "@heroicons/react/24/outline";
import { TenantDetail } from "@/components/tenants";
import { SimpleTenantForm } from "@/components/tenants/SimpleTenantForm";
import toast from "react-hot-toast";

export default function FlatTenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const flatId = params.flatId as string;

  const [flat, setFlat] = useState<Flat | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    loadData();
  }, [flatId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const flatData = await propertyService.getFlatById(flatId);
      if (!flatData) {
        toast.error("Flat not found");
        router.push("/properties/flats");
        return;
      }

      // Fetch tenant data for this flat
      let tenantData = null;
      try {
        tenantData = await propertyService.getTenantByProperty(flatId, "flat");
      } catch (error) {
        console.log("Failed to fetch tenant, trying fallback method:", error);
        try {
          const allTenants = await propertyService.getTenants();
          tenantData = allTenants.find(
            (tenant) =>
              tenant.propertyId === flatId && tenant.propertyType === "flat"
          );
        } catch (fallbackError) {
          console.error("Both methods failed to fetch tenant:", fallbackError);
        }
      }

      if (!tenantData) {
        toast.error("No tenant found for this flat");
        router.push(`/properties/flats/${flatId}`);
        return;
      }

      // Create flat object with tenant data
      const flatWithTenant = {
        ...flatData,
        currentTenant: tenantData,
      };

      setFlat(flatWithTenant);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load tenant details");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push(`/properties/flats/${flatId}`);
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

      // Update flat to mark as vacant
      await propertyService.updateFlat(flatId, {
        isOccupied: false,
      });
      console.log("Flat marked as vacant");

      toast.success("Tenant deleted successfully");
      router.push(`/properties/flats/${flatId}`);
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

  if (!flat || !flat.currentTenant) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Tenant not found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              No tenant information available for this flat.
            </p>
            <div className="mt-6">
              <Button onClick={handleBack}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Flat
              </Button>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const tenant = flat.currentTenant;
  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Flats", href: "/properties/flats" },
    { label: flat.name, href: `/properties/flats/${flatId}` },
    { label: "Tenant Details", href: `/properties/flats/${flatId}/tenant` },
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
              Back to Flat
            </Button>
          </div>

          {/* Tenant Detail Component */}
          <TenantDetail
            tenant={tenant}
            onEdit={handleEditTenant}
            onDelete={handleDeleteTenant}
            propertyInfo={{
              propertyName: flat.name,
              propertyType: "Flat",
              unitInfo: `Door No: ${flat.doorNumber}`,
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
