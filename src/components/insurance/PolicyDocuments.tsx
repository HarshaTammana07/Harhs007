import React, { useState } from "react";
import {
  Button,
  Modal,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Document } from "@/types";
import { fileService } from "@/services/FileService";

interface PolicyDocumentsProps {
  documents: Document[];
  policyNumber: string;
}

export const PolicyDocuments: React.FC<PolicyDocumentsProps> = ({
  documents,
  policyNumber,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleDownload = (document: Document) => {
    try {
      fileService.downloadFile(document.fileData, document.fileName);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith("image/")) {
      return (
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    } else if (mimeType === "application/pdf") {
      return (
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    } else {
      return (
        <svg
          className="w-5 h-5 text-gray-500"
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
  };

  if (documents.length === 0) {
    return <div className="text-sm text-gray-500">No documents uploaded</div>;
  }

  return (
    <>
      <div className="text-sm">
        <span className="text-gray-500">Documents:</span>
        <div className="flex items-center justify-between mt-1">
          <span className="font-medium">
            {documents.length} file(s) uploaded
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
          >
            View All
          </Button>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="lg"
      >
        <Card>
          <CardHeader>
            <CardTitle>Policy Documents - {policyNumber}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    {getFileIcon(document.mimeType)}
                    <div>
                      <div className="font-medium text-gray-900">
                        {document.fileName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {fileService.formatFileSize(document.fileSize)} •{" "}
                        {document.mimeType}
                      </div>
                      {document.createdAt && (
                        <div className="text-xs text-gray-400">
                          Uploaded:{" "}
                          {new Date(document.createdAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {document.mimeType.startsWith("image/") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newWindow = window.open();
                          if (newWindow) {
                            newWindow.document.write(`
                              <html>
                                <head><title>${document.fileName}</title></head>
                                <body style="margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#f3f4f6;">
                                  <img src="${document.fileData}" style="max-width:100%;max-height:100vh;object-fit:contain;" alt="${document.fileName}" />
                                </body>
                              </html>
                            `);
                          }
                        }}
                      >
                        Preview
                      </Button>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleDownload(document)}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  documents.forEach((doc, index) => {
                    setTimeout(() => {
                      fileService.downloadFile(doc.fileData, doc.fileName);
                    }, index * 100);
                  });
                }}
                disabled={documents.length === 0}
              >
                Download All ({documents.length})
              </Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </Modal>
    </>
  );
};
