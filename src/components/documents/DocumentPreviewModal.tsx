"use client";

import { useState, useEffect } from "react";
import { Document, FamilyMember } from "@/types";
import { ApiService } from "@/services/ApiService";
import { documentService } from "@/services/DocumentService";
import { fileService } from "@/services/FileService";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { SimpleFilePreview } from "@/components/ui/SimpleFilePreview";
import {
  ArrowDownTrayIcon,
  TrashIcon,
  TagIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  UserIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface DocumentPreviewModalProps {
  document: Document;
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
  onDelete: () => void;
}

export function DocumentPreviewModal({
  document,
  isOpen,
  onClose,
  onDownload,
  onDelete,
}: DocumentPreviewModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [familyMember, setFamilyMember] = useState<FamilyMember | null>(null);
  const [loadingFamilyMember, setLoadingFamilyMember] = useState(false);

  // Load family member details when document has a family member association
  useEffect(() => {
    const loadFamilyMember = async () => {
      if (document?.familyMemberId) {
        setLoadingFamilyMember(true);
        try {
          const member = await ApiService.getFamilyMemberById(document.familyMemberId);
          setFamilyMember(member);
        } catch (error) {
          console.error('Error loading family member:', error);
          setFamilyMember(null);
        } finally {
          setLoadingFamilyMember(false);
        }
      } else {
        setFamilyMember(null);
      }
    };

    if (isOpen) {
      loadFamilyMember();
    }
  }, [document?.familyMemberId, isOpen]);

  // Safety check
  if (!document) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Error" size="sm">
        <div className="p-4 text-center">
          <p className="text-gray-500 dark:text-gray-400">Document not found</p>
        </div>
      </Modal>
    );
  }

  const getExpiryStatus = () => {
    if (!document.expiryDate) return null;

    const now = new Date();
    const expiryDate = new Date(document.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return {
        status: "expired",
        message: `Expired ${Math.abs(daysUntilExpiry)} days ago`,
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />,
        className: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800",
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: "expiring",
        message: `Expires in ${daysUntilExpiry} days`,
        icon: <ClockIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />,
        className: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800",
      };
    }

    return null;
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const expiryStatus = getExpiryStatus();

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Document Preview" size="xl">
        <div className="space-y-6">
          {/* Document Preview */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <SimpleFilePreview
              fileData={document.fileData}
              fileName={document.fileName}
              mimeType={document.mimeType}
            />
          </div>

          {/* Document Information */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <DocumentIcon className="h-5 w-5" />
                Document Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Title
                  </label>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {document.title}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Category
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {document.category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    File Name
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {document.fileName}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    File Size
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {fileService.formatFileSize(document.fileSize)}
                  </p>
                </div>

                {document.documentNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Document Number
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {document.documentNumber}
                    </p>
                  </div>
                )}

                {document.issuer && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Issuer
                    </label>
                    <p className="text-gray-900 dark:text-white">{document.issuer}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Dates & Associations
              </h3>

              <div className="space-y-3">
                {document.issuedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Issued Date
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {format(new Date(document.issuedDate), "MMMM dd, yyyy")}
                    </p>
                  </div>
                )}

                {document.expiryDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Expiry Date
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      {format(new Date(document.expiryDate), "MMMM dd, yyyy")}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Created
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {format(
                      new Date(document.createdAt),
                      "MMMM dd, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Last Updated
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {format(
                      new Date(document.updatedAt),
                      "MMMM dd, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>

                {document.familyMemberId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      Associated Family Member
                    </label>
                    {loadingFamilyMember ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">Loading family member...</p>
                    ) : familyMember ? (
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium">
                          {familyMember.fullName} ({familyMember.nickname})
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {familyMember.relationship}
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Family member not found (ID: {document.familyMemberId})
                      </p>
                    )}
                  </div>
                )}

                {document.propertyId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      Associated Property
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      Property ID: {document.propertyId}
                    </p>
                  </div>
                )}

                {document.insurancePolicyId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Associated Insurance Policy
                    </label>
                    <p className="text-gray-900 dark:text-white">
                      Policy ID: {document.insurancePolicyId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Expiry Status */}
          {expiryStatus && (
            <div className={`p-4 rounded-lg border ${expiryStatus.className}`}>
              <div className="flex items-center gap-3">
                {expiryStatus.icon}
                <div>
                  <p className="font-medium">{expiryStatus.message}</p>
                  <p className="text-sm opacity-75">
                    {expiryStatus.status === "expired" 
                      ? "This document has expired and may need renewal."
                      : "This document will expire soon. Consider renewing it."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {document.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
                <TagIcon className="h-5 w-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
            >
              <TrashIcon className="h-4 w-4" />
              Delete Document
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Close
              </Button>
              <Button onClick={onDownload} className="flex items-center gap-2">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Document"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-200">
                Are you sure you want to delete this document?
              </p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">
                This action cannot be undone. The document &quot;{document.title}&quot;
                will be permanently removed.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white"
            >
              Delete Document
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
