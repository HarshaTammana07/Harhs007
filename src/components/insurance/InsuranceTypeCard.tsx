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
    <Card className="hover:shadow-lg dark:hover:shadow-xl transition-shadow cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              {icon}
            </div>
            <CardTitle className="text-lg text-gray-900 dark:text-white">{title}</CardTitle>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Policies</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status indicators */}
          <div className="flex justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 dark:bg-green-400 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-300">Active: {count - expired}</span>
            </div>
            {expiringSoon > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 dark:bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-600 dark:text-yellow-400">
                  Expiring: {expiringSoon}
                </span>
              </div>
            )}
            {expired > 0 && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full"></div>
                <span className="text-red-600 dark:text-red-400">Expired: {expired}</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onViewPolicies}
              className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
