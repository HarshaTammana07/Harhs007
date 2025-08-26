"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { FamilyMember, ContactInfo } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import {
  validateFamilyMemberForm,
  RELATIONSHIP_OPTIONS,
  getInitials,
} from "@/utils/familyMemberUtils";
import { fileService } from "@/services/FileService";
import toast from "react-hot-toast";
import Image from "next/image";

interface FamilyMemberFormProps {
  member?: FamilyMember;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    member: Omit<FamilyMember, "id" | "createdAt" | "updatedAt">
  ) => Promise<void>;
  loading?: boolean;
}

interface FormData {
  fullName: string;
  nickname: string;
  relationship: string;
  dateOfBirth: string;
  profilePhoto?: string;
  contactInfo: ContactInfo;
}

export function FamilyMemberForm({
  member,
  isOpen,
  onClose,
  onSave,
  loading = false,
}: FamilyMemberFormProps) {
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    nickname: "",
    relationship: "",
    dateOfBirth: "",
    profilePhoto: undefined,
    contactInfo: {
      phone: "",
      email: "",
      address: "",
    },
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when member changes
  useEffect(() => {
    if (member) {
      setFormData({
        fullName: member.fullName,
        nickname: member.nickname,
        relationship: member.relationship,
        dateOfBirth: member.dateOfBirth
          ? new Date(member.dateOfBirth).toISOString().split("T")[0]
          : "",
        profilePhoto: member.profilePhoto,
        contactInfo: {
          phone: member.contactInfo.phone || "",
          email: member.contactInfo.email || "",
          address: member.contactInfo.address || "",
        },
      });
      setPhotoPreview(member.profilePhoto || null);
    } else {
      // Reset form for new member
      setFormData({
        fullName: "",
        nickname: "",
        relationship: "",
        dateOfBirth: "",
        profilePhoto: undefined,
        contactInfo: {
          phone: "",
          email: "",
          address: "",
        },
      });
      setPhotoPreview(null);
    }
    setErrors([]);
  }, [member, isOpen]);

  const handleInputChange = useCallback(
    (field: keyof FormData, value: string) => {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
      // Clear errors when user starts typing
      if (errors.length > 0) {
        setErrors([]);
      }
    },
    [errors.length]
  );

  const handleContactInfoChange = useCallback(
    (field: keyof ContactInfo, value: string) => {
      setFormData((prev) => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value,
        },
      }));
      if (errors.length > 0) {
        setErrors([]);
      }
    },
    [errors.length]
  );

  const handlePhotoSelect = useCallback(async (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (fileService.isImage(file)) {
        try {
          const base64Data = await fileService.convertToBase64(file);
          setFormData((prev) => ({
            ...prev,
            profilePhoto: base64Data,
          }));
          setPhotoPreview(base64Data);
        } catch (error) {
          console.error("Error processing photo:", error);
          setErrors(["Failed to process photo. Please try again."]);
        }
      }
    }
  }, []);

  const handleRemovePhoto = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      profilePhoto: undefined,
    }));
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      // Validate form data
      const validation = validateFamilyMemberForm({
        fullName: formData.fullName,
        nickname: formData.nickname,
        relationship: formData.relationship,
        contactInfo: formData.contactInfo,
      });

      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsSubmitting(false);
        return;
      }

      try {
        const memberData: Omit<FamilyMember, "id" | "createdAt" | "updatedAt"> =
          {
            fullName: formData.fullName.trim(),
            nickname: formData.nickname.trim(),
            relationship: formData.relationship,
            dateOfBirth: formData.dateOfBirth
              ? new Date(formData.dateOfBirth)
              : undefined,
            profilePhoto: formData.profilePhoto,
            contactInfo: {
              phone: formData.contactInfo.phone?.trim() || undefined,
              email: formData.contactInfo.email?.trim() || undefined,
              address: formData.contactInfo.address?.trim() || undefined,
            },
            documents: member?.documents || [],
            insurancePolicies: member?.insurancePolicies || [],
          };

        await onSave(memberData);
        onClose();
      } catch (error) {
        console.error("Error saving family member:", error);
        setErrors(["Failed to save family member. Please try again."]);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, member, onSave, onClose]
  );

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [isSubmitting, onClose]);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={member ? "Edit Family Member" : "Add Family Member"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400 dark:text-red-300"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                    Please fix the following errors:
                  </h3>
                  <ul className="mt-2 text-sm text-red-700 dark:text-red-300 list-disc list-inside">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Profile Photo Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Profile Photo</h3>
            <div className="flex items-center space-x-6">
              {/* Photo Preview */}
              <div className="flex-shrink-0">
                {photoPreview ? (
                  <div className="relative w-24 h-24 rounded-full overflow-hidden">
                    <Image
                      src={photoPreview}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-semibold">
                    {formData.fullName ? getInitials(formData.fullName) : "?"}
                  </div>
                )}
              </div>

              {/* Photo Actions */}
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoPreview ? "Change Photo" : "Upload Photo"}
                  </Button>
                  {photoPreview && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleRemovePhoto}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG or GIF. Max size 5MB.
                </p>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  handlePhotoSelect(files);
                }}
                className="hidden"
              />
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name *
              </label>
              <Input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                placeholder="Enter full name"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nickname *
              </label>
              <Input
                type="text"
                value={formData.nickname}
                onChange={(e) => handleInputChange("nickname", e.target.value)}
                placeholder="Enter nickname"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Relationship *
              </label>
              <select
                value={formData.relationship}
                onChange={(e) =>
                  handleInputChange("relationship", e.target.value)
                }
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                <option value="" className="text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
                  Select relationship
                </option>
                {RELATIONSHIP_OPTIONS.map((relationship) => (
                  <option
                    key={relationship}
                    value={relationship}
                    className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
                  >
                    {relationship}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth
              </label>
              <Input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.contactInfo.phone || ""}
                  onChange={(e) =>
                    handleContactInfoChange("phone", e.target.value)
                  }
                  placeholder="Enter phone number"
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.contactInfo.email || ""}
                  onChange={(e) =>
                    handleContactInfoChange("email", e.target.value)
                  }
                  placeholder="Enter email address"
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address
                </label>
                <textarea
                  value={formData.contactInfo.address || ""}
                  onChange={(e) =>
                    handleContactInfoChange("address", e.target.value)
                  }
                  placeholder="Enter address"
                  rows={3}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting || loading}
              disabled={isSubmitting || loading}
            >
              {member ? "Update Member" : "Add Member"}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
