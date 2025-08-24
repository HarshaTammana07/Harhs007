"use client";

import { useState, useEffect } from "react";
import { Tenant, Building, Apartment, Flat } from "@/types";
import { propertyService } from "@/services/PropertyService";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  PhoneIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { EnhancedTenantForm } from "./EnhancedTenantForm";
import toast from "react-hot-toast";

// Interface for tenant with property metadata
interface TenantWithProperty extends Tenant {
  propertyMetadata?: {
    buildingName?: string;
    buildingCode?: string;
    apartmentDoorNumber?: string;
    apartmentFloor?: number;
    flatName?: string;
    flatDoorNumber?: string;
    address?: string;
  };
}

export function TenantManagement() {
  const [tenants, setTenants] = useState<TenantWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      setLoading(true);
      const tenantsData = await propertyService.getTenants();
      
      // Load property metadata for each tenant
      const tenantsWithMetadata = await Promise.all(
        tenantsData.map(async (tenant) => {
          const tenantWithProperty: TenantWithProperty = { ...tenant };
          
          if (tenant.propertyId && tenant.propertyType) {
            try {
              if (tenant.propertyType === "apartment" && tenant.buildingId) {
                // Get building and apartment details
                const [building, apartments] = await Promise.all([
                  propertyService.getBuildingById(tenant.buildingId),
                  propertyService.getApartmentsByBuildingId(tenant.buildingId),
                ]);
                
                const apartment = apartments.find(apt => apt.id === tenant.propertyId);
                
                if (building && apartment) {
                  tenantWithProperty.propertyMetadata = {
                    buildingName: building.name,
                    buildingCode: building.buildingCode,
                    apartmentDoorNumber: apartment.doorNumber,
                    apartmentFloor: apartment.floor,
                    address: building.address,
                  };
                }
              } else if (tenant.propertyType === "flat") {
                // Get flat details
                const flats = await propertyService.getFlats();
                const flat = flats.find(f => f.id === tenant.propertyId);
                
                if (flat) {
                  tenantWithProperty.propertyMetadata = {
                    flatName: flat.name,
                    flatDoorNumber: flat.doorNumber,
                    address: flat.address,
                  };
                }
              }
            } catch (error) {
              console.error(`Error loading property metadata for tenant ${tenant.id}:`, error);
              // Continue without metadata if property loading fails
            }
          }
          
          return tenantWithProperty;
        })
      );
      
      setTenants(tenantsWithMetadata);
    } catch (error) {
      console.error("Error loading tenants:", error);
      toast.error("Failed to load tenants");
    } finally {
      setLoading(false);
    }
  };

  const handleAddTenant = () => {
    setEditingTenant(null);
    setShowForm(true);
  };

  const handleEditTenant = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setShowForm(true);
  };

  const handleDeleteTenant = async (tenant: Tenant) => {
    if (
      !confirm(
        `Are you sure you want to delete ${tenant.personalInfo.fullName}?`
      )
    ) {
      return;
    }

    try {
      await propertyService.deleteTenant(tenant.id);
      
      // Free up the property if tenant was assigned to one
      if (tenant.propertyId && tenant.propertyType) {
        try {
          if (tenant.propertyType === "apartment") {
            await propertyService.updateApartment(tenant.propertyId, { isOccupied: false });
          } else if (tenant.propertyType === "flat") {
            await propertyService.updateFlat(tenant.propertyId, { isOccupied: false });
          }
        } catch (error) {
          console.error("Error updating property occupancy:", error);
          // Don't fail the tenant deletion if property update fails
        }
      }
      
      toast.success("Tenant deleted successfully");
      loadTenants();
    } catch (error) {
      console.error("Error deleting tenant:", error);
      toast.error("Failed to delete tenant");
    }
  };

  const handleFormSubmit = async (tenantData: Tenant) => {
    try {
      if (editingTenant) {
        await propertyService.updateTenant(editingTenant.id, tenantData);
        toast.success("Tenant updated successfully");
      } else {
        await propertyService.saveTenant(tenantData);
        toast.success("Tenant created successfully");
      }
      setShowForm(false);
      setEditingTenant(null);
      loadTenants();
    } catch (error) {
      console.error("Error saving tenant:", error);
      toast.error("Failed to save tenant");
    }
  };

  const filteredTenants = tenants.filter((tenant) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      tenant.personalInfo.fullName.toLowerCase().includes(searchLower) ||
      tenant.contactInfo.phone.includes(searchTerm) ||
      tenant.personalInfo.occupation.toLowerCase().includes(searchLower) ||
      tenant.propertyMetadata?.buildingName?.toLowerCase().includes(searchLower) ||
      tenant.propertyMetadata?.buildingCode?.toLowerCase().includes(searchLower) ||
      tenant.propertyMetadata?.flatName?.toLowerCase().includes(searchLower) ||
      tenant.propertyMetadata?.apartmentDoorNumber?.toLowerCase().includes(searchLower) ||
      tenant.propertyMetadata?.flatDoorNumber?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Tenant Management
          </h2>
          <p className="text-gray-600">Manage all your tenants in one place</p>
        </div>
        <Button onClick={handleAddTenant} className="flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Tenant
        </Button>
      </div>

      {/* Search */}
      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search by name, phone, occupation, building, or apartment..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Tenants
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {tenants.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <UserIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Active Tenants
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {tenants.filter((t) => t.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CurrencyRupeeIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Monthly Rent
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹
                  {tenants
                    .filter((t) => t.isActive)
                    .reduce((sum, t) => sum + t.rentalAgreement.rentAmount, 0)
                    .toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tenants List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTenants.map((tenant) => (
          <Card key={tenant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">
                    {tenant.personalInfo.fullName}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {tenant.personalInfo.occupation}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTenant(tenant)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteTenant(tenant)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="h-4 w-4 mr-2" />
                {tenant.contactInfo.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CurrencyRupeeIcon className="h-4 w-4 mr-2" />₹
                {tenant.rentalAgreement.rentAmount.toLocaleString()}/month
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {new Date(
                  tenant.rentalAgreement.startDate
                ).toLocaleDateString()}{" "}
                -{" "}
                {new Date(tenant.rentalAgreement.endDate).toLocaleDateString()}
              </div>
              <div className="flex items-center justify-between">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    tenant.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {tenant.isActive ? "Active" : "Inactive"}
                </span>
                {tenant.propertyType && (
                  <span className="text-xs text-gray-500 capitalize">
                    {tenant.propertyType === "apartment" ? "Building" : tenant.propertyType}
                  </span>
                )}
              </div>
              
              {/* Property Metadata Display */}
              {tenant.propertyMetadata && (
                <div className="mt-3 p-2 bg-gray-50 rounded-md">
                  {tenant.propertyType === "apartment" && tenant.propertyMetadata.buildingName && (
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-700">
                        <BuildingOfficeIcon className="h-3 w-3 mr-1" />
                        <span className="font-medium">{tenant.propertyMetadata.buildingName}</span>
                        {tenant.propertyMetadata.buildingCode && (
                          <span className="ml-1 text-gray-500">({tenant.propertyMetadata.buildingCode})</span>
                        )}
                      </div>
                      {tenant.propertyMetadata.apartmentDoorNumber && (
                        <div className="text-xs text-gray-600">
                          Door: {tenant.propertyMetadata.apartmentDoorNumber}
                          {tenant.propertyMetadata.apartmentFloor && (
                            <span className="ml-2">Floor: {tenant.propertyMetadata.apartmentFloor}</span>
                          )}
                        </div>
                      )}
                      {tenant.propertyMetadata.address && (
                        <div className="text-xs text-gray-500 truncate">
                          {tenant.propertyMetadata.address}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {tenant.propertyType === "flat" && tenant.propertyMetadata.flatName && (
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-gray-700">
                        <HomeIcon className="h-3 w-3 mr-1" />
                        <span className="font-medium">{tenant.propertyMetadata.flatName}</span>
                      </div>
                      {tenant.propertyMetadata.flatDoorNumber && (
                        <div className="text-xs text-gray-600">
                          Door: {tenant.propertyMetadata.flatDoorNumber}
                        </div>
                      )}
                      {tenant.propertyMetadata.address && (
                        <div className="text-xs text-gray-500 truncate">
                          {tenant.propertyMetadata.address}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Fallback for tenants without property assignment */}
              {!tenant.propertyMetadata && tenant.propertyId && (
                <div className="text-xs text-blue-600 mt-1">
                  Property ID: {tenant.propertyId.substring(0, 8)}...
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTenants.length === 0 && (
        <div className="text-center py-12">
          <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No tenants found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm
              ? "Try adjusting your search terms."
              : "Get started by adding your first tenant."}
          </p>
          {!searchTerm && (
            <div className="mt-6">
              <Button onClick={handleAddTenant}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Tenant
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <EnhancedTenantForm
          isOpen={showForm}
          tenant={editingTenant}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTenant(null);
          }}
          title={editingTenant ? "Edit Tenant" : "Add New Tenant"}
        />
      )}
    </div>
  );
}
