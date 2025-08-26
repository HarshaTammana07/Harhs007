"use client";

import { Flat } from "@/types";
import { Card, CardContent } from "@/components/ui";
import {
  HomeIcon,
  MapPinIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
} from "@heroicons/react/24/outline";

interface FlatCardProps {
  flat: Flat;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function FlatCard({ flat, onClick, onEdit, onDelete }: FlatCardProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg dark:hover:shadow-xl transition-shadow duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardContent onClick={onClick} className="p-6">
        {/* Header with Image and Status */}
        <div className="relative mb-4">
          {flat.images && flat.images.length > 0 ? (
            <img
              src={flat.images[0]}
              alt={flat.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <HomeIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
            </div>
          )}

          {/* Occupancy Status Badge */}
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                flat.isOccupied
                  ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                  : "bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300"
              }`}
            >
              {flat.isOccupied ? "Occupied" : "Vacant"}
            </span>
          </div>
        </div>

        {/* Flat Details */}
        <div className="space-y-3">
          {/* Name and Door Number */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {flat.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Door No: {flat.doorNumber}</p>
          </div>

          {/* Address */}
          <div className="flex items-start space-x-2">
            <MapPinIcon className="h-4 w-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{flat.address}</p>
          </div>

          {/* Property Details */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center space-x-1">
              <HomeIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-gray-600 dark:text-gray-300">{flat.bedroomCount} BHK</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-gray-600 dark:text-gray-300">{flat.area} sq ft</span>
            </div>
          </div>

          {/* Rent Information */}
          <div className="flex items-center space-x-2">
            <BanknotesIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              ₹{flat.rentAmount.toLocaleString()}/month
            </span>
          </div>

          {/* Current Tenant */}
          {flat.isOccupied && flat.currentTenant && (
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-gray-400 dark:text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-300 truncate">
                {flat.currentTenant.personalInfo.fullName}
              </span>
            </div>
          )}

          {/* Floor Information */}
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Floor {flat.floor} of {flat.totalFloors}
          </div>

          {/* Specifications Preview */}
          <div className="flex flex-wrap gap-1">
            {flat.specifications.furnished && (
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded">
                Furnished
              </span>
            )}
            {flat.specifications.parking && (
              <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded">
                Parking
              </span>
            )}
            {flat.specifications.balcony && (
              <span className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded">
                Balcony
              </span>
            )}
          </div>
        </div>
      </CardContent>

      {/* Action Buttons */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 flex justify-end space-x-2">
        <button
          onClick={handleEditClick}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
          title="Edit flat"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={handleDeleteClick}
          className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          title="Delete flat"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
