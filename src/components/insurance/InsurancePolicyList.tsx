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
import { insuranceService } from "@/services/InsuranceService";
import { familyMemberService } from "@/services/FamilyMemberService";
import { InsurancePolicyForm } from "./InsurancePolicyForm";
import { PolicyDocuments } from "./PolicyDocuments";
import toast from "react-hot-toast";

interface InsurancePolicyListProps {
  type: InsurancePolicy["type"];
  onBack: () => void;
}

export const InsurancePolicyList: React.FC<InsurancePolicyListProps> = ({
  type,
  onBack,
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
  }, [type]);

  const loadPolicies = () => {
    const allPolicies = insuranceService.getPoliciesByType(type);
    setPolicies(allPolicies);
  };

  const loadFamilyMembers = () => {
    const members = familyMemberService.getAllFamilyMembers();
    setFamilyMembers(members);
  };

  const getFamilyMemberName = (familyMemberId: string): string => {
    const member = familyMembers.find((m) => m.id === familyMemberId);
    return member ? `${member.fullName} (${member.nickname})` : "Unknown";
  };

  const getStatusColor = (status: InsurancePolicy["status"]): string => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "lapsed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDaysUntilRenewal = (policy: InsurancePolicy): number => {
    return insuranceService.getDaysUntilRenewal(policy);
  };

  const getRenewalStatus = (
    policy: InsurancePolicy
  ): { text: string; color: string } => {
    const days = getDaysUntilRenewal(policy);

    if (days < 0) {
      return {
        text: `Expired ${Math.abs(days)} days ago`,
        color: "text-red-600",
      };
    } else if (days <= 30) {
      return { text: `Expires in ${days} days`, color: "text-yellow-600" };
    } else {
      return { text: `${days} days to renewal`, color: "text-green-600" };
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
        insuranceService.deletePolicy(policy.id);
        loadPolicies();
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

  const handleFormSave = () => {
    loadPolicies();
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getTypeTitle(type)}
            </h1>
            <p className="text-gray-600 mt-1">
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Policies List */}
      {filteredPolicies.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-gray-500">
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
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">
                        {policy.policyNumber}
                      </CardTitle>
                      <p className="text-gray-600 text-sm mt-1">
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
                      <span className="text-gray-500">Family Member:</span>
                      <div className="font-medium">
                        {getFamilyMemberName(policy.familyMemberId)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Premium:</span>
                      <div className="font-medium">
                        ₹{policy.premiumAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Coverage:</span>
                      <div className="font-medium">
                        ₹{policy.coverageAmount.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Renewal:</span>
                      <div className={`font-medium ${renewalStatus.color}`}>
                        {renewalStatus.text}
                      </div>
                    </div>
                  </div>

                  <PolicyDocuments
                    documents={policy.documents || []}
                    policyNumber={policy.policyNumber}
                  />

                  <div className="flex space-x-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPolicy(policy)}
                      className="flex-1"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeletePolicy(policy)}
                      className="flex-1 text-red-600 hover:text-red-700"
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
