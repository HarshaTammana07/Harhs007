"use client";

import React, { useState } from "react";
import { InsuranceOverview } from "./InsuranceOverview";
import { InsurancePolicyList } from "./InsurancePolicyList";
import { InsurancePolicyForm } from "./InsurancePolicyForm";
import { InsurancePolicy } from "@/types";

type ViewMode = "overview" | "list" | "add";

export const InsuranceManagement: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>("overview");
  const [selectedType, setSelectedType] = useState<
    InsurancePolicy["type"] | null
  >(null);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const handleSelectType = (type: InsurancePolicy["type"]) => {
    setSelectedType(type);
    setViewMode("list");
  };

  const handleAddNew = (type: InsurancePolicy["type"]) => {
    setSelectedType(type);
    setIsAddFormOpen(true);
  };

  const handleBackToOverview = () => {
    setViewMode("overview");
    setSelectedType(null);
  };

  const handleFormClose = () => {
    setIsAddFormOpen(false);
  };

  const handleFormSave = () => {
    // Refresh the current view
    if (viewMode === "list") {
      // The list component will handle its own refresh
    }
  };

  return (
    <>
      {viewMode === "overview" && (
        <InsuranceOverview
          onSelectType={handleSelectType}
          onAddNew={handleAddNew}
        />
      )}

      {viewMode === "list" && selectedType && (
        <InsurancePolicyList
          type={selectedType}
          onBack={handleBackToOverview}
        />
      )}

      {/* Add New Policy Form */}
      <InsurancePolicyForm
        isOpen={isAddFormOpen}
        onClose={handleFormClose}
        onSave={handleFormSave}
        defaultType={selectedType || undefined}
      />
    </>
  );
};
