"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { DocumentCategory, FamilyMember, InsurancePolicy } from "@/types";
import {
  DocumentSearchCriteria,
  documentService,
} from "@/services/DocumentService";
import { ApiService } from "@/services/ApiService";
import { localStorageService } from "@/services/LocalStorageService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

interface DocumentFiltersFormData {
  category: string;
  familyMemberId: string;
  propertyId: string;
  insurancePolicyId: string;
  tags: string;
  isExpiring: string;
  expiryDateStart: string;
  expiryDateEnd: string;
  issuedDateStart: string;
  issuedDateEnd: string;
}

interface DocumentFiltersProps {
  criteria: DocumentSearchCriteria;
  onApply: (criteria: DocumentSearchCriteria) => void;
  onCancel: () => void;
}

export function DocumentFilters({
  criteria,
  onApply,
  onCancel,
}: DocumentFiltersProps) {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [properties, setProperties] = useState<unknown[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const { register, handleSubmit, reset, watch } =
    useForm<DocumentFiltersFormData>({
      defaultValues: {
        category: criteria.category || "",
        familyMemberId: criteria.familyMemberId || "",
        propertyId: criteria.propertyId || "",
        insurancePolicyId: criteria.insurancePolicyId || "",
        tags: criteria.tags?.join(", ") || "",
        isExpiring:
          criteria.isExpiring !== undefined
            ? criteria.isExpiring.toString()
            : "",
        expiryDateStart: criteria.expiryDateRange?.start
          ? criteria.expiryDateRange.start.toISOString().split("T")[0]
          : "",
        expiryDateEnd: criteria.expiryDateRange?.end
          ? criteria.expiryDateRange.end.toISOString().split("T")[0]
          : "",
        issuedDateStart: criteria.issuedDateRange?.start
          ? criteria.issuedDateRange.start.toISOString().split("T")[0]
          : "",
        issuedDateEnd: criteria.issuedDateRange?.end
          ? criteria.issuedDateRange.end.toISOString().split("T")[0]
          : "",
      },
    });

  useEffect(() => {
    const loadRelatedData = async () => {
      try {
        setLoadingData(true);
        const [members, policies] = await Promise.all([
          ApiService.getFamilyMembers(),
          ApiService.getInsurancePolicies(),
          // TODO: Add properties when they're migrated to API
          // ApiService.getProperties(),
        ]);
        
        setFamilyMembers(members);
        setInsurancePolicies(policies);
        // setProperties(properties); // TODO: Uncomment when properties are migrated
        setProperties(localStorageService.getProperties()); // Temporary fallback
        setAvailableTags(documentService.getAllTags());
      } catch (error) {
        console.error('Failed to load filter data:', error);
        // Fallback to localStorage for now
        setFamilyMembers(localStorageService.getFamilyMembers());
        setProperties(localStorageService.getProperties());
        setInsurancePolicies(localStorageService.getInsurancePolicies());
        setAvailableTags(documentService.getAllTags());
      } finally {
        setLoadingData(false);
      }
    };

    loadRelatedData();
  }, []);

  const onSubmit = (data: DocumentFiltersFormData) => {
    const newCriteria: DocumentSearchCriteria = {};

    if (data.category) newCriteria.category = data.category as DocumentCategory;
    if (data.familyMemberId) newCriteria.familyMemberId = data.familyMemberId;
    if (data.propertyId) newCriteria.propertyId = data.propertyId;
    if (data.insurancePolicyId) newCriteria.insurancePolicyId = data.insurancePolicyId;
    if (data.tags) {
      newCriteria.tags = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    }
    if (data.isExpiring !== "") {
      newCriteria.isExpiring = data.isExpiring === "true";
    }
    if (data.expiryDateStart || data.expiryDateEnd) {
      newCriteria.expiryDateRange = {};
      if (data.expiryDateStart) {
        newCriteria.expiryDateRange.start = new Date(data.expiryDateStart);
      }
      if (data.expiryDateEnd) {
        newCriteria.expiryDateRange.end = new Date(data.expiryDateEnd);
      }
    }
    if (data.issuedDateStart || data.issuedDateEnd) {
      newCriteria.issuedDateRange = {};
      if (data.issuedDateStart) {
        newCriteria.issuedDateRange.start = new Date(data.issuedDateStart);
      }
      if (data.issuedDateEnd) {
        newCriteria.issuedDateRange.end = new Date(data.issuedDateEnd);
      }
    }

    onApply(newCriteria);
  };

  const handleClear = () => {
    reset({
      category: "",
      familyMemberId: "",
      propertyId: "",
      insurancePolicyId: "",
      tags: "",
      isExpiring: "",
      expiryDateStart: "",
      expiryDateEnd: "",
      issuedDateStart: "",
      issuedDateEnd: "",
    });
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
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="Category"
            {...register("category")}
            placeholder="All categories"
            options={categories}
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <Select
            label="Family Member"
            {...register("familyMemberId")}
            placeholder="All family members"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="Property"
            {...register("propertyId")}
            placeholder="All properties"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            {(properties as { id: string; address: string }[]).map((property) => (
              <option
                key={property.id}
                value={property.id}
                className="text-gray-900 dark:text-white bg-white dark:bg-gray-800"
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
            placeholder="All insurance policies"
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

      {/* Tags and Expiry Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tags
          </label>
          <Input
            {...register("tags")}
            placeholder="Enter tags separated by commas"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          {availableTags.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available tags:</p>
              <div className="flex flex-wrap gap-1">
                {availableTags.slice(0, 10).map((tag, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      const currentTags = watch("tags");
                      const tagsArray = currentTags
                        ? currentTags.split(",").map((t) => t.trim())
                        : [];
                      if (!tagsArray.includes(tag)) {
                        const newTags = [...tagsArray, tag].join(", ");
                        reset({ ...watch(), tags: newTags });
                      }
                    }}
                    className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {tag}
                  </button>
                ))}
                {availableTags.length > 10 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{availableTags.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div>
          <Select
            label="Expiry Status"
            {...register("isExpiring")}
            placeholder="All documents"
            className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
          >
            <option value="true" className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">
              Expiring or expired documents
            </option>
            <option value="false" className="text-gray-900 dark:text-white bg-white dark:bg-gray-800">
              Valid documents
            </option>
          </Select>
        </div>
      </div>

      {/* Date Ranges */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Expiry Date Range
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
              <Input 
                type="date" 
                {...register("expiryDateStart")} 
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
              <Input 
                type="date" 
                {...register("expiryDateEnd")} 
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Issued Date Range
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
              <Input 
                type="date" 
                {...register("issuedDateStart")} 
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
              <Input 
                type="date" 
                {...register("issuedDateEnd")} 
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleClear}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Clear All
        </Button>

        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button type="submit">Apply Filters</Button>
        </div>
      </div>
    </form>
  );
}
