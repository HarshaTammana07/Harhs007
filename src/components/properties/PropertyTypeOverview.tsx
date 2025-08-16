"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PropertyTypeCard } from "./PropertyTypeCard";
import { propertyService } from "@/services/PropertyService";
import { LoadingState } from "@/components/ui";
import {
  BuildingOfficeIcon,
  HomeIcon,
  MapIcon,
} from "@heroicons/react/24/outline";

interface PropertyStats {
  buildings: { total: number; occupied: number; vacant: number };
  flats: { total: number; occupied: number; vacant: number };
  lands: { total: number; leased: number; vacant: number };
  totalUnits: number;
  totalOccupied: number;
  occupancyRate: number;
}

export function PropertyTypeOverview() {
  const [stats, setStats] = useState<PropertyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadPropertyStats();
  }, []);

  const loadPropertyStats = async () => {
    try {
      setLoading(true);
      const propertyStats = await propertyService.getPropertyStatistics();
      setStats(propertyStats);
    } catch (error) {
      console.error("Error loading property statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBuildings = () => {
    router.push("/properties/buildings");
  };

  const handleViewFlats = () => {
    router.push("/properties/flats");
  };

  const handleViewLands = () => {
    router.push("/properties/lands");
  };

  const handleAddBuilding = () => {
    router.push("/properties/buildings/new");
  };

  const handleAddFlat = () => {
    router.push("/properties/flats/new");
  };

  const handleAddLand = () => {
    router.push("/properties/lands/new");
  };

  if (loading) {
    return <LoadingState message="Loading property statistics..." />;
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Unable to load property statistics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Property Portfolio Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalUnits}
            </div>
            <div className="text-sm text-gray-600">Total Units</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalOccupied}
            </div>
            <div className="text-sm text-gray-600">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">
              {stats.occupancyRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Occupancy Rate</div>
          </div>
        </div>
      </div>

      {/* Property Type Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Buildings Card */}
        <PropertyTypeCard
          title="Buildings"
          description="Multi-unit apartment buildings with individual apartments"
          icon={<BuildingOfficeIcon className="h-6 w-6 text-blue-600" />}
          stats={{
            total: stats.buildings.total,
            occupied: stats.buildings.occupied,
            vacant: stats.buildings.vacant,
          }}
          onViewDetails={handleViewBuildings}
          onAddNew={handleAddBuilding}
        />

        {/* Flats Card */}
        <PropertyTypeCard
          title="Flats"
          description="Standalone rental units and individual apartments"
          icon={<HomeIcon className="h-6 w-6 text-blue-600" />}
          stats={{
            total: stats.flats.total,
            occupied: stats.flats.occupied,
            vacant: stats.flats.vacant,
          }}
          onViewDetails={handleViewFlats}
          onAddNew={handleAddFlat}
        />

        {/* Real Estate/Lands Card */}
        <PropertyTypeCard
          title="Real Estate"
          description="Land properties, plots, and agricultural land"
          icon={<MapIcon className="h-6 w-6 text-blue-600" />}
          stats={{
            total: stats.lands.total,
            occupied: stats.lands.leased,
            vacant: stats.lands.vacant,
          }}
          onViewDetails={handleViewLands}
          onAddNew={handleAddLand}
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleAddBuilding}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Add Building</div>
                <div className="text-sm text-gray-600">
                  Create a new apartment building
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleAddFlat}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <HomeIcon className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Add Flat</div>
                <div className="text-sm text-gray-600">
                  Add a standalone rental unit
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={handleAddLand}
            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <MapIcon className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-gray-900">Add Land</div>
                <div className="text-sm text-gray-600">
                  Register a land property
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
