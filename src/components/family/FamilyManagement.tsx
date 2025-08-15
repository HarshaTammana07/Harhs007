"use client";

import React, { useState, useEffect } from "react";
import { FamilyMember } from "@/types";
import { FamilyMemberList } from "./FamilyMemberList";
import { FamilyMemberForm } from "./FamilyMemberForm";
import { FamilyMemberDetail } from "./FamilyMemberDetail";
import { ApiService } from "@/services/ApiService";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import toast from "react-hot-toast";

export const FamilyManagement: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(
    null
  );
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  // Load family members on component mount
  useEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const familyMembers = await ApiService.getFamilyMembers();
      setMembers(familyMembers);
    } catch (err) {
      console.error("Error loading family members:", err);
      setError("Failed to load family members. Please try again.");
      toast.error("Failed to load family members");
    } finally {
      setLoading(false);
    }
  };

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
        setLoading(true);
        await ApiService.deleteFamilyMember(member.id);
        await loadFamilyMembers(); // Refresh the list
        toast.success("Family member deleted successfully");
      } catch (err) {
        console.error("Error deleting family member:", err);
        setError("Failed to delete family member. Please try again.");
        toast.error("Failed to delete family member");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFormSubmit = async (memberData: unknown) => {
    try {
      setLoading(true);
      if (editingMember) {
        // Update existing member
        await ApiService.updateFamilyMember(editingMember.id, memberData);
        toast.success("Family member updated successfully");
      } else {
        // Create new member
        await ApiService.createFamilyMember(memberData);
        toast.success("Family member created successfully");
      }
      await loadFamilyMembers(); // Refresh the list
      setShowForm(false);
      setEditingMember(null);
    } catch (err) {
      console.error("Error saving family member:", err);
      setError("Failed to save family member. Please try again.");
      toast.error("Failed to save family member");
    } finally {
      setLoading(false);
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
        <div className="text-red-600 text-lg font-medium">{error}</div>
        <button
          onClick={loadFamilyMembers}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
          <h1 className="text-3xl font-bold text-gray-900">
            Family Management
          </h1>
          <p className="text-gray-600 mt-1">
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
