"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { RentPayment, Tenant, Building, Flat } from "@/types";
import { ApiService } from "@/services/ApiService";
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
  CurrencyRupeeIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  DocumentArrowDownIcon,
} from "@heroicons/react/24/outline";
import { EnhancedRentPaymentForm } from "./EnhancedRentPaymentForm";
import { RentPaymentFilters, RentPaymentFilterCriteria, defaultFilterCriteria } from "./RentPaymentFilters";
import { PdfExportService } from "@/services/PdfExportService";
import toast from "react-hot-toast";

// Fallback default filter criteria in case of import issues
const fallbackFilterCriteria: RentPaymentFilterCriteria = {
  dateRange: "all",
  buildingId: "all",
  flatId: "all",
  searchTerm: "",
};

// Interface for rent payment with metadata
interface RentPaymentWithMetadata extends RentPayment {
  tenantName?: string;
  propertyName?: string;
  propertyAddress?: string;
  apartmentDoorNumber?: string;
  flatDoorNumber?: string;
}

export function RentManagement() {
  const [payments, setPayments] = useState<RentPaymentWithMetadata[]>([]);
  const [allPayments, setAllPayments] = useState<RentPaymentWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [editingPayment, setEditingPayment] = useState<RentPayment | null>(null);
  const [filterCriteria, setFilterCriteria] = useState<RentPaymentFilterCriteria>(defaultFilterCriteria || fallbackFilterCriteria);
  
  // Additional data for filtering
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  // Apply filters to the loaded payments
  const applyFilters = useCallback(() => {
    let filtered = [...allPayments];

    // Search filter
    if (filterCriteria.searchTerm && filterCriteria.searchTerm.trim() !== "") {
      const searchTerm = filterCriteria.searchTerm.toLowerCase();
      filtered = filtered.filter(payment => 
        payment.tenantName?.toLowerCase().includes(searchTerm) ||
        payment.propertyName?.toLowerCase().includes(searchTerm) ||
        payment.receiptNumber?.toLowerCase().includes(searchTerm) ||
        payment.transactionId?.toLowerCase().includes(searchTerm) ||
        payment.notes?.toLowerCase().includes(searchTerm)
      );
    }

    // Date range filter
    if (filterCriteria.dateRange !== "all" && filterCriteria.startDate && filterCriteria.endDate) {
      const startDate = new Date(filterCriteria.startDate);
      const endDate = new Date(filterCriteria.endDate);
      endDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.paidDate || payment.dueDate);
        return paymentDate >= startDate && paymentDate <= endDate;
      });
    }

    // Building filter
    if (filterCriteria.buildingId !== "all") {
      filtered = filtered.filter(payment => 
        payment.propertyType === "building" && payment.propertyId === filterCriteria.buildingId
      );
    }

    // Flat filter
    if (filterCriteria.flatId !== "all") {
      filtered = filtered.filter(payment => 
        payment.propertyType === "flat" && payment.propertyId === filterCriteria.flatId
      );
    }

    console.log("Filtered payments:", filtered.length, "from", allPayments.length);
    setPayments(filtered);
  }, [allPayments, filterCriteria]);

  // Apply filters whenever filter criteria or all payments change
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);

      const [paymentsData, tenantsData, buildingsData, flatsData] = await Promise.all([
        ApiService.getRentPayments(),
        propertyService.getTenants(),
        propertyService.getBuildings(),
        propertyService.getFlats(),
      ]);
      
      // Store reference data
      setTenants(tenantsData);
      setBuildings(buildingsData);
      setFlats(flatsData);
      
      // Load metadata for each payment
      const paymentsWithMetadata = await Promise.all(
        paymentsData.map(async (payment) => {
          const paymentWithMetadata: RentPaymentWithMetadata = { ...payment };
          
          try {
            // Get tenant information
            const tenant = tenantsData.find(t => t.id === payment.tenantId);
            if (tenant) {
              paymentWithMetadata.tenantName = tenant.personalInfo.fullName;
            }

            // Get property information
            if (payment.propertyType === "building") {
              const building = buildingsData.find(b => b.id === payment.propertyId);
              if (building) {
                paymentWithMetadata.propertyName = building.name;
                paymentWithMetadata.propertyAddress = building.address;
                
                // Get apartment info if unitId exists
                if (payment.unitId) {
                  const apartments = await propertyService.getApartmentsByBuildingId(payment.propertyId);
                  const apartment = apartments.find(apt => apt.id === payment.unitId);
                  if (apartment) {
                    paymentWithMetadata.apartmentDoorNumber = apartment.doorNumber;
                  }
                }
              }
            } else if (payment.propertyType === "flat") {
              const flat = flatsData.find(f => f.id === payment.propertyId);
              if (flat) {
                paymentWithMetadata.propertyName = flat.name;
                paymentWithMetadata.propertyAddress = flat.address;
                paymentWithMetadata.flatDoorNumber = flat.doorNumber;
              }
            }
          } catch (error) {
            console.error(`Error loading metadata for payment ${payment.id}:`, error);
          }
          
          return paymentWithMetadata;
        })
      );
      
      setAllPayments(paymentsWithMetadata);
      
      console.log("Loaded payments:", paymentsWithMetadata.length);
    } catch (error) {
      console.error("Error loading payments:", error);
      setError("Failed to load rent payments");
      toast.error("Failed to load rent payments");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPayment = () => {
    setEditingPayment(null);
    setShowForm(true);
  };

  const handleEditPayment = (payment: RentPayment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  const handleDeletePayment = async (payment: RentPayment) => {
    if (!confirm(`Are you sure you want to delete this payment record?`)) {
      return;
    }

    try {
      await ApiService.deleteRentPayment(payment.id);
      toast.success("Payment record deleted successfully");
      loadPayments();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment record");
    }
  };

  const handleFormSubmit = async (paymentData: RentPayment) => {
    try {
      if (editingPayment) {
        await ApiService.updateRentPayment(editingPayment.id, paymentData);
        toast.success("Payment updated successfully");
      } else {
        // Payment is created in the form itself
        toast.success("Payment recorded successfully");
      }
      setShowForm(false);
      setEditingPayment(null);
      loadPayments();
    } catch (error) {
      console.error("Error saving payment:", error);
      toast.error("Failed to save payment");
    }
  };

  const handleApplyFilters = (newFilters: RentPaymentFilterCriteria) => {
    console.log("Received filters in RentManagement:", newFilters); // Debug log
    setFilterCriteria(newFilters);
  };

  const handleExportToPdf = () => {
    try {
      if (payments.length === 0) {
        toast.error("No payments to export");
        return;
      }

      PdfExportService.exportRentPayments(payments, filterCriteria, statistics);
      toast.success("PDF exported successfully!");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filterCriteria.dateRange !== "all") count++;
    if (filterCriteria.buildingId !== "all") count++;
    if (filterCriteria.flatId !== "all") count++;
    if (filterCriteria.searchTerm && filterCriteria.searchTerm.trim() !== "") count++;
    return count;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "paid":
        return <CheckCircleIcon className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case "pending":
        return <ClockIcon className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case "overdue":
        return <ExclamationTriangleIcon className="h-4 w-4 text-red-600 dark:text-red-400" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      case "overdue":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  // Calculate statistics based on filtered payments
  const statistics = useMemo(() => {
    const totalPayments = payments.length;
    const paidPayments = payments.filter(p => p.status === "paid").length;
    const pendingPayments = payments.filter(p => p.status === "pending").length;
    const overduePayments = payments.filter(p => p.status === "overdue").length;
    const totalAmount = payments
      .filter(p => p.status === "paid")
      .reduce((sum, p) => sum + (p.actualAmountPaid || p.amount), 0);

    return {
      totalPayments,
      paidPayments,
      pendingPayments,
      overduePayments,
      totalAmount,
    };
  }, [payments]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-red-600 dark:text-red-400 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Something went wrong</h3>
          <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">{error}</p>
        </div>
        <Button onClick={loadPayments} variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Rent Management</h2>
          <p className="text-gray-600 dark:text-gray-300">Record and manage rent payments</p>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          {/* Quick Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Quick search..."
              value={filterCriteria.searchTerm || ""}
              onChange={(e) => {
                setFilterCriteria({ ...filterCriteria, searchTerm: e.target.value });
              }}
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(true)}
            className="flex items-center justify-center border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filters
            {getActiveFiltersCount() > 0 && (
              <span className="ml-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium px-2 py-0.5 rounded-full">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>

          <Button 
            variant="outline" 
            onClick={handleExportToPdf}
            className="flex items-center justify-center border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            disabled={payments.length === 0}
          >
            <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
            Export PDF
          </Button>
          
          <Button onClick={handleAddPayment} className="flex items-center justify-center">
            <PlusIcon className="h-4 w-4 mr-2" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* Filter Summary */}
      {getActiveFiltersCount() > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FunnelIcon className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  Showing {payments.length} payments with {getActiveFiltersCount()} active filter(s)
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  const defaultFilters = defaultFilterCriteria || fallbackFilterCriteria;
                  setFilterCriteria(defaultFilters);
                }}
                className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30"
              >
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CurrencyRupeeIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Payments</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.totalPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Paid</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.paidPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.pendingPayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-600 dark:text-red-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Overdue</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{statistics.overduePayments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center">
              <CurrencyRupeeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Collected</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{statistics.totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {payments.map((payment) => (
          <Card key={payment.id} className="hover:shadow-lg dark:hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg flex items-center text-gray-900 dark:text-white">
                    {getStatusIcon(payment.status)}
                    <span className="ml-2">{payment.tenantName || "Unknown Tenant"}</span>
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {payment.receiptNumber}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditPayment(payment)}
                    className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeletePayment(payment)}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* Property Information */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                <span>
                  {payment.propertyName}
                  {payment.apartmentDoorNumber && ` - Door: ${payment.apartmentDoorNumber}`}
                  {payment.flatDoorNumber && ` - Door: ${payment.flatDoorNumber}`}
                </span>
              </div>

              {/* Amount */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CurrencyRupeeIcon className="h-4 w-4 mr-2" />
                <span>₹{payment.amount.toLocaleString()}</span>
                {payment.actualAmountPaid !== payment.amount && (
                  <span className="ml-2 text-green-600 dark:text-green-400">
                    (Paid: ₹{payment.actualAmountPaid?.toLocaleString()})
                  </span>
                )}
              </div>

              {/* Payment Date */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <CalendarIcon className="h-4 w-4 mr-2" />
                <span>
                  {payment.paidDate 
                    ? new Date(payment.paidDate).toLocaleDateString()
                    : `Due: ${new Date(payment.dueDate).toLocaleDateString()}`
                  }
                </span>
              </div>

              {/* Payment Method */}
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                <span className="capitalize">{payment.paymentMethod}</span>
                {payment.transactionId && (
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    ({payment.transactionId})
                  </span>
                )}
              </div>

              {/* Status and Additional Info */}
              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {payment.propertyType}
                </span>
              </div>

              {/* Late Fee or Discount */}
              {(payment.lateFee > 0 || payment.discount > 0) && (
                <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
                  {payment.lateFee > 0 && (
                    <div className="text-red-600 dark:text-red-400">Late Fee: ₹{payment.lateFee}</div>
                  )}
                  {payment.discount > 0 && (
                    <div className="text-green-600 dark:text-green-400">Discount: ₹{payment.discount}</div>
                  )}
                </div>
              )}

              {/* Notes */}
              {payment.notes && (
                <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                  &quot;{payment.notes}&quot;
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {payments.length === 0 && (
        <div className="text-center py-12">
          <CurrencyRupeeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
            {getActiveFiltersCount() === 0 ? "No payments recorded" : "No payments match your filters"}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {getActiveFiltersCount() === 0 
              ? "Get started by recording your first rent payment."
              : "Try adjusting your filter criteria to see more results."
            }
          </p>
          {getActiveFiltersCount() === 0 ? (
            <div className="mt-6">
              <Button onClick={handleAddPayment}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Record Payment
              </Button>
            </div>
          ) : (
            <div className="mt-6">
              <Button onClick={() => setShowFilters(true)} variant="outline" className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                <FunnelIcon className="h-4 w-4 mr-2" />
                Adjust Filters
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <EnhancedRentPaymentForm
          isOpen={showForm}
          payment={editingPayment}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingPayment(null);
          }}
          title={editingPayment ? "Edit Payment" : "Record Rent Payment"}
        />
      )}

      {/* Filters Modal */}
      {showFilters && (
        <RentPaymentFilters
          isOpen={showFilters}
          onClose={() => setShowFilters(false)}
          onApplyFilters={handleApplyFilters}
          currentFilters={filterCriteria}
        />
      )}
    </div>
  );
}