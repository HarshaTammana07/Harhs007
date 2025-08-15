"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { Button } from "@/components/ui";
import { InsurancePolicy } from "@/types";

interface InsuranceTypeCardProps {
  type: InsurancePolicy["type"];
  title: string;
  icon: React.ReactNode;
  count: number;
  expiringSoon: number;
  expired: number;
  onViewPolicies: () => void;
  onAddNew: () => void;
}

export const InsuranceTypeCard: React.FC<InsuranceTypeCardProps> = ({
  type,
  title,
  icon,
  count,
  expiringSoon,
  expired,
  onViewPolicies,
  onAddNew,
}) => {
  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
              {icon}
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <div className="text-sm text-gray-500">Policies</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status indicators */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Active: {count - expired}</span>
            </div>
            {expiringSoon > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-yellow-600">
                  Expiring: {expiringSoon}
                </span>
              </div>
            )}
            {expired > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-red-600">Expired: {expired}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewPolicies}
              className="flex-1"
              disabled={count === 0}
            >
              View All
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onAddNew}
              className="flex-1"
            >
              Add New
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
