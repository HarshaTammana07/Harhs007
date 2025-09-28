"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Building } from "@/types";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui";
import { SimpleFileUpload } from "@/components/ui/SimpleFileUpload";
import { SimpleFilePreview } from "@/components/ui/SimpleFilePreview";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface BuildingFormData {
  name: string;
  buildingCode: string;
  address: string;
  description: string;
  totalFloors: number;
  totalApartments: number;
  constructionYear: number;
  amenities: string;
}

interface BuildingFormProps {
  building?: Building;
  onSubmit: (
    buildingData: Omit<Building, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BuildingForm({
  building,
  onSubmit,
  onCancel,
  isLoading = false,
}: BuildingFormProps) {
  const [images, setImages] = useState<string[]>(building?.images || []);
  const [amenitiesList, setAmenitiesList] = useState<string[]>(
    building?.amenities || []
  );
  const [newAmenity, setNewAmenity] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<BuildingFormData>({
    defaultValues: {
      name: building?.name || "",
      buildingCode: building?.buildingCode || "",
      address: building?.address || "",
      description: building?.description || "",
      totalFloors: building?.totalFloors || 1,
      totalApartments: building?.totalApartments || 1,
      constructionYear: building?.constructionYear || new Date().getFullYear(),
      amenities: "",
    },
  });

  const handleImageUpload = (base64Data: string) => {
    setImages((prev) => [...prev, base64Data]);
  };

  const handleImageRemove = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !amenitiesList.includes(newAmenity.trim())) {
      setAmenitiesList((prev) => [...prev, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenity: string) => {
    setAmenitiesList((prev) => prev.filter((a) => a !== amenity));
  };

  const onFormSubmit = (data: BuildingFormData) => {
    const buildingData: Omit<Building, "id" | "createdAt" | "updatedAt"> = {
      type: "building",
      name: data.name,
      buildingCode: data.buildingCode,
      address: data.address,
      description: data.description,
      totalFloors: data.totalFloors,
      totalApartments: data.totalApartments,
      constructionYear: data.constructionYear,
      images,
      amenities: amenitiesList,
      apartments: building?.apartments || [],
      documents: building?.documents || [],
    };

    onSubmit(buildingData);
  };

  return (
    <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{building ? "Edit Building" : "Add New Building"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Building Name *
              </label>
              <Input
                {...register("name", { required: "Building name is required" })}
                placeholder="e.g., Satyanarayana Apartments"
                error={errors.name?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Building Code *
              </label>
              <Input
                {...register("buildingCode", {
                  required: "Building code is required",
                })}
                placeholder="e.g., A, B, C"
                error={errors.buildingCode?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Address *
            </label>
            <Input
              {...register("address", { required: "Address is required" })}
              placeholder="Full address of the building"
              error={errors.address?.message}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              {...register("description")}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Brief description of the building"
            />
          </div>

          {/* Building Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Floors *
              </label>
              <Input
                type="number"
                min="1"
                {...register("totalFloors", {
                  required: "Total floors is required",
                  min: { value: 1, message: "Must be at least 1 floor" },
                })}
                error={errors.totalFloors?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Apartments *
              </label>
              <Input
                type="number"
                min="1"
                {...register("totalApartments", {
                  required: "Total apartments is required",
                  min: { value: 1, message: "Must be at least 1 apartment" },
                })}
                error={errors.totalApartments?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Construction Year
              </label>
              <Input
                type="number"
                min="1900"
                max={new Date().getFullYear()}
                {...register("constructionYear", {
                  min: { value: 1900, message: "Invalid year" },
                  max: {
                    value: new Date().getFullYear(),
                    message: "Year cannot be in the future",
                  },
                })}
                error={errors.constructionYear?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Building Images
            </label>
            <SimpleFileUpload
              onFileUpload={handleImageUpload}
              accept="image/*"
              maxSize={5}
            />
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <SimpleFilePreview
                      fileData={image}
                      fileName={`Building Image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Amenities
            </label>
            <div className="flex space-x-2 mb-3">
              <Input
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                placeholder="Add amenity (e.g., Parking, Elevator, Security)"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddAmenity();
                  }
                }}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <Button
                type="button"
                onClick={handleAddAmenity}
                variant="outline"
                disabled={!newAmenity.trim()}
                className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Add
              </Button>
            </div>
            {amenitiesList.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenitiesList.map((amenity) => (
                  <span
                    key={amenity}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(amenity)}
                      className="ml-2 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      <XMarkIcon className="h-3 w-3" />
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
                : building
                  ? "Update Building"
                  : "Create Building"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
