"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Land, Tenant } from "@/types";
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
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  BanknotesIcon,
  CalendarIcon,
  DocumentTextIcon,
  PencilIcon,
  UserMinusIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function LandTenantPage() {
  const [land, setLand] = useState<Land | null>(null);
  const [loading, setLoading] = useState(true);
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
      const landData = await propertyService.getLandById(landId);
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

  const handleAddTenant = () => {
    // For now, we'll show a placeholder message
    // In a full implementation, this would open a tenant form
    toast.success("Tenant management form would open here");
  };

  const handleEditTenant = () => {
    // For now, we'll show a placeholder message
    // In a full implementation, this would open a tenant edit form
    toast.success("Tenant edit form would open here");
  };

  const handleRemoveTenant = async () => {
    if (!land?.currentTenant) return;

    if (
      !confirm(
        "Are you sure you want to remove this tenant? This will mark the land as vacant."
      )
    ) {
      return;
    }

    try {
      // Update land to remove tenant
      const updatedLand = {
        ...land,
        isLeased: false,
        currentTenant: undefined,
        updatedAt: new Date(),
      };

      propertyService.updateLand(landId, updatedLand);
      toast.success("Tenant removed successfully");
      loadLand();
    } catch (error) {
      console.error("Error removing tenant:", error);
      toast.error("Failed to remove tenant");
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <LoadingState message="Loading tenant information..." />
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
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Real Estate", href: "/properties/lands" },
    { label: land.name, href: `/properties/lands/${landId}` },
    { label: "Tenant", href: `/properties/lands/${landId}/tenant` },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <Breadcrumb items={breadcrumbItems} />

          {/* Header */}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Tenant Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage tenant information for {land.name}
              </p>
            </div>
            <div className="flex space-x-3">
              {land.currentTenant ? (
                <>
                  <Button
                    variant="outline"
                    onClick={handleEditTenant}
                    className="flex items-center space-x-2"
                  >
                    <PencilIcon className="h-4 w-4" />
                    <span>Edit Tenant</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleRemoveTenant}
                    className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <UserMinusIcon className="h-4 w-4" />
                    <span>Remove Tenant</span>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleAddTenant}
                  className="flex items-center space-x-2"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Add Tenant</span>
                </Button>
              )}
            </div>
          </div>

          {land.currentTenant ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Personal Information */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Full Name</div>
                          <div className="font-medium">
                            {land.currentTenant.personalInfo.fullName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Occupation
                          </div>
                          <div className="font-medium">
                            {land.currentTenant.personalInfo.occupation}
                          </div>
                        </div>
                      </div>

                      {land.currentTenant.personalInfo.employer && (
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Employer
                            </div>
                            <div className="font-medium">
                              {land.currentTenant.personalInfo.employer}
                            </div>
                          </div>
                        </div>
                      )}

                      {land.currentTenant.personalInfo.monthlyIncome && (
                        <div className="flex items-center space-x-3">
                          <BanknotesIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-600">
                              Monthly Income
                            </div>
                            <div className="font-medium">
                              ₹
                              {land.currentTenant.personalInfo.monthlyIncome.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Family Size
                          </div>
                          <div className="font-medium">
                            {land.currentTenant.personalInfo.familySize} members
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Nationality
                          </div>
                          <div className="font-medium">
                            {land.currentTenant.personalInfo.nationality}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Information */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Contact Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {land.currentTenant.contactInfo.phone && (
                        <div className="flex items-center space-x-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-600">Phone</div>
                            <div className="font-medium">
                              {land.currentTenant.contactInfo.phone}
                            </div>
                          </div>
                        </div>
                      )}

                      {land.currentTenant.contactInfo.email && (
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-600">Email</div>
                            <div className="font-medium">
                              {land.currentTenant.contactInfo.email}
                            </div>
                          </div>
                        </div>
                      )}

                      {land.currentTenant.contactInfo.address && (
                        <div className="flex items-start space-x-3 md:col-span-2">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <div className="text-sm text-gray-600">Address</div>
                            <div className="font-medium">
                              {land.currentTenant.contactInfo.address}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Rental Agreement */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Rental Agreement
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Agreement Number
                          </div>
                          <div className="font-medium">
                            {land.currentTenant.rentalAgreement.agreementNumber}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Start Date
                          </div>
                          <div className="font-medium">
                            {new Date(
                              land.currentTenant.rentalAgreement.startDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">End Date</div>
                          <div className="font-medium">
                            {new Date(
                              land.currentTenant.rentalAgreement.endDate
                            ).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <BanknotesIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Rent Amount
                          </div>
                          <div className="font-medium">
                            ₹
                            {land.currentTenant.rentalAgreement.rentAmount.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <BanknotesIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Security Deposit
                          </div>
                          <div className="font-medium">
                            ₹
                            {land.currentTenant.rentalAgreement.securityDeposit.toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Rent Due Date
                          </div>
                          <div className="font-medium">
                            {land.currentTenant.rentalAgreement.rentDueDate} of
                            every month
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Emergency Contact */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Emergency Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Name</div>
                          <div className="font-medium">
                            {land.currentTenant.emergencyContact.name}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">
                            Relationship
                          </div>
                          <div className="font-medium">
                            {land.currentTenant.emergencyContact.relationship}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">Phone</div>
                          <div className="font-medium">
                            {land.currentTenant.emergencyContact.phone}
                          </div>
                        </div>
                      </div>

                      {land.currentTenant.emergencyContact.email && (
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-600">Email</div>
                            <div className="font-medium">
                              {land.currentTenant.emergencyContact.email}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Tenant Status */}
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tenant Status
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status</span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            land.currentTenant.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {land.currentTenant.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Move-in Date</span>
                        <span className="font-medium">
                          {new Date(
                            land.currentTenant.moveInDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      {land.currentTenant.moveOutDate && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Move-out Date</span>
                          <span className="font-medium">
                            {new Date(
                              land.currentTenant.moveOutDate
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

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
                          {land.currentTenant.documents.length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">References</span>
                        <span className="font-medium">
                          {land.currentTenant.references.length}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            /* No Tenant State */
            <Card>
              <CardContent className="p-12">
                <div className="text-center">
                  <div className="text-gray-400 mb-4">
                    <UserIcon className="h-16 w-16 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No Tenant Assigned
                  </h3>
                  <p className="text-gray-600 mb-6">
                    This land property is currently vacant. Add a tenant to
                    start managing lease information.
                  </p>
                  <Button
                    onClick={handleAddTenant}
                    className="flex items-center space-x-2 mx-auto"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span>Add Tenant</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
