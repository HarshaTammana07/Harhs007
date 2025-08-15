"use client";

import { Tenant } from "@/types";
import { Card, CardContent, Button } from "@/components/ui";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

interface TenantCardProps {
  tenant: Tenant;
  onView?: (tenant: Tenant) => void;
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
  showActions?: boolean;
  propertyInfo?: {
    propertyName: string;
    propertyType: string;
    unitInfo?: string;
  };
}

export function TenantCard({
  tenant,
  onView,
  onEdit,
  onDelete,
  showActions = true,
  propertyInfo,
}: TenantCardProps) {
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  const getTenancyDuration = () => {
    const moveInDate = new Date(tenant.moveInDate);
    const endDate = tenant.moveOutDate
      ? new Date(tenant.moveOutDate)
      : new Date();
    const diffTime = Math.abs(endDate.getTime() - moveInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) {
      return `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""}`;
    } else {
      const years = Math.floor(diffDays / 365);
      const remainingMonths = Math.floor((diffDays % 365) / 30);
      return `${years} year${years > 1 ? "s" : ""}${remainingMonths > 0 ? ` ${remainingMonths} month${remainingMonths > 1 ? "s" : ""}` : ""}`;
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {tenant.personalInfo.fullName}
              </h3>
              <p className="text-sm text-gray-600">
                {tenant.personalInfo.occupation}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                tenant.isActive
              )}`}
            >
              {tenant.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Property Information */}
        {propertyInfo && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <MapPinIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {propertyInfo.propertyName}
                </p>
                <p className="text-xs text-gray-600">
                  {propertyInfo.propertyType}
                  {propertyInfo.unitInfo && ` • ${propertyInfo.unitInfo}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center space-x-2">
            <PhoneIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-700">
              {tenant.contactInfo.phone}
            </span>
          </div>
          {tenant.contactInfo.email && (
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-700">
                {tenant.contactInfo.email}
              </span>
            </div>
          )}
        </div>

        {/* Rental Information */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <CurrencyRupeeIcon className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Monthly Rent</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatCurrency(tenant.rentalAgreement.rentAmount)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Move-in Date</p>
              <p className="text-sm font-semibold text-gray-900">
                {formatDate(tenant.moveInDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Tenancy Duration */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-600">Tenancy Duration</p>
              <p className="text-sm font-semibold text-gray-900">
                {getTenancyDuration()}
              </p>
            </div>
          </div>
        </div>

        {/* Agreement Information */}
        <div className="mb-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-600">Agreement</p>
              <p className="text-sm font-medium text-gray-900">
                {tenant.rentalAgreement.agreementNumber}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Security Deposit</p>
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(tenant.rentalAgreement.securityDeposit)}
              </p>
            </div>
          </div>
        </div>

        {/* Family Information */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Family Size:</span>
              <span className="font-medium text-gray-900">
                {tenant.personalInfo.familySize} member
                {tenant.personalInfo.familySize !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Status:</span>
              <span className="font-medium text-gray-900 capitalize">
                {tenant.personalInfo.maritalStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-1">Emergency Contact</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {tenant.emergencyContact.name}
              </p>
              <p className="text-xs text-gray-600">
                {tenant.emergencyContact.relationship}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-900">
                {tenant.emergencyContact.phone}
              </p>
            </div>
          </div>
        </div>

        {/* Documents Count */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="text-sm text-gray-600">
              Documents: {tenant.documents.length}
            </div>
            <div className="text-sm text-gray-600">
              References: {tenant.references.length}
            </div>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(tenant)}
                  className="flex items-center space-x-1"
                >
                  <EyeIcon className="h-4 w-4" />
                  <span>View</span>
                </Button>
              )}
              {onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(tenant)}
                  className="flex items-center space-x-1"
                >
                  <PencilIcon className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
            {onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(tenant)}
                className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50"
              >
                <TrashIcon className="h-4 w-4" />
                <span>Delete</span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
