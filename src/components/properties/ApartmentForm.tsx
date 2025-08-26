"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Building, Apartment, ApartmentSpecifications } from "@/types";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { Select } from "@/components/ui/Select";

interface ApartmentFormData {
  doorNumber: string;
  floor: number;
  bedroomCount: number;
  bathroomCount: number;
  area: number;
  rentAmount: number;
  securityDeposit: number;
  furnished: boolean;
  parking: boolean;
  balcony: boolean;
  airConditioning: boolean;
  powerBackup: boolean;
  waterSupply: "24x7" | "limited" | "tanker";
  internetReady: boolean;
  additionalFeatures: string;
}

interface ApartmentFormProps {
  building: Building;
  apartment?: Apartment;
  onSubmit: (
    apartmentData: Omit<Apartment, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function ApartmentForm({
  building,
  apartment,
  onSubmit,
  onCancel,
  isLoading = false,
}: ApartmentFormProps) {
  const [additionalFeaturesList, setAdditionalFeaturesList] = useState<
    string[]
  >(apartment?.specifications?.additionalFeatures || []);
  const [newFeature, setNewFeature] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ApartmentFormData>({
    defaultValues: {
      doorNumber: apartment?.doorNumber || "",
      floor: apartment?.floor || 1,
      bedroomCount: apartment?.bedroomCount || 1,
      bathroomCount: apartment?.bathroomCount || 1,
      area: apartment?.area || 0,
      rentAmount: apartment?.rentAmount || 0,
      securityDeposit: apartment?.securityDeposit || 0,
      furnished: apartment?.specifications?.furnished || false,
      parking: apartment?.specifications?.parking || false,
      balcony: apartment?.specifications?.balcony || false,
      airConditioning: apartment?.specifications?.airConditioning || false,
      powerBackup: apartment?.specifications?.powerBackup || false,
      waterSupply: apartment?.specifications?.waterSupply || "24x7",
      internetReady: apartment?.specifications?.internetReady || false,
      additionalFeatures: "",
    },
  });

  const handleAddFeature = () => {
    if (
      newFeature.trim() &&
      !additionalFeaturesList.includes(newFeature.trim())
    ) {
      setAdditionalFeaturesList((prev) => [...prev, newFeature.trim()]);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (feature: string) => {
    setAdditionalFeaturesList((prev) => prev.filter((f) => f !== feature));
  };

  const onFormSubmit = (data: ApartmentFormData) => {
    const specifications: ApartmentSpecifications = {
      furnished: data.furnished,
      parking: data.parking,
      balcony: data.balcony,
      airConditioning: data.airConditioning,
      powerBackup: data.powerBackup,
      waterSupply: data.waterSupply,
      internetReady: data.internetReady,
      additionalFeatures: additionalFeaturesList,
    };

    const apartmentData: Omit<Apartment, "id" | "createdAt" | "updatedAt"> = {
      buildingId: building.id,
      doorNumber: data.doorNumber,
      floor: data.floor,
      bedroomCount: data.bedroomCount,
      bathroomCount: data.bathroomCount,
      area: data.area,
      rentAmount: data.rentAmount,
      securityDeposit: data.securityDeposit,
      isOccupied: apartment?.isOccupied || false,
      currentTenant: apartment?.currentTenant,
      specifications,
      rentHistory: apartment?.rentHistory || [],
      maintenanceRecords: apartment?.maintenanceRecords || [],
      documents: apartment?.documents || [],
    };

    onSubmit(apartmentData);
  };

  const waterSupplyOptions = [
    { value: "24x7", label: "24x7 Water Supply" },
    { value: "limited", label: "Limited Hours" },
    { value: "tanker", label: "Tanker Supply" },
  ];

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">
          {apartment ? "Edit Apartment" : "Add New Apartment"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Door Number *
              </label>
              <Input
                {...register("doorNumber", {
                  required: "Door number is required",
                })}
                placeholder="e.g., 101, 201, A-1"
                error={errors.doorNumber?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Floor *
              </label>
              <Input
                type="number"
                min="0"
                max={building.totalFloors}
                {...register("floor", {
                  required: "Floor is required",
                  min: { value: 0, message: "Floor cannot be negative" },
                  max: {
                    value: building.totalFloors,
                    message: `Floor cannot exceed ${building.totalFloors}`,
                  },
                })}
                error={errors.floor?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area (sq ft) *
              </label>
              <Input
                type="number"
                min="1"
                {...register("area", {
                  required: "Area is required",
                  min: { value: 1, message: "Area must be positive" },
                })}
                error={errors.area?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Room Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bedrooms *
              </label>
              <Input
                type="number"
                min="0"
                {...register("bedroomCount", {
                  required: "Bedroom count is required",
                  min: { value: 0, message: "Cannot be negative" },
                })}
                error={errors.bedroomCount?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bathrooms *
              </label>
              <Input
                type="number"
                min="1"
                {...register("bathroomCount", {
                  required: "Bathroom count is required",
                  min: { value: 1, message: "Must have at least 1 bathroom" },
                })}
                error={errors.bathroomCount?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Monthly Rent (₹) *
              </label>
              <Input
                type="number"
                min="0"
                {...register("rentAmount", {
                  required: "Rent amount is required",
                  min: { value: 0, message: "Rent cannot be negative" },
                })}
                error={errors.rentAmount?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Security Deposit (₹) *
              </label>
              <Input
                type="number"
                min="0"
                {...register("securityDeposit", {
                  required: "Security deposit is required",
                  min: { value: 0, message: "Deposit cannot be negative" },
                })}
                error={errors.securityDeposit?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Specifications */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Specifications
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("furnished")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Furnished</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("parking")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Parking</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("balcony")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Balcony</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("airConditioning")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">AC</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("powerBackup")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Power Backup</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  {...register("internetReady")}
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Internet Ready</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Water Supply
              </label>
              <Select
                {...register("waterSupply")}
                options={waterSupplyOptions}
              />
            </div>
          </div>

          {/* Additional Features */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Features
            </label>
            <div className="flex space-x-2 mb-3">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add feature (e.g., Garden View, Corner Unit)"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <Button
                type="button"
                onClick={handleAddFeature}
                variant="outline"
                disabled={!newFeature.trim()}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Add
              </Button>
            </div>
            {additionalFeaturesList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {additionalFeaturesList.map((feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                  >
                    {feature}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feature)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading
                ? "Saving..."
                : apartment
                  ? "Update Apartment"
                  : "Create Apartment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
