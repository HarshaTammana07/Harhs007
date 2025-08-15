"use client";

import { Land } from "@/types";
import { Card, CardContent } from "@/components/ui";
import {
  MapIcon,
  MapPinIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

interface LandCardProps {
  land: Land;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function LandCard({ land, onClick, onEdit, onDelete }: LandCardProps) {
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const formatArea = (area: number, unit: string) => {
    return `${area.toLocaleString()} ${unit}`;
  };

  const getZoningColor = (zoning: string) => {
    switch (zoning) {
      case "residential":
        return "bg-blue-100 text-blue-800";
      case "commercial":
        return "bg-green-100 text-green-800";
      case "agricultural":
        return "bg-yellow-100 text-yellow-800";
      case "industrial":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-200">
      <CardContent onClick={onClick} className="p-6">
        {/* Header with Image and Status */}
        <div className="relative mb-4">
          {land.images && land.images.length > 0 ? (
            <img
              src={land.images[0]}
              alt={land.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
              <MapIcon className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {/* Lease Status Badge */}
          <div className="absolute top-2 right-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                land.isLeased
                  ? "bg-green-100 text-green-800"
                  : "bg-orange-100 text-orange-800"
              }`}
            >
              {land.isLeased ? "Leased" : "Vacant"}
            </span>
          </div>

          {/* Zoning Badge */}
          <div className="absolute top-2 left-2">
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${getZoningColor(
                land.zoning
              )}`}
            >
              {land.zoning}
            </span>
          </div>
        </div>

        {/* Land Details */}
        <div className="space-y-3">
          {/* Name and Survey Number */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {land.name}
            </h3>
            {land.surveyNumber && (
              <p className="text-sm text-gray-600">
                Survey No: {land.surveyNumber}
              </p>
            )}
          </div>

          {/* Address */}
          <div className="flex items-start space-x-2">
            <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-2">{land.address}</p>
          </div>

          {/* Area Information */}
          <div className="flex items-center space-x-2">
            <TagIcon className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-900">
              {formatArea(land.area, land.areaUnit)}
            </span>
          </div>

          {/* Lease Information */}
          {land.isLeased && land.leaseTerms && (
            <div className="flex items-center space-x-2">
              <BanknotesIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm font-medium text-gray-900">
                ₹{land.leaseTerms.rentAmount.toLocaleString()}/
                {land.leaseTerms.rentFrequency}
              </span>
            </div>
          )}

          {/* Current Tenant */}
          {land.isLeased && land.currentTenant && (
            <div className="flex items-center space-x-2">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-600 truncate">
                {land.currentTenant.personalInfo.fullName}
              </span>
            </div>
          )}

          {/* Property Features */}
          <div className="flex flex-wrap gap-1">
            {land.roadAccess && (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                Road Access
              </span>
            )}
            {land.electricityConnection && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                Electricity
              </span>
            )}
            {land.waterSource && (
              <span className="px-2 py-1 text-xs bg-cyan-100 text-cyan-800 rounded">
                Water Source
              </span>
            )}
            {land.soilType && (
              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                {land.soilType}
              </span>
            )}
          </div>

          {/* Lease Type for Leased Properties */}
          {land.isLeased && land.leaseTerms && (
            <div className="text-sm text-gray-600 capitalize">
              {land.leaseTerms.leaseType} lease •{" "}
              {land.leaseTerms.leaseDuration} years
            </div>
          )}
        </div>
      </CardContent>

      {/* Action Buttons */}
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex justify-end space-x-2">
        <button
          onClick={handleEditClick}
          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Edit land property"
        >
          <PencilIcon className="h-4 w-4" />
        </button>
        <button
          onClick={handleDeleteClick}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          title="Delete land property"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}
