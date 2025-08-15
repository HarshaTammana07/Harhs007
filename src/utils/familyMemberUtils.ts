import { FamilyMember, ContactInfo } from "@/types";

/**
 * Utility functions for family member operations
 */

/**
 * Validates if a family member has complete profile information
 */
export function hasCompleteProfile(member: FamilyMember): boolean {
  return !!(
    member.fullName &&
    member.nickname &&
    member.relationship &&
    member.contactInfo.email &&
    member.contactInfo.phone
  );
}

/**
 * Gets the completion percentage of a family member profile
 */
export function getProfileCompletionPercentage(member: FamilyMember): number {
  const fields = [
    member.fullName,
    member.nickname,
    member.relationship,
    member.profilePhoto,
    member.dateOfBirth,
    member.contactInfo.email,
    member.contactInfo.phone,
    member.contactInfo.address,
  ];

  const completedFields = fields.filter(
    (field) => field !== undefined && field !== null && field !== ""
  ).length;
  return Math.round((completedFields / fields.length) * 100);
}

/**
 * Sorts family members by relationship priority
 */
export function sortByRelationshipPriority(
  members: FamilyMember[]
): FamilyMember[] {
  const relationshipPriority: { [key: string]: number } = {
    father: 1,
    mother: 2,
    husband: 3,
    wife: 4,
    son: 5,
    daughter: 6,
    brother: 7,
    sister: 8,
    grandfather: 9,
    grandmother: 10,
    uncle: 11,
    aunt: 12,
    cousin: 13,
    nephew: 14,
    niece: 15,
  };

  return [...members].sort((a, b) => {
    const priorityA = relationshipPriority[a.relationship.toLowerCase()] || 999;
    const priorityB = relationshipPriority[b.relationship.toLowerCase()] || 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // If same priority, sort by name
    return a.fullName.localeCompare(b.fullName);
  });
}

/**
 * Sorts family members by age (oldest first)
 */
export function sortByAge(members: FamilyMember[]): FamilyMember[] {
  return [...members].sort((a, b) => {
    if (!a.dateOfBirth && !b.dateOfBirth) return 0;
    if (!a.dateOfBirth) return 1;
    if (!b.dateOfBirth) return -1;

    return (
      new Date(a.dateOfBirth).getTime() - new Date(b.dateOfBirth).getTime()
    );
  });
}

/**
 * Groups family members by relationship
 */
export function groupByRelationship(members: FamilyMember[]): {
  [relationship: string]: FamilyMember[];
} {
  return members.reduce(
    (groups, member) => {
      const relationship = member.relationship.toLowerCase();
      if (!groups[relationship]) {
        groups[relationship] = [];
      }
      groups[relationship].push(member);
      return groups;
    },
    {} as { [relationship: string]: FamilyMember[] }
  );
}

/**
 * Formats contact information for display
 */
export function formatContactInfo(contactInfo: ContactInfo): string {
  const parts: string[] = [];

  if (contactInfo.phone) {
    parts.push(`📞 ${contactInfo.phone}`);
  }

  if (contactInfo.email) {
    parts.push(`📧 ${contactInfo.email}`);
  }

  if (contactInfo.address) {
    parts.push(`🏠 ${contactInfo.address}`);
  }

  return parts.join(" • ");
}

/**
 * Gets initials from full name
 */
export function getInitials(fullName: string): string {
  return fullName
    .split(" ")
    .map((name) => name.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
}

/**
 * Checks if a family member has any alerts (expiring documents, upcoming birthday, etc.)
 */
export function hasAlerts(member: FamilyMember): boolean {
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // Check for upcoming birthday
  if (member.dateOfBirth) {
    const birthday = new Date(member.dateOfBirth);
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    );

    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }

    if (thisYearBirthday <= thirtyDaysFromNow) {
      return true;
    }
  }

  // Check for expiring documents
  const hasExpiringDocuments = member.documents.some((doc) => {
    if (!doc.expiryDate) return false;
    const expiryDate = new Date(doc.expiryDate);
    return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
  });

  if (hasExpiringDocuments) {
    return true;
  }

  // Check for expiring insurance policies
  const hasExpiringInsurance = member.insurancePolicies.some((policy) => {
    const renewalDate = new Date(policy.renewalDate);
    return renewalDate <= thirtyDaysFromNow && renewalDate >= today;
  });

  return hasExpiringInsurance;
}

/**
 * Gets alert count for a family member
 */
export function getAlertCount(member: FamilyMember): number {
  let count = 0;
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // Check for upcoming birthday
  if (member.dateOfBirth) {
    const birthday = new Date(member.dateOfBirth);
    const thisYearBirthday = new Date(
      today.getFullYear(),
      birthday.getMonth(),
      birthday.getDate()
    );

    if (thisYearBirthday < today) {
      thisYearBirthday.setFullYear(today.getFullYear() + 1);
    }

    if (thisYearBirthday <= thirtyDaysFromNow) {
      count++;
    }
  }

  // Count expiring documents
  count += member.documents.filter((doc) => {
    if (!doc.expiryDate) return false;
    const expiryDate = new Date(doc.expiryDate);
    return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
  }).length;

  // Count expiring insurance policies
  count += member.insurancePolicies.filter((policy) => {
    const renewalDate = new Date(policy.renewalDate);
    return renewalDate <= thirtyDaysFromNow && renewalDate >= today;
  }).length;

  return count;
}

/**
 * Validates family member data for form submission
 */
export function validateFamilyMemberForm(data: {
  fullName: string;
  nickname: string;
  relationship: string;
  contactInfo?: Partial<ContactInfo>;
}): { isValid: boolean; errors: string[] } {
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

  // Validate contact info if provided
  if (data.contactInfo?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.contactInfo.email)) {
      errors.push("Invalid email format");
    }
  }

  if (data.contactInfo?.phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(data.contactInfo.phone.replace(/[\s\-\(\)]/g, ""))) {
      errors.push("Invalid phone number format");
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Common relationship options for dropdowns
 */
export const RELATIONSHIP_OPTIONS = [
  "Father",
  "Mother",
  "Husband",
  "Wife",
  "Son",
  "Daughter",
  "Brother",
  "Sister",
  "Grandfather",
  "Grandmother",
  "Uncle",
  "Aunt",
  "Cousin",
  "Nephew",
  "Niece",
  "Other",
] as const;

/**
 * Gets a color class for relationship badges
 */
export function getRelationshipColor(relationship: string): string {
  const colorMap: { [key: string]: string } = {
    father: "bg-blue-100 text-blue-800",
    mother: "bg-pink-100 text-pink-800",
    husband: "bg-green-100 text-green-800",
    wife: "bg-green-100 text-green-800",
    son: "bg-purple-100 text-purple-800",
    daughter: "bg-purple-100 text-purple-800",
    brother: "bg-indigo-100 text-indigo-800",
    sister: "bg-indigo-100 text-indigo-800",
    grandfather: "bg-gray-100 text-gray-800",
    grandmother: "bg-gray-100 text-gray-800",
    uncle: "bg-yellow-100 text-yellow-800",
    aunt: "bg-yellow-100 text-yellow-800",
    cousin: "bg-orange-100 text-orange-800",
    nephew: "bg-red-100 text-red-800",
    niece: "bg-red-100 text-red-800",
  };

  return colorMap[relationship.toLowerCase()] || "bg-gray-100 text-gray-800";
}
