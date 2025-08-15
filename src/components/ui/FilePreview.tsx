"use client";

import React, { useState } from "react";
import { Document } from "@/types";
import { fileService } from "@/services/FileService";
import { Button } from "./Button";
import { Modal } from "./Modal";
import { Card } from "./Card";

export interface FilePreviewProps {
  document: Document;
  onDownload?: (document: Document) => void;
  onDelete?: (document: Document) => void;
  className?: string;
  showActions?: boolean;
}

export function FilePreview({
  document,
  onDownload,
  onDelete,
  className = "",
  showActions = true,
}: FilePreviewProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!onDownload) return;

    setIsLoading(true);
    try {
      onDownload(document);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    if (
      onDelete &&
      window.confirm("Are you sure you want to delete this file?")
    ) {
      onDelete(document);
    }
  };

  const isImage = document.mimeType.startsWith("image/");
  const isPDF = document.mimeType === "application/pdf";

  return (
    <>
      <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
        <div className="flex items-start space-x-3">
          {/* File Icon/Thumbnail */}
          <div className="flex-shrink-0">
            {isImage ? (
              <div
                className="w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setIsPreviewOpen(true)}
              >
                <img
                  src={document.fileData}
                  alt={document.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileIcon mimeType={document.mimeType} />
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">
              {document.title}
            </h4>
            <p className="text-xs text-gray-500 truncate">
              {document.fileName}
            </p>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-gray-400">
                {fileService.formatFileSize(document.fileSize)}
              </span>
              <span className="text-xs text-gray-300">•</span>
              <span className="text-xs text-gray-400 capitalize">
                {document.category.replace("_", " ")}
              </span>
            </div>

            {document.expiryDate && (
              <div className="mt-1">
                <ExpiryBadge expiryDate={document.expiryDate} />
              </div>
            )}

            {document.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {document.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {document.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{document.tags.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div className="flex-shrink-0 flex items-center space-x-1">
              {(isImage || isPDF) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreviewOpen(true)}
                  className="p-1.5"
                  title="Preview"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                </Button>
              )}

              {onDownload && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={isLoading}
                  className="p-1.5"
                  title="Download"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDelete}
                  className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
                  title="Delete"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Preview Modal */}
      {isPreviewOpen && (
        <FilePreviewModal
          document={document}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}
    </>
  );
}

interface FileIconProps {
  mimeType: string;
  className?: string;
}

function FileIcon({
  mimeType,
  className = "w-6 h-6 text-gray-400",
}: FileIconProps) {
  if (mimeType === "application/pdf") {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  }

  if (mimeType.includes("word") || mimeType.includes("document")) {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  }

  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
    return (
      <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
    );
  }

  // Default file icon
  return (
    <svg
      className={className}
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
  );
}

interface ExpiryBadgeProps {
  expiryDate: Date;
}

function ExpiryBadge({ expiryDate }: ExpiryBadgeProps) {
  const now = new Date();
  const expiry = new Date(expiryDate);
  const daysUntilExpiry = Math.ceil(
    (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  let badgeClass = "bg-green-100 text-green-800";
  let text = `Expires in ${daysUntilExpiry} days`;

  if (daysUntilExpiry < 0) {
    badgeClass = "bg-red-100 text-red-800";
    text = `Expired ${Math.abs(daysUntilExpiry)} days ago`;
  } else if (daysUntilExpiry <= 30) {
    badgeClass = "bg-yellow-100 text-yellow-800";
    text = `Expires in ${daysUntilExpiry} days`;
  }

  return (
    <span className={`inline-block px-2 py-0.5 text-xs rounded ${badgeClass}`}>
      {text}
    </span>
  );
}

interface FilePreviewModalProps {
  document: Document;
  onClose: () => void;
}

function FilePreviewModal({ document, onClose }: FilePreviewModalProps) {
  const isImage = document.mimeType.startsWith("image/");
  const isPDF = document.mimeType === "application/pdf";

  return (
    <Modal isOpen onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {document.title}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              fileService.downloadFile(document.fileData, document.fileName)
            }
          >
            Download
          </Button>
        </div>

        <div className="mb-4">
          {isImage ? (
            <img
              src={document.fileData}
              alt={document.title}
              className="max-w-full max-h-96 mx-auto rounded-lg"
            />
          ) : isPDF ? (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <FileIcon
                mimeType={document.mimeType}
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
              />
              <p className="text-gray-600 mb-4">PDF Preview</p>
              <Button
                onClick={() => window.open(document.fileData, "_blank")}
                className="mb-2"
              >
                Open in New Tab
              </Button>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <FileIcon
                mimeType={document.mimeType}
                className="w-16 h-16 mx-auto mb-4 text-gray-400"
              />
              <p className="text-gray-600">
                Preview not available for this file type
              </p>
            </div>
          )}
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>
            <strong>File:</strong> {document.fileName}
          </p>
          <p>
            <strong>Size:</strong>{" "}
            {fileService.formatFileSize(document.fileSize)}
          </p>
          <p>
            <strong>Type:</strong> {document.mimeType}
          </p>
          {document.expiryDate && (
            <p>
              <strong>Expires:</strong>{" "}
              {new Date(document.expiryDate).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
