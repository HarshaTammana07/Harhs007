import { render, screen, fireEvent } from "@testing-library/react";
import { TenantCard } from "../TenantCard";
import { Tenant } from "@/types";

const mockTenant: Tenant = {
  id: "tenant-1",
  personalInfo: {
    firstName: "John",
    lastName: "Doe",
    fullName: "John Doe",
    dateOfBirth: new Date("1990-01-01"),
    occupation: "Software Engineer",
    employer: "Tech Corp",
    monthlyIncome: 50000,
    maritalStatus: "married",
    familySize: 2,
    nationality: "Indian",
    religion: "Hindu",
  },
  contactInfo: {
    phone: "+91-9876543210",
    email: "john.doe@example.com",
    address: "123 Main Street, City, State",
  },
  emergencyContact: {
    name: "Jane Doe",
    relationship: "Spouse",
    phone: "+91-9876543211",
    email: "jane.doe@example.com",
    address: "123 Main Street, City, State",
  },
  identification: {
    aadharNumber: "1234-5678-9012",
    panNumber: "ABCDE1234F",
    drivingLicense: "DL123456789",
    passport: "P1234567",
    voterIdNumber: "VOT123456",
  },
  rentalAgreement: {
    agreementNumber: "AGR-001",
    startDate: new Date("2023-01-01"),
    endDate: new Date("2024-01-01"),
    rentAmount: 25000,
    securityDeposit: 50000,
    maintenanceCharges: 2000,
    rentDueDate: 5,
    paymentMethod: "bank_transfer",
    lateFeeAmount: 500,
    noticePeriod: 30,
    renewalTerms: "Renewable for another year",
    specialConditions: ["No pets allowed", "No smoking"],
  },
  references: [
    {
      name: "Reference 1",
      relationship: "Friend",
      phone: "+91-9876543212",
      email: "ref1@example.com",
      address: "Reference Address 1",
      verified: true,
    },
  ],
  documents: [],
  moveInDate: new Date("2023-01-01"),
  moveOutDate: undefined,
  isActive: true,
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
};

describe("TenantCard", () => {
  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders tenant information correctly", () => {
    render(
      <TenantCard
        tenant={mockTenant}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
    expect(screen.getByText("+91-9876543210")).toBeInTheDocument();
    expect(screen.getByText("₹25,000")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("displays property information when provided", () => {
    const propertyInfo = {
      propertyName: "Test Building",
      propertyType: "building" as const,
      unitInfo: "D-No: 101",
    };

    render(
      <TenantCard
        tenant={mockTenant}
        propertyInfo={propertyInfo}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Test Building")).toBeInTheDocument();
    expect(screen.getByText("building • D-No: 101")).toBeInTheDocument();
  });

  it("calls onView when view button is clicked", () => {
    render(
      <TenantCard
        tenant={mockTenant}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText("View"));
    expect(mockOnView).toHaveBeenCalledWith(mockTenant);
  });

  it("calls onEdit when edit button is clicked", () => {
    render(
      <TenantCard
        tenant={mockTenant}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText("Edit"));
    expect(mockOnEdit).toHaveBeenCalledWith(mockTenant);
  });

  it("calls onDelete when delete button is clicked", () => {
    render(
      <TenantCard
        tenant={mockTenant}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    fireEvent.click(screen.getByText("Delete"));
    expect(mockOnDelete).toHaveBeenCalledWith(mockTenant);
  });

  it("hides actions when showActions is false", () => {
    render(<TenantCard tenant={mockTenant} showActions={false} />);

    expect(screen.queryByText("View")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  it("displays inactive status correctly", () => {
    const inactiveTenant = { ...mockTenant, isActive: false };

    render(
      <TenantCard
        tenant={inactiveTenant}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Inactive")).toBeInTheDocument();
  });

  it("calculates tenancy duration correctly", () => {
    const tenantWithDuration = {
      ...mockTenant,
      moveInDate: new Date("2023-01-01"),
      moveOutDate: new Date("2023-07-01"), // 6 months later
    };

    render(
      <TenantCard
        tenant={tenantWithDuration}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Should show approximately 6 months
    expect(screen.getByText(/6 month/)).toBeInTheDocument();
  });

  it("displays emergency contact information", () => {
    render(
      <TenantCard
        tenant={mockTenant}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Spouse")).toBeInTheDocument();
    expect(screen.getByText("+91-9876543211")).toBeInTheDocument();
  });

  it("displays document and reference counts", () => {
    const tenantWithDocuments = {
      ...mockTenant,
      documents: [
        {
          id: "doc-1",
          title: "Aadhar Card",
          category: "aadhar" as const,
          fileData: "base64data",
          fileName: "aadhar.pdf",
          fileSize: 1024,
          mimeType: "application/pdf",
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    };

    render(
      <TenantCard
        tenant={tenantWithDocuments}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText("Documents: 1")).toBeInTheDocument();
    expect(screen.getByText("References: 1")).toBeInTheDocument();
  });
});
