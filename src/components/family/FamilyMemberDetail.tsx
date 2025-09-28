"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { FamilyMember, Document, InsurancePolicy } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { FilePreview } from "@/components/ui/FilePreview";
import { FamilyApiService } from "@/services/FamilyApiService";
import toast from "react-hot-toast";
import {
  getInitials,
  getRelationshipColor,
  hasAlerts,
  getAlertCount,
  getProfileCompletionPercentage,
} from "@/utils/familyMemberUtils";

interface FamilyMemberDetailProps {
  member: FamilyMember;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (member: FamilyMember) => void;
  onDelete?: (member: FamilyMember) => void;
}

export function FamilyMemberDetail({
  member,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}: FamilyMemberDetailProps) {
  const [activeTab, setActiveTab] = useState<
    "overview" | "documents" | "insurance"
  >("overview");
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [documents, setDocuments] = useState<Document[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMemberData = React.useCallback(async () => {
    if (!member?.id) return;
    
    try {
      setLoading(true);
      const [documentsData, policiesData] = await Promise.all([
        FamilyApiService.getDocumentsByFamilyMember(member.id),
        FamilyApiService.getInsurancePoliciesByFamilyMember(member.id),
      ]);
      
      setDocuments(documentsData);
      setInsurancePolicies(policiesData);
    } catch (error) {
      console.error("Error loading member data:", error);
      toast.error("Failed to load member documents and policies");
    } finally {
      setLoading(false);
    }
  }, [member?.id]);

  // Load documents and insurance policies when member changes
  useEffect(() => {
    if (member?.id && isOpen) {
      loadMemberData();
    }
  }, [member?.id, isOpen, loadMemberData]);

  const downloadDocument = React.useCallback((document: Document) => {
    try {
      if (!document.fileData) {
        toast.error("No file data available for download");
        return;
      }

      // Check if fileData is base64 encoded or already has data URL prefix
      let base64Data = document.fileData;
      if (base64Data.startsWith('data:')) {
        // Extract base64 part from data URL
        base64Data = base64Data.split(',')[1];
      }

      // Create a blob from the base64 data
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: document.mimeType || 'application/octet-stream' });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.fileName || `${document.title}.pdf`;
      
      // Append to body, click, and remove
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      
      // Clean up the URL
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      toast.success(`Downloaded ${document.title}`);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error(`Failed to download document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, []);

  const alertCount = getAlertCount(member);
  const hasAlert = hasAlerts(member);
  const completionPercentage = getProfileCompletionPercentage(member);
  const relationshipColor = getRelationshipColor(member.relationship);

  const calculateAge = (dateOfBirth: Date): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getUpcomingEvents = () => {
    const events = [];
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    // Birthday
    if (member.dateOfBirth) {
      const birthday = new Date(member.dateOfBirth);
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      );

      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      if (thisYearBirthday <= thirtyDaysFromNow) {
        events.push({
          type: "birthday",
          title: "Birthday",
          date: thisYearBirthday,
          description: `Turns ${calculateAge(member.dateOfBirth) + 1}`,
        });
      }
    }

    // Expiring documents
    documents.forEach((doc) => {
      if (doc.expiryDate) {
        const expiryDate = new Date(doc.expiryDate);
        if (expiryDate <= thirtyDaysFromNow && expiryDate >= today) {
          events.push({
            type: "document_expiry",
            title: `${doc.title} expires`,
            date: expiryDate,
            description: doc.category,
          });
        }
      }
    });

    // Insurance renewals
    insurancePolicies.forEach((policy) => {
      const renewalDate = new Date(policy.renewalDate);
      if (renewalDate <= thirtyDaysFromNow && renewalDate >= today) {
        events.push({
          type: "insurance_renewal",
          title: `${policy.type} policy renewal`,
          date: renewalDate,
          description: policy.provider,
        });
      }
    });

    return events.sort((a, b) => a.date.getTime() - b.date.getTime());
  };

  const upcomingEvents = getUpcomingEvents();

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={member.fullName}
        size="xl"
      >
        <div className="space-y-6">
          {/* Header Section */}
          <div className="flex items-start space-x-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              {member.profilePhoto ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src={member.profilePhoto}
                    alt={`${member.fullName} profile`}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-semibold">
                  {getInitials(member.fullName)}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {member.fullName}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300">{member.nickname}</p>
                  <div className="mt-2 flex items-center space-x-3">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${relationshipColor}`}
                    >
                      {member.relationship}
                    </span>
                    {member.dateOfBirth && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Age {calculateAge(member.dateOfBirth)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  {onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(member)}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(member)}
                      className="text-red-600 hover:text-red-700 hover:border-red-300"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>

              {/* Alerts */}
              {hasAlert && (
                <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-md p-3">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-orange-400 dark:text-orange-300"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                        {alertCount} alert{alertCount !== 1 ? "s" : ""} require
                        attention
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: "overview", label: "Overview" },
                {
                  id: "documents",
                  label: `Documents (${documents.length})`,
                },
                {
                  id: "insurance",
                  label: `Insurance (${insurancePolicies.length})`,
                },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as "overview" | "documents" | "insurance")}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Contact Information */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Phone
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {member.contactInfo.phone || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Email
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {member.contactInfo.email || "Not provided"}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Address
                      </label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                        {member.contactInfo.address || "Not provided"}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Profile Completion */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Profile Completion
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Overall completion
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {completionPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4 text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${member.fullName ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                        />
                        Full Name
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${member.nickname ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                        />
                        Nickname
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${member.relationship ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                        />
                        Relationship
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${member.profilePhoto ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                        />
                        Profile Photo
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${member.dateOfBirth ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                        />
                        Date of Birth
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${member.contactInfo.phone ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                        />
                        Phone
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${member.contactInfo.email ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                        />
                        Email
                      </div>
                      <div className="flex items-center">
                        <span
                          className={`w-2 h-2 rounded-full mr-2 ${member.contactInfo.address ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
                        />
                        Address
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Upcoming Events */}
                {upcomingEvents.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Upcoming Events
                    </h3>
                    <div className="space-y-3">
                      {upcomingEvents.map((event, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-md"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.title}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {event.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {event.date.toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {Math.ceil(
                                (event.date.getTime() - new Date().getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )}{" "}
                              days
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Statistics */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {documents.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Documents</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {insurancePolicies.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Insurance Policies
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {alertCount}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {completionPercentage}%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Profile Complete
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Loading documents...</p>
                  </div>
                ) : documents.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">📄</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No documents yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Documents will appear here when added for {member.fullName}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((document) => (
                      <Card key={document.id} className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
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
                                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                />
                              </svg>
                            </div>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-medium text-gray-900 dark:text-white truncate">
                              {document.title}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 capitalize mt-1">
                              {document.category.replace("_", " ")}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                              {document.expiryDate && (
                                <span>
                                  Expires: {new Date(document.expiryDate).toLocaleDateString()}
                                </span>
                              )}
                              {document.fileSize && (
                                <span>
                                  Size: {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                                </span>
                              )}
                              {document.issuer && (
                                <span>
                                  Issuer: {document.issuer}
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex-shrink-0 flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedDocument(document)}
                              className="whitespace-nowrap"
                            >
                              👁️ View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadDocument(document)}
                              className="whitespace-nowrap"
                            >
                              📥 Download
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "insurance" && (
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Loading insurance policies...</p>
                  </div>
                ) : insurancePolicies.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 text-6xl mb-4">🛡️</div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      No insurance policies yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Insurance policies will appear here when added for {member.fullName}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {insurancePolicies.map((policy) => (
                      <Card key={policy.id} className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {policy.type.toUpperCase()} Policy
                              </h4>
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  policy.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : policy.status === "expired"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {policy.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {policy.provider} • Policy #{policy.policyNumber}
                            </p>
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Premium:</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  ₹{policy.premiumAmount.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Coverage:</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  ₹{policy.coverageAmount.toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">
                                  Start Date:
                                </span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {new Date(
                                    policy.startDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Renewal:</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {new Date(
                                    policy.renewalDate
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Document Preview Modal */}
      {selectedDocument && (
        <Modal
          isOpen={!!selectedDocument}
          onClose={() => setSelectedDocument(null)}
          title={selectedDocument.title}
          size="lg"
        >
          <FilePreview
            document={selectedDocument}
            onDownload={downloadDocument}
            showActions={true}
          />
        </Modal>
      )}
    </>
  );
}
