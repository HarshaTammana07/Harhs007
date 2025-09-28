"use client";

import { useState, useEffect } from "react";
import { Tenant } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { tenantService } from "@/services/TenantService";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import {
  UsersIcon,
  CurrencyRupeeIcon,
  ExclamationTriangleIcon,
  CalendarIcon,
  DocumentTextIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalMonthlyRent: number;
  averageRent: number;
  expiringAgreements: number;
  overdueRents: number;
  totalSecurityDeposits: number;
}

interface TenantDashboardProps {
  onViewTenant?: (tenant: Tenant) => void;
  onManageTenants?: () => void;
}

export function TenantDashboard({
  onViewTenant,
  onManageTenants,
}: TenantDashboardProps) {
  const [stats, setStats] = useState<TenantStats>({
    totalTenants: 0,
    activeTenants: 0,
    inactiveTenants: 0,
    totalMonthlyRent: 0,
    averageRent: 0,
    expiringAgreements: 0,
    overdueRents: 0,
    totalSecurityDeposits: 0,
  });
  const [expiringTenants, setExpiringTenants] = useState<Tenant[]>([]);
  const [overdueTenants, setOverdueTenants] = useState<
    Array<{
      tenant: Tenant;
      daysPastDue: number;
      overdueAmount: number;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Get all tenants from properties
      const allTenants: Tenant[] = [];

      // Get tenants from buildings
      const buildings = await propertyService.getBuildings();
      buildings.forEach((building) => {
        building.apartments?.forEach((apartment) => {
          if (apartment.currentTenant) {
            allTenants.push(apartment.currentTenant);
          }
        });
      });

      // Get tenants from flats
      const flats = await propertyService.getFlats();
      flats.forEach((flat) => {
        if (flat.currentTenant) {
          allTenants.push(flat.currentTenant);
        }
      });

      // Get tenants from lands
      const lands = await propertyService.getLands();
      lands.forEach((land) => {
        if (land.currentTenant) {
          allTenants.push(land.currentTenant);
        }
      });

      // Calculate statistics
      const totalTenants = allTenants.length;
      const activeTenants = allTenants.filter((t) => t.isActive).length;
      const inactiveTenants = totalTenants - activeTenants;

      const totalMonthlyRent = allTenants
        .filter((t) => t.isActive)
        .reduce((sum, t) => sum + t.rentalAgreement.rentAmount, 0);

      const averageRent =
        activeTenants > 0 ? totalMonthlyRent / activeTenants : 0;

      const totalSecurityDeposits = allTenants
        .filter((t) => t.isActive)
        .reduce((sum, t) => sum + t.rentalAgreement.securityDeposit, 0);

      // Get expiring agreements (next 30 days)
      const expiringTenantsData =
        tenantService.getTenantsWithExpiringAgreements(30);
      const expiringAgreements = expiringTenantsData.length;

      // Get overdue rents
      const overdueTenantsData = tenantService.getOverdueRentTenants();
      const overdueRents = overdueTenantsData.length;

      setStats({
        totalTenants,
        activeTenants,
        inactiveTenants,
        totalMonthlyRent,
        averageRent,
        expiringAgreements,
        overdueRents,
        totalSecurityDeposits,
      });

      setExpiringTenants(expiringTenantsData);
      setOverdueTenants(overdueTenantsData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast.error("Failed to load tenant dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tenant Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Overview of all tenant information and rental management
          </p>
        </div>
        {onManageTenants && (
          <Button
            onClick={onManageTenants}
            className="flex items-center space-x-2"
          >
            <UsersIcon className="h-4 w-4" />
            <span>Manage Tenants</span>
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Tenants */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <UsersIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Total Tenants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.totalTenants}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Tenants */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-3 rounded-full">
                <UsersIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Active Tenants</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.activeTenants}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Rent Collection */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <CurrencyRupeeIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Monthly Rent</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(stats.totalMonthlyRent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Average Rent */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-indigo-100 p-3 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Average Rent</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {formatCurrency(stats.averageRent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Deposits */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-yellow-100 p-3 rounded-full">
                <CurrencyRupeeIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Security Deposits</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {formatCurrency(stats.totalSecurityDeposits)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Expiring Agreements */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <CalendarIcon className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Expiring Soon</p>
                <p className="text-2xl font-bold text-orange-600">
                  {stats.expiringAgreements}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overdue Rents */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-red-100 p-3 rounded-full">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Overdue Rents</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.overdueRents}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inactive Tenants */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gray-100 p-3 rounded-full">
                <UsersIcon className="h-6 w-6 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Inactive Tenants</p>
                <p className="text-2xl font-bold text-gray-600">
                  {stats.inactiveTenants}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts and Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring Agreements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2 text-orange-600" />
              Agreements Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringTenants.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-4">
                No agreements expiring in the next 30 days
              </p>
            ) : (
              <div className="space-y-3">
                {expiringTenants.slice(0, 5).map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-3 bg-orange-50 rounded-lg cursor-pointer hover:bg-orange-100"
                    onClick={() => onViewTenant?.(tenant)}
                  >
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {tenant.personalInfo.fullName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        Agreement: {tenant.rentalAgreement.agreementNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-orange-600">
                        {formatDate(tenant.rentalAgreement.endDate)}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">Expires</p>
                    </div>
                  </div>
                ))}
                {expiringTenants.length > 5 && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center pt-2">
                    +{expiringTenants.length - 5} more expiring agreements
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Overdue Rents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 text-red-600" />
              Overdue Rent Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            {overdueTenants.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-300 text-center py-4">
                No overdue rent payments
              </p>
            ) : (
              <div className="space-y-3">
                {overdueTenants
                  .slice(0, 5)
                  .map(({ tenant, daysPastDue, overdueAmount }) => (
                    <div
                      key={tenant.id}
                      className="flex items-center justify-between p-3 bg-red-50 rounded-lg cursor-pointer hover:bg-red-100"
                      onClick={() => onViewTenant?.(tenant)}
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {tenant.personalInfo.fullName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {daysPastDue} days overdue
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-red-600">
                          {formatCurrency(overdueAmount)}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">Amount Due</p>
                      </div>
                    </div>
                  ))}
                {overdueTenants.length > 5 && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center pt-2">
                    +{overdueTenants.length - 5} more overdue payments
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={onManageTenants}
              className="flex items-center justify-center space-x-2 p-4"
            >
              <UsersIcon className="h-5 w-5" />
              <span>View All Tenants</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info("Rent collection feature coming soon")}
              className="flex items-center justify-center space-x-2 p-4"
            >
              <CurrencyRupeeIcon className="h-5 w-5" />
              <span>Collect Rent</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => toast.info("Reports feature coming soon")}
              className="flex items-center justify-center space-x-2 p-4"
            >
              <DocumentTextIcon className="h-5 w-5" />
              <span>Generate Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
