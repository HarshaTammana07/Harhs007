"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { RentPayment, RentCollectionReport } from "@/types";
import { rentPaymentService } from "@/services/RentPaymentService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { RentCollectionReport as RentCollectionReportComponent } from "./RentCollectionReport";

interface RentCollectionDashboardProps {
  className?: string;
}

export const RentCollectionDashboard: React.FC<
  RentCollectionDashboardProps
> = ({ className = "" }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [overduePayments, setOverduePayments] = useState<RentPayment[]>([]);
  const [upcomingPayments, setUpcomingPayments] = useState<RentPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current_month");
  const [showReportModal, setShowReportModal] = useState(false);
  const [generatedReport, setGeneratedReport] =
    useState<RentCollectionReport | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get date range based on selected period
      const { startDate, endDate } = getDateRange(selectedPeriod);

      // Load analytics
      const analyticsData = rentPaymentService.getRentAnalytics(
        startDate,
        endDate
      );
      setAnalytics(analyticsData);

      // Load overdue payments
      const overdue = rentPaymentService.getOverduePayments();
      setOverduePayments(overdue);

      // Load upcoming payments
      const upcoming = rentPaymentService.getUpcomingPayments(7);
      setUpcomingPayments(upcoming);

      // Update overdue payments status
      rentPaymentService.updateOverduePayments();
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = (period: string): { startDate: Date; endDate: Date } => {
    const now = new Date();
    const startDate = new Date();
    const endDate = new Date();

    switch (period) {
      case "current_month":
        startDate.setDate(1);
        endDate.setMonth(endDate.getMonth() + 1, 0);
        break;
      case "last_month":
        startDate.setMonth(startDate.getMonth() - 1, 1);
        endDate.setMonth(endDate.getMonth(), 0);
        break;
      case "current_quarter":
        const currentQuarter = Math.floor(now.getMonth() / 3);
        startDate.setMonth(currentQuarter * 3, 1);
        endDate.setMonth(currentQuarter * 3 + 3, 0);
        break;
      case "current_year":
        startDate.setMonth(0, 1);
        endDate.setMonth(11, 31);
        break;
      case "last_year":
        startDate.setFullYear(startDate.getFullYear() - 1, 0, 1);
        endDate.setFullYear(endDate.getFullYear() - 1, 11, 31);
        break;
      default:
        // Last 30 days
        startDate.setDate(startDate.getDate() - 30);
        break;
    }

    return { startDate, endDate };
  };

  const handleGenerateReport = async () => {
    try {
      const { startDate, endDate } = getDateRange(selectedPeriod);
      const reportType = selectedPeriod.includes("month")
        ? "monthly"
        : selectedPeriod.includes("quarter")
          ? "quarterly"
          : selectedPeriod.includes("year")
            ? "yearly"
            : "custom";

      const report = await rentPaymentService.generateRentCollectionReport(
        startDate,
        endDate,
        reportType
      );

      setGeneratedReport(report);
      setShowReportModal(true);
      toast.success("Report generated successfully");
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error("Failed to generate report");
    }
  };

  const handleGenerateMonthlyPayments = async () => {
    try {
      const now = new Date();
      const payments = rentPaymentService.generateMonthlyRentPayments(
        now.getMonth(),
        now.getFullYear()
      );

      if (payments.length > 0) {
        toast.success(`Generated ${payments.length} rent payment records`);
        loadDashboardData();
      } else {
        toast.success("No new payment records needed");
      }
    } catch (error) {
      console.error("Error generating monthly payments:", error);
      toast.error("Failed to generate monthly payments");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Rent Collection Dashboard
        </h1>
        <div className="mt-4 sm:mt-0 flex space-x-4">
          <Select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-48"
          >
            <option value="current_month">Current Month</option>
            <option value="last_month">Last Month</option>
            <option value="current_quarter">Current Quarter</option>
            <option value="current_year">Current Year</option>
            <option value="last_year">Last Year</option>
          </Select>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
          <Button variant="outline" onClick={handleGenerateMonthlyPayments}>
            Generate Monthly Payments
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Total Expected
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(analytics?.totalExpectedRent || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Total Collected
              </p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics?.totalCollectedRent || 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(analytics?.totalOutstandingRent || 0)}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">
                Collection Rate
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {formatPercentage(analytics?.collectionRate || 0)}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Property Stats
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Properties:</span>
              <span className="font-medium">
                {analytics?.totalProperties || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Active Tenants:</span>
              <span className="font-medium">
                {analytics?.totalTenants || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Avg Rent/Property:</span>
              <span className="font-medium">
                {formatCurrency(analytics?.averageRentPerProperty || 0)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Status
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Overdue Payments:</span>
              <span className="font-medium text-red-600">
                {analytics?.overduePaymentsCount || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Upcoming (7 days):</span>
              <span className="font-medium text-yellow-600">
                {analytics?.upcomingPaymentsCount || 0}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Payment Methods
          </h3>
          <div className="space-y-2">
            {analytics?.paymentMethodStats?.slice(0, 3).map((method: any) => (
              <div key={method.method} className="flex justify-between">
                <span className="text-sm text-gray-600 capitalize">
                  {method.method.replace("_", " ")}:
                </span>
                <span className="font-medium">{method.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Overdue and Upcoming Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Payments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Overdue Payments ({overduePayments.length})
            </h3>
          </div>
          {overduePayments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No overdue payments
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {overduePayments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {/* Tenant name would need to be fetched */}
                      Tenant ID: {payment.tenantId.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              ))}
              {overduePayments.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{overduePayments.length - 5} more overdue payments
                </p>
              )}
            </div>
          )}
        </Card>

        {/* Upcoming Payments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Upcoming Payments ({upcomingPayments.length})
            </h3>
          </div>
          {upcomingPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No upcoming payments
            </p>
          ) : (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {upcomingPayments.slice(0, 5).map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      Tenant ID: {payment.tenantId.slice(-8)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-yellow-600">
                      {formatCurrency(payment.amount)}
                    </p>
                  </div>
                </div>
              ))}
              {upcomingPayments.length > 5 && (
                <p className="text-sm text-gray-500 text-center">
                  +{upcomingPayments.length - 5} more upcoming payments
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => {
          setShowReportModal(false);
          setGeneratedReport(null);
        }}
        title="Rent Collection Report"
        size="xl"
      >
        {generatedReport && (
          <RentCollectionReportComponent
            report={generatedReport}
            onClose={() => {
              setShowReportModal(false);
              setGeneratedReport(null);
            }}
          />
        )}
      </Modal>
    </div>
  );
};
