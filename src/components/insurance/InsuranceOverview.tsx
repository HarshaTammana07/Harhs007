"use client";

import React, { useState, useEffect } from "react";
import { InsuranceTypeCard } from "./InsuranceTypeCard";
import { ApiService } from "@/services/ApiService";
import { InsurancePolicy } from "@/types";
import toast from "react-hot-toast";

// Icons for different insurance types
const CarIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0M15 17a2 2 0 104 0"
    />
  </svg>
);

const BikeIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 10V3L4 14h7v7l9-11h-7z"
    />
  </svg>
);

const LICIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
);

const HealthIcon = () => (
  <svg
    className="w-6 h-6"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

interface InsuranceOverviewProps {
  onSelectType: (type: InsurancePolicy["type"]) => void;
  onAddNew: (type: InsurancePolicy["type"]) => void;
  refreshTrigger?: number;
}

export const InsuranceOverview: React.FC<InsuranceOverviewProps> = ({
  onSelectType,
  onAddNew,
  refreshTrigger = 0,
}) => {
  const [stats, setStats] = useState<
    Record<
      "car" | "bike" | "LIC" | "health",
      { count: number; expiringSoon: number; expired: number }
    >
  >({
    car: { count: 0, expiringSoon: 0, expired: 0 },
    bike: { count: 0, expiringSoon: 0, expired: 0 },
    LIC: { count: 0, expiringSoon: 0, expired: 0 },
    health: { count: 0, expiringSoon: 0, expired: 0 },
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]); // Reload when refreshTrigger changes

  const loadStats = async () => {
    try {
      setLoading(true);
      const allPolicies = await ApiService.getInsurancePolicies();
      const expiringSoon = await ApiService.getPoliciesExpiringSoon(30);
      const expired = await ApiService.getExpiredPolicies();

      const newStats = {
        car: { count: 0, expiringSoon: 0, expired: 0 },
        bike: { count: 0, expiringSoon: 0, expired: 0 },
        LIC: { count: 0, expiringSoon: 0, expired: 0 },
        health: { count: 0, expiringSoon: 0, expired: 0 },
      };

      // Count total policies by type
      allPolicies.forEach(policy => {
        if (newStats[policy.type]) {
          newStats[policy.type].count++;
        }
      });

      // Count expiring soon by type
      expiringSoon.forEach(policy => {
        if (newStats[policy.type]) {
          newStats[policy.type].expiringSoon++;
        }
      });

      // Count expired by type
      expired.forEach(policy => {
        if (newStats[policy.type]) {
          newStats[policy.type].expired++;
        }
      });

      setStats(newStats);
    } catch (error) {
      console.error("Failed to load insurance stats:", error);
      toast.error("Failed to load insurance statistics");
    } finally {
      setLoading(false);
    }
  };

  const insuranceTypes = [
    {
      type: "car" as const,
      title: "Car Insurance",
      icon: <CarIcon />,
    },
    {
      type: "bike" as const,
      title: "Bike Insurance",
      icon: <BikeIcon />,
    },
    {
      type: "LIC" as const,
      title: "LIC Insurance",
      icon: <LICIcon />,
    },
    {
      type: "health" as const,
      title: "Health Insurance",
      icon: <HealthIcon />,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Insurance Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-1">
          Manage all your insurance policies in one place
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insuranceTypes.map((insuranceType) => (
          <InsuranceTypeCard
            key={insuranceType.type}
            type={insuranceType.type}
            title={insuranceType.title}
            icon={insuranceType.icon}
            count={stats[insuranceType.type].count}
            expiringSoon={stats[insuranceType.type].expiringSoon}
            expired={stats[insuranceType.type].expired}
            onViewPolicies={() => onSelectType(insuranceType.type)}
            onAddNew={() => onAddNew(insuranceType.type)}
          />
        ))}
      </div>

      {/* Summary section */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {Object.values(stats).reduce((sum, stat) => sum + stat.count, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Total Policies</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {Object.values(stats).reduce(
                (sum, stat) => sum + (stat.count - stat.expired),
                0
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {Object.values(stats).reduce(
                (sum, stat) => sum + stat.expiringSoon,
                0
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Expiring Soon</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {Object.values(stats).reduce(
                (sum, stat) => sum + stat.expired,
                0
              )}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Expired</div>
          </div>
        </div>
      </div>
    </div>
  );
};
