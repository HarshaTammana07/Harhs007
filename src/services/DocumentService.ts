import { Document, DocumentCategory, FamilyMember } from "@/types";
import { localStorageService } from "./LocalStorageService";
import { fileService } from "./FileService";

/**
 * Document search and filter criteria
 */
export interface DocumentSearchCriteria {
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

/**
 * Document expiry information
 */
export interface DocumentExpiryInfo {
  document: Document;
  daysUntilExpiry: number;
  isExpired: boolean;
  isExpiringSoon: boolean; // Within 30 days
}

/**
 * Document statistics
 */
export interface DocumentStats {
  totalDocuments: number;
  documentsByCategory: Record<DocumentCategory, number>;
  expiringDocuments: number;
  expiredDocuments: number;
  documentsWithoutExpiry: number;
}

/**
 * DocumentService - Handles document management operations
 * Extends LocalStorageService with document-specific functionality
 */
export class DocumentService {
  private static readonly EXPIRY_WARNING_DAYS = 30;

  /**
   * Get all documents
   */
  public getDocuments(): Document[] {
    const documents = localStorageService.getDocuments();
    return documents;
  }

  /**
   * Get document by ID
   */
  public getDocumentById(id: string): Document | null {
    return localStorageService.getDocumentById(id);
  }

  /**
   * Save a new document
   */
  public async saveDocument(document: Document): Promise<void> {
    // Validate document before saving
    this.validateDocument(document);

    // Save to localStorage
    localStorageService.saveDocument(document);
  }

  /**
   * Update an existing document
   */
  public async updateDocument(
    id: string,
    updates: Partial<Document>
  ): Promise<void> {
    localStorageService.updateDocument(id, updates);
  }

  /**
   * Delete a document
   */
  public deleteDocument(id: string): void {
    localStorageService.deleteDocument(id);
  }

  /**
   * Search and filter documents based on criteria
   */
  public searchDocuments(criteria: DocumentSearchCriteria): Document[] {
    let documents = this.getDocuments();

    // Filter by query (search in title, fileName, documentNumber, issuer)
    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      documents = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(query) ||
          doc.fileName.toLowerCase().includes(query) ||
          doc.documentNumber?.toLowerCase().includes(query) ||
          doc.issuer?.toLowerCase().includes(query) ||
          doc.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (criteria.category) {
      documents = documents.filter((doc) => doc.category === criteria.category);
    }

    // Filter by family member
    if (criteria.familyMemberId) {
      documents = documents.filter(
        (doc) => doc.familyMemberId === criteria.familyMemberId
      );
    }

    // Filter by property
    if (criteria.propertyId) {
      documents = documents.filter(
        (doc) => doc.propertyId === criteria.propertyId
      );
    }

    // Filter by insurance policy
    if (criteria.insurancePolicyId) {
      documents = documents.filter(
        (doc) => doc.insurancePolicyId === criteria.insurancePolicyId
      );
    }

    // Filter by tags
    if (criteria.tags && criteria.tags.length > 0) {
      documents = documents.filter((doc) =>
        criteria.tags!.some((tag) => doc.tags.includes(tag))
      );
    }

    // Filter by expiry status
    if (criteria.isExpiring !== undefined) {
      const expiringDocs = this.getExpiringDocuments();
      const expiringIds = new Set(expiringDocs.map((info) => info.document.id));

      if (criteria.isExpiring) {
        documents = documents.filter((doc) => expiringIds.has(doc.id));
      } else {
        documents = documents.filter((doc) => !expiringIds.has(doc.id));
      }
    }

    // Filter by expiry date range
    if (criteria.expiryDateRange) {
      documents = documents.filter((doc) => {
        if (!doc.expiryDate) return false;

        const expiryDate = new Date(doc.expiryDate);
        const { start, end } = criteria.expiryDateRange!;

        if (start && expiryDate < start) return false;
        if (end && expiryDate > end) return false;

        return true;
      });
    }

    // Filter by issued date range
    if (criteria.issuedDateRange) {
      documents = documents.filter((doc) => {
        if (!doc.issuedDate) return false;

        const issuedDate = new Date(doc.issuedDate);
        const { start, end } = criteria.issuedDateRange!;

        if (start && issuedDate < start) return false;
        if (end && issuedDate > end) return false;

        return true;
      });
    }

    return documents;
  }

