"use client";

import React, { useState } from "react";
import { FamilyMember } from "@/types";
import { FamilyMemberList } from "./FamilyMemberList";
import { FamilyMemberForm } from "./FamilyMemberForm";
import { FamilyMemberDetail } from "./FamilyMemberDetail";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { useFamilyMembers } from "@/hooks/useFamilyMembers";
import toast from "react-hot-toast";

export const FamilyManagement: React.FC = () => {
  // Use reliable family members hook for immediate state updates
  const {
    members,
    loading,
    error,
    createMember,
    updateMember,
    deleteMember,
    refresh,
  } = useFamilyMembers();

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null
  );
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleViewMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setShowDetail(true);
  };

  const handleDeleteMember = async (member: FamilyMember) => {
    if (
      window.confirm(
        `Are you sure you want to delete ${member.fullName}? This action cannot be undone.`
      )
    ) {
      try {
        await deleteMember(member.id);
      } catch (err) {
        console.error("Error deleting family member:", err);
        // Error handling is done in the hook
      }
    }
  };

  const handleFormSubmit = async (memberData: unknown) => {
    try {
      if (editingMember) {
        // Update existing member
        await updateMember(editingMember.id, memberData);
      } else {
        // Create new member
        await createMember(memberData);
      }

      setShowForm(false);
      setEditingMember(null);
    } catch (err) {
      console.error("Error saving family member:", err);
      // Error handling is done in the hook
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const handleDetailClose = () => {
    setShowDetail(false);
    setSelectedMember(null);
  };

  if (loading) {
    return <LoadingState message="Loading family members..." />;
  }

  if (error) {
    return (
      <div className="text-center">
        <div className="text-red-600 dark:text-red-400 text-lg font-medium">{error}</div>
        <button
          onClick={refresh}
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Family Management
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage family member profiles and personal information
          </p>
        </div>

        <FamilyMemberList
          members={members}
          onAdd={handleAddMember}
          onEdit={handleEditMember}
          onView={handleViewMember}
          onDelete={handleDeleteMember}
          loading={loading}
          showActions={true}
        />

        {/* Family Member Form Modal */}
        <FamilyMemberForm
          member={editingMember}
          isOpen={showForm}
          onSave={handleFormSubmit}
          onClose={handleFormCancel}
        />

        {/* Family Member Detail Modal */}
        {selectedMember && (
          <FamilyMemberDetail
            member={selectedMember}
            isOpen={showDetail}
            onClose={handleDetailClose}
            onEdit={() => {
              handleDetailClose();
              handleEditMember(selectedMember);
            }}
            onDelete={() => {
              handleDetailClose();
              handleDeleteMember(selectedMember);
            }}
          />
        )}
      </div>
    </ErrorBoundary>
  );
};
