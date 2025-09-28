"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Document, DocumentCategory, FamilyMember, InsurancePolicy } from "@/types";
import { ApiService } from "@/services/ApiService";
import { propertyService } from "@/services/PropertyService";
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
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [loadingData, setLoadingData] = useState(true);

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
    loadRelatedData();
  }, []);

  const loadRelatedData = async () => {
    try {
      setLoadingData(true);
      const [members, policies, propertiesData] = await Promise.all([
        ApiService.getFamilyMembers(),
        ApiService.getInsurancePolicies(),
        propertyService.getAllPropertiesForDropdown(),
      ]);
      
      setFamilyMembers(members);
      setInsurancePolicies(policies);
      setProperties(propertiesData);
    } catch (error) {
      console.error("Failed to load related data:", error);
      toast.error("Failed to load form data");
    } finally {
      setLoadingData(false);
    }
  };

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);

    // Auto-generate title from filename if not set
    const currentTitle = watch("title");
    if (!currentTitle && file && file.name) {
      const fileName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
      setValue("title", fileName);
    }
  };

  const onSubmit = async (data: DocumentUploadFormData) => {
    if (!selectedFile) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsUploading(true);
    try {
      // Convert file to base64
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          // Remove the data URL prefix to get just the base64 data
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const documentData = {
        title: data.title,
        category: data.category,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        fileData: base64Data,
        familyMemberId: data.familyMemberId || null,
        propertyId: data.propertyId || null,
        insurancePolicyId: data.insurancePolicyId || null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
        issuedDate: data.issuedDate ? new Date(data.issuedDate) : null,
        issuer: data.issuer || null,
        documentNumber: data.documentNumber || null,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
      };

      await ApiService.createDocument(documentData);
      toast.success("Document uploaded successfully");
      reset();
      setSelectedFile(null);
      onSuccess();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Failed to upload document");
    } finally {
      setIsUploading(false);
    }
  };

  const categories = [
    { value: "aadhar", label: "Aadhar Card" },
    { value: "pan", label: "PAN Card" },
    { value: "driving_license", label: "Driving License" },
    { value: "passport", label: "Passport" },
    { value: "house_documents", label: "House Documents" },
    { value: "business_documents", label: "Business Documents" },
    { value: "insurance_documents", label: "Insurance Documents" },
    { value: "bank_documents", label: "Bank Documents" },
    { value: "educational_certificates", label: "Educational Certificates" },
    { value: "medical_records", label: "Medical Records" },
    { value: "others", label: "Others" },
  ];

  if (loadingData) {
    return <LoadingState message="Loading form data..." />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* File Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Select File *
        </label>
        <SimpleFileUpload
          onFileSelect={handleFileSelect}
          selectedFile={selectedFile}
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          maxSize={5 * 1024 * 1024} // 5MB
        />
        {errors.file && (
          <p className="text-red-500 dark:text-red-400 text-sm mt-1">
            {errors.file.message}
          </p>
        )}
      </div>

      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Document Title *
          </label>
          <Input
            {...register("title", { required: "Title is required" })}
            placeholder="Enter document title"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {errors.title && (
            <p className="text-red-500 dark:text-red-400 text-sm mt-1">
              {errors.title.message}
            </p>
          )}
        </div>

        <div>
          <Select
            label="Category *"
            {...register("category", { required: "Category is required" })}
            error={errors.category?.message}
            options={categories}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
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
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            {familyMembers.map((member) => (
              <option
                key={member.id}
                value={member.id}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
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
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            {properties.map((property) => (
              <option
                key={property.id}
                value={property.id}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              >
                {property.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Select
            label="Insurance Policy"
            {...register("insurancePolicyId")}
            placeholder="Select insurance policy"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            {insurancePolicies.map((policy) => (
              <option
                key={policy.id}
                value={policy.id}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
              >
                {policy.policyNumber} - {policy.type.toUpperCase()} ({policy.provider})
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Document Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Document Number
          </label>
          <Input
            {...register("documentNumber")}
            placeholder="Enter document number"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Issuer
          </label>
          <Input
            {...register("issuer")}
            placeholder="Enter issuing authority"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Issued Date
          </label>
          <Input 
            type="date" 
            {...register("issuedDate")} 
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Expiry Date
          </label>
          <Input 
            type="date" 
            {...register("expiryDate")} 
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Tags
        </label>
        <Input
          {...register("tags")}
          placeholder="Enter tags separated by commas (e.g., government, identity, important)"
          className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Separate multiple tags with commas
        </p>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
