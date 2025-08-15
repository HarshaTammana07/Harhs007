"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, Card, LoadingState } from "@/components/ui";
import { propertyService } from "@/services/PropertyService";
import { Flat } from "@/types";
import {
  PencilIcon,
  UserIcon,
  HomeIcon,
  MapPinIcon,
  BanknotesIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { SimpleTenantForm } from "@/components/tenants/SimpleTenantForm";
import { toast } from "react-hot-toast";

export default function FlatDetailPage() {
  const [flat, setFlat] = useState<Flat | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTenantForm, setShowAddTenantForm] = useState(false);
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

  const handleEdit = () => {
    router.push(`/properties/flats/${flatId}/edit`);
  };

  const handleViewTenant = () => {
    if (flat?.currentTenant) {
      router.push(`/properties/flats/${flatId}/tenant`);
    }
  };

  const handleAddTenant = () => {
    setShowAddTenantForm(true);
  };

  const handleTenantSubmit = async (tenant: any) => {
    try {
      // Save tenant to property service
      propertyService.saveTenant(tenant);

      // Update flat with tenant
      propertyService.updateFlat(flatId, {
        currentTenant: tenant,
        isOccupied: true,
      });

      setShowAddTenantForm(false);
      toast.success("Tenant added successfully");
      loadFlat(); // Reload data to show the new tenant
    } catch (error) {
      console.error("Error adding tenant:", error);
      throw error; // Let the form handle the error
    }
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
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-4 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {flat.name}
                </h1>
                <p className="text-gray-600 mt-1">Door No: {flat.doorNumber}</p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="flex items-center space-x-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Images */}
              {flat.images && flat.images.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Property Images
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {flat.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${flat.name} - Image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              {/* Property Details */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Property Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <MapPinIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-medium text-gray-900">
                            {flat.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <HomeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Configuration</p>
                          <p className="font-medium text-gray-900">
                            {flat.bedroomCount} BHK, {flat.bathroomCount} Bath
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                          <span className="text-xs font-bold">sq</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Area</p>
                          <p className="font-medium text-gray-900">
                            {flat.area} sq ft
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                          <span className="text-xs font-bold">#</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Floor</p>
                          <p className="font-medium text-gray-900">
                            {flat.floor} of {flat.totalFloors}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <BanknotesIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Monthly Rent</p>
                          <p className="font-medium text-gray-900">
                            ₹{flat.rentAmount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                          <span className="text-xs font-bold">₹</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Security Deposit
                          </p>
                          <p className="font-medium text-gray-900">
                            ₹{flat.securityDeposit.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {flat.description && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-600 mb-2">Description</p>
                      <p className="text-gray-900">{flat.description}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Specifications */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Specifications & Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[
                      { key: "furnished", label: "Furnished" },
                      { key: "parking", label: "Parking" },
                      { key: "balcony", label: "Balcony" },
                      { key: "airConditioning", label: "Air Conditioning" },
                      { key: "powerBackup", label: "Power Backup" },
                      { key: "internetReady", label: "Internet Ready" },
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center space-x-2">
                        {flat.specifications[
                          key as keyof typeof flat.specifications
                        ] ? (
                          <CheckCircleIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircleIcon className="h-5 w-5 text-gray-300" />
                        )}
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Water Supply</p>
                      <p className="font-medium text-gray-900 capitalize">
                        {flat.specifications.waterSupply.replace("_", " ")}
                      </p>
                    </div>
                    {flat.specifications.societyName && (
                      <div>
                        <p className="text-sm text-gray-600">Society</p>
                        <p className="font-medium text-gray-900">
                          {flat.specifications.societyName}
                        </p>
                      </div>
                    )}
                    {flat.specifications.maintenanceCharges && (
                      <div>
                        <p className="text-sm text-gray-600">
                          Maintenance Charges
                        </p>
                        <p className="font-medium text-gray-900">
                          ₹
                          {flat.specifications.maintenanceCharges.toLocaleString()}
                          /month
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Occupancy Status */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Occupancy Status
                  </h3>
                  <div className="text-center">
                    <div
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        flat.isOccupied
                          ? "bg-green-100 text-green-800"
                          : "bg-orange-100 text-orange-800"
                      }`}
                    >
                      {flat.isOccupied ? "Occupied" : "Vacant"}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Current Tenant */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Current Tenant
                  </h3>
                  {flat.currentTenant ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {flat.currentTenant.personalInfo.fullName}
                          </p>
                          <p className="text-sm text-gray-600">
                            {flat.currentTenant.contactInfo.phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Move-in Date</p>
                          <p className="font-medium text-gray-900">
                            {new Date(
                              flat.currentTenant.moveInDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={handleViewTenant}
                        className="w-full"
                        variant="outline"
                      >
                        View Tenant Details
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-gray-600 mb-4">No current tenant</p>
                      <Button onClick={handleAddTenant} className="w-full">
                        Add Tenant
                      </Button>
                    </div>
                  )}
                </div>
              </Card>

              {/* Quick Stats */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Rent History
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {flat.rentHistory?.length || 0} payments
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Maintenance Records
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {flat.maintenanceRecords?.length || 0} records
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Documents</span>
                      <span className="text-sm font-medium text-gray-900">
                        {flat.documents?.length || 0} files
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Add Tenant Form Modal */}
          {showAddTenantForm && (
            <SimpleTenantForm
              isOpen={showAddTenantForm}
              onSubmit={handleTenantSubmit}
              onCancel={() => setShowAddTenantForm(false)}
              defaultRent={flat.rentAmount}
              title="Add Tenant to Flat"
            />
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
