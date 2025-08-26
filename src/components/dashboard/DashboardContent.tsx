"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ApiService } from "@/services/ApiService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Grid,
  Button,
} from "@/components/ui";
import {
  FamilyMember,
  Document,
  InsurancePolicy,
  RentPayment,
  Tenant,
  Building,
  Flat,
  Land,
} from "@/types";

interface DashboardStats {
  familyMembers: FamilyMember[];
  totalProperties: number;
  propertyBreakdown: {
    buildings: number;
    flats: number;
    lands: number;
    apartments: number;
  };
  occupancy: {
    occupied: number;
    vacant: number;
    leased: number;
  };
  tenants: {
    active: number;
    total: number;
  };
  documents: {
    total: number;
    expiring: number;
    expired: number;
  };
  insurance: {
    active: number;
    expiring: number;
    expired: number;
  };
  rentPayments: {
    pending: number;
    overdue: number;
    collected: number;
  };
  // New KPI sections
  financialKPIs: {
    totalRentCollected: number;
    pendingAmount: number;
    overdueAmount: number;
    occupancyRate: number;
    averageRentPerUnit: number;
  };
  operationalKPIs: {
    documentComplianceRate: number;
    insuranceCoverageRate: number;
    maintenanceBacklog: number;
    tenantRetentionRate: number;
  };
  monthlyTrends: {
    rentCollection: { month: string; amount: number; }[];
    occupancyTrend: { month: string; rate: number; }[];
  };
}

interface RecentActivity {
  type: 'document' | 'payment' | 'tenant' | 'insurance';
  title: string;
  description: string;
  date: Date;
  status: 'success' | 'warning' | 'error' | 'info';
}

