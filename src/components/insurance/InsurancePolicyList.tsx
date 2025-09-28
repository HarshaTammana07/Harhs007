"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
} from "@/components/ui";
import { InsurancePolicy, FamilyMember } from "@/types";
import { ApiService } from "@/services/ApiService";
import { InsurancePolicyForm } from "./InsurancePolicyForm";
import { PolicyDocuments } from "./PolicyDocuments";
import toast from "react-hot-toast";

interface InsurancePolicyListProps {
  type: InsurancePolicy["type"];
  onBack: () => void;
  refreshTrigger?: number;
}

export const InsurancePolicyList: React.FC<InsurancePolicyListProps> = ({
  type,
  onBack,
  refreshTrigger = 0,
}) => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<InsurancePolicy | null>(
    null
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadPolicies();
    loadFamilyMembers();
  }, [type, refreshTrigger]); // Reload when type or refreshTrigger changes

  const loadPolicies = async () => {
    try {
      const allPolicies = await ApiService.getPoliciesByType(type);
      setPolicies(allPolicies);
    } catch (error) {
      console.error("Failed to load policies:", error);
      toast.error("Failed to load policies");
    }
  };

  const loadFamilyMembers = async () => {
    try {
      const members = await ApiService.getFamilyMembers();
      setFamilyMembers(members);
    } catch (error) {
      console.error("Failed to load family members:", error);
      toast.error("Failed to load family members");
    }
  };

  const getFamilyMemberName = (familyMemberId: string): string => {
    const member = familyMembers.find((m) => m.id === familyMemberId);
    return member ? `${member.fullName} (${member.nickname})` : "Unknown";
  };

  const getStatusColor = (status: InsurancePolicy["status"]): string => {
    switch (status) {
      case "active":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "expired":
        return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300";
      case "lapsed":
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getDaysUntilRenewal = (policy: InsurancePolicy): number => {
    const today = new Date();
    const renewalDate = new Date(policy.renewalDate);
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getRenewalStatus = (
    policy: InsurancePolicy
  ): { text: string; color: string } => {
    const days = getDaysUntilRenewal(policy);

    if (days < 0) {
      return {
        text: `Expired ${Math.abs(days)} days ago`,
        color: "text-red-600 dark:text-red-400",
      };
    } else if (days <= 30) {
      return { text: `Expires in ${days} days`, color: "text-yellow-600 dark:text-yellow-400" };
    } else {
      return { text: `${days} days to renewal`, color: "text-green-600 dark:text-green-400" };
    }
  };

  const handleEditPolicy = (policy: InsurancePolicy) => {
    setSelectedPolicy(policy);
    setIsFormOpen(true);
  };

  const handleDeletePolicy = async (policy: InsurancePolicy) => {
    if (
      window.confirm(
        `Are you sure you want to delete the policy ${policy.policyNumber}?`
      )
    ) {
      try {
        await ApiService.deleteInsurancePolicy(policy.id);
        await loadPolicies();
        toast.success("Policy deleted successfully");
      } catch (error) {
        console.error("Error deleting policy:", error);
        toast.error("Failed to delete policy");
      }
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedPolicy(null);
  };

  const handleFormSave = async () => {
    await loadPolicies();
  };

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getFamilyMemberName(policy.familyMemberId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const getTypeTitle = (type: InsurancePolicy["type"]): string => {
    switch (type) {
      case "car":
        return "Car Insurance";
      case "bike":
        return "Bike Insurance";
      case "LIC":
        return "LIC Insurance";
      case "health":
        return "Health Insurance";
      default:
        return "Insurance";
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {getTypeTitle(type)}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Manage your {getTypeTitle(type).toLowerCase()} policies
            </p>
          </div>
        </div>
        <Button variant="primary" onClick={() => setIsFormOpen(true)}>
          Add New Policy
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search policies by number, provider, or family member..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Policies List */}
      {filteredPolicies.length === 0 ? (
        <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <CardContent className="text-center py-12">
            <div className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No policies found matching your search."
                : `No ${getTypeTitle(type).toLowerCase()} policies found.`}
            </div>
            <Button
              variant="primary"
              className="mt-4"
              onClick={() => setIsFormOpen(true)}
            >
              Add Your First Policy
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPolicies.map((policy) => {
            const renewalStatus = getRenewalStatus(policy);

            return (
              <Card
                key={policy.id}
                className="hover:shadow-lg dark:hover:shadow-xl transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {policy.policyNumber}
                      </CardTitle>
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                        {policy.provider}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}
                    >
                      {policy.status.charAt(0).toUpperCase() +
                        policy.status.slice(1)}
                    </span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Family Member:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {getFamilyMemberName(policy.familyMemberId)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Premium:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        ₹{policy.premiumAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Coverage:</span>
                      <div className="font-medium text-gray-900 dark:text-white">
                        ₹{policy.coverageAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">Renewal:</span>
                      <div className={`font-medium ${renewalStatus.color}`}>
                        {renewalStatus.text}
                      </div>
                    </div>
                  </div>

                  <PolicyDocuments
                    documents={policy.documents || []}
                    policyNumber={policy.policyNumber}
                  />

                  <div className="flex space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPolicy(policy)}
                      className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePolicy(policy)}
                      className="flex-1 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-gray-300 dark:border-gray-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Policy Form Modal */}
      <InsurancePolicyForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        policy={selectedPolicy || undefined}
        defaultType={type}
      />
    </div>
  );
};
