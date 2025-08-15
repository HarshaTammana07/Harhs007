import { DocumentService } from "../DocumentService";
import { Document, DocumentCategory } from "@/types";
import { localStorageService } from "../LocalStorageService";
import { fileService } from "../FileService";

// Mock dependencies
jest.mock("../LocalStorageService");
jest.mock("../FileService");

const mockLocalStorageService = localStorageService as jest.Mocked<
  typeof localStorageService
>;
const mockFileService = fileService as jest.Mocked<typeof fileService>;

describe("DocumentService", () => {
  let documentService: DocumentService;
  let mockDocuments: Document[];

  beforeEach(() => {
    documentService = new DocumentService();

    // Setup mock documents
    mockDocuments = [
      {
        id: "doc1",
        title: "Aadhar Card - Ravi",
        category: "aadhar" as DocumentCategory,
        fileData: "data:image/jpeg;base64,mockdata1",
        fileName: "ravi-aadhar.jpg",
        fileSize: 1024,
        mimeType: "image/jpeg",
        familyMemberId: "family1",
        expiryDate: new Date("2025-12-31"),
        issuedDate: new Date("2020-01-01"),
        issuer: "UIDAI",
        documentNumber: "1234-5678-9012",
        tags: ["identity", "government"],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: "doc2",
        title: "PAN Card - Lakshmi",
        category: "pan" as DocumentCategory,
        fileData: "data:image/jpeg;base64,mockdata2",
        fileName: "lakshmi-pan.jpg",
        fileSize: 2048,
        mimeType: "image/jpeg",
        familyMemberId: "family2",
        expiryDate: new Date("2024-06-30"), // Expiring soon
        issuedDate: new Date("2019-01-01"),
        issuer: "Income Tax Department",
        documentNumber: "ABCDE1234F",
        tags: ["tax", "government"],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: "doc3",
        title: "House Document - Property 1",
        category: "house_documents" as DocumentCategory,
        fileData: "data:application/pdf;base64,mockdata3",
        fileName: "house-deed.pdf",
        fileSize: 4096,
        mimeType: "application/pdf",
        propertyId: "prop1",
        issuedDate: new Date("2018-01-01"),
        issuer: "Registrar Office",
        documentNumber: "HD-2018-001",
        tags: ["property", "legal"],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
      {
        id: "doc4",
        title: "Expired Passport",
        category: "passport" as DocumentCategory,
        fileData: "data:image/jpeg;base64,mockdata4",
        fileName: "expired-passport.jpg",
        fileSize: 3072,
        mimeType: "image/jpeg",
        familyMemberId: "family1",
        expiryDate: new Date("2023-12-31"), // Expired
        issuedDate: new Date("2013-01-01"),
        issuer: "Passport Office",
        documentNumber: "P1234567",
        tags: ["travel", "identity"],
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-01-01"),
      },
    ];

    // Setup mocks
    mockLocalStorageService.getDocuments.mockReturnValue(mockDocuments);
    mockLocalStorageService.getDocumentById.mockImplementation(
      (id: string) => mockDocuments.find((doc) => doc.id === id) || null
    );
    mockLocalStorageService.saveDocument.mockImplementation(() => {});
    mockLocalStorageService.updateDocument.mockImplementation(() => {});
    mockLocalStorageService.deleteDocument.mockImplementation(() => {});

    mockFileService.validateFileType.mockReturnValue(true);
    mockFileService.validateFileSize.mockReturnValue(true);
    mockFileService.convertToBase64.mockResolvedValue(
      "data:image/jpeg;base64,newmockdata"
    );
    mockFileService.downloadFile.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic CRUD Operations", () => {
    test("should get all documents", () => {
      const documents = documentService.getDocuments();
      expect(documents).toEqual(mockDocuments);
      expect(mockLocalStorageService.getDocuments).toHaveBeenCalled();
    });

    test("should get document by ID", () => {
      const document = documentService.getDocumentById("doc1");
      expect(document).toEqual(mockDocuments[0]);
      expect(mockLocalStorageService.getDocumentById).toHaveBeenCalledWith(
        "doc1"
      );
    });

    test("should save a new document", async () => {
      const newDocument: Document = {
        id: "doc5",
        title: "New Document",
        category: "pan",
        fileData: "data:image/jpeg;base64,newdata",
        fileName: "new-doc.jpg",
        fileSize: 1024,
        mimeType: "image/jpeg",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await documentService.saveDocument(newDocument);
      expect(mockLocalStorageService.saveDocument).toHaveBeenCalledWith(
        newDocument
      );
    });

    test("should update a document", async () => {
      const updates = { title: "Updated Title" };
      await documentService.updateDocument("doc1", updates);
      expect(mockLocalStorageService.updateDocument).toHaveBeenCalledWith(
        "doc1",
        updates
      );
    });

    test("should delete a document", () => {
      documentService.deleteDocument("doc1");
      expect(mockLocalStorageService.deleteDocument).toHaveBeenCalledWith(
        "doc1"
      );
    });
  });

  describe("Search and Filtering", () => {
    test("should search documents by query", () => {
      const results = documentService.searchDocuments({ query: "Ravi" });
      expect(results).toHaveLength(1);
      expect(results[0].title).toContain("Ravi");
    });

    test("should filter documents by category", () => {
      const results = documentService.searchDocuments({ category: "aadhar" });
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe("aadhar");
    });

    test("should filter documents by family member", () => {
      const results = documentService.searchDocuments({
        familyMemberId: "family1",
      });
      expect(results).toHaveLength(2);
      expect(results.every((doc) => doc.familyMemberId === "family1")).toBe(
        true
      );
    });

    test("should filter documents by property", () => {
      const results = documentService.searchDocuments({ propertyId: "prop1" });
      expect(results).toHaveLength(1);
      expect(results[0].propertyId).toBe("prop1");
    });

    test("should filter documents by tags", () => {
      const results = documentService.searchDocuments({ tags: ["government"] });
      expect(results).toHaveLength(2);
      expect(results.every((doc) => doc.tags.includes("government"))).toBe(
        true
      );
    });

    test("should filter documents by expiry date range", () => {
      const results = documentService.searchDocuments({
        expiryDateRange: {
          start: new Date("2024-01-01"),
          end: new Date("2025-12-31"),
        },
      });
      expect(results).toHaveLength(2); // doc1 and doc2
    });

    test("should combine multiple search criteria", () => {
      const results = documentService.searchDocuments({
        query: "Card",
        category: "aadhar",
        familyMemberId: "family1",
      });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("doc1");
    });
  });

  describe("Category-based Retrieval", () => {
    test("should get documents by category", () => {
      const results = documentService.getDocumentsByCategory("aadhar");
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe("aadhar");
    });

    test("should get documents by family member", () => {
      const results = documentService.getDocumentsByFamilyMember("family1");
      expect(results).toHaveLength(2);
    });

    test("should get documents by property", () => {
      const results = documentService.getDocumentsByProperty("prop1");
      expect(results).toHaveLength(1);
    });

    test("should get documents by tags", () => {
      const results = documentService.getDocumentsByTags(["government"]);
      expect(results).toHaveLength(2);
    });
  });

  describe("Expiry Tracking", () => {
    test("should get expiring documents", () => {
      const expiringDocs = documentService.getExpiringDocuments();
      expect(expiringDocs).toHaveLength(2); // doc2 (expiring soon) and doc4 (expired)

      const expiringSoon = expiringDocs.find(
        (info) => info.document.id === "doc2"
      );
      const expired = expiringDocs.find((info) => info.document.id === "doc4");

      expect(expiringSoon?.isExpiringSoon).toBe(true);
      expect(expiringSoon?.isExpired).toBe(false);
      expect(expired?.isExpired).toBe(true);
    });

    test("should get expired documents", () => {
      const expiredDocs = documentService.getExpiredDocuments();
      expect(expiredDocs).toHaveLength(1);
      expect(expiredDocs[0].id).toBe("doc4");
    });

    test("should get documents expiring soon", () => {
      const expiringSoonDocs = documentService.getDocumentsExpiringSoon();
      expect(expiringSoonDocs).toHaveLength(1);
      expect(expiringSoonDocs[0].id).toBe("doc2");
    });
  });

  describe("Statistics", () => {
    test("should get document statistics", () => {
      const stats = documentService.getDocumentStats();

      expect(stats.totalDocuments).toBe(4);
      expect(stats.documentsByCategory.aadhar).toBe(1);
      expect(stats.documentsByCategory.pan).toBe(1);
      expect(stats.documentsByCategory.house_documents).toBe(1);
      expect(stats.documentsByCategory.passport).toBe(1);
      expect(stats.expiringDocuments).toBe(1); // doc2
      expect(stats.expiredDocuments).toBe(1); // doc4
      expect(stats.documentsWithoutExpiry).toBe(1); // doc3
    });
  });

  describe("Tag Management", () => {
    test("should get all unique tags", () => {
      const tags = documentService.getAllTags();
      expect(tags).toEqual([
        "government",
        "identity",
        "legal",
        "property",
        "tax",
        "travel",
      ]);
    });

    test("should add tags to document", () => {
      documentService.addTagsToDocument("doc1", ["new-tag", "another-tag"]);

      expect(mockLocalStorageService.updateDocument).toHaveBeenCalledWith(
        "doc1",
        {
          tags: ["identity", "government", "new-tag", "another-tag"],
        }
      );
    });

    test("should remove tags from document", () => {
      documentService.removeTagsFromDocument("doc1", ["government"]);

      expect(mockLocalStorageService.updateDocument).toHaveBeenCalledWith(
        "doc1",
        {
          tags: ["identity"],
        }
      );
    });

    test("should throw error when adding tags to non-existent document", () => {
      mockLocalStorageService.getDocumentById.mockReturnValue(null);

      expect(() => {
        documentService.addTagsToDocument("nonexistent", ["tag"]);
      }).toThrow('Document with id "nonexistent" not found');
    });
  });

  describe("File Operations", () => {
    test("should create document from file", async () => {
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const metadata = {
        title: "Test Document",
        category: "aadhar" as DocumentCategory,
        familyMemberId: "family1",
        tags: ["test"],
      };

      const document = await documentService.createDocumentFromFile(
        mockFile,
        metadata
      );

      expect(mockFileService.validateFileType).toHaveBeenCalledWith(mockFile);
      expect(mockFileService.validateFileSize).toHaveBeenCalledWith(mockFile);
      expect(mockFileService.convertToBase64).toHaveBeenCalledWith(mockFile);
      expect(mockLocalStorageService.saveDocument).toHaveBeenCalled();

      expect(document.title).toBe("Test Document");
      expect(document.category).toBe("aadhar");
      expect(document.fileName).toBe("test.jpg");
      expect(document.fileData).toBe("data:image/jpeg;base64,newmockdata");
    });

    test("should throw error for invalid file type", async () => {
      mockFileService.validateFileType.mockReturnValue(false);
      const mockFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });

      await expect(
        documentService.createDocumentFromFile(mockFile, {
          title: "Test",
          category: "aadhar",
        })
      ).rejects.toThrow("Invalid file type");
    });

    test("should throw error for file too large", async () => {
      mockFileService.validateFileSize.mockReturnValue(false);
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      await expect(
        documentService.createDocumentFromFile(mockFile, {
          title: "Test",
          category: "aadhar",
        })
      ).rejects.toThrow("File size too large");
    });

    test("should download document", () => {
      documentService.downloadDocument("doc1");

      expect(mockFileService.downloadFile).toHaveBeenCalledWith(
        mockDocuments[0].fileData,
        mockDocuments[0].fileName
      );
    });

    test("should throw error when downloading non-existent document", () => {
      mockLocalStorageService.getDocumentById.mockReturnValue(null);

      expect(() => {
        documentService.downloadDocument("nonexistent");
      }).toThrow('Document with id "nonexistent" not found');
    });
  });

  describe("Category Utilities", () => {
    test("should get category display name", () => {
      expect(documentService.getCategoryDisplayName("aadhar")).toBe(
        "Aadhar Card"
      );
      expect(documentService.getCategoryDisplayName("pan")).toBe("PAN Card");
      expect(documentService.getCategoryDisplayName("driving_license")).toBe(
        "Driving License"
      );
    });

    test("should get all categories with display names", () => {
      const categories = documentService.getAllCategories();

      expect(categories).toHaveLength(10);
      expect(categories[0]).toEqual({ value: "aadhar", label: "Aadhar Card" });
      expect(categories[1]).toEqual({ value: "pan", label: "PAN Card" });
    });
  });

  describe("Validation", () => {
    test("should validate document with missing required fields", async () => {
      const invalidDocument = {
        id: "",
        title: "",
        category: "aadhar" as DocumentCategory,
        fileData: "",
        fileName: "",
        fileSize: 0,
        mimeType: "",
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(
        documentService.saveDocument(invalidDocument)
      ).rejects.toThrow("Document ID is required");
    });

    test("should validate document with future issued date", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const invalidDocument: Document = {
        id: "test",
        title: "Test",
        category: "aadhar",
        fileData: "data:image/jpeg;base64,test",
        fileName: "test.jpg",
        fileSize: 1024,
        mimeType: "image/jpeg",
        issuedDate: futureDate,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await expect(
        documentService.saveDocument(invalidDocument)
      ).rejects.toThrow("Document issued date cannot be in the future");
    });
  });
});