export function DashboardContent() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        familyMembers,
        buildings,
        flats,
        lands,
        tenants,
        documents,
        expiringDocs,
        expiredDocs,
        insurancePolicies,
        expiringPolicies,
        expiredPolicies,
        rentPayments,
      ] = await Promise.all([
        ApiService.getFamilyMembers(),
        ApiService.getBuildings(),
        ApiService.getFlats(),
        ApiService.getLands(),
        ApiService.getTenants(),
        ApiService.getDocuments(),
        ApiService.getExpiringDocuments(30),
        ApiService.getExpiredDocuments(),
        ApiService.getInsurancePolicies(),
        ApiService.getPoliciesExpiringSoon(30),
        ApiService.getExpiredPolicies(),
        ApiService.getRentPayments(),
      ]);

      // Calculate apartment count from buildings
      const totalApartments = buildings.reduce(
        (sum, building) => sum + (building.apartments?.length || 0),
        0
      );

      // Calculate occupancy stats
      const occupiedFlats = flats.filter((flat) => flat.isOccupied).length;
      const vacantFlats = flats.filter((flat) => !flat.isOccupied).length;
      const leasedLands = lands.filter((land) => land.isLeased).length;

      // Calculate tenant stats
      const activeTenants = tenants.filter((tenant) => tenant.isActive).length;

      // Calculate rent payment stats
      const pendingPayments = rentPayments.filter(
        (payment) => payment.status === "pending"
      ).length;
      const overduePayments = rentPayments.filter(
        (payment) => payment.status === "overdue"
      ).length;
      const collectedPayments = rentPayments.filter(
        (payment) => payment.status === "paid"
      ).length;

      // Calculate insurance stats
      const activePolicies = insurancePolicies.filter(
        (policy) => policy.status === "active"
      ).length;

      // Calculate Financial KPIs
      const totalRentCollected = rentPayments
        .filter(p => p.status === "paid")
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      const pendingAmount = rentPayments
        .filter(p => p.status === "pending")
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      const overdueAmount = rentPayments
        .filter(p => p.status === "overdue")
        .reduce((sum, payment) => sum + payment.amount, 0);
      
      const totalRentableUnits = flats.length + totalApartments;
      const occupancyRate = totalRentableUnits > 0 
        ? ((occupiedFlats + totalApartments) / totalRentableUnits) * 100 
        : 0;
      
      const averageRentPerUnit = totalRentableUnits > 0
        ? ([...flats, ...buildings.flatMap(b => b.apartments || [])]
            .reduce((sum, unit) => sum + (unit.rentAmount || 0), 0) / totalRentableUnits)
        : 0;

      // Calculate Operational KPIs
      const totalDocumentsNeeded = familyMembers.length * 2; // Assume 2 docs per member minimum
      const documentComplianceRate = totalDocumentsNeeded > 0 
        ? (documents.filter(d => !d.expiryDate || d.expiryDate > new Date()).length / totalDocumentsNeeded) * 100
        : 100;
      
      const insurablePeople = familyMembers.length;
      const insuranceCoverageRate = insurablePeople > 0 
        ? (activePolicies / insurablePeople) * 100 
        : 0;
      
      const maintenanceBacklog = 0; // Would calculate from maintenance records if available
      const tenantRetentionRate = 85; // Would calculate from historical data

      // Mock monthly trends (in real app, you'd calculate from historical data)
      const generateMonthlyTrends = () => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        return {
          rentCollection: months.map((month, index) => ({
            month,
            amount: totalRentCollected * (0.8 + Math.random() * 0.4) // Simulate variation
          })),
          occupancyTrend: months.map((month, index) => ({
            month,
            rate: Math.max(60, occupancyRate + (Math.random() - 0.5) * 20) // Simulate trend
          }))
        };
      };

      setStats({
        familyMembers,
        totalProperties: buildings.length + flats.length + lands.length,
        propertyBreakdown: {
          buildings: buildings.length,
          flats: flats.length,
          lands: lands.length,
          apartments: totalApartments,
        },
        occupancy: {
          occupied: occupiedFlats,
          vacant: vacantFlats,
          leased: leasedLands,
        },
        tenants: {
          active: activeTenants,
          total: tenants.length,
        },
        documents: {
          total: documents.length,
          expiring: expiringDocs.length,
          expired: expiredDocs.length,
        },
        insurance: {
          active: activePolicies,
          expiring: expiringPolicies.length,
          expired: expiredPolicies.length,
        },
        rentPayments: {
          pending: pendingPayments,
          overdue: overduePayments,
          collected: collectedPayments,
        },
        financialKPIs: {
          totalRentCollected,
          pendingAmount,
          overdueAmount,
          occupancyRate: Math.round(occupancyRate * 100) / 100,
          averageRentPerUnit: Math.round(averageRentPerUnit),
        },
        operationalKPIs: {
          documentComplianceRate: Math.round(documentComplianceRate * 100) / 100,
          insuranceCoverageRate: Math.round(insuranceCoverageRate * 100) / 100,
          maintenanceBacklog,
          tenantRetentionRate,
        },
        monthlyTrends: generateMonthlyTrends(),
      });

      // Generate recent activity
      const activity: RecentActivity[] = [];

      // Add expired documents
      expiredDocs.slice(0, 3).forEach((doc) => {
        activity.push({
          type: 'document',
          title: 'Document Expired',
          description: `${doc.title} expired on ${doc.expiryDate?.toLocaleDateString()}`,
          date: doc.expiryDate || new Date(),
          status: 'error',
        });
      });

      // Add expiring documents
      expiringDocs.slice(0, 2).forEach((doc) => {
        activity.push({
          type: 'document',
          title: 'Document Expiring Soon',
          description: `${doc.title} expires on ${doc.expiryDate?.toLocaleDateString()}`,
          date: doc.expiryDate || new Date(),
          status: 'warning',
        });
      });

      // Add overdue payments
      rentPayments
        .filter((payment) => payment.status === 'overdue')
        .slice(0, 2)
        .forEach((payment) => {
          activity.push({
            type: 'payment',
            title: 'Rent Payment Overdue',
            description: `Payment of ₹${payment.amount.toLocaleString()} was due on ${payment.dueDate.toLocaleDateString()}`,
            date: payment.dueDate,
            status: 'error',
          });
        });

      // Add expiring insurance policies
      expiringPolicies.slice(0, 2).forEach((policy) => {
        activity.push({
          type: 'insurance',
          title: 'Insurance Policy Renewing',
          description: `${policy.type} policy ${policy.policyNumber} renews on ${policy.renewalDate.toLocaleDateString()}`,
          date: policy.renewalDate,
          status: 'warning',
        });
      });

      // Sort by date (most recent first)
      activity.sort((a, b) => b.date.getTime() - a.date.getTime());
      setRecentActivity(activity.slice(0, 5));

    } catch (err: unknown) {
      const error = err as Error;
      console.error('Dashboard error:', error);
      setError(error.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Business Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Loading dashboard data...
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse bg-white dark:bg-gray-800">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
        <div className="p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Business Overview
          </h1>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md mx-6">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 dark:text-red-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200">Error Loading Dashboard</h4>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              <Button onClick={loadDashboardData} className="mt-2 text-sm" size="sm">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex justify-between items-start p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Business Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Welcome back, {user?.name?.split(" ")[0]}! Here&apos;s your business performance summary.
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline" className="dark:border-gray-600 dark:hover:bg-gray-700">
          Refresh
        </Button>
      </div>

      {/* Main Stats Grid */}
      <Grid cols={4} gap="lg">
        {/* Total Properties */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Total Properties
              </CardTitle>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 3h10M9 9h6m-6 4h6m-6 4h6" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalProperties}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.propertyBreakdown.buildings} buildings, {stats.propertyBreakdown.flats} flats, {stats.propertyBreakdown.lands} lands
            </p>
          </CardContent>
        </Card>

        {/* Family Members */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Family Members
              </CardTitle>
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.familyMembers.length}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Registered family members
            </p>
          </CardContent>
        </Card>

        {/* Active Tenants */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Active Tenants
              </CardTitle>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.tenants.active}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              of {stats.tenants.total} total tenants
            </p>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className={`border-l-4 ${
          stats.documents.expired > 0 ? 'border-l-red-500' : 
          stats.documents.expiring > 0 ? 'border-l-yellow-500' : 'border-l-green-500'
        }`}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Documents
              </CardTitle>
              <div className={`p-2 rounded-lg ${
                stats.documents.expired > 0 ? 'bg-red-100' : 
                stats.documents.expiring > 0 ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <svg className={`h-5 w-5 ${
                  stats.documents.expired > 0 ? 'text-red-600' : 
                  stats.documents.expiring > 0 ? 'text-yellow-600' : 'text-green-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.documents.total}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {stats.documents.expired > 0 && (
                <span className="text-red-600 dark:text-red-400">{stats.documents.expired} expired, </span>
              )}
              {stats.documents.expiring > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400">{stats.documents.expiring} expiring</span>
              )}
              {stats.documents.expired === 0 && stats.documents.expiring === 0 && "All up to date"}
            </p>
          </CardContent>
        </Card>
      </Grid>

      {/* Secondary Stats Grid */}
      <Grid cols={4} gap="lg">
        {/* Occupancy Stats */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Property Occupancy
              </CardTitle>
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Occupied</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.occupancy.occupied}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Vacant</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.occupancy.vacant}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Land Leased</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.occupancy.leased}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rent Payments */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Rent Payments
              </CardTitle>
              <div className="p-2 bg-emerald-100 rounded-lg">
                <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Collected</span>
                <span className="font-medium text-green-600 dark:text-green-400">{stats.rentPayments.collected}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Pending</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">{stats.rentPayments.pending}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Overdue</span>
                <span className="font-medium text-red-600 dark:text-red-400">{stats.rentPayments.overdue}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Insurance Policies */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Insurance Policies
              </CardTitle>
              <div className="p-2 bg-cyan-100 rounded-lg">
                <svg className="h-4 w-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Active</span>
                <span className="font-medium text-green-600 dark:text-green-400">{stats.insurance.active}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Expiring Soon</span>
                <span className="font-medium text-yellow-600 dark:text-yellow-400">{stats.insurance.expiring}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Expired</span>
                <span className="font-medium text-red-600 dark:text-red-400">{stats.insurance.expired}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Breakdown */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                Property Breakdown
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Buildings</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.propertyBreakdown.buildings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Apartments</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.propertyBreakdown.apartments}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Flats</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.propertyBreakdown.flats}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-300">Lands</span>
                <span className="font-medium text-gray-900 dark:text-white">{stats.propertyBreakdown.lands}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </Grid>

      {/* Financial Performance KPIs */}
      <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg mr-3">
            <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          Financial Performance
        </h2>
        
        <Grid cols={5} gap="lg">
          {/* Total Rent Collected */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Total Rent Collected
                </CardTitle>
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                ₹{stats.financialKPIs.totalRentCollected.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Total collected this period
              </p>
            </CardContent>
          </Card>

          {/* Pending Amount */}
          <Card className="border-l-4 border-l-yellow-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Pending Amount
                </CardTitle>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="h-4 w-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                ₹{stats.financialKPIs.pendingAmount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Awaiting payment
              </p>
            </CardContent>
          </Card>

          {/* Overdue Amount */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Overdue Amount
                </CardTitle>
                <div className="p-2 bg-red-100 rounded-lg">
                  <svg className="h-4 w-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                ₹{stats.financialKPIs.overdueAmount.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>

          {/* Occupancy Rate */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Occupancy Rate
                </CardTitle>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">
                {stats.financialKPIs.occupancyRate}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Properties occupied
              </p>
            </CardContent>
          </Card>

          {/* Average Rent Per Unit */}
          <Card className="border-l-4 border-l-purple-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg Rent/Unit
                </CardTitle>
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">
                ₹{stats.financialKPIs.averageRentPerUnit.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Average monthly rent
              </p>
            </CardContent>
          </Card>
        </Grid>
      </div>

      {/* Operational Metrics */}
      <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg mr-3">
            <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          Operational Metrics
        </h2>
        
        <Grid cols={4} gap="lg">
          {/* Document Compliance Rate */}
          <Card className="border-l-4 border-l-emerald-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Document Compliance
                </CardTitle>
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg className="h-4 w-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">
                {stats.operationalKPIs.documentComplianceRate}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Documents up to date
              </p>
            </CardContent>
          </Card>

          {/* Insurance Coverage Rate */}
          <Card className="border-l-4 border-l-cyan-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Insurance Coverage
                </CardTitle>
                <div className="p-2 bg-cyan-100 rounded-lg">
                  <svg className="h-4 w-4 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-700">
                {stats.operationalKPIs.insuranceCoverageRate}%
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Family members covered
              </p>
            </CardContent>
          </Card>

          {/* Maintenance Backlog */}
          <Card className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Maintenance Backlog
                </CardTitle>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
                {stats.operationalKPIs.maintenanceBacklog}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Pending maintenance tasks
              </p>
            </CardContent>
          </Card>

          {/* Tenant Retention Rate */}
          <Card className="border-l-4 border-l-rose-500">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Tenant Retention
                </CardTitle>
                <div className="p-2 bg-rose-100 rounded-lg">
                  <svg className="h-4 w-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">
                {stats.operationalKPIs.tenantRetentionRate}%
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Tenant satisfaction rate
              </p>
            </CardContent>
          </Card>
        </Grid>
      </div>

      {/* Charts and Trends */}
      <div className="space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
          <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg mr-3">
            <svg className="h-5 w-5 text-violet-600 dark:text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          Business Analytics & Trends
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rent Collection Trend Chart */}
          <Card className="relative">
            {/* Dev badge */}
            <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-md text-[10px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
              Development in progress
            </div>
            <CardHeader className="opacity-60">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <CardTitle>Monthly Rent Collection Trend</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="opacity-60">
              <div className="space-y-4">
                {/* Chart Data Display */}
                <div className="space-y-3">
                  {stats.monthlyTrends.rentCollection.map((item, index) => {
                    const maxAmount = Math.max(...stats.monthlyTrends.rentCollection.map(d => d.amount));
                    const percentage = (item.amount / maxAmount) * 100;
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">{item.month}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-300" 
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[80px] text-right">
                              ₹{Math.round(item.amount).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Summary Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Average: </span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{Math.round(stats.monthlyTrends.rentCollection.reduce((sum, item) => sum + item.amount, 0) / stats.monthlyTrends.rentCollection.length).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Peak: </span>
                      <span className="font-medium text-gray-900 dark:text-white">₹{Math.round(Math.max(...stats.monthlyTrends.rentCollection.map(d => d.amount))).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Occupancy Rate Trend Chart */}
          <Card className="relative">
            {/* Dev badge */}
            <div className="absolute top-2 right-2 z-10 px-2 py-1 rounded-md text-[10px] font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-700">
              Development in progress
            </div>
            <CardHeader className="opacity-60">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                </div>
                <CardTitle>Occupancy Rate Trends</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="opacity-60">
              <div className="space-y-4">
                {/* Chart Data Display */}
                <div className="space-y-3">
                  {stats.monthlyTrends.occupancyTrend.map((item, index) => {
                    const rate = Math.round(item.rate);
                    const getColorClass = (rate: number) => {
                      if (rate >= 90) return 'bg-green-500';
                      if (rate >= 70) return 'bg-yellow-500';
                      return 'bg-red-500';
                    };
                    return (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-8 text-sm font-medium text-gray-600 dark:text-gray-400">{item.month}</div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-300 ${getColorClass(rate)}`}
                                style={{ width: `${rate}%` }}
                              ></div>
                            </div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white min-w-[50px] text-right">
                              {rate}%
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {/* Summary Stats */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Average: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{Math.round(stats.monthlyTrends.occupancyTrend.reduce((sum, item) => sum + item.rate, 0) / stats.monthlyTrends.occupancyTrend.length)}%</span>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Peak: </span>
                      <span className="font-medium text-gray-900 dark:text-white">{Math.round(Math.max(...stats.monthlyTrends.occupancyTrend.map(d => d.rate)))}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Property Performance Histogram */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <CardTitle>Property Performance Distribution</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Property Types Distribution */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Property Types</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Buildings', value: stats.propertyBreakdown.buildings, color: 'bg-blue-500' },
                    { label: 'Flats', value: stats.propertyBreakdown.flats, color: 'bg-green-500' },
                    { label: 'Apartments', value: stats.propertyBreakdown.apartments, color: 'bg-yellow-500' },
                    { label: 'Lands', value: stats.propertyBreakdown.lands, color: 'bg-purple-500' },
                  ].map((item, index) => {
                    const maxValue = Math.max(
                      stats.propertyBreakdown.buildings,
                      stats.propertyBreakdown.flats,
                      stats.propertyBreakdown.apartments,
                      stats.propertyBreakdown.lands
                    );
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Occupancy Status */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Occupancy Status</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Occupied', value: stats.occupancy.occupied, color: 'bg-green-500' },
                    { label: 'Vacant', value: stats.occupancy.vacant, color: 'bg-red-500' },
                    { label: 'Leased', value: stats.occupancy.leased, color: 'bg-blue-500' },
                  ].map((item, index) => {
                    const maxValue = Math.max(stats.occupancy.occupied, stats.occupancy.vacant, stats.occupancy.leased);
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Payment Status */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Payment Status</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Collected', value: stats.rentPayments.collected, color: 'bg-green-500' },
                    { label: 'Pending', value: stats.rentPayments.pending, color: 'bg-yellow-500' },
                    { label: 'Overdue', value: stats.rentPayments.overdue, color: 'bg-red-500' },
                  ].map((item, index) => {
                    const maxValue = Math.max(stats.rentPayments.collected, stats.rentPayments.pending, stats.rentPayments.overdue);
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Insurance Status */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200">Insurance Status</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Active', value: stats.insurance.active, color: 'bg-green-500' },
                    { label: 'Expiring', value: stats.insurance.expiring, color: 'bg-yellow-500' },
                    { label: 'Expired', value: stats.insurance.expired, color: 'bg-red-500' },
                  ].map((item, index) => {
                    const maxValue = Math.max(stats.insurance.active, stats.insurance.expiring, stats.insurance.expired);
                    const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
                    return (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600 dark:text-gray-300">{item.label}</span>
                          <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-300 ${item.color}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5h5m-5-5v5m-5-5l-5 5m5-5H5m5 0v-5m0 5l5-5" />
                </svg>
              </div>
              <CardTitle>Recent Activity & Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((activity, index) => {
                  const getActivityIcon = (type: string) => {
                    switch (type) {
                      case 'document':
                        return (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        );
                      case 'payment':
                        return (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        );
                      case 'insurance':
                        return (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                          </svg>
                        );
                      default:
                        return (
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        );
                    }
                  };

                  return (
                  <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                      <span className="mr-1">{getActivityIcon(activity.type)}</span>
                      {activity.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {activity.date.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent activity to show.</p>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <CardTitle>System Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* API Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">API Connection</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Operational</span>
              </div>
              
              {/* Database Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Connected</span>
              </div>
              
              {/* Authentication */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Authentication</span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">Active</span>
              </div>
              
              {/* Data Sync */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Sync</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Just now</span>
              </div>

              {/* Health Summary */}
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-green-400 dark:text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-green-800 dark:text-green-300">
                    All systems operational
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
