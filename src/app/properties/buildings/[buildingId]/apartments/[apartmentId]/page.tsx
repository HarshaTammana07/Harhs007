"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Building, Apartment } from "@/types";
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
  PencilIcon,
  TrashIcon,
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { SimpleTenantForm } from "@/components/tenants/SimpleTenantForm";
import toast from "react-hot-toast";

export default function ApartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.buildingId as string;
  const apartmentId = params.apartmentId as string;

  const [building, setBuilding] = useState<Building | null>(null);
  const [apartment, setApartment] = useState<Apartment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAddTenantForm, setShowAddTenantForm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      console.log(
        "Loading apartment detail - buildingId:",
        buildingId,
        "apartmentId:",
        apartmentId
      );

      const buildingData = await propertyService.getBuildingById(buildingId);
      console.log("Building data loaded:", buildingData);
      if (!buildingData) {
        console.error("Building not found for ID:", buildingId);
        toast.error("Building not found");
        router.push("/properties/buildings");
        return;
      }

      const apartmentData = await propertyService.getApartmentById(apartmentId);
      console.log("Apartment data loaded:", apartmentData);
      if (!apartmentData) {
        console.error(
          "Apartment not found for buildingId:",
          buildingId,
          "apartmentId:",
          apartmentId
        );
        toast.error("Apartment not found");
        router.push(`/properties/buildings/${buildingId}/apartments`);
        return;
      }

      // Fetch tenant data for this apartment
      console.log("Fetching tenant for apartment:", apartmentId);
      let apartmentTenant = null;

      try {
        // Try efficient method first (requires property_id column)
        apartmentTenant = await propertyService.getTenantByProperty(
          apartmentId,
          "apartment"
        );
        console.log(
          "Apartment tenant found (efficient method):",
          apartmentTenant
        );
      } catch (error) {
        console.log(
          "Efficient method failed, falling back to old method:",
          error.message
        );

        // Fallback: Get all tenants and filter (works with existing database)
        try {
          const allTenants = await propertyService.getTenants();
          apartmentTenant = allTenants.find(
            (tenant) =>
              tenant.propertyId === apartmentId &&
              tenant.propertyType === "apartment"
          );
          console.log(
            "Apartment tenant found (fallback method):",
            apartmentTenant
          );
        } catch (fallbackError) {
          console.error("Both methods failed to fetch tenant:", fallbackError);
          apartmentTenant = null;
        }
      }

      if (apartmentTenant) {
        console.log("Tenant details:", {
          id: apartmentTenant.id,
          fullName: apartmentTenant.personalInfo?.fullName,
          phone: apartmentTenant.contactInfo?.phone,
          email: apartmentTenant.contactInfo?.email,
          rentAmount: apartmentTenant.rentalAgreement?.rentAmount,
        });
      } else {
        console.log("No tenant found for apartment:", apartmentId);
      }

      // Link tenant to apartment
      const apartmentWithTenant = {
        ...apartmentData,
        currentTenant: apartmentTenant || null,
      };

      setBuilding(buildingData);
      setApartment(apartmentWithTenant);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load apartment details");
    } finally {
      setLoading(false);
    }
  }, [buildingId, apartmentId, router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleBack = () => {
    router.push(`/properties/buildings/${buildingId}/apartments`);
  };

  const handleEdit = () => {
    router.push(
      `/properties/buildings/${buildingId}/apartments/${apartmentId}/edit`
    );
  };

  const handleDelete = async () => {
    try {
      await propertyService.deleteApartment(apartmentId);
      toast.success("Apartment deleted successfully");
      router.push(`/properties/buildings/${buildingId}/apartments`);
    } catch (error) {
      console.error("Error deleting apartment:", error);
      toast.error("Failed to delete apartment");
    }
  };

  const handleAddTenant = () => {
    setShowAddTenantForm(true);
  };

  const handleTenantSubmit = async (tenant: unknown) => {
    try {
      // Save tenant to property service with apartment reference
      const tenantData = {
        ...tenant,
        propertyId: apartmentId,
        propertyType: "apartment",
        buildingId: buildingId,
      };

      console.log("Saving tenant with data:", tenantData);
      console.log("Property linking fields:", {
        propertyId: apartmentId,
        propertyType: "apartment",
        buildingId: buildingId,
      });

      await propertyService.saveTenant(tenantData);

      // Update apartment occupancy status only
      await propertyService.updateApartment(apartmentId, {
        isOccupied: true,
      });

      setShowAddTenantForm(false);
      toast.success("Tenant added successfully");
      await loadData(); // Reload data to show the new tenant
    } catch (error) {
      console.error("Error adding tenant:", error);
      throw error; // Let the form handle the error
    }
  };

  const handleViewTenant = () => {
    console.log("handleViewTenant called");
    console.log("apartment:", apartment);
    console.log("apartment.currentTenant:", apartment?.currentTenant);

    if (apartment?.currentTenant) {
      console.log("Navigating to tenant details page");
      router.push(
        `/properties/buildings/${buildingId}/apartments/${apartmentId}/tenant`
      );
    } else {
      console.log("No tenant found, cannot navigate");
      toast.error("No tenant information available");
    }
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
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              Apartment not found
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              The apartment you're looking for doesn&apos;t exist.
            </p>
            <div className="mt-6">
              <Button onClick={handleBack}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Apartments
              </Button>
            </div>
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
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <div className="p-6">
            <Breadcrumb items={breadcrumbItems} />

            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Apartment D-No: {apartment.doorNumber}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 mt-1">
                  {building.name} • Floor {apartment.floor}
                </p>
                <div className="flex items-center space-x-4 mt-2">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      apartment.isOccupied
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {apartment.isOccupied ? "Occupied" : "Vacant"}
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {apartment.bedroomCount} bedroom
                    {apartment.bedroomCount !== 1 ? "s" : ""} •{" "}
                    {apartment.bathroomCount} bathroom
                    {apartment.bathroomCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={handleBack}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <Button variant="outline" onClick={handleEdit}>
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Apartment Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-900 dark:text-white">
                    <HomeIcon className="h-5 w-5 mr-2" />
                    Apartment Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Door Number
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {apartment.doorNumber}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Floor
                      </label>
                      <p className="text-lg font-semibold">{apartment.floor}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Area
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {apartment.area} sq ft
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Bedrooms
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {apartment.bedroomCount}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Bathrooms
                      </label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {apartment.bathroomCount}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Monthly Rent
                      </label>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        ₹{apartment.rentAmount?.toLocaleString() || "0"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Specifications */}
              <Card>
                <CardHeader>
                  <CardTitle>Specifications & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {[
                      {
                        key: "furnished",
                        label: "Furnished",
                        value: apartment.specifications.furnished,
                      },
                      {
                        key: "parking",
                        label: "Parking",
                        value: apartment.specifications.parking,
                      },
                      {
                        key: "balcony",
                        label: "Balcony",
                        value: apartment.specifications.balcony,
                      },
                      {
                        key: "airConditioning",
                        label: "Air Conditioning",
                        value: apartment.specifications.airConditioning,
                      },
                      {
                        key: "powerBackup",
                        label: "Power Backup",
                        value: apartment.specifications.powerBackup,
                      },
                      {
                        key: "internetReady",
                        label: "Internet Ready",
                        value: apartment.specifications.internetReady,
                      },
                    ].map((spec) => (
                      <div
                        key={spec.key}
                        className="flex items-center space-x-2"
                      >
                        <div
                          className={`w-3 h-3 rounded-full ${
                            spec.value ? "bg-green-500" : "bg-gray-300"
                          }`}
                        />
                        <span
                          className={`text-sm ${spec.value ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}
                        >
                          {spec.label}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Water Supply
                    </label>
                    <p className="text-sm text-gray-900 dark:text-white capitalize">
                      {apartment.specifications.waterSupply.replace("_", " ")}
                    </p>
                  </div>

                  {apartment.specifications.additionalFeatures.length > 0 && (
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2 block">
                        Additional Features
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {apartment.specifications.additionalFeatures.map(
                          (feature) => (
                            <span
                              key={feature}
                              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                            >
                              {feature}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Tenant Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UsersIcon className="h-5 w-5 mr-2" />
                      Tenant Information
                    </div>
                    {!apartment.currentTenant && (
                      <Button size="sm" onClick={handleAddTenant}>
                        Add Tenant
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {apartment.currentTenant ? (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {apartment.currentTenant.personalInfo?.fullName}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {apartment.currentTenant.personalInfo?.occupation}
                        </p>
                      </div>

                      {apartment.currentTenant.contactInfo && (
                        <div className="space-y-2">
                          {apartment.currentTenant.contactInfo.phone && (
                            <div className="flex items-center space-x-2">
                              <PhoneIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {apartment.currentTenant.contactInfo.phone}
                              </span>
                            </div>
                          )}
                          {apartment.currentTenant.contactInfo.email && (
                            <div className="flex items-center space-x-2">
                              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-900 dark:text-white">
                                {apartment.currentTenant.contactInfo.email}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {apartment.currentTenant.rentalAgreement && (
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Monthly Rent
                              </span>
                              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                ₹
                                {apartment.currentTenant.rentalAgreement.rentAmount?.toLocaleString() ||
                                  "0"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Security Deposit
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                ₹
                                {apartment.currentTenant.rentalAgreement.securityDeposit?.toLocaleString() ||
                                  "0"}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Lease Start
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(
                                  apartment.currentTenant.rentalAgreement.startDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                Lease End
                              </span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {new Date(
                                  apartment.currentTenant.rentalAgreement.endDate
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleViewTenant}
                          className="w-full"
                        >
                          View Full Tenant Details
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <UsersIcon className="mx-auto h-8 w-8 text-gray-400 dark:text-gray-500" />
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                        No tenant assigned
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        This apartment is currently vacant
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Financial Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Monthly Rent</span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      ₹{apartment.rentAmount?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Security Deposit
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{apartment.securityDeposit?.toLocaleString() || "0"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-300">Annual Rent</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ₹{((apartment.rentAmount || 0) * 12).toLocaleString()}
                    </span>
                  </div>
                  {apartment.rentHistory &&
                    apartment.rentHistory.length > 0 && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {apartment.rentHistory.length} payment
                          {apartment.rentHistory.length !== 1 ? "s" : ""}{" "}
                          recorded
                        </p>
                      </div>
                    )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Delete Apartment
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Are you sure you want to delete apartment D-No:{" "}
                  {apartment.doorNumber}? This action cannot be undone and will
                  also remove any associated tenant information.
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Delete Apartment
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Add Tenant Form Modal */}
          {showAddTenantForm && (
            <SimpleTenantForm
              isOpen={showAddTenantForm}
              onSubmit={handleTenantSubmit}
              onCancel={() => setShowAddTenantForm(false)}
              defaultRent={apartment.rentAmount}
              title="Add Tenant to Apartment"
            />
          )}
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
