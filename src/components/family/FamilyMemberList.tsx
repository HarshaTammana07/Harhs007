"use client";

import React, { useState, useMemo } from "react";
import { FamilyMember } from "@/types";
import { FamilyMemberCard } from "./FamilyMemberCard";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Grid } from "@/components/ui/Grid";
import { LoadingState } from "@/components/ui/LoadingState";
import { useFamilyMemberCounts } from "@/hooks/useFamilyMemberCounts";
import {
  sortByRelationshipPriority,
  sortByAge,
  groupByRelationship,
  RELATIONSHIP_OPTIONS,
} from "@/utils/familyMemberUtils";

interface FamilyMemberListProps {
  members: FamilyMember[];
  onEdit?: (member: FamilyMember) => void;
  onView?: (member: FamilyMember) => void;
  onDelete?: (member: FamilyMember) => void;
  onAdd?: () => void;
  loading?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

type SortOption = "name" | "relationship" | "age" | "recent";
type ViewMode = "grid" | "list";

export function FamilyMemberList({
  members,
  onEdit,
  onView,
  onDelete,
  onAdd,
  loading = false,
  showActions = true,
  compact = false,
}: FamilyMemberListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRelationship, setSelectedRelationship] =
    useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("relationship");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Get dynamic counts for all family members
  const familyMemberIds = useMemo(() => members.map(member => member.id), [members]);
  const { getCountsForMember, loading: countsLoading } = useFamilyMemberCounts(familyMemberIds);

  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = members;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (member) =>
          member.fullName.toLowerCase().includes(query) ||
          member.nickname.toLowerCase().includes(query) ||
          member.relationship.toLowerCase().includes(query) ||
          member.contactInfo.email?.toLowerCase().includes(query) ||
          member.contactInfo.phone?.includes(query)
      );
    }

    // Filter by relationship
    if (selectedRelationship !== "all") {
      filtered = filtered.filter(
        (member) =>
          member.relationship.toLowerCase() ===
          selectedRelationship.toLowerCase()
      );
    }

    // Sort members
    switch (sortBy) {
      case "name":
        return [...filtered].sort((a, b) =>
          a.fullName.localeCompare(b.fullName)
        );
      case "relationship":
        return sortByRelationshipPriority(filtered);
      case "age":
        return sortByAge(filtered);
      case "recent":
        return [...filtered].sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      default:
        return filtered;
    }
  }, [members, searchQuery, selectedRelationship, sortBy]);

  // Group members by relationship for better organization
  const groupedMembers = useMemo(() => {
    if (viewMode === "list" && selectedRelationship === "all") {
      return groupByRelationship(filteredAndSortedMembers);
    }
    return null;
  }, [filteredAndSortedMembers, viewMode, selectedRelationship]);

  if (loading) {
    return <LoadingState message="Loading family members..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Family Members</h2>
          <p className="text-gray-600">
            {members.length} member{members.length !== 1 ? "s" : ""}
            {filteredAndSortedMembers.length !== members.length &&
              ` (${filteredAndSortedMembers.length} shown)`}
          </p>
        </div>
        {onAdd && (
          <Button onClick={onAdd} className="shrink-0">
            Add Family Member
          </Button>
        )}
      </div>

      {/* Filters and Controls */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by name, nickname, relationship, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* Relationship Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Relationship:
            </label>
            <select
              value={selectedRelationship}
              onChange={(e) => setSelectedRelationship(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all" className="text-gray-900 bg-white">
                All
              </option>
              {RELATIONSHIP_OPTIONS.map((relationship) => (
                <option
                  key={relationship}
                  value={relationship}
                  className="text-gray-900 bg-white"
                >
                  {relationship}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Options */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Sort by:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="relationship" className="text-gray-900 bg-white">
                Relationship
              </option>
              <option value="name" className="text-gray-900 bg-white">
                Name
              </option>
              <option value="age" className="text-gray-900 bg-white">
                Age
              </option>
              <option value="recent" className="text-gray-900 bg-white">
                Recently Updated
              </option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2 ml-auto">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              View:
            </label>
            <div className="flex border border-gray-300 rounded-md overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1 text-sm ${
                  viewMode === "grid"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-3 py-1 text-sm ${
                  viewMode === "list"
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredAndSortedMembers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">👥</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedRelationship !== "all"
              ? "No matching family members found"
              : "No family members yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedRelationship !== "all"
              ? "Try adjusting your search or filters"
              : "Add your first family member to get started"}
          </p>
          {onAdd && <Button onClick={onAdd}>Add Family Member</Button>}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Grid View */}
          {viewMode === "grid" && (
            <Grid cols={compact ? 4 : 3} gap="md">
              {filteredAndSortedMembers.map((member) => {
                const counts = getCountsForMember(member.id);
                return (
                  <FamilyMemberCard
                    key={member.id}
                    member={member}
                    onEdit={onEdit}
                    onView={onView}
                    onDelete={onDelete}
                    showActions={showActions}
                    compact={compact}
                    documentCount={counts.documents}
                    insuranceCount={counts.insurance}
                  />
                );
              })}
            </Grid>
          )}

          {/* List View */}
          {viewMode === "list" && (
            <div className="space-y-6">
              {groupedMembers && selectedRelationship === "all" ? (
                // Grouped by relationship
                Object.entries(groupedMembers).map(
                  ([relationship, relationshipMembers]) => (
                    <div key={relationship} className="space-y-3">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize border-b border-gray-200 pb-2">
                        {relationship} ({relationshipMembers.length})
                      </h3>
                      <div className="space-y-2">
                        {relationshipMembers.map((member) => {
                          const counts = getCountsForMember(member.id);
                          return (
                            <FamilyMemberCard
                              key={member.id}
                              member={member}
                              onEdit={onEdit}
                              onView={onView}
                              onDelete={onDelete}
                              showActions={showActions}
                              compact={true}
                              documentCount={counts.documents}
                              insuranceCount={counts.insurance}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )
                )
              ) : (
                // Simple list
                <div className="space-y-2">
                  {filteredAndSortedMembers.map((member) => (
                    <FamilyMemberCard
                      key={member.id}
                      member={member}
                      onEdit={onEdit}
                      onView={onView}
                      onDelete={onDelete}
                      showActions={showActions}
                      compact={true}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
