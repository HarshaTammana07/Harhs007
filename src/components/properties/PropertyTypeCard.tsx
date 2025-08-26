"use client";

import { Card, CardContent } from "@/components/ui";
import { Button } from "@/components/ui";
import { PlusIcon } from "@heroicons/react/24/outline";

interface PropertyTypeStats {
  total: number;
  occupied: number;
  vacant: number;
}

interface PropertyTypeCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  stats: PropertyTypeStats;
  onViewDetails: () => void;
  onAddNew: () => void;
  className?: string;
}

export function PropertyTypeCard({
  title,
  description,
  icon,
  stats,
  onViewDetails,
  onAddNew,
  className = "",
}: PropertyTypeCardProps) {
  const occupancyRate =
    stats.total > 0 ? (stats.occupied / stats.total) * 100 : 0;

  return (
    <Card
      className={`hover:shadow-lg dark:hover:shadow-xl transition-shadow cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <CardContent className="p-6">
        {/* Header with Icon and Title */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">{icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onAddNew();
            }}
            className="flex items-center space-x-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <PlusIcon className="h-4 w-4" />
            <span>Add</span>
          </Button>
        </div>

        {/* Statistics */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Total Units</span>
            <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Occupied</span>
            <span className="font-semibold text-green-600 dark:text-green-400">
              {stats.occupied}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Vacant</span>
            <span className="font-semibold text-red-600 dark:text-red-400">{stats.vacant}</span>
          </div>

          {/* Occupancy Rate Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300">Occupancy Rate</span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {occupancyRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupancyRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-6">
          <Button
            variant="primary"
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails();
            }}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
