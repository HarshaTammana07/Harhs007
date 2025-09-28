"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Modal,
} from "@/components/ui";

import { InsurancePolicy, FamilyMember, Document } from "@/types";
import { ApiService } from "@/services/ApiService";
import { fileService } from "@/services/FileService";
import toast from "react-hot-toast";

interface InsurancePolicyFormData {
  policyNumber: string;
  type: InsurancePolicy["type"];
  provider: string;
  familyMemberId: string;
  premiumAmount: number;
  coverageAmount: number;
  startDate: string;
  endDate: string;
  renewalDate: string;
  status: InsurancePolicy["status"];
}

interface InsurancePolicyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  policy?: InsurancePolicy;
  defaultType?: InsurancePolicy["type"];
}

export const InsurancePolicyForm: React.FC<InsurancePolicyFormProps> = ({
  isOpen,
  onClose,
  onSave,
  policy,
  defaultType,
}) => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<InsurancePolicyFormData>();

  // Load family members when modal opens
  useEffect(() => {
    if (isOpen) {
      loadFamilyMembers();
    }
  }, [isOpen]);

  // Set form values after family members are loaded
  useEffect(() => {
    if (isOpen && familyMembers.length > 0) {
      if (policy) {
        // Populate form with existing policy data
        setValue("policyNumber", policy.policyNumber);
        setValue("type", policy.type);
        setValue("provider", policy.provider);
        setValue("familyMemberId", policy.familyMemberId);
        setValue("premiumAmount", policy.premiumAmount);
        setValue("coverageAmount", policy.coverageAmount);
        setValue(
          "startDate",
          new Date(policy.startDate).toISOString().split("T")[0]
        );
        setValue(
          "endDate",
          new Date(policy.endDate).toISOString().split("T")[0]
        );
        setValue(
          "renewalDate",
          new Date(policy.renewalDate).toISOString().split("T")[0]
        );
        setValue("status", policy.status);
        setDocuments(policy.documents || []);
      } else if (defaultType) {
        setValue("type", defaultType);
        setValue("status", "active");
      }
    }
  }, [isOpen, policy, defaultType, setValue, familyMembers]);

  const loadFamilyMembers = async () => {
    try {
      const members = await ApiService.getFamilyMembers();
      setFamilyMembers(members);
    } catch (error) {
      console.error("Failed to load family members:", error);
      toast.error("Failed to load family members");
    }
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      const uploadedDocs: Document[] = [];
      for (const file of files) {
        const fileData = await fileService.readFileAsDataURL(file);
        const doc: Document = {
          id: `doc_${Date.now()}_${Math.random()}`,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          fileData,
          createdAt: new Date(),
        };
        uploadedDocs.push(doc);
      }
      setDocuments((prev) => [...prev, ...uploadedDocs]);
      toast.success(`${files.length} document(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload documents");
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const handleClose = () => {
    reset();
    setDocuments([]);
    onClose();
  };

  const onSubmit = async (data: InsurancePolicyFormData) => {
    try {
      setIsSubmitting(true);

      const policyData: Omit<InsurancePolicy, "id" | "createdAt" | "updatedAt"> = {
        policyNumber: data.policyNumber,
        type: data.type,
        provider: data.provider,
        familyMemberId: data.familyMemberId,
        premiumAmount: data.premiumAmount,
        coverageAmount: data.coverageAmount,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        renewalDate: new Date(data.renewalDate),
        status: data.status,
        documents,
      };

      if (policy) {
        await ApiService.updateInsurancePolicy(policy.id, policyData);
        toast.success("Policy updated successfully");
      } else {
        await ApiService.createInsurancePolicy(policyData);
        toast.success("Policy created successfully");
      }

      onSave();
      handleClose();
    } catch (error) {
      console.error("Error saving policy:", error);
      toast.error("Failed to save policy");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">
            {policy ? "Edit Insurance Policy" : "Add New Insurance Policy"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Policy Number *
                </label>
                <Input
                  {...register("policyNumber", {
                    required: "Policy number is required",
                  })}
                  placeholder="Enter policy number"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.policyNumber && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.policyNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Insurance Type *
                </label>
                <select
                  {...register("type", {
                    required: "Insurance type is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select type</option>
                  <option value="car">Car Insurance</option>
                  <option value="bike">Bike Insurance</option>
                  <option value="LIC">LIC Insurance</option>
                  <option value="health">Health Insurance</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Insurance Provider *
                </label>
                <Input
                  {...register("provider", {
                    required: "Provider is required",
                  })}
                  placeholder="Enter insurance provider"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.provider && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.provider.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Family Member *
                </label>
                <select
                  {...register("familyMemberId", {
                    required: "Family member is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select family member</option>
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName} ({member.nickname})
                    </option>
                  ))}
                </select>
                {errors.familyMemberId && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.familyMemberId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Premium Amount (₹) *
                </label>
                <Input
                  type="number"
                  {...register("premiumAmount", {
                    required: "Premium amount is required",
                    min: { value: 0, message: "Amount must be positive" },
                  })}
                  placeholder="Enter premium amount"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.premiumAmount && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.premiumAmount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Coverage Amount (₹) *
                </label>
                <Input
                  type="number"
                  {...register("coverageAmount", {
                    required: "Coverage amount is required",
                    min: { value: 0, message: "Amount must be positive" },
                  })}
                  placeholder="Enter coverage amount"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.coverageAmount && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.coverageAmount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Date Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date *
                </label>
                <Input
                  type="date"
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.startDate && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date *
                </label>
                <Input
                  type="date"
                  {...register("endDate", {
                    required: "End date is required",
                  })}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.endDate && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Renewal Date *
                </label>
                <Input
                  type="date"
                  {...register("renewalDate", {
                    required: "Renewal date is required",
                  })}
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.renewalDate && (
                  <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                    {errors.renewalDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status *
              </label>
              <select
                {...register("status", {
                  required: "Status is required",
                })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="lapsed">Lapsed</option>
              </select>
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Policy Documents
              </label>
              <div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length > 0) {
                      handleFileUpload(files);
                    }
                  }}
                  className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 dark:file:bg-blue-900/30 file:text-blue-700 dark:file:text-blue-400 hover:file:bg-blue-100 dark:hover:file:bg-blue-900/50"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select multiple files (PDF, JPG, PNG, DOC, DOCX) up to 5MB
                  each
                </p>
              </div>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Uploaded Documents:
                  </h4>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-gray-50 dark:bg-gray-700 p-3 rounded border border-gray-200 dark:border-gray-600"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {doc.fileName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {fileService.formatFileSize(doc.fileSize)} •{" "}
                          {doc.mimeType}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            fileService.downloadFile(doc.fileData, doc.fileName)
                          }
                          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                        >
                          Download
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={isSubmitting}>
                {isSubmitting
                  ? "Saving..."
                  : policy
                    ? "Update Policy"
                    : "Create Policy"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </Modal>
  );
};
