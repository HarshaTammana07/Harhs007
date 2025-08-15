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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

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
    // Trigger refresh when going back to overview
    setRefreshTrigger(prev => prev + 1);
  };

  const handleFormClose = () => {
    setIsAddFormOpen(false);
  };

  const handleFormSave = () => {
    // Trigger refresh for both overview and list views
    setRefreshTrigger(prev => prev + 1);
    setIsAddFormOpen(false);
  };

  return (
    <>
      {viewMode === "overview" && (
        <InsuranceOverview
          onSelectType={handleSelectType}
          onAddNew={handleAddNew}
          refreshTrigger={refreshTrigger}
        />
      )}

      {viewMode === "list" && selectedType && (
        <InsurancePolicyList
          type={selectedType}
          onBack={handleBackToOverview}
          refreshTrigger={refreshTrigger}
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
