import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FamilyManagement } from "../FamilyManagement";
import { ApiService } from "@/services/ApiService";
import { FamilyMember } from "@/types";

// Mock the ApiService
jest.mock("@/services/ApiService");
const mockApiService = ApiService as jest.Mocked<typeof ApiService>;

// Mock Next.js Image component
jest.mock("next/image", () => {
  return function MockImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// Mock react-hot-toast
jest.mock("react-hot-toast", () => ({
  success: jest.fn(),
  error: jest.fn(),
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const mockFamilyMembers: FamilyMember[] = [
  {
    id: "1",
    fullName: "John Doe",
    nickname: "Johnny",
    relationship: "Father",
    profilePhoto: undefined,
    dateOfBirth: new Date("1980-01-01"),
    contactInfo: {
      phone: "+1234567890",
      email: "john@example.com",
      address: "123 Main St",
    },
    documents: [],
    insurancePolicies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    fullName: "Jane Doe",
    nickname: "Janie",
    relationship: "Mother",
    profilePhoto: undefined,
    dateOfBirth: new Date("1985-05-15"),
    contactInfo: {
      phone: "+1234567891",
      email: "jane@example.com",
      address: "123 Main St",
    },
    documents: [],
    insurancePolicies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

describe("FamilyManagement Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockApiService.getFamilyMembers.mockResolvedValue(mockFamilyMembers);
  });

  it("loads family members from API on mount", async () => {
    render(<FamilyManagement />);

    // Should show loading state initially
    expect(screen.getByText("Loading family members...")).toBeInTheDocument();

    // Wait for API call to complete
    await waitFor(() => {
      expect(mockApiService.getFamilyMembers).toHaveBeenCalled();
    });

    // Should display family members
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    const errorMessage = "Failed to fetch family members";
    mockApiService.getFamilyMembers.mockRejectedValue(new Error(errorMessage));

    render(<FamilyManagement />);

    await waitFor(() => {
      expect(screen.getByText("Failed to load family members. Please try again.")).toBeInTheDocument();
    });

    // Should show retry button
    const retryButton = screen.getByText("Try Again");
    expect(retryButton).toBeInTheDocument();
  });

  it("creates new family member via API", async () => {
    const user = userEvent.setup();
    const newMember: FamilyMember = {
      id: "3",
      fullName: "Bob Doe",
      nickname: "Bobby",
      relationship: "Son",
      profilePhoto: undefined,
      dateOfBirth: new Date("2010-03-20"),
      contactInfo: {
        phone: "",
        email: "",
        address: "123 Main St",
      },
      documents: [],
      insurancePolicies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockApiService.createFamilyMember.mockResolvedValue(newMember);
    mockApiService.getFamilyMembers
      .mockResolvedValueOnce(mockFamilyMembers)
      .mockResolvedValueOnce([...mockFamilyMembers, newMember]);

    render(<FamilyManagement />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Click add button
    const addButton = screen.getByText("Add Family Member");
    await user.click(addButton);

    // Form should open
    await waitFor(() => {
      expect(screen.getByText("Add Family Member")).toBeInTheDocument();
    });

    // Fill form
    const fullNameInput = screen.getByLabelText(/Full Name/);
    const nicknameInput = screen.getByLabelText(/Nickname/);
    const relationshipSelect = screen.getByLabelText(/Relationship/);

    await user.type(fullNameInput, "Bob Doe");
    await user.type(nicknameInput, "Bobby");
    await user.selectOptions(relationshipSelect, "Son");

    // Submit form
    const submitButton = screen.getByRole("button", { name: /Add Member/ });
    await user.click(submitButton);

    // Should call API
    await waitFor(() => {
      expect(mockApiService.createFamilyMember).toHaveBeenCalledWith(
        expect.objectContaining({
          fullName: "Bob Doe",
          nickname: "Bobby",
          relationship: "Son",
        })
      );
    });

    // Should refresh the list
    await waitFor(() => {
      expect(mockApiService.getFamilyMembers).toHaveBeenCalledTimes(2);
    });
  });

  it("updates existing family member via API", async () => {
    const user = userEvent.setup();
    const updatedMember = { ...mockFamilyMembers[0], fullName: "John Updated Doe" };

    mockApiService.updateFamilyMember.mockResolvedValue(updatedMember);
    mockApiService.getFamilyMembers
      .mockResolvedValueOnce(mockFamilyMembers)
      .mockResolvedValueOnce([updatedMember, mockFamilyMembers[1]]);

    render(<FamilyManagement />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Click edit button (assuming it's available in the card)
    const editButtons = screen.getAllByText("Edit");
    await user.click(editButtons[0]);

    // Form should open with existing data
    await waitFor(() => {
      expect(screen.getByText("Edit Family Member")).toBeInTheDocument();
    });

    // Update name
    const fullNameInput = screen.getByDisplayValue("John Doe");
    await user.clear(fullNameInput);
    await user.type(fullNameInput, "John Updated Doe");

    // Submit form
    const submitButton = screen.getByRole("button", { name: /Update Member/ });
    await user.click(submitButton);

    // Should call API
    await waitFor(() => {
      expect(mockApiService.updateFamilyMember).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({
          fullName: "John Updated Doe",
        })
      );
    });
  });

  it("deletes family member via API", async () => {
    const user = userEvent.setup();
    
    // Mock window.confirm
    const originalConfirm = window.confirm;
    window.confirm = jest.fn(() => true);

    mockApiService.deleteFamilyMember.mockResolvedValue(undefined);
    mockApiService.getFamilyMembers
      .mockResolvedValueOnce(mockFamilyMembers)
      .mockResolvedValueOnce([mockFamilyMembers[1]]); // John removed

    render(<FamilyManagement />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    // Click delete button
    const deleteButtons = screen.getAllByText("Delete");
    await user.click(deleteButtons[0]);

    // Should call API
    await waitFor(() => {
      expect(mockApiService.deleteFamilyMember).toHaveBeenCalledWith("1");
    });

    // Should refresh the list
    await waitFor(() => {
      expect(mockApiService.getFamilyMembers).toHaveBeenCalledTimes(2);
    });

    // Restore window.confirm
    window.confirm = originalConfirm;
  });

  it("retries loading on error", async () => {
    const user = userEvent.setup();
    
    mockApiService.getFamilyMembers
      .mockRejectedValueOnce(new Error("Network error"))
      .mockResolvedValueOnce(mockFamilyMembers);

    render(<FamilyManagement />);

    // Should show error
    await waitFor(() => {
      expect(screen.getByText("Failed to load family members. Please try again.")).toBeInTheDocument();
    });

    // Click retry
    const retryButton = screen.getByText("Try Again");
    await user.click(retryButton);

    // Should retry and succeed
    await waitFor(() => {
      expect(mockApiService.getFamilyMembers).toHaveBeenCalledTimes(2);
    });

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });
});