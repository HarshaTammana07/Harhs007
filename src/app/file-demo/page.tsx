"use client";

import React, { useState } from "react";
import { FileUpload } from "@/components/ui/FileUpload";
import { FilePreview } from "@/components/ui/FilePreview";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fileService } from "@/services/FileService";
import { Document } from "@/types";

export default function FileDemoPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileSelect = (files: File[]) => {
    console.log("Files selected:", files);
  };

  const handleFileProcessed = async (base64Data: string, file: File) => {
    setIsProcessing(true);
    try {
      const document = await fileService.createDocumentFromFile(file, {
        title: file.name,
        category: "business_documents",
        tags: ["demo"],
      });

      const newDocument: Document = {
        ...document,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setDocuments((prev) => [...prev, newDocument]);
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = (document: Document) => {
    fileService.downloadFile(document.fileData, document.fileName);
  };

  const handleDelete = (document: Document) => {
    setDocuments((prev) => prev.filter((d) => d.id !== document.id));
  };

  const handleExportAll = () => {
    const exportData = {
      documents,
      exportDate: new Date().toISOString(),
      totalFiles: documents.length,
    };
    fileService.downloadJSON(exportData, "file-demo-export");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          File Handling Service Demo
        </h1>
        <p className="text-gray-600">
          Test file upload, compression, validation, and preview functionality
        </p>
      </div>

      {/* File Upload Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
        <FileUpload
          onFileSelect={handleFileSelect}
          onFileProcessed={handleFileProcessed}
          multiple={true}
          maxFiles={10}
          options={{
            maxSizeMB: 5,
            compressImages: true,
            maxImageWidth: 1920,
            maxImageHeight: 1080,
            imageQuality: 0.8,
          }}
          disabled={isProcessing}
        />

        {isProcessing && (
          <div className="mt-4 text-center">
            <p className="text-blue-600">Processing files...</p>
          </div>
        )}
      </Card>

      {/* File Statistics */}
      {documents.length > 0 && (
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">File Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {documents.length}
                  </div>
                  <div className="text-sm text-gray-500">Total Files</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {
                      documents.filter((d) => d.mimeType.startsWith("image/"))
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-500">Images</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {fileService.formatFileSize(
                      documents.reduce((total, doc) => total + doc.fileSize, 0)
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Total Size</div>
                </div>
              </div>
            </div>
            <Button onClick={handleExportAll} variant="outline">
              Export All Data
            </Button>
          </div>
        </Card>
      )}

      {/* File List */}
      {documents.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Uploaded Files</h3>
          <div className="space-y-4">
            {documents.map((document) => (
              <FilePreview
                key={document.id}
                document={document}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </Card>
      )}

      {documents.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No files uploaded yet
          </h3>
          <p className="text-gray-500">
            Upload some files using the form above to see them here
          </p>
        </Card>
      )}

      {/* Feature Showcase */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-semibold mb-4">FileService Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              ✅ Implemented Features
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• File validation (type, size)</li>
              <li>• Base64 conversion with progress tracking</li>
              <li>• Image compression and resizing</li>
              <li>• Drag and drop file upload</li>
              <li>• File preview for images and PDFs</li>
              <li>• Download functionality</li>
              <li>• JSON export/import</li>
              <li>• File metadata extraction</li>
              <li>• Progress indicators</li>
              <li>• Error handling</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">
              📋 Supported File Types
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Images: JPEG, PNG, GIF, WebP</li>
              <li>• Documents: PDF, DOC, DOCX</li>
              <li>• Spreadsheets: XLS, XLSX</li>
              <li>• Text: TXT, CSV</li>
              <li>• Maximum size: 5MB (configurable)</li>
              <li>• Image compression enabled</li>
              <li>• Progress tracking</li>
              <li>• Batch upload support</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
