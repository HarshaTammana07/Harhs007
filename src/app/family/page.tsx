"use client";

import React, { useState, useEffect } from "react";
import { FamilyMember } from "@/types";
import { FamilyMemberList } from "@/components/family/FamilyMemberList";
import { FamilyMemberForm } from "@/components/family/FamilyMemberForm";
import { FamilyMemberDetail } from "@/components/family/FamilyMemberDetail";
import { familyMemberService } from "@/services/FamilyMemberService";
import { LoadingState } from "@/components/ui/LoadingState";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { useClientSideEffect } from "@/hooks/useClientSide";

export default function FamilyPage() {
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

  // Load family members on component mount (client-side only)
  useClientSideEffect(() => {
    loadFamilyMembers();
  }, []);

  const loadFamilyMembers = () => {
    // Don't try to load family members during SSR
    if (typeof window === "undefined") {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const familyMembers = familyMemberService.getAllFamilyMembers();
      setMembers(familyMembers);
    } catch (err) {
      console.error("Error loading family members:", err);
      setError("Failed to load family members. Please try again.");
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
    setShowDetail(false);
  };

  const handleViewMember = (member: FamilyMember) => {
    setSelectedMember(member);
    setShowDetail(true);
  };

  const handleDeleteMember = (member: FamilyMember) => {
    if (window.confirm(`Are you sure you want to delete ${member.fullName}?`)) {
      try {
        familyMemberService.deleteFamilyMember(member.id);
        loadFamilyMembers(); // Reload the list
        setShowDetail(false);
      } catch (err) {
        console.error("Error deleting family member:", err);
        alert("Failed to delete family member. Please try again.");
      }
    }
  };

  const handleSaveMember = (
    memberData: Omit<FamilyMember, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      if (editingMember) {
        // Update existing member
        familyMemberService.updateFamilyMember(editingMember.id, memberData);
      } else {
        // Create new member
        familyMemberService.createFamilyMember({
          fullName: memberData.fullName,
          nickname: memberData.nickname,
          relationship: memberData.relationship,
          profilePhoto: memberData.profilePhoto,
          dateOfBirth: memberData.dateOfBirth,
          contactInfo: memberData.contactInfo,
        });
      }

      loadFamilyMembers(); // Reload the list
      setShowForm(false);
      setEditingMember(null);
    } catch (err) {
      console.error("Error saving family member:", err);
      throw new Error("Failed to save family member. Please try again.");
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMember(null);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedMember(null);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadFamilyMembers}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[{ label: "Family Members", current: true }]}
            className="mb-6"
          />
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
            onClose={handleCloseForm}
            onSave={handleSaveMember}
          />

          {/* Family Member Detail Modal */}
          {selectedMember && (
            <FamilyMemberDetail
              member={selectedMember}
              isOpen={showDetail}
              onClose={handleCloseDetail}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
            />
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
}
