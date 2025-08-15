"use client";

import { useState } from "react";
import { Document } from "@/types";
import { documentService } from "@/services/DocumentService";
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

  // Safety check
  if (!document) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Error" size="sm">
        <div className="p-4 text-center">
          <p className="text-gray-500">Document not found</p>
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
        icon: <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />,
        className: "text-red-600 bg-red-50 border-red-200",
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: "expiring",
        message: `Expires in ${daysUntilExpiry} days`,
        icon: <ClockIcon className="h-5 w-5 text-yellow-500" />,
        className: "text-yellow-600 bg-yellow-50 border-yellow-200",
      };
    }

    return null;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleDelete = () => {
    onDelete();
    setShowDeleteConfirm(false);
  };

  const expiryStatus = getExpiryStatus();

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title={document.title} size="xl">
        <div className="space-y-6">
          {/* Expiry Alert */}
          {expiryStatus && (
            <div
              className={`p-4 rounded-lg border flex items-center gap-3 ${expiryStatus.className}`}
            >
              {expiryStatus.icon}
              <div>
                <p className="font-medium">{expiryStatus.message}</p>
                <p className="text-sm opacity-75">
                  Expiry Date:{" "}
                  {format(new Date(document.expiryDate!), "MMMM dd, yyyy")}
                </p>
              </div>
            </div>
          )}

          {/* Document Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <SimpleFilePreview
              fileData={document.fileData}
              fileName={document.fileName}
              mimeType={document.mimeType}
              maxHeight="400px"
            />
          </div>

          {/* Document Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DocumentIcon className="h-5 w-5" />
                Document Details
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Category
                  </label>
                  <p className="text-gray-900">
                    {documentService.getCategoryDisplayName(document.category)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    File Name
                  </label>
                  <p className="text-gray-900 break-all">{document.fileName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    File Size
                  </label>
                  <p className="text-gray-900">
                    {formatFileSize(document.fileSize)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    File Type
                  </label>
                  <p className="text-gray-900">{document.mimeType}</p>
                </div>

                {document.documentNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Document Number
                    </label>
                    <p className="text-gray-900">{document.documentNumber}</p>
                  </div>
                )}

                {document.issuer && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Issuer
                    </label>
                    <p className="text-gray-900">{document.issuer}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Dates & Associations
              </h3>

              <div className="space-y-3">
                {document.issuedDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Issued Date
                    </label>
                    <p className="text-gray-900">
                      {format(new Date(document.issuedDate), "MMMM dd, yyyy")}
                    </p>
                  </div>
                )}

                {document.expiryDate && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Expiry Date
                    </label>
                    <p className="text-gray-900">
                      {format(new Date(document.expiryDate), "MMMM dd, yyyy")}
                    </p>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Created
                  </label>
                  <p className="text-gray-900">
                    {format(
                      new Date(document.createdAt),
                      "MMMM dd, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Last Updated
                  </label>
                  <p className="text-gray-900">
                    {format(
                      new Date(document.updatedAt),
                      "MMMM dd, yyyy 'at' h:mm a"
                    )}
                  </p>
                </div>

                {document.familyMemberId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <UserIcon className="h-4 w-4" />
                      Associated Family Member
                    </label>
                    <p className="text-gray-900">
                      Family Member ID: {document.familyMemberId}
                    </p>
                  </div>
                )}

                {document.propertyId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                      <BuildingOfficeIcon className="h-4 w-4" />
                      Associated Property
                    </label>
                    <p className="text-gray-900">
                      Property ID: {document.propertyId}
                    </p>
                  </div>
                )}

                {document.insurancePolicyId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Associated Insurance Policy
                    </label>
                    <p className="text-gray-900">
                      Policy ID: {document.insurancePolicyId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          {document.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <TagIcon className="h-5 w-5" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {document.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between items-center pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 border-red-300 hover:bg-red-50 flex items-center gap-2"
            >
              <TrashIcon className="h-4 w-4" />
              Delete Document
            </Button>

            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose}>
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
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800">
                Are you sure you want to delete this document?
              </p>
              <p className="text-sm text-red-600 mt-1">
                This action cannot be undone. The document "{document.title}"
                will be permanently removed.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Document
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
