"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Flat } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { FlatCard } from "./FlatCard";
import { Button, LoadingState, Input } from "@/components/ui";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export function FlatsList() {
  const [flats, setFlats] = useState<Flat[]>([]);
  const [filteredFlats, setFilteredFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [occupancyFilter, setOccupancyFilter] = useState<
    "all" | "occupied" | "vacant"
  >("all");
  const router = useRouter();

  useEffect(() => {
    loadFlats();
  }, []);

  useEffect(() => {
    filterFlats();
  }, [flats, searchQuery, occupancyFilter]);

  const loadFlats = async () => {
    try {
      setLoading(true);
      const flatsData = await propertyService.getFlats();
      setFlats(flatsData);
    } catch (error) {
      console.error("Error loading flats:", error);
      toast.error("Failed to load flats");
    } finally {
      setLoading(false);
    }
  };

  const filterFlats = () => {
    let filtered = [...flats];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (flat) =>
          flat.name.toLowerCase().includes(query) ||
          flat.address.toLowerCase().includes(query) ||
          flat.doorNumber.toLowerCase().includes(query)
      );
    }

    // Apply occupancy filter
    if (occupancyFilter !== "all") {
      filtered = filtered.filter((flat) =>
        occupancyFilter === "occupied" ? flat.isOccupied : !flat.isOccupied
      );
    }

    setFilteredFlats(filtered);
  };

  const handleAddFlat = () => {
    router.push("/properties/flats/new");
  };

  const handleFlatClick = (flatId: string) => {
    router.push(`/properties/flats/${flatId}`);
  };

  const handleEditFlat = (flatId: string) => {
    router.push(`/properties/flats/${flatId}/edit`);
  };

  const handleDeleteFlat = async (flatId: string) => {
    if (!confirm("Are you sure you want to delete this flat?")) {
      return;
    }

    try {
      await propertyService.deleteFlat(flatId);
      toast.success("Flat deleted successfully");
      await loadFlats();
    } catch (error) {
      console.error("Error deleting flat:", error);
      toast.error("Failed to delete flat");
    }
  };

  if (loading) {
    return <LoadingState message="Loading flats..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            All Flats ({filteredFlats.length})
          </h2>
        </div>
        <Button onClick={handleAddFlat} className="flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Add Flat</span>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search flats by name, address, or door number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Occupancy Filter */}
          <div className="sm:w-48">
            <select
              value={occupancyFilter}
              onChange={(e) =>
                setOccupancyFilter(
                  e.target.value as "all" | "occupied" | "vacant"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Flats</option>
              <option value="occupied">Occupied</option>
              <option value="vacant">Vacant</option>
            </select>
          </div>
        </div>
      </div>

      {/* Flats Grid */}
      {filteredFlats.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || occupancyFilter !== "all"
              ? "No flats found"
              : "No flats yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || occupancyFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Get started by adding your first flat."}
          </p>
          {!searchQuery && occupancyFilter === "all" && (
            <Button
              onClick={handleAddFlat}
              className="flex items-center space-x-2 mx-auto"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Your First Flat</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFlats.map((flat) => (
            <FlatCard
              key={flat.id}
              flat={flat}
              onClick={() => handleFlatClick(flat.id)}
              onEdit={() => handleEditFlat(flat.id)}
              onDelete={() => handleDeleteFlat(flat.id)}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {flats.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {flats.length}
              </div>
              <div className="text-sm text-gray-600">Total Flats</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {flats.filter((f) => f.isOccupied).length}
              </div>
              <div className="text-sm text-gray-600">Occupied</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {flats.filter((f) => !f.isOccupied).length}
              </div>
              <div className="text-sm text-gray-600">Vacant</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
