import { render, screen, fireEvent } from "@testing-library/react";
import { DocumentList } from "../DocumentList";
import { Document, DocumentCategory } from "@/types";
import { documentService } from "@/services/DocumentService";

// Mock the documentService
jest.mock("@/services/DocumentService");
const mockDocumentService = documentService as jest.Mocked<
  typeof documentService
>;

// Mock date-fns
jest.mock("date-fns", () => ({
  formatDistanceToNow: jest.fn(() => "2 days ago"),
  format: jest.fn(() => "Jan 15, 2024"),
}));

describe("DocumentList", () => {
  const mockDocuments: Document[] = [
    {
      id: "doc1",
      title: "Test Document 1",
      category: "aadhar" as DocumentCategory,
      fileData: "data:image/jpeg;base64,test",
      fileName: "test1.jpg",
      fileSize: 1024,
      mimeType: "image/jpeg",
      familyMemberId: "family1",
      expiryDate: new Date("2025-12-31"),
      tags: ["test", "document"],
      createdAt: new Date("2024-01-01"),
      updatedAt: new Date("2024-01-01"),
    },
    {
      id: "doc2",
      title: "Test Document 2",
      category: "pan" as DocumentCategory,
      fileData: "data:application/pdf;base64,test",
      fileName: "test2.pdf",
      fileSize: 2048,
      mimeType: "application/pdf",
      tags: [],
      createdAt: new Date("2024-01-02"),
      updatedAt: new Date("2024-01-02"),
    },
  ];

  const mockProps = {
    documents: mockDocuments,
    onView: jest.fn(),
    onDownload: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => {
    mockDocumentService.getCategoryDisplayName.mockImplementation(
      (category) => {
        const names: Record<DocumentCategory, string> = {
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
        return names[category] || category;
      }
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders document list with documents", () => {
    render(<DocumentList {...mockProps} />);

    expect(screen.getByText("Test Document 1")).toBeInTheDocument();
    expect(screen.getByText("Test Document 2")).toBeInTheDocument();
    expect(screen.getByText("Aadhar Card")).toBeInTheDocument();
    expect(screen.getByText("PAN Card")).toBeInTheDocument();
  });

  test("renders empty state when no documents", () => {
    render(<DocumentList {...mockProps} documents={[]} />);

    expect(screen.getByText("No documents found")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Upload your first document or adjust your search filters."
      )
    ).toBeInTheDocument();
  });

  test("calls onView when view button is clicked", () => {
    render(<DocumentList {...mockProps} />);

    const viewButtons = screen.getAllByTitle("View document");
    fireEvent.click(viewButtons[0]);

    expect(mockProps.onView).toHaveBeenCalledWith(mockDocuments[0]);
  });

  test("calls onDownload when download button is clicked", () => {
    render(<DocumentList {...mockProps} />);

    const downloadButtons = screen.getAllByTitle("Download document");
    fireEvent.click(downloadButtons[0]);

    expect(mockProps.onDownload).toHaveBeenCalledWith("doc1");
  });

  test("calls onDelete when delete button is clicked", () => {
    render(<DocumentList {...mockProps} />);

    const deleteButtons = screen.getAllByTitle("Delete document");
    fireEvent.click(deleteButtons[0]);

    expect(mockProps.onDelete).toHaveBeenCalledWith("doc1");
  });

  test("displays file size correctly", () => {
    render(<DocumentList {...mockProps} />);

    expect(screen.getByText("1 KB")).toBeInTheDocument();
    expect(screen.getByText("2 KB")).toBeInTheDocument();
  });

  test("displays tags when present", () => {
    render(<DocumentList {...mockProps} />);

    expect(screen.getByText("test")).toBeInTheDocument();
    expect(screen.getByText("document")).toBeInTheDocument();
  });

  test("shows sort controls", () => {
    render(<DocumentList {...mockProps} />);

    expect(screen.getByText("Sort by:")).toBeInTheDocument();
    expect(screen.getByText(/Title/)).toBeInTheDocument();
    expect(screen.getByText(/Category/)).toBeInTheDocument();
    expect(screen.getByText(/Created/)).toBeInTheDocument();
    expect(screen.getByText(/Expiry/)).toBeInTheDocument();
  });

  test("shows results summary", () => {
    render(<DocumentList {...mockProps} />);

    expect(screen.getByText("Showing 2 documents")).toBeInTheDocument();
  });

  test("shows singular form for single document", () => {
    render(<DocumentList {...mockProps} documents={[mockDocuments[0]]} />);

    expect(screen.getByText("Showing 1 document")).toBeInTheDocument();
  });
});
