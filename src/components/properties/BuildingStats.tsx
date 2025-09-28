"use client";

import { Building } from "@/types";
import { Card, CardContent } from "@/components/ui";
import {
  HomeIcon,
  UsersIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";

interface BuildingStatsProps {
  buildings: Building[];
}

export function BuildingStats({ buildings }: BuildingStatsProps) {
  const totalBuildings = buildings.length;
  const totalApartments = buildings.reduce(
    (sum, building) => sum + (building.apartments?.length || 0),
    0
  );
  const occupiedApartments = buildings.reduce(
    (sum, building) =>
      sum + (building.apartments?.filter((apt) => apt.isOccupied).length || 0),
    0
  );
  const vacantApartments = totalApartments - occupiedApartments;
  const occupancyRate =
    totalApartments > 0 ? (occupiedApartments / totalApartments) * 100 : 0;

  const totalMonthlyRent = buildings.reduce(
    (sum, building) =>
      sum +
      (building.apartments?.reduce(
        (aptSum, apt) => aptSum + (apt.isOccupied ? apt.rentAmount : 0),
        0
      ) || 0),
    0
  );

  const stats = [
    {
      title: "Total Buildings",
      value: totalBuildings,
      icon: BuildingOfficeIcon,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-900/30",
    },
    {
      title: "Total Apartments",
      value: totalApartments,
      icon: HomeIcon,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-900/30",
    },
    {
      title: "Occupied Units",
      value: occupiedApartments,
      icon: UsersIcon,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-50 dark:bg-indigo-900/30",
    },
    {
      title: "Monthly Revenue",
      value: `₹${totalMonthlyRent.toLocaleString()}`,
      icon: CurrencyRupeeIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/30",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stat.value}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Occupancy Rate Card */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Occupancy Overview
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Current occupancy across all buildings
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {occupancyRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Occupancy Rate</div>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Occupied: {occupiedApartments}</span>
              <span>Vacant: {vacantApartments}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupancyRate}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
