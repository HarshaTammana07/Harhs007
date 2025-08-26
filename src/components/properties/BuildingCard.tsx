"use client";

import { Building } from "@/types";
import { Card, CardContent } from "@/components/ui";
import {
  BuildingOfficeIcon,
  MapPinIcon,
  HomeIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

interface BuildingCardProps {
  building: Building;
  onEdit: (building: Building) => void;
  onDelete: (buildingId: string) => void;
  onViewApartments: (buildingId: string) => void;
}

export function BuildingCard({
  building,
  onEdit,
  onDelete,
  onViewApartments,
}: BuildingCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const occupiedApartments =
    building.apartments?.filter((apt) => apt.isOccupied).length || 0;
  const totalApartments = building.apartments?.length || 0;
  const vacantApartments = totalApartments - occupiedApartments;
  const occupancyRate =
    totalApartments > 0 ? (occupiedApartments / totalApartments) * 100 : 0;

  const handleDelete = () => {
    onDelete(building.id);
    setShowDeleteConfirm(false);
  };

  return (
    <Card className="hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardContent className="p-6">
        {/* Building Image */}
        <div className="mb-4">
          {building.images && building.images.length > 0 ? (
            <img
              src={building.images[0]}
              alt={building.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <BuildingOfficeIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
          )}
        </div>

        {/* Building Info */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {building.name}
              </h3>
              <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mt-1">
                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full text-xs font-medium">
                  Building {building.buildingCode}
                </span>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(building)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Edit Building"
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Delete Building"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <MapPinIcon className="h-4 w-4 mr-1" />
            <span className="truncate">{building.address}</span>
          </div>

          {building.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
              {building.description}
            </p>
          )}

          {/* Building Stats */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <HomeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {totalApartments} Units
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {building.totalFloors} Floors
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <UsersIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {occupancyRate.toFixed(0)}% Occupied
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {occupiedApartments} of {totalApartments}
                </div>
              </div>
            </div>
          </div>

          {/* Occupancy Status */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex space-x-4 text-xs">
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                {occupiedApartments} Occupied
              </span>
              <span className="flex items-center text-gray-600 dark:text-gray-300">
                <div className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full mr-1"></div>
                {vacantApartments} Vacant
              </span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onViewApartments(building.id)}
            className="w-full mt-4 bg-blue-600 dark:bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            View Apartments
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Delete Building
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Are you sure you want to delete "{building.name}"? This action
                cannot be undone and will also delete all apartments in this
                building.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleDelete}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
