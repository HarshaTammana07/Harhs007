"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Building, Flat } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import {
  FunnelIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export interface RentPaymentFilterCriteria {
  // Date Filters
  dateRange: "all" | "this_month" | "last_month" | "this_year" | "custom";
  startDate?: string;
  endDate?: string;

  // Property Filters
  buildingId: string; // "all" or specific building ID
  flatId: string; // "all" or specific flat ID

  // Search
  searchTerm?: string;
}

interface RentPaymentFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filters: RentPaymentFilterCriteria) => void;
  currentFilters: RentPaymentFilterCriteria;
}

export function RentPaymentFilters({
  isOpen,
  onClose,
  onApplyFilters,
  currentFilters,
}: RentPaymentFiltersProps) {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, watch } =
    useForm<RentPaymentFilterCriteria>({
      defaultValues: currentFilters,
    });

  const watchDateRange = watch("dateRange");

  useEffect(() => {
    if (isOpen) {
      loadFilterData();
      reset(currentFilters);
    }
  }, [isOpen, currentFilters, reset]);

  const loadFilterData = async () => {
    try {
      setLoading(true);
      const [buildingsData, flatsData] = await Promise.all([
        propertyService.getBuildings(),
        propertyService.getFlats(),
      ]);
      setBuildings(buildingsData);
      setFlats(flatsData);
    } catch (error) {
      console.error("Error loading filter data:", error);
      toast.error("Failed to load filter options");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: RentPaymentFilterCriteria) => {
    const finalData = { ...data };

    // Set date range based on selection
    if (finalData.dateRange !== "custom" && finalData.dateRange !== "all") {
      const today = new Date();
      let startDate: Date | undefined;
      let endDate: Date | undefined;

      switch (finalData.dateRange) {
        case "this_month":
          startDate = new Date(today.getFullYear(), today.getMonth(), 1);
          endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
          break;
        case "last_month":
          startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          endDate = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case "this_year":
          startDate = new Date(today.getFullYear(), 0, 1);
          endDate = new Date(today.getFullYear(), 11, 31);
          break;
      }

      if (startDate && endDate) {
        finalData.startDate = startDate.toISOString().split("T")[0];
        finalData.endDate = endDate.toISOString().split("T")[0];
      }
    } else if (finalData.dateRange === "all") {
      // Clear date filters for "all" option
      finalData.startDate = undefined;
      finalData.endDate = undefined;
    }

    console.log("Applying filters:", finalData);
    onApplyFilters(finalData);
    onClose();
    toast.success("Filters applied successfully!");
  };

  const clearAllFilters = () => {
    const defaultFilters: RentPaymentFilterCriteria = {
      dateRange: "all",
      buildingId: "all",
      flatId: "all",
      searchTerm: "",
    };
    reset(defaultFilters);
    onApplyFilters(defaultFilters);
    onClose();
    toast.success("All filters cleared!");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (currentFilters.dateRange !== "all") count++;
    if (currentFilters.buildingId !== "all") count++;
    if (currentFilters.flatId !== "all") count++;
    if (currentFilters.searchTerm && currentFilters.searchTerm.trim() !== "")
      count++;
    return count;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <FunnelIcon className="h-6 w-6 text-blue-600 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900">
              Filter Rent Payments
            </h2>
            {getActiveFiltersCount() > 0 && (
              <span className="ml-3 bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                {getActiveFiltersCount()} active
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={clearAllFilters}>
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear All
            </Button>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading filter options...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Search */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  label="Search payments"
                  placeholder="Search by receipt number, tenant name, or notes..."
                  {...register("searchTerm")}
                />
              </CardContent>
            </Card>

            {/* Date Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <CalendarIcon className="h-5 w-5 mr-2" />
                  Date Range
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date Range
                  </label>
                  <select
                    {...register("dateRange")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Time</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="this_year">This Year</option>
                    <option value="custom">Custom Range</option>
                  </select>
                </div>

                {watchDateRange === "custom" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      type="date"
                      {...register("startDate")}
                    />
                    <Input
                      label="End Date"
                      type="date"
                      {...register("endDate")}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Property Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                  Property Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Building
                  </label>
                  <select
                    {...register("buildingId")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Buildings</option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name} ({building.buildingCode})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Flat
                  </label>
                  <select
                    {...register("flatId")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Flats</option>
                    {flats.map((flat) => (
                      <option key={flat.id} value={flat.id}>
                        {flat.name} - {flat.doorNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="button" variant="outline" onClick={clearAllFilters}>
                Clear All Filters
              </Button>
              <Button type="submit">Apply Filters</Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}

// Default filter criteria
export const defaultFilterCriteria: RentPaymentFilterCriteria = {
  dateRange: "all",
  buildingId: "all",
  flatId: "all",
  searchTerm: "",
};
