"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Document, DocumentCategory, FamilyMember } from "@/types";
import { documentService } from "@/services/DocumentService";
import { localStorageService } from "@/services/LocalStorageService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { SimpleFileUpload } from "@/components/ui/SimpleFileUpload";
import { LoadingState } from "@/components/ui/LoadingState";
import toast from "react-hot-toast";

interface DocumentUploadFormData {
  title: string;
  category: DocumentCategory;
  familyMemberId?: string;
  propertyId?: string;
  insurancePolicyId?: string;
  expiryDate?: string;
  issuedDate?: string;
  issuer?: string;
  documentNumber?: string;
  tags: string;
}

interface DocumentUploadFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Partial<DocumentUploadFormData>;
}

export function DocumentUploadForm({
  onSuccess,
  onCancel,
  initialData,
}: DocumentUploadFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<DocumentUploadFormData>({
    defaultValues: {
      title: initialData?.title || "",
      category: initialData?.category || "aadhar",
      familyMemberId: initialData?.familyMemberId || "",
      propertyId: initialData?.propertyId || "",
      insurancePolicyId: initialData?.insurancePolicyId || "",
      expiryDate: initialData?.expiryDate || "",
      issuedDate: initialData?.issuedDate || "",
      issuer: initialData?.issuer || "",
      documentNumber: initialData?.documentNumber || "",
      tags: initialData?.tags || "",
    },
  });

  const selectedCategory = watch("category");

  useEffect(() => {
    // Load related data for dropdowns
    setFamilyMembers(localStorageService.getFamilyMembers());
    setProperties(localStorageService.getProperties());
    setInsurancePolicies(localStorageService.getInsurancePolicies());
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);

    // Auto-generate title from filename if not set
    const currentTitle = watch("title");
    if (!currentTitle && file && file.name) {
      const titleFromFile = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setValue("title", titleFromFile);
    }
  };

  const onSubmit = async (data: DocumentUploadFormData) => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);

    try {
      // Parse tags
      const tags = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      // Create document metadata
      const metadata = {
        title: data.title,
        category: data.category,
        familyMemberId: data.familyMemberId || undefined,
        propertyId: data.propertyId || undefined,
        insurancePolicyId: data.insurancePolicyId || undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        issuedDate: data.issuedDate ? new Date(data.issuedDate) : undefined,
        issuer: data.issuer || undefined,
        documentNumber: data.documentNumber || undefined,
        tags,
      };

      // Create document from file
      await documentService.createDocumentFromFile(selectedFile, metadata);

      toast.success("Document uploaded successfully!");
      reset();
      setSelectedFile(null);
      onSuccess();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload document"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const categories = documentService.getAllCategories();

  if (isUploading) {
    return <LoadingState message="Uploading document..." />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Document File *
        </label>
        <SimpleFileUpload
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          accept="image/*,.pdf,.doc,.docx"
          maxSizeMB={5}
        />
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Title *
          </label>
          <Input
            {...register("title", { required: "Title is required" })}
            placeholder="Enter document title"
            error={errors.title?.message}
          />
        </div>

        <div>
          <Select
            label="Category *"
            {...register("category", { required: "Category is required" })}
            error={errors.category?.message}
            options={categories}
          />
        </div>
      </div>

      {/* Association */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Select
            label="Family Member"
            {...register("familyMemberId")}
            placeholder="Select family member"
          >
            {familyMembers.map((member) => (
              <option
                key={member.id}
                value={member.id}
                className="text-gray-900 bg-white"
              >
                {member.fullName} ({member.nickname})
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            label="Property"
            {...register("propertyId")}
            placeholder="Select property"
          >
            {properties.map((property) => (
              <option
                key={property.id}
                value={property.id}
                className="text-gray-900 bg-white"
              >
                {property.address}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            label="Insurance Policy"
            {...register("insurancePolicyId")}
            placeholder="Select insurance policy"
          >
            {insurancePolicies.map((policy) => (
              <option
                key={policy.id}
                value={policy.id}
                className="text-gray-900 bg-white"
              >
                {policy.policyNumber} - {policy.type}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Document Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Number
          </label>
          <Input
            {...register("documentNumber")}
            placeholder="Enter document number"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issuer
          </label>
          <Input
            {...register("issuer")}
            placeholder="Enter issuing authority"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issued Date
          </label>
          <Input type="date" {...register("issuedDate")} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expiry Date
          </label>
          <Input type="date" {...register("expiryDate")} />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tags
        </label>
        <Input
          {...register("tags")}
          placeholder="Enter tags separated by commas (e.g., government, identity, important)"
        />
        <p className="text-sm text-gray-500 mt-1">
          Separate multiple tags with commas
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isUploading || !selectedFile}>
          {isUploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>
    </form>
  );
}
