"use client";

import { useState } from "react";
import { Tenant, Document } from "@/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Modal,
} from "@/components/ui";
import { SimpleFilePreview } from "@/components/ui/SimpleFilePreview";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  BanknotesIcon,
  HomeIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

interface TenantDetailProps {
  tenant: Tenant;
  onEdit?: (tenant: Tenant) => void;
  onDelete?: (tenant: Tenant) => void;
  onClose?: () => void;
  isModal?: boolean;
  propertyInfo?: {
    propertyName: string;
    propertyType: string;
    unitInfo?: string;
  };
}

export function TenantDetail({
  tenant,
  onEdit,
  onDelete,
  onClose,
  isModal = false,
  propertyInfo,
}: TenantDetailProps) {
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );

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
      month: "long",
      day: "numeric",
    });
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

  const getAgreementStatus = () => {
    const endDate = new Date(tenant.rentalAgreement.endDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil(
      (endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return {
        status: "Expired",
        color: "text-red-600",
        bgColor: "bg-red-100",
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: "Expiring Soon",
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      };
    } else {
      return {
        status: "Active",
        color: "text-green-600",
        bgColor: "bg-green-100",
      };
    }
  };

  const agreementStatus = getAgreementStatus();

  const content = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full">
            <UserIcon className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {tenant.personalInfo.fullName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              {tenant.personalInfo.occupation}
              {tenant.personalInfo.employer &&
                ` at ${tenant.personalInfo.employer}`}
            </p>
            <div className="flex items-center space-x-4 mt-2">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tenant.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {tenant.isActive ? "Active Tenant" : "Inactive Tenant"}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${agreementStatus.bgColor} ${agreementStatus.color}`}
              >
                Agreement {agreementStatus.status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {onEdit && (
            <Button
              variant="outline"
              onClick={() => onEdit(tenant)}
              className="flex items-center space-x-2"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outline"
              onClick={() => onDelete(tenant)}
              className="flex items-center space-x-2 text-red-600 border-red-300 hover:bg-red-50"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Delete</span>
            </Button>
          )}
          {isModal && onClose && (
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center space-x-2"
            >
              <XMarkIcon className="h-4 w-4" />
              <span>Close</span>
            </Button>
          )}
        </div>
      </div>

      {/* Property Information */}
      {propertyInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <HomeIcon className="h-5 w-5 mr-2" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-full">
                <HomeIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {propertyInfo.propertyName}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {propertyInfo.propertyType.charAt(0).toUpperCase() +
                    propertyInfo.propertyType.slice(1)}
                  {propertyInfo.unitInfo && ` • ${propertyInfo.unitInfo}`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Full Name
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {tenant.personalInfo.fullName}
                    </p>
                  </div>

                  {tenant.personalInfo.dateOfBirth && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Date of Birth
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatDate(tenant.personalInfo.dateOfBirth)}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Occupation
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {tenant.personalInfo.occupation}
                    </p>
                  </div>

                  {tenant.personalInfo.employer && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Employer
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {tenant.personalInfo.employer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {tenant.personalInfo.monthlyIncome && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Monthly Income
                      </label>
                      <p className="text-gray-900 dark:text-white font-semibold">
                        {formatCurrency(tenant.personalInfo.monthlyIncome)}
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Marital Status
                    </label>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {tenant.personalInfo.maritalStatus}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Family Size
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {tenant.personalInfo.familySize} member
                      {tenant.personalInfo.familySize !== 1 ? "s" : ""}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Nationality
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {tenant.personalInfo.nationality}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Phone
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium">
                        {tenant.contactInfo.phone}
                      </p>
                    </div>
                  </div>

                  {tenant.contactInfo.email && (
                    <div className="flex items-center space-x-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Email
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {tenant.contactInfo.email}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {tenant.contactInfo.address && (
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          Address
                        </label>
                        <p className="text-gray-900 dark:text-white">
                          {tenant.contactInfo.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Name
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {tenant.emergencyContact.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Relationship
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {tenant.emergencyContact.relationship}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Phone
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {tenant.emergencyContact.phone}
                    </p>
                  </div>
                  {tenant.emergencyContact.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {tenant.emergencyContact.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {tenant.emergencyContact.address && (
                <div className="mt-4">
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Address
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {tenant.emergencyContact.address}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Rental Agreement Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Rental Agreement Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Agreement Number
                    </label>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {tenant.rentalAgreement.agreementNumber}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Start Date
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(tenant.rentalAgreement.startDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      End Date
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatDate(tenant.rentalAgreement.endDate)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Payment Method
                    </label>
                    <p className="text-gray-900 dark:text-white capitalize">
                      {tenant.rentalAgreement.paymentMethod.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Monthly Rent
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">
                      {formatCurrency(tenant.rentalAgreement.rentAmount)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Security Deposit
                    </label>
                    <p className="text-gray-900 dark:text-white font-semibold">
                      {formatCurrency(tenant.rentalAgreement.securityDeposit)}
                    </p>
                  </div>
                  {tenant.rentalAgreement.maintenanceCharges && (
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                        Maintenance Charges
                      </label>
                      <p className="text-gray-900 dark:text-white">
                        {formatCurrency(
                          tenant.rentalAgreement.maintenanceCharges
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Rent Due Date
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {tenant.rentalAgreement.rentDueDate} of every month
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Notice Period
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {tenant.rentalAgreement.noticePeriod} days
                  </p>
                </div>
                {tenant.rentalAgreement.lateFeeAmount && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Late Fee
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {formatCurrency(tenant.rentalAgreement.lateFeeAmount)}
                    </p>
                  </div>
                )}
              </div>

              {tenant.rentalAgreement.renewalTerms && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Renewal Terms
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {tenant.rentalAgreement.renewalTerms}
                  </p>
                </div>
              )}

              {tenant.rentalAgreement.specialConditions &&
                tenant.rentalAgreement.specialConditions.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                      Special Conditions
                    </label>
                    <ul className="text-gray-900 dark:text-white list-disc list-inside space-y-1">
                      {tenant.rentalAgreement.specialConditions.map(
                        (condition, index) => (
                          <li key={index}>{condition}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* References */}
          {tenant.references.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  References ({tenant.references.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {tenant.references.map((reference, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {reference.name}
                        </h4>
                        {reference.verified && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Verified
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Relationship:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {reference.relationship}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-300">Phone:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {reference.phone}
                          </span>
                        </div>
                        {reference.email && (
                          <div>
                            <span className="text-gray-600 dark:text-gray-300">Email:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {reference.email}
                            </span>
                          </div>
                        )}
                        {reference.address && (
                          <div className="md:col-span-2">
                            <span className="text-gray-600 dark:text-gray-300">Address:</span>
                            <span className="ml-2 text-gray-900 dark:text-white">
                              {reference.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tenancy Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Tenancy Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Move-in Date
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {formatDate(tenant.moveInDate)}
                </p>
              </div>
              {tenant.moveOutDate && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Move-out Date
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {formatDate(tenant.moveOutDate)}
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Duration
                </label>
                <p className="text-gray-900 dark:text-white font-medium">
                  {getTenancyDuration()}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Status
                </label>
                <p
                  className={`font-medium ${tenant.isActive ? "text-green-600" : "text-red-600"}`}
                >
                  {tenant.isActive ? "Active" : "Inactive"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IdentificationIcon className="h-5 w-5 mr-2" />
                Identification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tenant.identification.aadharNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Aadhar Number
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono">
                    {tenant.identification.aadharNumber}
                  </p>
                </div>
              )}
              {tenant.identification.panNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    PAN Number
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono">
                    {tenant.identification.panNumber}
                  </p>
                </div>
              )}
              {tenant.identification.drivingLicense && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Driving License
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono">
                    {tenant.identification.drivingLicense}
                  </p>
                </div>
              )}
              {tenant.identification.passport && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Passport
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono">
                    {tenant.identification.passport}
                  </p>
                </div>
              )}
              {tenant.identification.voterIdNumber && (
                <div>
                  <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    Voter ID
                  </label>
                  <p className="text-gray-900 dark:text-white font-mono">
                    {tenant.identification.voterIdNumber}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          {tenant.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DocumentTextIcon className="h-5 w-5 mr-2" />
                  Documents ({tenant.documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {tenant.documents.map((document) => (
                    <div
                      key={document.id}
                      className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                      onClick={() => setSelectedDocument(document)}
                    >
                      <div className="flex items-center space-x-2">
                        <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {document.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {document.category}
                          </p>
                        </div>
                      </div>
                      <EyeIcon className="h-4 w-4 text-gray-400" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <Modal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          size="4xl"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedDocument.title}
              </h3>
              <Button
                variant="outline"
                onClick={() => setSelectedDocument(null)}
              >
                <XMarkIcon className="h-4 w-4" />
              </Button>
            </div>
            <SimpleFilePreview document={selectedDocument} />
          </div>
        </Modal>
      )}
    </div>
  );

  if (isModal) {
    return (
      <Modal isOpen={true} onClose={onClose} size="6xl">
        <div className="p-6 max-h-[90vh] overflow-y-auto">{content}</div>
      </Modal>
    );
  }

  return content;
}
