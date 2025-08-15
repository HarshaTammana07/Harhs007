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
import { insuranceService } from "@/services/InsuranceService";
import { familyMemberService } from "@/services/FamilyMemberService";
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

  useEffect(() => {
    if (isOpen) {
      loadFamilyMembers();
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
  }, [isOpen, policy, defaultType, setValue]);

  const loadFamilyMembers = () => {
    const members = familyMemberService.getAllFamilyMembers();
    setFamilyMembers(members);
  };

  const handleFileUpload = async (files: File[]) => {
    try {
      const newDocuments: Document[] = [];

      for (const file of files) {
        const base64Data = await fileService.convertToBase64(file);
        const document: Document = {
          id: Date.now().toString() + Math.random().toString(36).substr(2),
          title: file.name,
          category: "insurance_documents",
          fileData: base64Data,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          tags: ["insurance"],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        newDocuments.push(document);
      }

      setDocuments((prev) => [...prev, ...newDocuments]);
      toast.success(`${newDocuments.length} document(s) uploaded successfully`);
    } catch (error) {
      console.error("Error uploading files:", error);
      toast.error("Failed to upload documents");
    }
  };

  const handleRemoveDocument = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const onSubmit = async (data: InsurancePolicyFormData) => {
    setIsSubmitting(true);
    try {
      const policyData = {
        ...data,
        premiumAmount: Number(data.premiumAmount),
        coverageAmount: Number(data.coverageAmount),
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        renewalDate: new Date(data.renewalDate),
        documents,
      };

      if (policy) {
        // Update existing policy
        insuranceService.updatePolicy(policy.id, policyData);
        toast.success("Policy updated successfully");
      } else {
        // Create new policy
        insuranceService.createPolicy(policyData);
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

  const handleClose = () => {
    reset();
    setDocuments([]);
    onClose();
  };

  const selectedType = watch("type");

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg">
      <Card>
        <CardHeader>
          <CardTitle>
            {policy ? "Edit Insurance Policy" : "Add New Insurance Policy"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Policy Number *
                </label>
                <Input
                  {...register("policyNumber", {
                    required: "Policy number is required",
                  })}
                  placeholder="Enter policy number"
                />
                {errors.policyNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.policyNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Type *
                </label>
                <select
                  {...register("type", {
                    required: "Insurance type is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select type</option>
                  <option value="car">Car Insurance</option>
                  <option value="bike">Bike Insurance</option>
                  <option value="LIC">LIC Insurance</option>
                  <option value="health">Health Insurance</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Insurance Provider *
                </label>
                <Input
                  {...register("provider", {
                    required: "Provider is required",
                  })}
                  placeholder="Enter insurance provider"
                />
                {errors.provider && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.provider.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Family Member *
                </label>
                <select
                  {...register("familyMemberId", {
                    required: "Family member is required",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select family member</option>
                  {familyMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.fullName} ({member.nickname})
                    </option>
                  ))}
                </select>
                {errors.familyMemberId && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.familyMemberId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Financial Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Premium Amount (₹) *
                </label>
                <Input
                  type="number"
                  {...register("premiumAmount", {
                    required: "Premium amount is required",
                    min: { value: 0, message: "Amount must be positive" },
                  })}
                  placeholder="Enter premium amount"
                />
                {errors.premiumAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.premiumAmount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coverage Amount (₹) *
                </label>
                <Input
                  type="number"
                  {...register("coverageAmount", {
                    required: "Coverage amount is required",
                    min: { value: 0, message: "Amount must be positive" },
                  })}
                  placeholder="Enter coverage amount"
                />
                {errors.coverageAmount && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.coverageAmount.message}
                  </p>
                )}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <Input
                  type="date"
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <Input
                  type="date"
                  {...register("endDate", { required: "End date is required" })}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Renewal Date *
                </label>
                <Input
                  type="date"
                  {...register("renewalDate", {
                    required: "Renewal date is required",
                  })}
                />
                {errors.renewalDate && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.renewalDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="lapsed">Lapsed</option>
              </select>
            </div>

            {/* Document Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select multiple files (PDF, JPG, PNG, DOC, DOCX) up to 5MB
                  each
                </p>
              </div>

              {documents.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">
                    Uploaded Documents:
                  </h4>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded"
                    >
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {doc.fileName}
                        </div>
                        <div className="text-xs text-gray-500">
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
                        >
                          Download
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemoveDocument(doc.id)}
                          className="text-red-600 hover:text-red-700"
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
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
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
