"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Land } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Breadcrumb,
  Button,
  Card,
  CardContent,
  LoadingState,
} from "@/components/ui";
import {
  MapIcon,
  MapPinIcon,
  TagIcon,
  UserIcon,
  BanknotesIcon,
  PencilIcon,
  UserPlusIcon,
  DocumentTextIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { SimpleTenantForm } from "@/components/tenants/SimpleTenantForm";
import { toast } from "react-hot-toast";

export default function LandDetailPage() {
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddTenantForm, setShowAddTenantForm] = useState(false);
  const router = useRouter();
  const params = useParams();
  const landId = params.landId as string;

  useEffect(() => {
    if (landId) {
      loadLand();
    }
  }, [landId]);

  const loadLand = async () => {
    try {
      setLoading(true);
      const landData = propertyService.getLandById(landId);
      if (landData) {
        setLand(landData);
      } else {
        toast.error("Land property not found");
        router.push("/properties/lands");
      }
    } catch (error) {
      console.error("Error loading land:", error);
      toast.error("Failed to load land property");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    router.push(`/properties/lands/${landId}/edit`);
  };

  const handleManageTenant = () => {
    if (land?.currentTenant) {
      router.push(`/properties/lands/${landId}/tenant`);
    } else {
      setShowAddTenantForm(true);
    }
  };

  const handleTenantSubmit = async (tenant: any) => {
    try {
      // Save tenant to property service
      propertyService.saveTenant(tenant);

      // Update land with tenant
      propertyService.updateLand(landId, {
        currentTenant: tenant,
        isLeased: true,
      });

      setShowAddTenantForm(false);
      toast.success("Tenant added successfully");
      loadLand(); // Reload data to show the new tenant
    } catch (error) {
      console.error("Error adding tenant:", error);
      throw error; // Let the form handle the error
    }
  };

  const formatArea = (area: number, unit: string) => {
    return `${area.toLocaleString()} ${unit}`;
  };

  const getZoningColor = (zoning: string) => {
    switch (zoning) {
      case "residential":
        return "bg-blue-100 text-blue-800";
      case "commercial":
        return "bg-green-100 text-green-800";
      case "agricultural":
        return "bg-yellow-100 text-yellow-800";
      case "industrial":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <LoadingState message="Loading land property..." />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (!land) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">
              Land Property Not Found
            </h2>
            <p className="text-gray-600 mt-2">
              The requested land property could not be found.
            </p>
            <Button
              onClick={() => router.push("/properties/lands")}
              className="mt-4"
            >
              Back to Land Properties
            </Button>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Real Estate", href: "/properties/lands" },
    { label: land.name, href: `/properties/lands/${landId}` },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{land.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    land.isLeased
                      ? "bg-green-100 text-green-800"
                      : "bg-orange-100 text-orange-800"
                  }`}
                >
                  {land.isLeased ? "Leased" : "Vacant"}
                </span>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full capitalize ${getZoningColor(
                    land.zoning
                  )}`}
                >
                  {land.zoning}
                </span>
              </div>
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
              <Button
                onClick={handleManageTenant}
                className="flex items-center space-x-2"
              >
                {land.isLeased ? (
                  <>
                    <UserIcon className="h-4 w-4" />
                    <span>Manage Tenant</span>
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="h-4 w-4" />
                    <span>Add Tenant</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Images */}
              {land.images && land.images.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Property Images
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {land.images.map((image, index) => (
                        <img
                          key={index}
                          src={image}
                          alt={`${land.name} - Image ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Property Details */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Property Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Address</div>
                        <div className="font-medium">{land.address}</div>
                      </div>
                    </div>

                    {land.surveyNumber && (
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Survey Number
                          </div>
                          <div className="font-medium">{land.surveyNumber}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <TagIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Area</div>
                        <div className="font-medium">
                          {formatArea(land.area, land.areaUnit)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600">Zoning</div>
                        <div className="font-medium capitalize">
                          {land.zoning}
                        </div>
                      </div>
                    </div>

                    {land.soilType && (
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 bg-yellow-400 rounded-full flex-shrink-0"></div>
                        <div>
                          <div className="text-sm text-gray-600">Soil Type</div>
                          <div className="font-medium">{land.soilType}</div>
                        </div>
                      </div>
                    )}

                    {land.waterSource && (
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 bg-blue-400 rounded-full flex-shrink-0"></div>
                        <div>
                          <div className="text-sm text-gray-600">
                            Water Source
                          </div>
                          <div className="font-medium">{land.waterSource}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      Features
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {land.roadAccess && (
                        <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">
                          Road Access
                        </span>
                      )}
                      {land.electricityConnection && (
                        <span className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full">
                          Electricity Connection
                        </span>
                      )}
                      {!land.roadAccess && !land.electricityConnection && (
                        <span className="text-sm text-gray-500">
                          No special features listed
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {land.description && (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Description
                      </h4>
                      <p className="text-gray-600">{land.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lease Information */}
              {land.isLeased && land.leaseTerms && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Lease Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <BanknotesIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Rent Amount
                          </div>
                          <div className="font-medium">
                            ₹{land.leaseTerms.rentAmount.toLocaleString()}/
                            {land.leaseTerms.rentFrequency}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Lease Duration
                          </div>
                          <div className="font-medium">
                            {land.leaseTerms.leaseDuration} years
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <TagIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Lease Type
                          </div>
                          <div className="font-medium capitalize">
                            {land.leaseTerms.leaseType}
                          </div>
                        </div>
                      </div>

                      {land.leaseTerms.securityDeposit > 0 && (
                        <div className="flex items-center space-x-3">
                          <BanknotesIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Security Deposit
                            </div>
                            <div className="font-medium">
                              ₹
                              {land.leaseTerms.securityDeposit.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {land.leaseTerms.renewalTerms && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                          Renewal Terms
                        </h4>
                        <p className="text-gray-600">
                          {land.leaseTerms.renewalTerms}
                        </p>
                      </div>
                    )}

                    {land.leaseTerms.restrictions &&
                      land.leaseTerms.restrictions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Restrictions
                          </h4>
                          <ul className="list-disc list-inside text-gray-600 space-y-1">
                            {land.leaseTerms.restrictions.map(
                              (restriction, index) => (
                                <li key={index}>{restriction}</li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Current Tenant */}
              {land.isLeased && land.currentTenant ? (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Current Tenant
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">
                            {land.currentTenant.personalInfo.fullName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {land.currentTenant.personalInfo.occupation}
                          </div>
                        </div>
                      </div>
                      {land.currentTenant.contactInfo.phone && (
                        <div className="text-sm text-gray-600">
                          Phone: {land.currentTenant.contactInfo.phone}
                        </div>
                      )}
                      {land.currentTenant.contactInfo.email && (
                        <div className="text-sm text-gray-600">
                          Email: {land.currentTenant.contactInfo.email}
                        </div>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleManageTenant}
                        className="w-full mt-3"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tenant Status
                    </h3>
                    <div className="text-center py-4">
                      <div className="text-gray-400 mb-2">
                        <UserIcon className="h-8 w-8 mx-auto" />
                      </div>
                      <p className="text-gray-600 mb-4">No tenant assigned</p>
                      <Button
                        onClick={handleManageTenant}
                        size="sm"
                        className="w-full"
                      >
                        Add Tenant
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Documents</span>
                      <span className="font-medium">
                        {land.documents.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rent History</span>
                      <span className="font-medium">
                        {land.rentHistory.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Maintenance Records</span>
                      <span className="font-medium">
                        {land.maintenanceRecords.length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Add Tenant Form Modal */}
          {showAddTenantForm && (
            <SimpleTenantForm
              isOpen={showAddTenantForm}
              onSubmit={handleTenantSubmit}
              onCancel={() => setShowAddTenantForm(false)}
              defaultRent={land.leaseTerms?.rentAmount || 0}
              title="Add Tenant to Land"
            />
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
