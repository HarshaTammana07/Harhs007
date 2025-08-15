"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Apartment } from "@/types";
import { Button, Card, CardContent, Input } from "@/components/ui";
import { Select } from "@/components/ui/Select";
import {
  HomeIcon,
  UsersIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

interface ApartmentListProps {
  apartments: Apartment[];
  buildingId: string;
  onEditApartment: (apartmentId: string) => void;
  onDeleteApartment: (apartmentId: string) => void;
  onViewTenant: (apartmentId: string) => void;
}

export function ApartmentList({
  apartments,
  buildingId,
  onEditApartment,
  onDeleteApartment,
  onViewTenant,
}: ApartmentListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState<string>("all");
  const [bedroomFilter, setBedroomFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("doorNumber");

  // Filter and sort apartments
  const filteredAndSortedApartments = useMemo(() => {
    let filtered = apartments.filter((apartment) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        apartment.doorNumber
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        apartment.currentTenant?.personalInfo?.fullName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase());

      // Occupancy filter
      const matchesOccupancy =
        occupancyFilter === "all" ||
        (occupancyFilter === "occupied" && apartment.isOccupied) ||
        (occupancyFilter === "vacant" && !apartment.isOccupied);

      // Bedroom filter
      const matchesBedrooms =
        bedroomFilter === "all" ||
        apartment.bedroomCount.toString() === bedroomFilter;

      return matchesSearch && matchesOccupancy && matchesBedrooms;
    });

    // Sort apartments
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "doorNumber":
          return a.doorNumber.localeCompare(b.doorNumber);
        case "floor":
          return a.floor - b.floor;
        case "rent":
          return b.rentAmount - a.rentAmount;
        case "bedrooms":
          return b.bedroomCount - a.bedroomCount;
        case "area":
          return b.area - a.area;
        default:
          return 0;
      }
    });

    return filtered;
  }, [apartments, searchQuery, occupancyFilter, bedroomFilter, sortBy]);

  const occupancyOptions = [
    { value: "all", label: "All Apartments" },
    { value: "occupied", label: "Occupied Only" },
    { value: "vacant", label: "Vacant Only" },
  ];

  const bedroomOptions = [
    { value: "all", label: "All Bedrooms" },
    { value: "1", label: "1 Bedroom" },
    { value: "2", label: "2 Bedrooms" },
    { value: "3", label: "3 Bedrooms" },
    { value: "4", label: "4+ Bedrooms" },
  ];

  const sortOptions = [
    { value: "doorNumber", label: "Door Number" },
    { value: "floor", label: "Floor" },
    { value: "rent", label: "Rent (High to Low)" },
    { value: "bedrooms", label: "Bedrooms (High to Low)" },
    { value: "area", label: "Area (High to Low)" },
  ];

  const handleViewApartment = (apartmentId: string) => {
    router.push(
      `/properties/buildings/${buildingId}/apartments/${apartmentId}`
    );
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-900">
              Search & Filter Apartments
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by door number or tenant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Occupancy Filter */}
            <Select
              value={occupancyFilter}
              onChange={(e) => setOccupancyFilter(e.target.value)}
              options={occupancyOptions}
            />

            {/* Bedroom Filter */}
            <Select
              value={bedroomFilter}
              onChange={(e) => setBedroomFilter(e.target.value)}
              options={bedroomOptions}
            />

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              options={sortOptions}
            />
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedApartments.length} of{" "}
              {apartments.length} apartments
              {searchQuery && <span className="ml-2">for "{searchQuery}"</span>}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Apartments Grid */}
      {filteredAndSortedApartments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <HomeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No apartments found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ||
              occupancyFilter !== "all" ||
              bedroomFilter !== "all"
                ? "Try adjusting your search or filters."
                : "Get started by adding the first apartment to this building."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedApartments.map((apartment) => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              onView={() => handleViewApartment(apartment.id)}
              onEdit={() => onEditApartment(apartment.id)}
              onDelete={() => onDeleteApartment(apartment.id)}
              onViewTenant={() => onViewTenant(apartment.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ApartmentCardProps {
  apartment: Apartment;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onViewTenant: () => void;
}

function ApartmentCard({
  apartment,
  onView,
  onEdit,
  onDelete,
  onViewTenant,
}: ApartmentCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="cursor-pointer" onClick={onView}>
            <h3 className="font-semibold text-gray-900 hover:text-blue-600">
              D-No: {apartment.doorNumber}
            </h3>
            <p className="text-sm text-gray-600">Floor {apartment.floor}</p>
          </div>
          <div className="flex items-center space-x-1">
            <span
              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                apartment.isOccupied
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {apartment.isOccupied ? "Occupied" : "Vacant"}
            </span>
          </div>
        </div>

        {/* Apartment Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Bedrooms:</span>
            <span className="font-medium">
              {apartment.bedroomCount} bedroom
              {apartment.bedroomCount !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Bathrooms:</span>
            <span className="font-medium">{apartment.bathroomCount}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Area:</span>
            <span className="font-medium">{apartment.area} sq ft</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Rent:</span>
            <span className="font-medium text-green-600">
              ₹{apartment.rentAmount.toLocaleString()}/month
            </span>
          </div>
        </div>

        {/* Tenant Information */}
        {apartment.currentTenant && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  {apartment.currentTenant.personalInfo?.fullName}
                </span>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={onViewTenant}
                className="text-xs"
              >
                View Details
              </Button>
            </div>
            {apartment.currentTenant.contactInfo?.phone && (
              <p className="text-xs text-blue-700 mt-1">
                {apartment.currentTenant.contactInfo.phone}
              </p>
            )}
          </div>
        )}

        {/* Specifications Preview */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {apartment.specifications.furnished && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                Furnished
              </span>
            )}
            {apartment.specifications.parking && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                Parking
              </span>
            )}
            {apartment.specifications.balcony && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-purple-100 text-purple-800">
                Balcony
              </span>
            )}
            {apartment.specifications.airConditioning && (
              <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-cyan-100 text-cyan-800">
                AC
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <Button
            size="sm"
            variant="outline"
            onClick={onView}
            className="flex-1 mr-2"
          >
            View Details
          </Button>
          <div className="flex space-x-1">
            <Button
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="p-2"
              title="Edit Apartment"
            >
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              title="Delete Apartment"
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
