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

import { toast } from "react-hot-toast";

export default function LandDetailPage() {
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
      console.log("Loading land with ID:", landId);

      const landData = await propertyService.getLandById(landId);
      console.log("Land data loaded:", landData);

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

  const formatArea = (area: number, unit: string) => {
    return `${(area || 0).toLocaleString()} ${unit}`;
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{land.name}</h1>
              <div className="flex items-center space-x-4 mt-2">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    land.isLeased
                      ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                      : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
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
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Property Images */}
              {land.images && land.images.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
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
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Property Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Address</div>
                        <div className="font-medium text-gray-900 dark:text-white">{land.address}</div>
                      </div>
                    </div>

                    {land.surveyNumber && (
                      <div className="flex items-center space-x-3">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Survey Number
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">{land.surveyNumber}</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-3">
                      <TagIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Area</div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {formatArea(land.area, land.areaUnit)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <MapIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">Zoning</div>
                        <div className="font-medium text-gray-900 dark:text-white capitalize">
                          {land.zoning}
                        </div>
                      </div>
                    </div>

                    {land.soilType && (
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 bg-yellow-400 rounded-full flex-shrink-0"></div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Soil Type</div>
                          <div className="font-medium text-gray-900 dark:text-white">{land.soilType}</div>
                        </div>
                      </div>
                    )}

                    {land.waterSource && (
                      <div className="flex items-center space-x-3">
                        <div className="h-5 w-5 bg-blue-400 rounded-full flex-shrink-0"></div>
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Water Source
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">{land.waterSource}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Features */}
                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
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
                        <span className="text-sm text-gray-500 dark:text-gray-400">
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
                      <p className="text-gray-600 dark:text-gray-300">{land.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Lease Information */}
              {land.isLeased && land.leaseTerms && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Lease Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <BanknotesIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Rent Amount
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            ₹
                            {(land.leaseTerms.rentAmount || 0).toLocaleString()}
                            /{land.leaseTerms.rentFrequency}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <CalendarIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Lease Duration
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {land.leaseTerms.leaseDuration} years
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <TagIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            Lease Type
                          </div>
                          <div className="font-medium text-gray-900 dark:text-white capitalize">
                            {land.leaseTerms.leaseType}
                          </div>
                        </div>
                      </div>

                      {land.leaseTerms.securityDeposit > 0 && (
                        <div className="flex items-center space-x-3">
                          <BanknotesIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              Security Deposit
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              ₹
                              {(
                                land.leaseTerms.securityDeposit || 0
                              ).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {land.leaseTerms.renewalTerms && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Renewal Terms
                        </h4>
                        <p className="text-gray-600 dark:text-gray-300">
                          {land.leaseTerms.renewalTerms}
                        </p>
                      </div>
                    )}

                    {land.leaseTerms.restrictions &&
                      land.leaseTerms.restrictions.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Restrictions
                          </h4>
                          <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 space-y-1">
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
              {/* Quick Stats */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Documents</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {land.documents?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Rent History</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {land.rentHistory?.length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-300">Maintenance Records</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {land.maintenanceRecords?.length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
