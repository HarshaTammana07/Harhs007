"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { Building, Apartment, Tenant, RentPayment } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { Button, LoadingState, Card, CardContent } from "@/components/ui";
import { ApartmentList } from "@/components/properties/ApartmentList";
import { Modal } from "@/components/ui/Modal";
import { ApiService } from "@/services/ApiService";
import {
  ArrowLeftIcon,
  PlusIcon,
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export default function BuildingApartmentsPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params.buildingId as string;

  const [building, setBuilding] = useState<Building | null>(null);
  const [loading, setLoading] = useState(true);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [apartmentHistory, setApartmentHistory] = useState<{
    apartmentId: string;
    apartmentInfo: { doorNumber: string; floor: number; buildingName: string; buildingAddress?: string };
    currentTenant: Tenant | null;
    tenantHistory: Array<{
      tenant: Tenant;
      paymentHistory: RentPayment[];
      summary: { totalPaid: number; totalPayments: number; monthlyRent: number };
    }>;
    totals: { totalTenants: number; totalRevenue: number; averageMonthlyRent: number };
  } | null>(null);

  useEffect(() => {
    loadBuilding();
  }, [buildingId]);

  const loadBuilding = async () => {
    try {
      setLoading(true);
      const buildingData = await propertyService.getBuildingById(buildingId);
      if (!buildingData) {
        toast.error("Building not found");
        router.push("/properties/buildings");
        return;
      }
      setBuilding(buildingData);
    } catch (error) {
      console.error("Error loading building:", error);
      toast.error("Failed to load building");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push("/properties/buildings");
  };

  const handleAddApartment = () => {
    router.push(`/properties/buildings/${buildingId}/apartments/new`);
  };

  const handleEditApartment = (apartmentId: string) => {
    router.push(
      `/properties/buildings/${buildingId}/apartments/${apartmentId}/edit`
    );
  };

  const handleDeleteApartment = async (apartmentId: string) => {
    if (window.confirm("Are you sure you want to delete this apartment?")) {
      try {
        await propertyService.deleteApartment(apartmentId);
        toast.success("Apartment deleted successfully");
        await loadBuilding(); // Reload to refresh the list
      } catch (error) {
        console.error("Error deleting apartment:", error);
        toast.error("Failed to delete apartment");
      }
    }
  };

  const handleViewTenant = (apartmentId: string) => {
    router.push(
      `/properties/buildings/${buildingId}/apartments/${apartmentId}/tenant`
    );
  };

  const handleViewHistory = async (apartmentId: string) => {
    try {
      setHistoryOpen(true);
      setHistoryLoading(true);
      // minimal initial aggregate: tenants + payments
      const history = await ApiService.getApartmentHistory(apartmentId as string);
      setApartmentHistory(history);
    } catch (e) {
      console.error("Failed to load apartment history", e);
    } finally {
      setHistoryLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <LoadingState message="Loading building..." />
        </AppLayout>
      </ProtectedRoute>
    );
  }

  if (!building) {
    return (
      <ProtectedRoute>
        <AppLayout>
          <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
            <div className="text-center py-12">
              <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                Building not found
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                The building you are looking for does not exist.
              </p>
              <div className="mt-6">
                <Button onClick={handleBack}>
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Buildings
                </Button>
              </div>
            </div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  const apartments = building.apartments || [];
  const occupiedApartments = apartments.filter((apt) => apt.isOccupied).length;
  const vacantApartments = apartments.length - occupiedApartments;
  const occupancyRate =
    apartments.length > 0 ? (occupiedApartments / apartments.length) * 100 : 0;

  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Buildings", href: "/properties/buildings" },
    {
      label: building.name,
      href: `/properties/buildings/${buildingId}/apartments`,
    },
  ];

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
          <div className="p-6">
            <Breadcrumb items={breadcrumbItems} />

            {/* Building Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  {building.images && building.images.length > 0 ? (
                    <img
                      src={building.images[0]}
                      alt={building.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                      <BuildingOfficeIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {building.name}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">{building.address}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                        Building {building.buildingCode}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {building.totalFloors} Floors
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={handleBack} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={handleAddApartment}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Apartment
                  </Button>
                </div>
              </div>

              {/* Building Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {apartments.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Total Apartments</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {occupiedApartments}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Occupied</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600 dark:text-gray-400">
                    {vacantApartments}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Vacant</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                    {occupancyRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">Occupancy Rate</div>
                </div>
              </div>
            </div>

            {/* Apartments List */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Apartments
                </h2>
                <Button onClick={handleAddApartment}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Apartment
                </Button>
              </div>

              {apartments.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <CardContent className="text-center py-12">
                    <HomeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                      No apartments yet
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Get started by adding the first apartment to this building.
                    </p>
                    <div className="mt-6">
                      <Button onClick={handleAddApartment}>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Apartment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <ApartmentList
                  apartments={apartments}
                  buildingId={buildingId}
                  onEditApartment={handleEditApartment}
                  onDeleteApartment={handleDeleteApartment}
                  onViewTenant={handleViewTenant}
                  onViewHistory={handleViewHistory}
                />
              )}
            </div>
          </div>
          <Modal
            isOpen={historyOpen}
            onClose={() => setHistoryOpen(false)}
            title="Apartment History"
            size="xl"
          >
            {historyLoading ? (
              <LoadingState message="Loading history..." />)
              : apartmentHistory ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Tenants</div>
                    <div className="text-2xl font-semibold text-gray-900 dark:text-white">{apartmentHistory.totals.totalTenants}</div>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Total Revenue</div>
                    <div className="text-2xl font-semibold text-green-600 dark:text-green-400">₹{apartmentHistory.totals.totalRevenue.toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Avg Monthly Rent</div>
                    <div className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">₹{Math.round(apartmentHistory.totals.averageMonthlyRent).toLocaleString()}</div>
                  </div>
                </div>
                {apartmentHistory.currentTenant && (
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <div className="text-sm text-blue-900 dark:text-blue-300 font-medium">Current Tenant</div>
                    <div className="mt-1 text-gray-900 dark:text-white">
                      {apartmentHistory.currentTenant.personalInfo?.fullName}
                    </div>
                    {apartmentHistory.currentTenant.contactInfo?.phone && (
                      <div className="text-sm text-blue-800 dark:text-blue-400">{apartmentHistory.currentTenant.contactInfo.phone}</div>
                    )}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Tenants</h4>
                  <div className="space-y-2">
                    {apartmentHistory.tenantHistory.map((entry: { tenant: Tenant; summary: { totalPaid: number; totalPayments: number }; }) => (
                      <div key={entry.tenant.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-gray-900 dark:text-white font-medium">{entry.tenant.personalInfo?.fullName || "Unknown"}</div>
                            {entry.tenant.contactInfo?.phone && (
                              <div className="text-sm text-gray-600 dark:text-gray-300">{entry.tenant.contactInfo.phone}</div>
                            )}
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              Move in: {entry.tenant.moveInDate ? new Date(entry.tenant.moveInDate).toLocaleDateString() : "-"}
                              {" · "}
                              Move out: {entry.tenant.moveOutDate ? new Date(entry.tenant.moveOutDate).toLocaleDateString() : "Present"}
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">Paid: ₹{entry.summary.totalPaid.toLocaleString()} ({entry.summary.totalPayments})</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Payment History</h4>
                  <div className="space-y-3">
                    {apartmentHistory.tenantHistory.map((entry: { tenant: Tenant; paymentHistory: RentPayment[]; }) => (
                      <details key={entry.tenant.id} className="rounded border border-gray-200 dark:border-gray-700">
                        <summary className="cursor-pointer px-4 py-2 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white">
                          <span className="font-medium">{entry.tenant.personalInfo?.fullName || "Unknown"}</span>
                          {entry.tenant.contactInfo?.phone && (
                            <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">{entry.tenant.contactInfo.phone}</span>
                          )}
                          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                            ({entry.tenant.moveInDate ? new Date(entry.tenant.moveInDate).toLocaleDateString() : "-"}
                            {" → "}
                            {entry.tenant.moveOutDate ? new Date(entry.tenant.moveOutDate).toLocaleDateString() : "Present"})
                          </span>
                        </summary>
                        <div className="p-4 space-y-2">
                          {entry.paymentHistory.length === 0 ? (
                            <div className="text-sm text-gray-500 dark:text-gray-400">No payments found</div>
                          ) : (
                            entry.paymentHistory.map((p: RentPayment) => (
                              <div key={p.id} className="flex items-center justify-between text-sm text-gray-900 dark:text-white">
                                <div>Due: {new Date(p.dueDate).toLocaleDateString()}</div>
                                <div>Amount: ₹{p.amount.toLocaleString()}</div>
                                <div className={p.status === 'paid' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}>{p.status}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-300">No history available</div>
            )}
          </Modal>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
