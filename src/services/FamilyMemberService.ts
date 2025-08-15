import { FamilyMember, ContactInfo, Document, InsurancePolicy } from "@/types";
import { localStorageService } from "./LocalStorageService";
import { v4 as uuidv4 } from "uuid";

/**
 * Family Member Service - Specialized service for family member operations
 * Provides business logic, validation, and utility functions for family member management
 */
export class FamilyMemberService {
  /**
   * Creates a new family member with validation
   */
  public createFamilyMember(data: {
    fullName: string;
    nickname: string;
    relationship: string;
    profilePhoto?: string;
    dateOfBirth?: Date;
    contactInfo?: Partial<ContactInfo>;
  }): FamilyMember {
    this.validateFamilyMemberData(data);

    const familyMember: FamilyMember = {
      id: uuidv4(),
      fullName: data.fullName.trim(),
      nickname: data.nickname.trim(),
      relationship: data.relationship.trim(),
      profilePhoto: data.profilePhoto,
      dateOfBirth: data.dateOfBirth,
      contactInfo: {
        phone: data.contactInfo?.phone?.trim(),
        email: data.contactInfo?.email?.trim(),
        address: data.contactInfo?.address?.trim(),
      },
      documents: [],
      insurancePolicies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    localStorageService.saveFamilyMember(familyMember);
    return familyMember;
  }

  /**
   * Updates an existing family member
   */
  public updateFamilyMember(
    id: string,
    updates: Partial<Omit<FamilyMember, "id" | "createdAt" | "updatedAt">>
  ): FamilyMember {
    const existingMember = localStorageService.getFamilyMemberById(id);
    if (!existingMember) {
      throw new Error(`Family member with id "${id}" not found`);
    }

    // Validate updates if they contain core data
    if (updates.fullName || updates.nickname || updates.relationship) {
      this.validateFamilyMemberData({
        fullName: updates.fullName || existingMember.fullName,
        nickname: updates.nickname || existingMember.nickname,
        relationship: updates.relationship || existingMember.relationship,
      });
    }

    // Clean up contact info if provided
    if (updates.contactInfo) {
      updates.contactInfo = {
        phone: updates.contactInfo.phone?.trim(),
        email: updates.contactInfo.email?.trim(),
        address: updates.contactInfo.address?.trim(),
      };
    }

    localStorageService.updateFamilyMember(id, updates);
    return localStorageService.getFamilyMemberById(id)!;
  }

  /**
   * Gets all family members
   */
  public getAllFamilyMembers(): FamilyMember[] {
    return localStorageService.getFamilyMembers();
  }

  /**
   * Gets a family member by ID
   */
  public getFamilyMemberById(id: string): FamilyMember | null {
    return localStorageService.getFamilyMemberById(id);
  }

  /**
   * Deletes a family member
   */
  public deleteFamilyMember(id: string): void {
    const member = localStorageService.getFamilyMemberById(id);
    if (!member) {
      throw new Error(`Family member with id "${id}" not found`);
    }

    // Check if member has associated data
    const hasDocuments = member.documents.length > 0;
    const hasInsurancePolicies = member.insurancePolicies.length > 0;

    if (hasDocuments || hasInsurancePolicies) {
      throw new Error(
        "Cannot delete family member with associated documents or insurance policies. Please remove associated data first."
      );
    }

    localStorageService.deleteFamilyMember(id);
  }

  /**
   * Searches family members by name or nickname
   */
  public searchFamilyMembers(query: string): FamilyMember[] {
    if (!query.trim()) {
      return this.getAllFamilyMembers();
    }

    const searchTerm = query.toLowerCase().trim();
    const members = this.getAllFamilyMembers();

    return members.filter(
      (member) =>
        member.fullName.toLowerCase().includes(searchTerm) ||
        member.nickname.toLowerCase().includes(searchTerm) ||
        member.relationship.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Filters family members by relationship
   */
  public filterByRelationship(relationship: string): FamilyMember[] {
    const members = this.getAllFamilyMembers();
    return members.filter(
      (member) =>
        member.relationship.toLowerCase() === relationship.toLowerCase()
    );
  }

  /**
   * Gets family members with upcoming birthdays (within next 30 days)
   */
  public getUpcomingBirthdays(daysAhead: number = 30): FamilyMember[] {
    const members = this.getAllFamilyMembers();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return members.filter((member) => {
      if (!member.dateOfBirth) return false;

      const birthday = new Date(member.dateOfBirth);
      const thisYearBirthday = new Date(
        today.getFullYear(),
        birthday.getMonth(),
        birthday.getDate()
      );

      // If birthday already passed this year, check next year
      if (thisYearBirthday < today) {
        thisYearBirthday.setFullYear(today.getFullYear() + 1);
      }

      return thisYearBirthday >= today && thisYearBirthday <= futureDate;
    });
  }

  /**
   * Gets family members with expiring documents
   */
  public getMembersWithExpiringDocuments(daysAhead: number = 30): {
    member: FamilyMember;
    expiringDocuments: Document[];
  }[] {
    const members = this.getAllFamilyMembers();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return members
      .map((member) => {
        const expiringDocuments = member.documents.filter((doc) => {
          if (!doc.expiryDate) return false;
          const expiryDate = new Date(doc.expiryDate);
          return expiryDate <= futureDate && expiryDate >= new Date();
        });

        return { member, expiringDocuments };
      })
      .filter((item) => item.expiringDocuments.length > 0);
  }

  /**
   * Gets family member statistics
   */
  public getFamilyMemberStats(): {
    totalMembers: number;
    membersWithPhotos: number;
    membersWithDocuments: number;
    membersWithInsurance: number;
    relationshipBreakdown: { [relationship: string]: number };
  } {
    const members = this.getAllFamilyMembers();

    const stats = {
      totalMembers: members.length,
      membersWithPhotos: members.filter((m) => m.profilePhoto).length,
      membersWithDocuments: members.filter((m) => m.documents.length > 0)
        .length,
      membersWithInsurance: members.filter(
        (m) => m.insurancePolicies.length > 0
      ).length,
      relationshipBreakdown: {} as { [relationship: string]: number },
    };

    // Calculate relationship breakdown
    members.forEach((member) => {
      const relationship = member.relationship;
      stats.relationshipBreakdown[relationship] =
        (stats.relationshipBreakdown[relationship] || 0) + 1;
    });

    return stats;
  }

  /**
   * Associates a document with a family member
   */
  public associateDocument(memberId: string, document: Document): void {
    const member = localStorageService.getFamilyMemberById(memberId);
    if (!member) {
      throw new Error(`Family member with id "${memberId}" not found`);
    }

    const updatedDocuments = [...member.documents, document];
    localStorageService.updateFamilyMember(memberId, {
      documents: updatedDocuments,
    });
  }

  /**
   * Removes a document association from a family member
   */
  public removeDocumentAssociation(memberId: string, documentId: string): void {
    const member = localStorageService.getFamilyMemberById(memberId);
    if (!member) {
      throw new Error(`Family member with id "${memberId}" not found`);
    }

    const updatedDocuments = member.documents.filter(
      (doc) => doc.id !== documentId
    );
    localStorageService.updateFamilyMember(memberId, {
      documents: updatedDocuments,
    });
  }

  /**
   * Associates an insurance policy with a family member
   */
  public associateInsurancePolicy(
    memberId: string,
    policy: InsurancePolicy
  ): void {
    const member = localStorageService.getFamilyMemberById(memberId);
    if (!member) {
      throw new Error(`Family member with id "${memberId}" not found`);
    }

    const updatedPolicies = [...member.insurancePolicies, policy];
    localStorageService.updateFamilyMember(memberId, {
      insurancePolicies: updatedPolicies,
    });
  }

  /**
   * Removes an insurance policy association from a family member
   */
  public removeInsurancePolicyAssociation(
    memberId: string,
    policyId: string
  ): void {
    const member = localStorageService.getFamilyMemberById(memberId);
    if (!member) {
      throw new Error(`Family member with id "${memberId}" not found`);
    }

    const updatedPolicies = member.insurancePolicies.filter(
      (policy) => policy.id !== policyId
    );
    localStorageService.updateFamilyMember(memberId, {
      insurancePolicies: updatedPolicies,
    });
  }

  /**
   * Validates family member data
   */
  private validateFamilyMemberData(data: {
    fullName: string;
    nickname: string;
    relationship: string;
  }): void {
    const errors: string[] = [];

    // Validate full name
    if (!data.fullName || data.fullName.trim().length < 2) {
      errors.push("Full name must be at least 2 characters long");
    }

    if (data.fullName && data.fullName.trim().length > 100) {
      errors.push("Full name must be less than 100 characters");
    }

    // Validate nickname
    if (!data.nickname || data.nickname.trim().length < 1) {
      errors.push("Nickname is required");
    }

    if (data.nickname && data.nickname.trim().length > 50) {
      errors.push("Nickname must be less than 50 characters");
    }

    // Validate relationship
    if (!data.relationship || data.relationship.trim().length < 1) {
      errors.push("Relationship is required");
    }

    if (data.relationship && data.relationship.trim().length > 50) {
      errors.push("Relationship must be less than 50 characters");
    }

    // Check for duplicate nicknames
    const existingMembers = this.getAllFamilyMembers();
    const duplicateNickname = existingMembers.find(
      (member) =>
        member.nickname.toLowerCase() === data.nickname.trim().toLowerCase()
    );

    if (duplicateNickname) {
      errors.push("A family member with this nickname already exists");
    }

    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(", ")}`);
    }
  }

  /**
   * Validates contact information
   */
  public validateContactInfo(contactInfo: Partial<ContactInfo>): string[] {
    const errors: string[] = [];

    if (contactInfo.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(contactInfo.email)) {
        errors.push("Invalid email format");
      }
    }

    if (contactInfo.phone) {
      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(contactInfo.phone.replace(/[\s\-\(\)]/g, ""))) {
        errors.push("Invalid phone number format");
      }
    }

    return errors;
  }

  /**
   * Formats family member display name
   */
  public getDisplayName(member: FamilyMember): string {
    return `${member.fullName} (${member.nickname})`;
  }

  /**
   * Gets age from date of birth
   */
  public getAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }

  /**
   * Formats relationship for display
   */
  public formatRelationship(relationship: string): string {
    return (
      relationship.charAt(0).toUpperCase() + relationship.slice(1).toLowerCase()
    );
  }
}

// Export singleton instance
export const familyMemberService = new FamilyMemberService();
