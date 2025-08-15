import { describe, it, expect, beforeEach, vi } from "vitest";
import { FamilyMemberService } from "../FamilyMemberService";
import { localStorageService } from "../LocalStorageService";
import { FamilyMember } from "@/types";

// Mock the LocalStorageService
vi.mock("../LocalStorageService", () => ({
  localStorageService: {
    getFamilyMembers: vi.fn(),
    getFamilyMemberById: vi.fn(),
    saveFamilyMember: vi.fn(),
    updateFamilyMember: vi.fn(),
    deleteFamilyMember: vi.fn(),
  },
}));

// Mock uuid
vi.mock("uuid", () => ({
  v4: () => "test-uuid-123",
}));

describe("FamilyMemberService", () => {
  let service: FamilyMemberService;
  let mockFamilyMember: FamilyMember;

  beforeEach(() => {
    service = new FamilyMemberService();
    vi.clearAllMocks();

    mockFamilyMember = {
      id: "test-id-1",
      fullName: "Test User",
      nickname: "Tester",
      relationship: "Son",
      profilePhoto: undefined,
      dateOfBirth: new Date("1990-01-01"),
      contactInfo: {
        phone: "1234567890",
        email: "test@example.com",
        address: "123 Test St",
      },
      documents: [],
      insurancePolicies: [],
      createdAt: new Date("2023-01-01"),
      updatedAt: new Date("2023-01-01"),
    };
  });

  describe("createFamilyMember", () => {
    it("should create a new family member with valid data", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      const mockSaveFamilyMember = vi.mocked(
        localStorageService.saveFamilyMember
      );

      mockGetFamilyMembers.mockReturnValue([]);

      const result = service.createFamilyMember({
        fullName: "John Doe",
        nickname: "Johnny",
        relationship: "Brother",
        contactInfo: {
          email: "john@example.com",
          phone: "1234567890",
        },
      });

      expect(result.id).toBe("test-uuid-123");
      expect(result.fullName).toBe("John Doe");
      expect(result.nickname).toBe("Johnny");
      expect(result.relationship).toBe("Brother");
      expect(result.contactInfo.email).toBe("john@example.com");
      expect(mockSaveFamilyMember).toHaveBeenCalledWith(result);
    });

    it("should throw error for invalid full name", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([]);

      expect(() => {
        service.createFamilyMember({
          fullName: "A", // Too short
          nickname: "Johnny",
          relationship: "Brother",
        });
      }).toThrow(
        "Validation failed: Full name must be at least 2 characters long"
      );
    });

    it("should throw error for missing nickname", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([]);

      expect(() => {
        service.createFamilyMember({
          fullName: "John Doe",
          nickname: "", // Empty
          relationship: "Brother",
        });
      }).toThrow("Validation failed: Nickname is required");
    });

    it("should throw error for duplicate nickname", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([mockFamilyMember]);

      expect(() => {
        service.createFamilyMember({
          fullName: "John Doe",
          nickname: "Tester", // Duplicate
          relationship: "Brother",
        });
      }).toThrow(
        "Validation failed: A family member with this nickname already exists"
      );
    });
  });

  describe("updateFamilyMember", () => {
    it("should update an existing family member", () => {
      const mockGetFamilyMemberById = vi.mocked(
        localStorageService.getFamilyMemberById
      );
      const mockUpdateFamilyMember = vi.mocked(
        localStorageService.updateFamilyMember
      );

      mockGetFamilyMemberById.mockReturnValueOnce(mockFamilyMember);
      mockGetFamilyMemberById.mockReturnValueOnce({
        ...mockFamilyMember,
        fullName: "Updated Name",
      });

      const result = service.updateFamilyMember("test-id-1", {
        fullName: "Updated Name",
      });

      expect(mockUpdateFamilyMember).toHaveBeenCalledWith("test-id-1", {
        fullName: "Updated Name",
      });
      expect(result.fullName).toBe("Updated Name");
    });

    it("should throw error when family member not found", () => {
      const mockGetFamilyMemberById = vi.mocked(
        localStorageService.getFamilyMemberById
      );
      mockGetFamilyMemberById.mockReturnValue(null);

      expect(() => {
        service.updateFamilyMember("non-existent-id", {
          fullName: "Updated Name",
        });
      }).toThrow('Family member with id "non-existent-id" not found');
    });
  });

  describe("getAllFamilyMembers", () => {
    it("should return all family members", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([mockFamilyMember]);

      const result = service.getAllFamilyMembers();

      expect(result).toEqual([mockFamilyMember]);
      expect(mockGetFamilyMembers).toHaveBeenCalled();
    });
  });

  describe("getFamilyMemberById", () => {
    it("should return family member by id", () => {
      const mockGetFamilyMemberById = vi.mocked(
        localStorageService.getFamilyMemberById
      );
      mockGetFamilyMemberById.mockReturnValue(mockFamilyMember);

      const result = service.getFamilyMemberById("test-id-1");

      expect(result).toEqual(mockFamilyMember);
      expect(mockGetFamilyMemberById).toHaveBeenCalledWith("test-id-1");
    });

    it("should return null when family member not found", () => {
      const mockGetFamilyMemberById = vi.mocked(
        localStorageService.getFamilyMemberById
      );
      mockGetFamilyMemberById.mockReturnValue(null);

      const result = service.getFamilyMemberById("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("deleteFamilyMember", () => {
    it("should delete family member with no associated data", () => {
      const mockGetFamilyMemberById = vi.mocked(
        localStorageService.getFamilyMemberById
      );
      const mockDeleteFamilyMember = vi.mocked(
        localStorageService.deleteFamilyMember
      );

      mockGetFamilyMemberById.mockReturnValue({
        ...mockFamilyMember,
        documents: [],
        insurancePolicies: [],
      });

      service.deleteFamilyMember("test-id-1");

      expect(mockDeleteFamilyMember).toHaveBeenCalledWith("test-id-1");
    });

    it("should throw error when trying to delete member with documents", () => {
      const mockGetFamilyMemberById = vi.mocked(
        localStorageService.getFamilyMemberById
      );

      mockGetFamilyMemberById.mockReturnValue({
        ...mockFamilyMember,
        documents: [{ id: "doc-1" } as any],
        insurancePolicies: [],
      });

      expect(() => {
        service.deleteFamilyMember("test-id-1");
      }).toThrow(
        "Cannot delete family member with associated documents or insurance policies"
      );
    });

    it("should throw error when family member not found", () => {
      const mockGetFamilyMemberById = vi.mocked(
        localStorageService.getFamilyMemberById
      );
      mockGetFamilyMemberById.mockReturnValue(null);

      expect(() => {
        service.deleteFamilyMember("non-existent-id");
      }).toThrow('Family member with id "non-existent-id" not found');
    });
  });

  describe("searchFamilyMembers", () => {
    it("should return all members when query is empty", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([mockFamilyMember]);

      const result = service.searchFamilyMembers("");

      expect(result).toEqual([mockFamilyMember]);
    });

    it("should search by full name", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([mockFamilyMember]);

      const result = service.searchFamilyMembers("Test");

      expect(result).toEqual([mockFamilyMember]);
    });

    it("should search by nickname", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([mockFamilyMember]);

      const result = service.searchFamilyMembers("Tester");

      expect(result).toEqual([mockFamilyMember]);
    });

    it("should search by relationship", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([mockFamilyMember]);

      const result = service.searchFamilyMembers("Son");

      expect(result).toEqual([mockFamilyMember]);
    });

    it("should return empty array when no matches found", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([mockFamilyMember]);

      const result = service.searchFamilyMembers("NonExistent");

      expect(result).toEqual([]);
    });
  });

  describe("filterByRelationship", () => {
    it("should filter members by relationship", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([
        mockFamilyMember,
        { ...mockFamilyMember, id: "test-id-2", relationship: "Daughter" },
      ]);

      const result = service.filterByRelationship("Son");

      expect(result).toHaveLength(1);
      expect(result[0].relationship).toBe("Son");
    });

    it("should be case insensitive", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([mockFamilyMember]);

      const result = service.filterByRelationship("son");

      expect(result).toHaveLength(1);
      expect(result[0].relationship).toBe("Son");
    });
  });

  describe("getUpcomingBirthdays", () => {
    it("should return members with upcoming birthdays", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      const today = new Date();
      const upcomingBirthday = new Date();
      upcomingBirthday.setDate(today.getDate() + 10);
      upcomingBirthday.setFullYear(1990); // Set to past year to simulate birthday

      mockGetFamilyMembers.mockReturnValue([
        {
          ...mockFamilyMember,
          dateOfBirth: upcomingBirthday,
        },
      ]);

      const result = service.getUpcomingBirthdays(30);

      expect(result).toHaveLength(1);
    });

    it("should return empty array when no upcoming birthdays", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      const pastBirthday = new Date();
      pastBirthday.setDate(pastBirthday.getDate() - 100);

      mockGetFamilyMembers.mockReturnValue([
        {
          ...mockFamilyMember,
          dateOfBirth: pastBirthday,
        },
      ]);

      const result = service.getUpcomingBirthdays(30);

      expect(result).toHaveLength(0);
    });
  });

  describe("getFamilyMemberStats", () => {
    it("should return correct statistics", () => {
      const mockGetFamilyMembers = vi.mocked(
        localStorageService.getFamilyMembers
      );
      mockGetFamilyMembers.mockReturnValue([
        {
          ...mockFamilyMember,
          profilePhoto: "base64-photo",
          documents: [{ id: "doc-1" } as any],
          insurancePolicies: [{ id: "policy-1" } as any],
        },
        {
          ...mockFamilyMember,
          id: "test-id-2",
          relationship: "Daughter",
          profilePhoto: undefined,
          documents: [],
          insurancePolicies: [],
        },
      ]);

      const result = service.getFamilyMemberStats();

      expect(result.totalMembers).toBe(2);
      expect(result.membersWithPhotos).toBe(1);
      expect(result.membersWithDocuments).toBe(1);
      expect(result.membersWithInsurance).toBe(1);
      expect(result.relationshipBreakdown).toEqual({
        Son: 1,
        Daughter: 1,
      });
    });
  });

  describe("validateContactInfo", () => {
    it("should return empty array for valid contact info", () => {
      const result = service.validateContactInfo({
        email: "test@example.com",
        phone: "1234567890",
      });

      expect(result).toEqual([]);
    });

    it("should return error for invalid email", () => {
      const result = service.validateContactInfo({
        email: "invalid-email",
      });

      expect(result).toContain("Invalid email format");
    });

    it("should return error for invalid phone", () => {
      const result = service.validateContactInfo({
        phone: "invalid-phone",
      });

      expect(result).toContain("Invalid phone number format");
    });
  });

  describe("utility methods", () => {
    it("should format display name correctly", () => {
      const result = service.getDisplayName(mockFamilyMember);
      expect(result).toBe("Test User (Tester)");
    });

    it("should calculate age correctly", () => {
      const birthDate = new Date();
      birthDate.setFullYear(birthDate.getFullYear() - 25);

      const result = service.getAge(birthDate);
      expect(result).toBe(25);
    });

    it("should format relationship correctly", () => {
      const result = service.formatRelationship("FATHER");
      expect(result).toBe("Father");
    });
  });
});
