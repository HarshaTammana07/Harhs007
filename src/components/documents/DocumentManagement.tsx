"use client";

import { useState, useEffect } from "react";
import { Document, DocumentCategory } from "@/types";
import { ApiService } from "@/services/ApiService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { DocumentUploadForm } from "./DocumentUploadForm";
import { DocumentList } from "./DocumentList";
import { DocumentPreviewModal } from "./DocumentPreviewModal";
import { DocumentFilters } from "./DocumentFilters";
import { DocumentStats } from "./DocumentStats";
import { ExpiryReminders } from "./ExpiryReminders";
import toast from "react-hot-toast";
import {
  PlusIcon,
  FunnelIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// Document search criteria interface
interface DocumentSearchCriteria {
  query?: string;
  category?: DocumentCategory;
  familyMemberId?: string;
  propertyId?: string;
  insurancePolicyId?: string;
  tags?: string[];
  isExpiring?: boolean;
  expiryDateRange?: {
    start?: Date;
    end?: Date;
  };
  issuedDateRange?: {
    start?: Date;
    end?: Date;
  };
}

export const DocumentManagement: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchCriteria, setSearchCriteria] = useState<DocumentSearchCriteria>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, [refreshTrigger]);

  // Apply search and filters when criteria changes
  useEffect(() => {
    const applyFilters = async () => {
      try {
        if (Object.keys(searchCriteria).length === 0) {
          setFilteredDocuments(documents);
        } else {
          const filtered = await ApiService.searchDocuments(searchCriteria);
          setFilteredDocuments(filtered);
        }
      } catch (error) {
        console.error("Error filtering documents:", error);
        setFilteredDocuments(documents); // Fallback to all documents
      }
    };

    applyFilters();
  }, [searchCriteria, documents]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const allDocuments = await ApiService.getDocuments();
      setDocuments(allDocuments);
    } catch (error) {
      console.error("Error loading documents:", error);
      toast.error("Failed to load documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchCriteria((prev) => ({ ...prev, query }));
  };

  const handleFilterChange = (newCriteria: DocumentSearchCriteria) => {
    setSearchCriteria(newCriteria);
    setShowFiltersModal(false);
  };

  const handleDocumentUpload = () => {
    setRefreshTrigger(prev => prev + 1); // Trigger refresh after upload
    setShowUploadModal(false);
  };

  const handleDocumentDelete = async (documentId: string) => {
    if (window.confirm("Are you sure you want to delete this document? This action cannot be undone.")) {
      try {
        await ApiService.deleteDocument(documentId);
        setRefreshTrigger(prev => prev + 1); // Trigger refresh after deletion
        toast.success("Document deleted successfully");
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Failed to delete document");
      }
    }
  };

  const handleDocumentView = (document: Document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleDocumentDownload = (doc: Document) => {
    try {
      // Ensure the fileData is properly formatted
      let dataUrl = doc.fileData;
      
      // If the data doesn't start with 'data:', add the proper prefix
      if (!dataUrl.startsWith('data:')) {
        dataUrl = `data:${doc.mimeType};base64,${dataUrl}`;
      }
      
      // Create download link from base64 data
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = doc.fileName;
      
      // Append to body, click, then remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success(`Downloaded ${doc.fileName}`);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Failed to download document. Please try again.");
    }
  };

  const clearFilters = () => {
    setSearchCriteria({});
  };

  const hasActiveFilters = Object.keys(searchCriteria).some((key) => {
    const value = searchCriteria[key as keyof DocumentSearchCriteria];
    return (
      value !== undefined &&
      value !== "" &&
      (Array.isArray(value) ? value.length > 0 : true)
    );
  });

  if (isLoading) {
    return <LoadingState message="Loading documents..." />;
  }

  return (
    <div className="space-y-6 p-6 bg-gray-50 dark:bg-gray-900 min-h-screen transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Document Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage family and business documents with secure storage
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <ChartBarIcon className="h-4 w-4" />
            Stats
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFiltersModal(true)}
            className="flex items-center gap-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-500 dark:bg-blue-600 text-white text-xs rounded-full px-2 py-0.5">
                Active
              </span>
            )}
          </Button>
          <Button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search documents by title, filename, document number, or issuer..."
              value={searchCriteria.query || ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="whitespace-nowrap border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Expiry Reminders */}
      <ExpiryReminders refreshTrigger={refreshTrigger} />

      {/* Document List */}
      <DocumentList
        documents={filteredDocuments}
        onView={handleDocumentView}
        onDownload={handleDocumentDownload}
        onDelete={handleDocumentDelete}
      />

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Document"
        size="lg"
      >
        <DocumentUploadForm
          onSuccess={handleDocumentUpload}
          onCancel={() => setShowUploadModal(false)}
        />
      </Modal>

      {/* Filters Modal */}
      <Modal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        title="Filter Documents"
        size="lg"
      >
        <DocumentFilters
          criteria={searchCriteria}
          onApply={handleFilterChange}
          onCancel={() => setShowFiltersModal(false)}
        />
      </Modal>

      {/* Stats Modal */}
      <Modal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        title="Document Statistics"
        size="lg"
      >
        <DocumentStats 
          onClose={() => setShowStatsModal(false)}
        />
      </Modal>

      {/* Preview Modal */}
      {selectedDocument && (
        <DocumentPreviewModal
          document={selectedDocument}
          isOpen={showPreviewModal}
          onClose={() => {
            setShowPreviewModal(false);
            setSelectedDocument(null);
          }}
          onDownload={() => handleDocumentDownload(selectedDocument)}
          onDelete={() => {
            handleDocumentDelete(selectedDocument.id);
            setShowPreviewModal(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
};
