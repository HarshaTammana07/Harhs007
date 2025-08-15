"use client";

import { useState, useEffect } from "react";
import { Document, DocumentCategory } from "@/types";
import {
  documentService,
  DocumentSearchCriteria,
} from "@/services/DocumentService";
import { localStorageService } from "@/services/LocalStorageService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { LoadingState } from "@/components/ui/LoadingState";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { DocumentList } from "@/components/documents/DocumentList";
import { DocumentPreviewModal } from "@/components/documents/DocumentPreviewModal";
import { DocumentFilters } from "@/components/documents/DocumentFilters";
import { DocumentStats } from "@/components/documents/DocumentStats";
import { ExpiryReminders } from "@/components/documents/ExpiryReminders";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useClientSideEffect } from "@/hooks/useClientSide";
import {
  PlusIcon,
  FunnelIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

export default function DocumentsPage() {
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

  // Load documents on component mount (client-side only)
  useClientSideEffect(() => {
    loadDocuments();
  }, []);

  // Apply search and filters when criteria changes
  useEffect(() => {
    const filtered = documentService.searchDocuments(searchCriteria);
    setFilteredDocuments(filtered);
  }, [searchCriteria, documents]);

  const loadDocuments = () => {
    // Don't try to load documents during SSR
    if (typeof window === "undefined") {
      return;
    }

    setIsLoading(true);
    try {
      const allDocuments = documentService.getDocuments();
      setDocuments(allDocuments);
    } catch (error) {
      console.error("Error loading documents:", error);
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
    loadDocuments(); // Refresh documents after upload
    setShowUploadModal(false);
  };

  const handleDocumentDelete = (documentId: string) => {
    try {
      documentService.deleteDocument(documentId);
      loadDocuments(); // Refresh documents after deletion
    } catch (error) {
      console.error("Error deleting document:", error);
    }
  };

  const handleDocumentView = (document: Document) => {
    setSelectedDocument(document);
    setShowPreviewModal(true);
  };

  const handleDocumentDownload = (documentId: string) => {
    try {
      documentService.downloadDocument(documentId);
    } catch (error) {
      console.error("Error downloading document:", error);
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
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb items={[{ label: "Documents", current: true }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage family and business documents</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowStatsModal(true)}
            className="flex items-center gap-2"
          >
            <ChartBarIcon className="h-4 w-4" />
            Stats
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowFiltersModal(true)}
            className="flex items-center gap-2"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
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
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search documents by title, filename, document number, or issuer..."
              value={searchCriteria.query || ""}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="whitespace-nowrap"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </Card>

      {/* Expiry Reminders */}
      <ExpiryReminders />

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
        <DocumentStats onClose={() => setShowStatsModal(false)} />
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
          onDownload={() => handleDocumentDownload(selectedDocument.id)}
          onDelete={() => {
            handleDocumentDelete(selectedDocument.id);
            setShowPreviewModal(false);
            setSelectedDocument(null);
          }}
        />
      )}
    </div>
  );
}