  /**
   * Get documents by category
   */
  public getDocumentsByCategory(category: DocumentCategory): Document[] {
    return this.searchDocuments({ category });
  }

  /**
   * Get documents by family member
   */
  public getDocumentsByFamilyMember(familyMemberId: string): Document[] {
    return this.searchDocuments({ familyMemberId });
  }

  /**
   * Get documents by property
   */
  public getDocumentsByProperty(propertyId: string): Document[] {
    return this.searchDocuments({ propertyId });
  }

  /**
   * Get documents by insurance policy
   */
  public getDocumentsByInsurancePolicy(insurancePolicyId: string): Document[] {
    return this.searchDocuments({ insurancePolicyId });
  }

  /**
   * Get documents by tags
   */
  public getDocumentsByTags(tags: string[]): Document[] {
    return this.searchDocuments({ tags });
  }

  /**
   * Get expiring documents (within warning period)
   */
  public getExpiringDocuments(): DocumentExpiryInfo[] {
    const documents = this.getDocuments();
    const now = new Date();
    const warningDate = new Date();
    warningDate.setDate(now.getDate() + DocumentService.EXPIRY_WARNING_DAYS);

    return documents
      .filter((doc) => doc.expiryDate)
      .map((doc) => {
        const expiryDate = new Date(doc.expiryDate!);
        const daysUntilExpiry = Math.ceil(
          (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );

        return {
          document: doc,
          daysUntilExpiry,
          isExpired: daysUntilExpiry < 0,
          isExpiringSoon:
            daysUntilExpiry >= 0 &&
            daysUntilExpiry <= DocumentService.EXPIRY_WARNING_DAYS,
        };
      })
      .filter((info) => info.isExpired || info.isExpiringSoon)
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  /**
   * Get expired documents
   */
  public getExpiredDocuments(): Document[] {
    const expiryInfo = this.getExpiringDocuments();
    return expiryInfo
      .filter((info) => info.isExpired)
      .map((info) => info.document);
  }

  /**
   * Get documents expiring soon (within warning period but not expired)
   */
  public getDocumentsExpiringSoon(): Document[] {
    const expiryInfo = this.getExpiringDocuments();
    return expiryInfo
      .filter((info) => info.isExpiringSoon && !info.isExpired)
      .map((info) => info.document);
  }

  /**
   * Get document statistics
   */
  public getDocumentStats(): DocumentStats {
    const documents = this.getDocuments();
    const expiringInfo = this.getExpiringDocuments();

    // Count documents by category
    const documentsByCategory = {} as Record<DocumentCategory, number>;
    const categories: DocumentCategory[] = [
      "aadhar",
      "pan",
      "driving_license",
      "passport",
      "house_documents",
      "business_documents",
      "insurance_documents",
      "bank_documents",
      "educational_certificates",
      "medical_records",
    ];

    categories.forEach((category) => {
      documentsByCategory[category] = documents.filter(
        (doc) => doc.category === category
      ).length;
    });

    return {
      totalDocuments: documents.length,
      documentsByCategory,
      expiringDocuments: expiringInfo.filter(
        (info) => info.isExpiringSoon && !info.isExpired
      ).length,
      expiredDocuments: expiringInfo.filter((info) => info.isExpired).length,
      documentsWithoutExpiry: documents.filter((doc) => !doc.expiryDate).length,
    };
  }

  /**
   * Get all unique tags from documents
   */
  public getAllTags(): string[] {
    const documents = this.getDocuments();
    const tagSet = new Set<string>();

    documents.forEach((doc) => {
      doc.tags.forEach((tag) => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }

  /**
   * Add tags to a document
   */
  public addTagsToDocument(documentId: string, tags: string[]): void {
    const document = this.getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document with id "${documentId}" not found`);
    }

    const uniqueTags = [...new Set([...document.tags, ...tags])];
    this.updateDocument(documentId, { tags: uniqueTags });
  }

  /**
   * Remove tags from a document
   */
  public removeTagsFromDocument(documentId: string, tags: string[]): void {
    const document = this.getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document with id "${documentId}" not found`);
    }

    const filteredTags = document.tags.filter((tag) => !tags.includes(tag));
    this.updateDocument(documentId, { tags: filteredTags });
  }

  /**
   * Create a document from uploaded file
   */
  public async createDocumentFromFile(
    file: File,
    metadata: {
      title: string;
      category: DocumentCategory;
      familyMemberId?: string;
      propertyId?: string;
      insurancePolicyId?: string;
      expiryDate?: Date;
      issuedDate?: Date;
      issuer?: string;
      documentNumber?: string;
      tags?: string[];
    }
  ): Promise<Document> {
    // Validate file
    if (!fileService.validateFileType(file)) {
      throw new Error("Invalid file type");
    }

    if (!fileService.validateFileSize(file)) {
      throw new Error("File size too large");
    }

    // Convert file to base64
    const fileData = await fileService.convertToBase64(file);

    // Create document object
    const document: Document = {
      id: this.generateId(),
      title: metadata.title,
      category: metadata.category,
      fileData,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      familyMemberId: metadata.familyMemberId,
      propertyId: metadata.propertyId,
      insurancePolicyId: metadata.insurancePolicyId,
      expiryDate: metadata.expiryDate,
      issuedDate: metadata.issuedDate,
      issuer: metadata.issuer,
      documentNumber: metadata.documentNumber,
      tags: metadata.tags || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save document
    await this.saveDocument(document);
    return document;
  }

  /**
   * Download a document
   */
  public downloadDocument(documentId: string): void {
    const document = this.getDocumentById(documentId);
    if (!document) {
      throw new Error(`Document with id "${documentId}" not found`);
    }

    fileService.downloadFile(document.fileData, document.fileName);
  }

  /**
   * Get document category display name
   */
  public getCategoryDisplayName(category: DocumentCategory): string {
    const categoryNames: Record<DocumentCategory, string> = {
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

    return categoryNames[category] || category;
  }

  /**
   * Get all document categories with display names
   */
  public getAllCategories(): Array<{ value: DocumentCategory; label: string }> {
    const categories: DocumentCategory[] = [
      "aadhar",
      "pan",
      "driving_license",
      "passport",
      "house_documents",
      "business_documents",
      "insurance_documents",
      "bank_documents",
      "educational_certificates",
      "medical_records",
    ];

    return categories.map((category) => ({
      value: category,
      label: this.getCategoryDisplayName(category),
    }));
  }

  /**
   * Validate document data
   */
  private validateDocument(document: Document): void {
    if (!document.id) {
      throw new Error("Document ID is required");
    }

    if (!document.title.trim()) {
      throw new Error("Document title is required");
    }

    if (!document.fileName.trim()) {
      throw new Error("Document file name is required");
    }

    if (!document.fileData) {
      throw new Error("Document file data is required");
    }

    if (!document.category) {
      throw new Error("Document category is required");
    }

    // Validate expiry date is not in the past for new documents
    if (document.expiryDate && new Date(document.expiryDate) < new Date()) {
      console.warn("Document expiry date is in the past");
    }

    // Validate issued date is not in the future
    if (document.issuedDate && new Date(document.issuedDate) > new Date()) {
      throw new Error("Document issued date cannot be in the future");
    }
  }

  /**
   * Generate unique ID for documents
   */
  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const documentService = new DocumentService();
