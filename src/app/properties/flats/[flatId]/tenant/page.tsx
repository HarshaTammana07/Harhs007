"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, Card, LoadingState } from "@/components/ui";
import { propertyService } from "@/services/PropertyService";
import { Flat, Tenant } from "@/types";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  BanknotesIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export default function FlatTenantPage() {
  const [flat, setFlat] = useState<Flat | null>(null);
  const [loading, setLoading] = useState(true);
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

  const handleEditTenant = () => {
    router.push(`/properties/flats/${flatId}/tenant/edit`);
  };

  const handleRemoveTenant = async () => {
    if (
      !confirm(
        "Are you sure you want to remove this tenant? This will mark the flat as vacant."
      )
    ) {
      return;
    }

    try {
      // Update flat to remove tenant and mark as vacant
      propertyService.updateFlat(flatId, {
        currentTenant: undefined,
        isOccupied: false,
        updatedAt: new Date(),
      });

      toast.success("Tenant removed successfully");
      router.push(`/properties/flats/${flatId}`);
    } catch (error) {
      console.error("Error removing tenant:", error);
      toast.error("Failed to remove tenant");
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
          <div className="text-center py-8">
            <p className="text-gray-600">No tenant found for this flat.</p>
            <Button
              onClick={() => router.push(`/properties/flats/${flatId}`)}
              className="mt-4"
            >
              Back to Flat Details
            </Button>
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
          <div>
            <Breadcrumb items={breadcrumbItems} />
            <div className="mt-4 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {tenant.personalInfo.fullName}
                </h1>
                <p className="text-gray-600 mt-1">
                  Tenant at {flat.name} - {flat.doorNumber}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleEditTenant}
                  className="flex items-center space-x-2"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="outline"
                  onClick={handleRemoveTenant}
                  className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                  <span>Remove Tenant</span>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-medium text-gray-900">
                            {tenant.personalInfo.fullName}
                          </p>
                        </div>
                      </div>

                      {tenant.personalInfo.dateOfBirth && (
                        <div className="flex items-center space-x-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Date of Birth
                            </p>
                            <p className="font-medium text-gray-900">
                              {new Date(
                                tenant.personalInfo.dateOfBirth
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                          <span className="text-xs font-bold">👤</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Occupation</p>
                          <p className="font-medium text-gray-900">
                            {tenant.personalInfo.occupation}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                          <span className="text-xs font-bold">👥</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Family Size</p>
                          <p className="font-medium text-gray-900">
                            {tenant.personalInfo.familySize} members
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                          <span className="text-xs font-bold">💍</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Marital Status
                          </p>
                          <p className="font-medium text-gray-900 capitalize">
                            {tenant.personalInfo.maritalStatus}
                          </p>
                        </div>
                      </div>

                      {tenant.personalInfo.monthlyIncome && (
                        <div className="flex items-center space-x-3">
                          <BanknotesIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">
                              Monthly Income
                            </p>
                            <p className="font-medium text-gray-900">
                              ₹
                              {tenant.personalInfo.monthlyIncome.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Contact Information */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">
                            {tenant.contactInfo.phone}
                          </p>
                        </div>
                      </div>

                      {tenant.contactInfo.email && (
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">
                              {tenant.contactInfo.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      {tenant.contactInfo.address && (
                        <div className="flex items-start space-x-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium text-gray-900">
                              {tenant.contactInfo.address}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Emergency Contact */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Emergency Contact
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <UserIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium text-gray-900">
                            {tenant.emergencyContact.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                          <span className="text-xs font-bold">🤝</span>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Relationship</p>
                          <p className="font-medium text-gray-900">
                            {tenant.emergencyContact.relationship}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium text-gray-900">
                            {tenant.emergencyContact.phone}
                          </p>
                        </div>
                      </div>

                      {tenant.emergencyContact.email && (
                        <div className="flex items-center space-x-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-600">Email</p>
                            <p className="font-medium text-gray-900">
                              {tenant.emergencyContact.email}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Rental Agreement */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Rental Agreement
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Agreement No.
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {tenant.rentalAgreement.agreementNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Start Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(
                          tenant.rentalAgreement.startDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">End Date</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(
                          tenant.rentalAgreement.endDate
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Monthly Rent
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{tenant.rentalAgreement.rentAmount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Security Deposit
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹
                        {tenant.rentalAgreement.securityDeposit.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Move-in Information */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Move-in Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Move-in Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(tenant.moveInDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="h-5 w-5 text-gray-400 flex items-center justify-center">
                        <span className="text-xs font-bold">✓</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium text-green-600">Active</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Identification */}
              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Identification
                  </h3>
                  <div className="space-y-3">
                    {tenant.identification.aadharNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Aadhar</span>
                        <span className="text-sm font-medium text-gray-900">
                          {tenant.identification.aadharNumber}
                        </span>
                      </div>
                    )}
                    {tenant.identification.panNumber && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">PAN</span>
                        <span className="text-sm font-medium text-gray-900">
                          {tenant.identification.panNumber}
                        </span>
                      </div>
                    )}
                    {tenant.identification.drivingLicense && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Driving License
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {tenant.identification.drivingLicense}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
