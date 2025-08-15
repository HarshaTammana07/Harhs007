"use client";

import React from "react";
import Image from "next/image";
import { FamilyMember } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  getInitials,
  formatContactInfo,
  getRelationshipColor,
  hasAlerts,
  getAlertCount,
  getProfileCompletionPercentage,
} from "@/utils/familyMemberUtils";

interface FamilyMemberCardProps {
  member: FamilyMember;
  onEdit?: (member: FamilyMember) => void;
  onView?: (member: FamilyMember) => void;
  onDelete?: (member: FamilyMember) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function FamilyMemberCard({
  member,
  onEdit,
  onView,
  onDelete,
  showActions = true,
  compact = false,
}: FamilyMemberCardProps) {
  const alertCount = getAlertCount(member);
  const hasAlert = hasAlerts(member);
  const completionPercentage = getProfileCompletionPercentage(member);
  const relationshipColor = getRelationshipColor(member.relationship);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(member);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(member);
  };

  const handleCardClick = () => {
    onView?.(member);
  };

  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-lg cursor-pointer ${
        hasAlert ? "ring-2 ring-orange-200 bg-orange-50" : ""
      } ${compact ? "p-4" : "p-6"}`}
      onClick={handleCardClick}
    >
      {/* Alert Badge */}
      {hasAlert && (
        <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-semibold">
          {alertCount}
        </div>
      )}

      <div className="flex items-start space-x-4">
        {/* Profile Photo or Initials */}
        <div className="flex-shrink-0">
          {member.profilePhoto ? (
            <div
              className={`relative ${compact ? "w-12 h-12" : "w-16 h-16"} rounded-full overflow-hidden`}
            >
              <Image
                src={member.profilePhoto}
                alt={`${member.fullName} profile`}
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div
              className={`${
                compact ? "w-12 h-12 text-sm" : "w-16 h-16 text-lg"
              } rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold`}
            >
              {getInitials(member.fullName)}
            </div>
          )}
        </div>

        {/* Member Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3
                className={`font-semibold text-gray-900 truncate ${compact ? "text-sm" : "text-lg"}`}
              >
                {member.fullName}
              </h3>
              <p
                className={`text-gray-600 truncate ${compact ? "text-xs" : "text-sm"}`}
              >
                {member.nickname}
              </p>
            </div>

            {/* Relationship Badge */}
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${relationshipColor}`}
            >
              {member.relationship}
            </span>
          </div>

          {/* Contact Info */}
          {!compact && (
            <div className="mt-2">
              <p className="text-sm text-gray-500 truncate">
                {formatContactInfo(member.contactInfo) ||
                  "No contact information"}
              </p>
            </div>
          )}

          {/* Stats */}
          {!compact && (
            <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
              <span className="flex items-center">
                📄 {member.documents.length} docs
              </span>
              <span className="flex items-center">
                🛡️ {member.insurancePolicies.length} policies
              </span>
              <span className="flex items-center">
                ✅ {completionPercentage}% complete
              </span>
            </div>
          )}

          {/* Age */}
          {member.dateOfBirth && !compact && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Born: {new Date(member.dateOfBirth).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && !compact && (
        <div className="mt-4 flex justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleEdit}
            className="text-xs"
          >
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="text-xs text-red-600 hover:text-red-700 hover:border-red-300"
          >
            Delete
          </Button>
        </div>
      )}

      {/* Compact Actions */}
      {showActions && compact && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex space-x-1">
            <button
              onClick={handleEdit}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title="Edit"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 rounded"
              title="Delete"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar for Profile Completion */}
      {!compact && completionPercentage < 100 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
            <span>Profile completion</span>
            <span>{completionPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
