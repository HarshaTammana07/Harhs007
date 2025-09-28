"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Flat, FlatSpecifications } from "@/types";
import { Button, Input, Card } from "@/components/ui";
import { SimpleFileUpload } from "@/components/ui/SimpleFileUpload";
import { toast } from "react-hot-toast";

interface FlatFormData {
  name: string;
  address: string;
  doorNumber: string;
  serviceNumber: string;
  bedroomCount: number;
  bathroomCount: number;
  area: number;
  floor: number;
  totalFloors: number;
  rentAmount: number;
  securityDeposit: number;
  description?: string;
  specifications: FlatSpecifications;
}

interface FlatFormProps {
  flat?: Flat;
  onSubmit: (flatData: Omit<Flat, "id" | "createdAt" | "updatedAt">) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function FlatForm({
  flat,
  onSubmit,
  onCancel,
  loading = false,
}: FlatFormProps) {
  const [images, setImages] = useState<string[]>(flat?.images || []);

  // Reset form when flat data changes
  useEffect(() => {
    if (flat) {
      setImages(flat.images || []);
    }
  }, [flat]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FlatFormData>({
    defaultValues: {
      name: flat?.name || "",
      address: flat?.address || "",
      doorNumber: flat?.doorNumber || "",
      serviceNumber: flat?.serviceNumber || "",
      bedroomCount: flat?.bedroomCount || 1,
      bathroomCount: flat?.bathroomCount || 1,
      area: flat?.area || 0,
      floor: flat?.floor || 1,
      totalFloors: flat?.totalFloors || 1,
      rentAmount: flat?.rentAmount || 0,
      securityDeposit: flat?.securityDeposit || 0,
      description: flat?.description || "",
      specifications: {
        furnished: flat?.specifications?.furnished || false,
        parking: flat?.specifications?.parking || false,
        balcony: flat?.specifications?.balcony || false,
        airConditioning: flat?.specifications?.airConditioning || false,
        powerBackup: flat?.specifications?.powerBackup || false,
        waterSupply: flat?.specifications?.waterSupply || "24x7",
        internetReady: flat?.specifications?.internetReady || false,
        societyName: flat?.specifications?.societyName || "",
        maintenanceCharges: flat?.specifications?.maintenanceCharges || 0,
        additionalFeatures: flat?.specifications?.additionalFeatures || [],
      },
    },
  });

  const floor = watch("floor");
  const totalFloors = watch("totalFloors");

  // Ensure floor doesn't exceed total floors
  useEffect(() => {
    if (floor > totalFloors) {
      setValue("floor", totalFloors);
    }
  }, [floor, totalFloors, setValue]);

  const handleFormSubmit = (data: FlatFormData) => {
    const flatData: Omit<Flat, "id" | "createdAt" | "updatedAt"> = {
      type: "flat",
      name: data.name,
      address: data.address,
      doorNumber: data.doorNumber,
      serviceNumber: data.serviceNumber,
      bedroomCount: data.bedroomCount,
      bathroomCount: data.bathroomCount,
      area: data.area,
      floor: data.floor,
      totalFloors: data.totalFloors,
      rentAmount: data.rentAmount,
      securityDeposit: data.securityDeposit,
      description: data.description,
      images,
      documents: flat?.documents || [],
      isOccupied: flat?.isOccupied || false,
      currentTenant: flat?.currentTenant,
      specifications: data.specifications,
      rentHistory: flat?.rentHistory || [],
      maintenanceRecords: flat?.maintenanceRecords || [],
    };

    onSubmit(flatData);
  };

  const handleImageUpload = (base64Images: string[]) => {
    setImages(base64Images);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Flat Name *
              </label>
              <Input
                {...register("name", { required: "Flat name is required" })}
                placeholder="e.g., Sunrise Apartments"
                error={errors.name?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Door Number *
              </label>
              <Input
                {...register("doorNumber", {
                  required: "Door number is required",
                })}
                placeholder="e.g., 101, A-201"
                error={errors.doorNumber?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address *
              </label>
              <Input
                {...register("address", { required: "Address is required" })}
                placeholder="Complete address with area and city"
                error={errors.address?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Additional details about the flat..."
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Property Details */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Property Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Service Number
              </label>
              <Input
                {...register("serviceNumber")}
                placeholder="e.g., ELEC-001, WATER-101"
                error={errors.serviceNumber?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bedrooms *
              </label>
              <Input
                type="number"
                min="0"
                {...register("bedroomCount", {
                  required: "Bedroom count is required",
                  min: { value: 0, message: "Must be 0 or more" },
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
                  min: { value: 1, message: "Must be at least 1" },
                })}
                error={errors.bathroomCount?.message}
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
                  min: { value: 1, message: "Must be greater than 0" },
                })}
                error={errors.area?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Floor *
              </label>
              <Input
                type="number"
                min="1"
                {...register("floor", {
                  required: "Floor is required",
                  min: { value: 1, message: "Must be at least 1" },
                })}
                error={errors.floor?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Total Floors *
              </label>
              <Input
                type="number"
                min="1"
                {...register("totalFloors", {
                  required: "Total floors is required",
                  min: { value: 1, message: "Must be at least 1" },
                })}
                error={errors.totalFloors?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Financial Details */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Financial Details
          </h3>
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
                  min: { value: 0, message: "Must be 0 or more" },
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
                  min: { value: 0, message: "Must be 0 or more" },
                })}
                error={errors.securityDeposit?.message}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Specifications */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Specifications & Amenities
          </h3>

          {/* Checkboxes */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("specifications.furnished")}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Furnished</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("specifications.parking")}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Parking</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("specifications.balcony")}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Balcony</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("specifications.airConditioning")}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">AC</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("specifications.powerBackup")}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Power Backup</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("specifications.internetReady")}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-800"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">Internet Ready</span>
            </label>
          </div>

          {/* Additional Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Water Supply
              </label>
              <select
                {...register("specifications.waterSupply")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="24x7">24x7</option>
                <option value="limited">Limited Hours</option>
                <option value="tanker">Tanker Supply</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Society Name
              </label>
              <Input
                {...register("specifications.societyName")}
                placeholder="e.g., Green Valley Society"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Maintenance Charges (₹)
              </label>
              <Input
                type="number"
                min="0"
                {...register("specifications.maintenanceCharges")}
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Images */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Property Images
          </h3>
          <SimpleFileUpload
            onFilesSelected={handleImageUpload}
            existingFiles={images}
            accept="image/*"
            multiple
            maxFiles={10}
          />
        </div>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {flat ? "Update Flat" : "Create Flat"}
        </Button>
      </div>
    </form>
  );
}
