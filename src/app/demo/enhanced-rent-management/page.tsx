"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { RentPayment, Tenant, Building, Flat } from "@/types";
import { ApiService } from "@/services/ApiService";
import { propertyService } from "@/services/PropertyService";
import { EnhancedRentPaymentForm } from "@/components/rent/EnhancedRentPaymentForm";
import {
  RentPaymentFilters,
  RentPaymentFilterCriteria,
  defaultFilterCriteria,
} from "@/components/rent/RentPaymentFilters";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  PlusIcon,
  CurrencyRupeeIcon,
  FunnelIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

export default function EnhancedRentManagementPage() {
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [allPayments, setAllPayments] = useState<RentPayment[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterCriteria, setFilterCriteria] =
    useState<RentPaymentFilterCriteria>(defaultFilterCriteria);

  // Additional data for filtering
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);

  useEffect(() => {
    loadAllData();
  }, []);

  // Apply filters whenever filter criteria changes
  useEffect(() => {
    applyFilters();
  }, [filterCriteria, allPayments, applyFilters]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [paymentsData, tenantsData, buildingsData, flatsData] =
        await Promise.all([
          ApiService.getRentPayments(),
          propertyService.getTenants(),
          propertyService.getBuildings(),
          propertyService.getFlats(),
        ]);

      setAllPayments(paymentsData);
      setTenants(tenantsData);
      setBuildings(buildingsData);
      setFlats(flatsData);
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Failed to load rent payments");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    if (!allPayments || !Array.isArray(allPayments)) {
      setPayments([]);
      return;
    }
    let filtered = [...allPayments];

    // Search filter
    if (filterCriteria.searchTerm) {
      const searchTerm = filterCriteria.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (payment) =>
          payment.receiptNumber?.toLowerCase().includes(searchTerm) ||
          payment.transactionId?.toLowerCase().includes(searchTerm) ||
          payment.notes?.toLowerCase().includes(searchTerm) ||
          payment.tenantId.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (
      filterCriteria.dateRange !== "all" &&
      filterCriteria.startDate &&
      filterCriteria.endDate
    ) {
      const startDate = new Date(filterCriteria.startDate);
      const endDate = new Date(filterCriteria.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date

      filtered = filtered.filter((payment) => {
        const paymentDate = new Date(payment.paidDate || payment.dueDate);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }

    // Building filter
    if (filterCriteria.buildingId !== "all") {
      filtered = filtered.filter((payment) =>
        payment.propertyId === filterCriteria.buildingId
      );
    }

    // Flat filter
    if (filterCriteria.flatId !== "all") {
      filtered = filtered.filter((payment) =>
        payment.propertyId === filterCriteria.flatId
      );
    }

    setPayments(filtered);
  }, [allPayments, filterCriteria]);

  const handlePaymentSubmit = async (paymentData: RentPayment) => {
    try {
      setAllPayments((prev) => [paymentData, ...prev]);
      setIsFormOpen(false);
      toast.success("Rent payment recorded successfully!");
    } catch (error) {
      console.error("Error handling payment:", error);
      toast.error("Failed to handle payment");
    }
  };

  const handleApplyFilters = (newFilters: RentPaymentFilterCriteria) => {
    setFilterCriteria(newFilters);
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    if (!payments || !Array.isArray(payments)) {
      return {
        totalPayments: 0,
        totalAmount: 0,
        paidCount: 0,
        pendingCount: 0,
        overdueCount: 0,
      };
    }

    const totalAmount = payments.reduce(
      (sum, payment) => sum + (payment.actualAmountPaid || payment.amount),
      0
    );

    const paidCount = payments.filter((p) => p.status === "paid").length;
    const pendingCount = payments.filter((p) => p.status === "pending").length;
    const overdueCount = payments.filter((p) => p.status === "overdue").length;

    return {
      totalPayments: payments.length,
      totalAmount,
      paidCount,
      pendingCount,
      overdueCount,
    };
  }, [payments]);

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterCriteria.dateRange !== "all") count++;
    if (filterCriteria.buildingId !== "all") count++;
    if (filterCriteria.flatId !== "all") count++;
    if (filterCriteria.searchTerm && filterCriteria.searchTerm.trim() !== "") count++;
    return count;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 space-y-4 lg:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Enhanced Rent Management
          </h1>
          <p className="text-gray-600 mt-2">
            Record and manage rent payments with comprehensive filtering
          </p>
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Quick Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Quick search..."
              value={filterCriteria.searchTerm || ""}
              onChange={(e) =>
                setFilterCriteria((prev) => ({
                  ...prev,
                  searchTerm: e.target.value,
                }))
              }
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
            />
          </div>

          <Button
            variant="outline"
            onClick={() => setIsFilterOpen(true)}
            className="flex items-center justify-center"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>

          <Button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center justify-center"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {!loading && allPayments && allPayments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-blue-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Total Payments
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.totalPayments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <CurrencyRupeeIcon className="h-8 w-8 text-green-600" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">
                    Total Amount
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(statistics.totalAmount)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Paid</p>
                  <p className="text-2xl font-bold text-green-600">
                    {statistics.paidCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statistics.pendingCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-red-600 rounded-full"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-600">
                    {statistics.overdueCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading rent payments...</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Filter Summary */}
          {getActiveFiltersCount() > 0 && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FunnelIcon className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-blue-900">
                      Showing {payments?.length || 0} of {allPayments?.length || 0} payments
                      with {getActiveFiltersCount()} active filter(s)
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilterCriteria(defaultFilterCriteria)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {!payments || payments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <CurrencyRupeeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {!allPayments || allPayments.length === 0
                    ? "No payments recorded"
                    : "No payments match your filters"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {!allPayments || allPayments.length === 0
                    ? "Start by recording your first rent payment"
                    : "Try adjusting your filter criteria to see more results"}
                </p>
                {!allPayments || allPayments.length === 0 ? (
                  <Button onClick={() => setIsFormOpen(true)}>
                    Record First Payment
                  </Button>
                ) : (
                  <Button
                    onClick={() => setIsFilterOpen(true)}
                    variant="outline"
                  >
                    Adjust Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {payments && payments.map((payment) => {
                // Get tenant and property names for display
                const tenant = tenants.find((t) => t.id === payment.tenantId);
                const building = buildings.find(
                  (b) => b.id === payment.propertyId
                );
                const flat = flats.find((f) => f.id === payment.propertyId);

                return (
                  <Card key={payment.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div>
                          <span>Payment #{payment.receiptNumber}</span>
                          {tenant && (
                            <p className="text-sm font-normal text-gray-600 mt-1">
                              {tenant.personalInfo.fullName} -{" "}
                              {tenant.contactInfo.phone}
                            </p>
                          )}
                        </div>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(
                            payment.actualAmountPaid || payment.amount
                          )}
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Property</p>
                          <p className="font-medium">
                            {payment.propertyType === "building" && building
                              ? `${building.name} (${building.buildingCode})`
                              : payment.propertyType === "flat" && flat
                                ? `${flat.name} - ${flat.doorNumber}`
                                : `${payment.propertyType} - ${payment.propertyId.slice(0, 8)}...`}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Property Type</p>
                          <p className="font-medium capitalize">
                            {payment.propertyType}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Date</p>
                          <p className="font-medium">
                            {formatDate(payment.paidDate || payment.dueDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Payment Method
                          </p>
                          <p className="font-medium capitalize">
                            {payment.paymentMethod.replace("_", " ")}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Status</p>
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : payment.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : payment.status === "overdue"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {payment.status}
                          </span>
                        </div>
                        {payment.transactionId && (
                          <div>
                            <p className="text-sm text-gray-600">
                              Transaction ID
                            </p>
                            <p className="font-medium">
                              {payment.transactionId}
                            </p>
                          </div>
                        )}
                      </div>
                      {payment.notes && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">Notes</p>
                          <p className="text-gray-800">{payment.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      <EnhancedRentPaymentForm
        isOpen={isFormOpen}
        onSubmit={handlePaymentSubmit}
        onCancel={() => setIsFormOpen(false)}
      />

      <RentPaymentFilters
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        onApplyFilters={handleApplyFilters}
        currentFilters={filterCriteria}
      />
    </div>
  );
}
