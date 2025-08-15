"use client";

import React, { useCallback, useState, useRef } from "react";
import {
  fileService,
  FileUploadOptions,
  FileUploadProgress,
} from "@/services/FileService";
import { Button } from "./Button";
import { Card } from "./Card";

export interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  onFileProcessed?: (base64Data: string, file: File) => void;
  multiple?: boolean;
  accept?: string;
  maxFiles?: number;
  options?: FileUploadOptions;
  className?: string;
  disabled?: boolean;
}

export interface FilePreview {
  file: File;
  preview?: string;
  progress?: FileUploadProgress;
  error?: string;
  processed?: boolean;
}

export function FileUpload({
  onFileSelect,
  onFileProcessed,
  multiple = false,
  accept,
  maxFiles = 10,
  options = {},
  className = "",
  disabled = false,
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState<FilePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (fileList: File[]) => {
      if (disabled) return;

      const newFiles: FilePreview[] = fileList.map((file) => ({
        file,
        preview: fileService.isImage(file)
          ? URL.createObjectURL(file)
          : undefined,
        progress: { loaded: 0, total: file.size, percentage: 0 },
        processed: false,
      }));

      setFiles((prev) => [...prev, ...newFiles]);
      setIsProcessing(true);

      for (let i = 0; i < newFiles.length; i++) {
        const filePreview = newFiles[i];
        const { file } = filePreview;

        try {
          // Update progress callback
          const progressOptions: FileUploadOptions = {
            ...options,
            onProgress: (progress) => {
              setFiles((prev) =>
                prev.map((f, index) =>
                  f.file === file ? { ...f, progress } : f
                )
              );
            },
          };

          const base64Data = await fileService.processFileUpload(
            file,
            progressOptions
          );

          // Update file as processed
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file ? { ...f, processed: true, error: undefined } : f
            )
          );

          onFileProcessed?.(base64Data, file);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to process file";
          setFiles((prev) =>
            prev.map((f) =>
              f.file === file ? { ...f, error: errorMessage } : f
            )
          );
        }
      }

      setIsProcessing(false);
      onFileSelect(fileList);
    },
    [onFileSelect, onFileProcessed, options, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const droppedFiles = Array.from(e.dataTransfer.files);
      const filesToProcess = multiple
        ? droppedFiles.slice(0, maxFiles - files.length)
        : droppedFiles.slice(0, 1);

      if (filesToProcess.length > 0) {
        processFiles(filesToProcess);
      }
    },
    [disabled, multiple, maxFiles, files.length, processFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      if (selectedFiles.length > 0) {
        processFiles(selectedFiles);
      }
      // Reset input value to allow selecting the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [processFiles]
  );

  const handleBrowseClick = useCallback(() => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }, [disabled]);

  const removeFile = useCallback((fileToRemove: File) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.file !== fileToRemove);
      // Revoke object URLs to prevent memory leaks
      prev.forEach((f) => {
        if (f.preview && f.file === fileToRemove) {
          URL.revokeObjectURL(f.preview);
        }
      });
      return updated;
    });
  }, []);

  const clearAllFiles = useCallback(() => {
    // Revoke all object URLs
    files.forEach((f) => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });
    setFiles([]);
  }, [files]);

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      files.forEach((f) => {
        if (f.preview) {
          URL.revokeObjectURL(f.preview);
        }
      });
    };
  }, [files]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${
            isDragOver
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
        onClick={handleBrowseClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />

        <div className="space-y-4">
          <div className="mx-auto w-12 h-12 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragOver ? "Drop files here" : "Drag and drop files here"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or{" "}
              <span className="text-blue-600 hover:text-blue-500 font-medium">
                browse to choose files
              </span>
            </p>
          </div>

          {options.maxSizeMB && (
            <p className="text-xs text-gray-400">
              Maximum file size: {options.maxSizeMB}MB
            </p>
          )}
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length})
            </h4>
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFiles}
              disabled={isProcessing}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-2">
            {files.map((filePreview, index) => (
              <FilePreviewCard
                key={`${filePreview.file.name}-${index}`}
                filePreview={filePreview}
                onRemove={() => removeFile(filePreview.file)}
                disabled={isProcessing}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface FilePreviewCardProps {
  filePreview: FilePreview;
  onRemove: () => void;
  disabled?: boolean;
}

function FilePreviewCard({
  filePreview,
  onRemove,
  disabled,
}: FilePreviewCardProps) {
  const { file, preview, progress, error, processed } = filePreview;

  return (
    <Card className="p-3">
      <div className="flex items-center space-x-3">
        {/* File Preview/Icon */}
        <div className="flex-shrink-0 w-10 h-10">
          {preview ? (
            <img
              src={preview}
              alt={file.name}
              className="w-10 h-10 object-cover rounded"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
              <svg
                className="w-6 h-6 text-gray-400"
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
          )}
        </div>

        {/* File Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {fileService.formatFileSize(file.size)}
          </p>

          {/* Progress Bar */}
          {progress && progress.percentage < 100 && !error && (
            <div className="mt-1">
              <div className="bg-gray-200 rounded-full h-1.5">
                <div
                  className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {progress.percentage}% uploaded
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

          {/* Success Message */}
          {processed && !error && (
            <p className="text-xs text-green-600 mt-1">
              ✓ Processed successfully
            </p>
          )}
        </div>

        {/* Remove Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          disabled={disabled}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </Button>
      </div>
    </Card>
  );
}
