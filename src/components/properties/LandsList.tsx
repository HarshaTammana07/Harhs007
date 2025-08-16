"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Land } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { LandCard } from "./LandCard";
import { Button, LoadingState, Input } from "@/components/ui";
import { PlusIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

export function LandsList() {
  const [lands, setLands] = useState<Land[]>([]);
  const [filteredLands, setFilteredLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [leaseFilter, setLeaseFilter] = useState<"all" | "leased" | "vacant">(
    "all"
  );
  const [zoningFilter, setZoningFilter] = useState<
    "all" | "residential" | "commercial" | "agricultural" | "industrial"
  >("all");
  const router = useRouter();

  useEffect(() => {
    loadLands();
  }, []);

  useEffect(() => {
    filterLands();
  }, [lands, searchQuery, leaseFilter, zoningFilter]);

  const loadLands = async () => {
    try {
      setLoading(true);
      const landsData = await propertyService.getLands();
      setLands(landsData);
    } catch (error) {
      console.error("Error loading lands:", error);
      toast.error("Failed to load lands");
    } finally {
      setLoading(false);
    }
  };

  const filterLands = () => {
    let filtered = [...lands];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (land) =>
          land.name.toLowerCase().includes(query) ||
          land.address.toLowerCase().includes(query) ||
          land.surveyNumber?.toLowerCase().includes(query)
      );
    }

    // Apply lease filter
    if (leaseFilter !== "all") {
      filtered = filtered.filter((land) =>
        leaseFilter === "leased" ? land.isLeased : !land.isLeased
      );
    }

    // Apply zoning filter
    if (zoningFilter !== "all") {
      filtered = filtered.filter((land) => land.zoning === zoningFilter);
    }

    setFilteredLands(filtered);
  };

  const handleAddLand = () => {
    router.push("/properties/lands/new");
  };

  const handleLandClick = (landId: string) => {
    router.push(`/properties/lands/${landId}`);
  };

  const handleEditLand = (landId: string) => {
    router.push(`/properties/lands/${landId}/edit`);
  };

  const handleDeleteLand = async (landId: string) => {
    if (!confirm("Are you sure you want to delete this land property?")) {
      return;
    }

    try {
      await propertyService.deleteLand(landId);
      toast.success("Land property deleted successfully");
      await loadLands();
    } catch (error) {
      console.error("Error deleting land:", error);
      toast.error("Failed to delete land property");
    }
  };

  if (loading) {
    return <LoadingState message="Loading land properties..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">
            All Land Properties ({filteredLands.length})
          </h2>
        </div>
        <Button onClick={handleAddLand} className="flex items-center space-x-2">
          <PlusIcon className="h-4 w-4" />
          <span>Add Land</span>
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
                placeholder="Search lands by name, address, or survey number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Lease Status Filter */}
          <div className="sm:w-48">
            <select
              value={leaseFilter}
              onChange={(e) =>
                setLeaseFilter(e.target.value as "all" | "leased" | "vacant")
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Properties</option>
              <option value="leased">Leased</option>
              <option value="vacant">Vacant</option>
            </select>
          </div>

          {/* Zoning Filter */}
          <div className="sm:w-48">
            <select
              value={zoningFilter}
              onChange={(e) =>
                setZoningFilter(
                  e.target.value as
                    | "all"
                    | "residential"
                    | "commercial"
                    | "agricultural"
                    | "industrial"
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Zoning</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="agricultural">Agricultural</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lands Grid */}
      {filteredLands.length === 0 ? (
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
                d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || leaseFilter !== "all" || zoningFilter !== "all"
              ? "No land properties found"
              : "No land properties yet"}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || leaseFilter !== "all" || zoningFilter !== "all"
              ? "Try adjusting your search or filters."
              : "Get started by adding your first land property."}
          </p>
          {!searchQuery && leaseFilter === "all" && zoningFilter === "all" && (
            <Button
              onClick={handleAddLand}
              className="flex items-center space-x-2 mx-auto"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Your First Land Property</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLands.map((land) => (
            <LandCard
              key={land.id}
              land={land}
              onClick={() => handleLandClick(land.id)}
              onEdit={() => handleEditLand(land.id)}
              onDelete={() => handleDeleteLand(land.id)}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {lands.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {lands.length}
              </div>
              <div className="text-sm text-gray-600">Total Properties</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {lands.filter((l) => l.isLeased).length}
              </div>
              <div className="text-sm text-gray-600">Leased</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {lands.filter((l) => !l.isLeased).length}
              </div>
              <div className="text-sm text-gray-600">Vacant</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {lands
                  .reduce((total, land) => total + land.area, 0)
                  .toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Total Area (sq ft)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
