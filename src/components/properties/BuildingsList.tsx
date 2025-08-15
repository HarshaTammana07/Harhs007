"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Building } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { BuildingCard } from "./BuildingCard";
import { BuildingForm } from "./BuildingForm";
import { BuildingStats } from "./BuildingStats";
import { Button, Input, LoadingState } from "@/components/ui";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

export function BuildingsList() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<Building | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadBuildings();
  }, []);

  useEffect(() => {
    filterBuildings();
  }, [buildings, searchQuery]);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      const buildingsData = propertyService.getBuildings();
      setBuildings(buildingsData);
    } catch (error) {
      console.error("Error loading buildings:", error);
      toast.error("Failed to load buildings");
    } finally {
      setLoading(false);
    }
  };

  const filterBuildings = () => {
    if (!searchQuery.trim()) {
      setFilteredBuildings(buildings);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = buildings.filter(
      (building) =>
        building.name.toLowerCase().includes(query) ||
        building.buildingCode.toLowerCase().includes(query) ||
        building.address.toLowerCase().includes(query)
    );
    setFilteredBuildings(filtered);
  };

  const handleAddBuilding = () => {
    setEditingBuilding(null);
    setShowForm(true);
  };

  const handleEditBuilding = (building: Building) => {
    setEditingBuilding(building);
    setShowForm(true);
  };

  const handleDeleteBuilding = async (buildingId: string) => {
    try {
      propertyService.deleteBuilding(buildingId);
      await loadBuildings();
      toast.success("Building deleted successfully");
    } catch (error) {
      console.error("Error deleting building:", error);
      toast.error("Failed to delete building");
    }
  };

  const handleViewApartments = (buildingId: string) => {
    router.push(`/properties/buildings/${buildingId}/apartments`);
  };

  const handleFormSubmit = async (
    buildingData: Omit<Building, "id" | "createdAt" | "updatedAt">
  ) => {
    try {
      setFormLoading(true);

      if (editingBuilding) {
        // Update existing building
        propertyService.updateBuilding(editingBuilding.id, buildingData);
        toast.success("Building updated successfully");
      } else {
        // Create new building
        const newBuilding: Building = {
          ...buildingData,
          id: `building_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        propertyService.saveBuilding(newBuilding);
        toast.success("Building created successfully");
      }

      setShowForm(false);
      setEditingBuilding(null);
      await loadBuildings();
    } catch (error) {
      console.error("Error saving building:", error);
      toast.error("Failed to save building");
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingBuilding(null);
  };

  const breadcrumbItems = [
    { label: "Properties", href: "/properties" },
    { label: "Buildings", href: "/properties/buildings" },
  ];

  if (loading) {
    return <LoadingState message="Loading buildings..." />;
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <Breadcrumb items={breadcrumbItems} />
        <BuildingForm
          building={editingBuilding || undefined}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={formLoading}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={breadcrumbItems} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buildings</h1>
          <p className="text-gray-600 mt-1">
            Manage apartment buildings and their units
          </p>
        </div>
        <Button
          onClick={handleAddBuilding}
          className="flex items-center space-x-2"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add Building</span>
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search buildings by name, code, or address..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span className="flex items-center">
            <BuildingOfficeIcon className="h-4 w-4 mr-1" />
            {filteredBuildings.length} Buildings
          </span>
        </div>
      </div>

      {/* Buildings Grid */}
      {filteredBuildings.length === 0 ? (
        <div className="text-center py-12">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery ? "No buildings found" : "No buildings yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Get started by creating your first building"}
          </p>
          {!searchQuery && (
            <div className="mt-6">
              <Button onClick={handleAddBuilding}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Building
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuildings.map((building) => (
            <BuildingCard
              key={building.id}
              building={building}
              onEdit={handleEditBuilding}
              onDelete={handleDeleteBuilding}
              onViewApartments={handleViewApartments}
            />
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {filteredBuildings.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Buildings Overview
          </h3>
          <BuildingStats buildings={filteredBuildings} />
        </div>
      )}
    </div>
  );
}
