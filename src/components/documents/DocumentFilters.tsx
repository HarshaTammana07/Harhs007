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
    const newCriteria: DocumentSearchCriteria = {
      query: criteria.query, // Preserve existing query
    };

    // Add filters only if they have values
    if (data.category) {
      newCriteria.category = data.category as DocumentCategory;
    }

    if (data.familyMemberId) {
      newCriteria.familyMemberId = data.familyMemberId;
    }

    if (data.propertyId) {
      newCriteria.propertyId = data.propertyId;
    }

    if (data.insurancePolicyId) {
      newCriteria.insurancePolicyId = data.insurancePolicyId;
    }

    if (data.tags) {
      const tags = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      if (tags.length > 0) {
        newCriteria.tags = tags;
      }
    }

    if (data.isExpiring) {
      newCriteria.isExpiring = data.isExpiring === "true";
    }

    // Date ranges
    if (data.expiryDateStart || data.expiryDateEnd) {
      newCriteria.expiryDateRange = {
        start: data.expiryDateStart
          ? new Date(data.expiryDateStart)
          : undefined,
        end: data.expiryDateEnd ? new Date(data.expiryDateEnd) : undefined,
      };
    }

    if (data.issuedDateStart || data.issuedDateEnd) {
      newCriteria.issuedDateRange = {
        start: data.issuedDateStart
          ? new Date(data.issuedDateStart)
          : undefined,
        end: data.issuedDateEnd ? new Date(data.issuedDateEnd) : undefined,
      };
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

  const categories = documentService.getAllCategories();

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading filter options...</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Category and Associations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="Category"
            {...register("category")}
            placeholder="All categories"
            options={categories}
          />
        </div>

        <div>
          <Select
            label="Family Member"
            {...register("familyMemberId")}
            placeholder="All family members"
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            label="Property"
            {...register("propertyId")}
            placeholder="All properties"
          >
            {(properties as { id: string; address: string }[]).map((property) => (
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
            placeholder="All insurance policies"
          >
            {insurancePolicies.map((policy) => (
              <option
                key={policy.id}
                value={policy.id}
                className="text-gray-900 bg-white"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <Input
            {...register("tags")}
            placeholder="Enter tags separated by commas"
          />
          {availableTags.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Available tags:</p>
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
                    className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    {tag}
                  </button>
                ))}
                {availableTags.length > 10 && (
                  <span className="text-xs text-gray-500">
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
          >
            <option value="true" className="text-gray-900 bg-white">
              Expiring or expired documents
            </option>
            <option value="false" className="text-gray-900 bg-white">
              Valid documents
            </option>
          </Select>
        </div>
      </div>

      {/* Date Ranges */}
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Expiry Date Range
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <Input type="date" {...register("expiryDateStart")} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <Input type="date" {...register("expiryDateEnd")} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Issued Date Range
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">From</label>
              <Input type="date" {...register("issuedDateStart")} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">To</label>
              <Input type="date" {...register("issuedDateEnd")} />
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between pt-6 border-t">
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear All
        </Button>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">Apply Filters</Button>
        </div>
      </div>
    </form>
  );
}
