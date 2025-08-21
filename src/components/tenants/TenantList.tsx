"use client";

import { useState, useEffect } from "react";
import { Tenant, Building, Flat, Land } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { TenantCard } from "./TenantCard";
import { TenantForm } from "./TenantForm";
import {
  Button,
  Input,
  LoadingState,
  Card,
  CardContent,
} from "@/components/ui";
import {
  UserIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface TenantWithProperty extends Tenant {
  propertyInfo?: {
    propertyId: string;
    propertyName: string;
    propertyType: "building" | "flat" | "land";
    unitInfo?: string;
  };
}

interface TenantListProps {
  showAddButton?: boolean;
  showFilters?: boolean;
  maxItems?: number;
  onTenantSelect?: (tenant: Tenant) => void;
}

export function TenantList({
  showAddButton = true,
  showFilters = true,
  maxItems,
  onTenantSelect,
}: TenantListProps) {
  const [tenants, setTenants] = useState<TenantWithProperty[]>([]);
  const [filteredTenants, setFilteredTenants] = useState<TenantWithProperty[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<
    "all" | "building" | "flat" | "land"
  >("all");
  const [showTenantForm, setShowTenantForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  useEffect(() => {
    filterTenants();
  }, [tenants, searchQuery, statusFilter, propertyTypeFilter]);

  const loadTenants = async () => {
    try {
      setLoading(true);

      // Get all tenants from properties
      const allTenants: TenantWithProperty[] = [];

      // Get tenants from buildings
      const buildings = propertyService.getBuildings();
      buildings.forEach((building) => {
        building.apartments?.forEach((apartment) => {
          if (apartment.currentTenant) {
            allTenants.push({
              ...apartment.currentTenant,
              propertyInfo: {
                propertyId: building.id,
                propertyName: building.name,
                propertyType: "building",
                unitInfo: `D-No: ${apartment.doorNumber}`,
              },
            });
          }
        });
      });

      // Get tenants from flats
      const flats = propertyService.getFlats();
      flats.forEach((flat) => {
        if (flat.currentTenant) {
          allTenants.push({
            ...flat.currentTenant,
            propertyInfo: {
              propertyId: flat.id,
              propertyName: flat.name,
              propertyType: "flat",
              unitInfo: `D-No: ${flat.doorNumber}`,
            },
          });
        }
      });

      // Get tenants from lands
      const lands = propertyService.getLands();
      lands.forEach((land) => {
        if (land.currentTenant) {
          allTenants.push({
            ...land.currentTenant,
            propertyInfo: {
              propertyId: land.id,
              propertyName: land.name,
              propertyType: "land",
            },
          });
        }
      });

      // Also get standalone tenants
      const standaloneTenants = propertyService.getTenants();
      standaloneTenants.forEach((tenant) => {
        // Check if this tenant is not already associated with a property
        const isAssociated = allTenants.some((t) => t.id === tenant.id);
        if (!isAssociated) {
          allTenants.push(tenant);
        }
      });

      setTenants(allTenants);
    } catch (error) {
      console.error("Error loading tenants:", error);
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const filterTenants = () => {
    let filtered = [...tenants];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tenant) =>
          tenant.personalInfo.fullName.toLowerCase().includes(query) ||
          tenant.personalInfo.occupation.toLowerCase().includes(query) ||
          tenant.contactInfo.phone.includes(query) ||
          tenant.contactInfo.email?.toLowerCase().includes(query) ||
          tenant.rentalAgreement.agreementNumber
            .toLowerCase()
            .includes(query) ||
          tenant.propertyInfo?.propertyName.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((tenant) =>
        statusFilter === "active" ? tenant.isActive : !tenant.isActive
      );
    }

    // Property type filter
    if (propertyTypeFilter !== "all") {
      filtered = filtered.filter(
        (tenant) => tenant.propertyInfo?.propertyType === propertyTypeFilter
      );
    }

    // Limit results if maxItems is specified
    if (maxItems) {
      filtered = filtered.slice(0, maxItems);
    }

    setFilteredTenants(filtered);
  };

  const handleAddTenant = () => {
    setEditingTenant(null);
    setShowTenantForm(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowTenantForm(true);
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (
      !confirm(
        `Are you sure you want to delete tenant ${tenant.personalInfo.fullName}?`
      )
    ) {
      return;
    }

    try {
      // Remove tenant from property if associated
      if (tenant.propertyInfo) {
        const { propertyId, propertyType } = tenant.propertyInfo;

        if (propertyType === "building") {
          // Find the apartment and remove tenant
          const building = propertyService.getBuildingById(propertyId);
          if (building) {
            const apartment = building.apartments?.find(
              (apt) => apt.currentTenant?.id === tenant.id
            );
            if (apartment) {
              await propertyService.updateApartment(propertyId, apartment.id, {
                currentTenant: undefined,
                isOccupied: false,
              });
            }
          }
        } else if (propertyType === "flat") {
          await propertyService.updateFlat(propertyId, {
            currentTenant: undefined,
            isOccupied: false,
          });
        } else if (propertyType === "land") {
          await propertyService.updateLand(propertyId, {
            currentTenant: undefined,
            isLeased: false,
          });
        }
      }

      // Remove from standalone tenants if exists
      try {
        await propertyService.deleteTenant(tenant.id);
      } catch (error) {
        // Tenant might not exist in standalone list, which is fine
      }

      toast.success("Tenant deleted successfully");
      loadTenants();
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error("Failed to delete tenant");
    }
  };

  const handleTenantSubmit = async (
    tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editingTenant) {
        // Update existing tenant
        await propertyService.updateTenant(editingTenant.id, {
          ...tenantData,
          updatedAt: new Date(),
        });
      } else {
        // Add new tenant
        const newTenant: Tenant = {
          ...tenantData,
          id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        await propertyService.saveTenant(newTenant);
      }

      setShowTenantForm(false);
      setEditingTenant(null);
      loadTenants();
    } catch (error) {
      console.error("Error saving tenant:", error);
      throw error;
    }
  };

  const handleViewTenant = (tenant: Tenant) => {
    if (onTenantSelect) {
      onTenantSelect(tenant);
    } else {
      // Default behavior - could navigate to tenant detail page
      toast.info("Tenant detail view would open here");
    }
  };

  const getStats = () => {
    const total = tenants.length;
    const active = tenants.filter((t) => t.isActive).length;
    const inactive = total - active;
    const withProperties = tenants.filter((t) => t.propertyInfo).length;

    return { total, active, inactive, withProperties };
  };

  const stats = getStats();

  if (loading) {
    return <LoadingState message="Loading tenants..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tenants</h2>
          <p className="text-gray-600 mt-1">
            Manage all tenant information and rental agreements
          </p>
        </div>
        {showAddButton && (
          <Button
            onClick={handleAddTenant}
            className="flex items-center space-x-2"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add Tenant</span>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <UsersIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-full">
                <UserIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.active}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-2 rounded-full">
                <UserIcon className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Inactive</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.inactive}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <UserIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">With Properties</p>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.withProperties}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search tenants by name, phone, email, or agreement..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-4 w-4 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <select
                  value={propertyTypeFilter}
                  onChange={(e) => setPropertyTypeFilter(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Properties</option>
                  <option value="building">Buildings</option>
                  <option value="flat">Flats</option>
                  <option value="land">Lands</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tenant List */}
      {filteredTenants.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <UsersIcon className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ||
                statusFilter !== "all" ||
                propertyTypeFilter !== "all"
                  ? "No tenants found"
                  : "No tenants yet"}
              </h3>
              <p className="text-gray-600 mb-6">
                {searchQuery ||
                statusFilter !== "all" ||
                propertyTypeFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Add your first tenant to get started"}
              </p>
              {showAddButton &&
                !searchQuery &&
                statusFilter === "all" &&
                propertyTypeFilter === "all" && (
                  <Button
                    onClick={handleAddTenant}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <PlusIcon className="h-4 w-4" />
                    <span>Add First Tenant</span>
                  </Button>
                )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTenants.map((tenant) => (
            <TenantCard
              key={tenant.id}
              tenant={tenant}
              onView={handleViewTenant}
              onEdit={handleEditTenant}
              onDelete={handleDeleteTenant}
              propertyInfo={tenant.propertyInfo}
            />
          ))}
        </div>
      )}

      {/* Tenant Form Modal */}
      {showTenantForm && (
        <TenantForm
          tenant={editingTenant || undefined}
          onSubmit={handleTenantSubmit}
          onCancel={() => {
            setShowTenantForm(false);
            setEditingTenant(null);
          }}
          isOpen={showTenantForm}
          title={editingTenant ? "Edit Tenant" : "Add New Tenant"}
        />
      )}
    </div>
  );
}
