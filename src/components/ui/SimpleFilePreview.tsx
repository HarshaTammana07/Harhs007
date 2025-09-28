"use client";

import React from "react";
import { DocumentIcon } from "@heroicons/react/24/outline";

interface SimpleFilePreviewProps {
  fileData: string;
  fileName: string;
  mimeType: string;
  maxHeight?: string;
  className?: string;
}

export function SimpleFilePreview({
  fileData,
  fileName,
  mimeType,
  maxHeight = "400px",
  className = "",
}: SimpleFilePreviewProps) {
  // Safety checks
  if (!fileData || !fileName || !mimeType) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center ${className}`}
      >
        <DocumentIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-sm text-gray-500 dark:text-gray-400">Unable to preview document</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          Missing: {!fileData && "fileData "}
          {!fileName && "fileName "}
          {!mimeType && "mimeType"}
        </p>
      </div>
    );
  }

  const isImage = mimeType.startsWith("image/");
  const isPDF = mimeType === "application/pdf";

  if (isImage) {
    return (
      <div className={`flex justify-center ${className}`}>
        <img
          src={fileData}
          alt={fileName}
          className="max-w-full rounded-lg shadow-sm"
          style={{ maxHeight }}
        />
      </div>
    );
  }

  if (isPDF) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center ${className}`}
      >
        <DocumentIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">PDF Document</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{fileName}</p>
        <button
          onClick={() => window.open(fileData, "_blank")}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Open PDF in New Tab
        </button>
      </div>
    );
  }

  // For other file types
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 text-center ${className}`}
    >
      <DocumentIcon className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {getFileTypeDisplayName(mimeType)}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{fileName}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Preview not available for this file type
      </p>
    </div>
  );
}

function getFileTypeDisplayName(mimeType: string): string {
  if (mimeType.includes("word") || mimeType.includes("document")) {
    return "Word Document";
  }
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) {
    return "Excel Spreadsheet";
  }
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation")) {
    return "PowerPoint Presentation";
  }
  if (mimeType === "text/plain") {
    return "Text File";
  }
  if (mimeType === "text/csv") {
    return "CSV File";
  }
  return "Document";
}
