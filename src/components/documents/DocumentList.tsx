"use client";

import { useState } from "react";
import { Document, DocumentCategory } from "@/types";
import { fileService } from "@/services/FileService";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  DocumentIcon,
  PhotoIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { formatDistanceToNow, format } from "date-fns";

interface DocumentListProps {
  documents: Document[];
  onView: (document: Document) => void;
  onDownload: (document: Document) => void;
  onDelete: (documentId: string) => void;
}

export function DocumentList({
  documents,
  onView,
  onDownload,
  onDelete,
}: DocumentListProps) {
  const [sortBy, setSortBy] = useState<
    "title" | "category" | "createdAt" | "expiryDate"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const getCategoryDisplayName = (category: DocumentCategory): string => {
    const categoryMap: Record<DocumentCategory, string> = {
      aadhar: "Aadhar Card",
      pan: "PAN Card",
      driving_license: "Driving License",
      passport: "Passport",
      house_documents: "House Documents",
      business_documents: "Business Documents",
      insurance_documents: "Insurance Documents",
      bank_documents: "Bank Documents",
      educational_certificates: "Educational Certificates",
      medical_records: "Medical Records",
    };
    return categoryMap[category] || category;
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortBy) {
      case "title":
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case "category":
        aValue = getCategoryDisplayName(a.category);
        bValue = getCategoryDisplayName(b.category);
        break;
      case "createdAt":
        aValue = new Date(a.createdAt);
        bValue = new Date(b.createdAt);
        break;
      case "expiryDate":
        aValue = a.expiryDate ? new Date(a.expiryDate) : new Date(0);
        bValue = b.expiryDate ? new Date(b.expiryDate) : new Date(0);
        break;
      default:
        aValue = a.createdAt;
        bValue = b.createdAt;
    }

    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return <PhotoIcon className="h-5 w-5 text-blue-500 dark:text-blue-400" />;
    }
    return <DocumentIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />;
  };

  const getExpiryStatus = (document: Document) => {
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
        icon: <ExclamationTriangleIcon className="h-4 w-4 text-red-500 dark:text-red-400" />,
        className: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        status: "expiring",
        message: `Expires in ${daysUntilExpiry} days`,
        icon: <ClockIcon className="h-4 w-4 text-yellow-500 dark:text-yellow-400" />,
        className: "text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20",
      };
    }

    return null;
  };



  if (documents.length === 0) {
    return (
      <Card className="p-8 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <DocumentIcon className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No documents found
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Upload your first document or adjust your search filters.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Sort Controls */}
      <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
          <button
            onClick={() => handleSort("title")}
            className={`text-sm px-2 py-1 rounded ${
              sortBy === "title"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Title {sortBy === "title" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("category")}
            className={`text-sm px-2 py-1 rounded ${
              sortBy === "category"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Category{" "}
            {sortBy === "category" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("createdAt")}
            className={`text-sm px-2 py-1 rounded ${
              sortBy === "createdAt"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Created{" "}
            {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button
            onClick={() => handleSort("expiryDate")}
            className={`text-sm px-2 py-1 rounded ${
              sortBy === "expiryDate"
                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            }`}
          >
            Expiry{" "}
            {sortBy === "expiryDate" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </Card>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDocuments.map((document) => {
          const expiryStatus = getExpiryStatus(document);

          return (
            <Card
              key={document.id}
              className="p-4 hover:shadow-md dark:hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileIcon(document.mimeType)}
                  <div className="min-w-0 flex-1">
                    <h3
                      className="font-medium text-gray-900 dark:text-white truncate"
                      title={document.title}
                    >
                      {document.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {getCategoryDisplayName(document.category)}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1 ml-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(document)}
                    title="View document"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDownload(document)}
                    title="Download document"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <ArrowDownTrayIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(document.id)}
                    title="Delete document"
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Document Info */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">File:</span>
                  <span
                    className="text-gray-900 dark:text-white truncate ml-2"
                    title={document.fileName}
                  >
                    {document.fileName}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Size:</span>
                  <span className="text-gray-900 dark:text-white">
                    {fileService.formatFileSize(document.fileSize)}
                  </span>
                </div>

                {document.documentNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Number:</span>
                    <span
                      className="text-gray-900 dark:text-white truncate ml-2"
                      title={document.documentNumber}
                    >
                      {document.documentNumber}
                    </span>
                  </div>
                )}

                {document.issuer && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Issuer:</span>
                    <span
                      className="text-gray-900 dark:text-white truncate ml-2"
                      title={document.issuer}
                    >
                      {document.issuer}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Created:</span>
                  <span className="text-gray-900 dark:text-white">
                    {formatDistanceToNow(new Date(document.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>

                {document.expiryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                    <span className="text-gray-900 dark:text-white">
                      {format(new Date(document.expiryDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
              </div>

              {/* Expiry Status */}
              {expiryStatus && (
                <div
                  className={`mt-3 p-2 rounded-md flex items-center gap-2 ${expiryStatus.className}`}
                >
                  {expiryStatus.icon}
                  <span className="text-sm font-medium">
                    {expiryStatus.message}
                  </span>
                </div>
              )}

              {/* Tags */}
              {document.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {document.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {document.tags.length > 3 && (
                    <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                      +{document.tags.length - 3} more
                    </span>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Results Summary */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-4">
        Showing {documents.length} document{documents.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
