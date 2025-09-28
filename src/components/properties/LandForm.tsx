"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Land, LandLeaseTerms } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { Button, Input, Card, CardContent } from "@/components/ui";
import { SimpleFileUpload } from "@/components/ui/SimpleFileUpload";
import { toast } from "react-hot-toast";

interface LandFormData {
  name: string;
  address: string;
  description: string;
  surveyNumber: string;
  area: number;
  areaUnit: "sqft" | "acres" | "cents";
  zoning: "residential" | "commercial" | "agricultural" | "industrial";
  soilType: string;
  waterSource: string;
  roadAccess: boolean;
  electricityConnection: boolean;
  isLeased: boolean;
  // Lease terms (optional)
  leaseType?: "agricultural" | "commercial" | "residential";
  rentAmount?: number;
  rentFrequency?: "monthly" | "quarterly" | "yearly";
  securityDeposit?: number;
  leaseDuration?: number;
  renewalTerms?: string;
  restrictions?: string;
}

interface LandFormProps {
  land?: Land;
  onSubmit?: (land: Land) => void;
}

export function LandForm({ land, onSubmit }: LandFormProps) {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(land?.images || []);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<LandFormData>({
    defaultValues: {
      name: land?.name || "",
      address: land?.address || "",
      description: land?.description || "",
      surveyNumber: land?.surveyNumber || "",
      area: land?.area || 0,
      areaUnit: land?.areaUnit || "sqft",
      zoning: land?.zoning || "residential",
      soilType: land?.soilType || "",
      waterSource: land?.waterSource || "",
      roadAccess: land?.roadAccess || false,
      electricityConnection: land?.electricityConnection || false,
      isLeased: land?.isLeased || false,
      leaseType: land?.leaseTerms?.leaseType || "agricultural",
      rentAmount: land?.leaseTerms?.rentAmount || 0,
      rentFrequency: land?.leaseTerms?.rentFrequency || "monthly",
      securityDeposit: land?.leaseTerms?.securityDeposit || 0,
      leaseDuration: land?.leaseTerms?.leaseDuration || 1,
      renewalTerms: land?.leaseTerms?.renewalTerms || "",
      restrictions: land?.leaseTerms?.restrictions?.join(", ") || "",
    },
  });

  const isLeased = watch("isLeased");

  const handleFormSubmit = async (data: LandFormData) => {
    try {
      setLoading(true);

      const landData: Land = {
        id: land?.id || `land_${Date.now()}`,
        type: "land",
        name: data.name,
        address: data.address,
        description: data.description,
        images,
        documents: land?.documents || [],
        surveyNumber: data.surveyNumber || undefined,
        area: data.area,
        areaUnit: data.areaUnit,
        zoning: data.zoning,
        soilType: data.soilType || undefined,
        waterSource: data.waterSource || undefined,
        roadAccess: data.roadAccess,
        electricityConnection: data.electricityConnection,
        isLeased: data.isLeased,
        currentTenant: land?.currentTenant,
        leaseTerms: data.isLeased
          ? {
              leaseType: data.leaseType!,
              rentAmount: data.rentAmount!,
              rentFrequency: data.rentFrequency!,
              securityDeposit: data.securityDeposit!,
              leaseDuration: data.leaseDuration!,
              renewalTerms: data.renewalTerms,
              restrictions: data.restrictions
                ? data.restrictions.split(",").map((r) => r.trim())
                : undefined,
            }
          : undefined,
        rentHistory: land?.rentHistory || [],
        maintenanceRecords: land?.maintenanceRecords || [],
        createdAt: land?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      if (land) {
        await propertyService.updateLand(land.id, landData);
        toast.success("Land property updated successfully");
      } else {
        await propertyService.saveLand(landData);
        toast.success("Land property added successfully");
      }

      if (onSubmit) {
        onSubmit(landData);
      } else {
        router.push("/properties/lands");
      }
    } catch (error) {
      console.error("Error saving land:", error);
      toast.error("Failed to save land property");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const handleImagesChange = (newImages: string[]) => {
    setImages(newImages);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Property Name *
              </label>
              <Input
                {...register("name", { required: "Property name is required" })}
                placeholder="e.g., Agricultural Land - Annavaram"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {errors.name && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Survey Number
              </label>
              <Input 
                {...register("surveyNumber")} 
                placeholder="e.g., 123/A"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Address *
              </label>
              <Input
                {...register("address", { required: "Address is required" })}
                placeholder="Complete address of the land property"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {errors.address && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                {...register("description")}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Additional details about the land property"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Details */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Property Details
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area *
              </label>
              <Input
                type="number"
                step="0.01"
                {...register("area", {
                  required: "Area is required",
                  min: { value: 0.01, message: "Area must be greater than 0" },
                })}
                placeholder="e.g., 1000"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {errors.area && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {errors.area.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Area Unit *
              </label>
              <select
                {...register("areaUnit", { required: "Area unit is required" })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="sqft">Square Feet</option>
                <option value="acres">Acres</option>
                <option value="cents">Cents</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Zoning *
              </label>
              <select
                {...register("zoning", { required: "Zoning is required" })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="agricultural">Agricultural</option>
                <option value="industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Soil Type
              </label>
              <Input
                {...register("soilType")}
                placeholder="e.g., Black soil, Red soil"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Water Source
              </label>
              <Input
                {...register("waterSource")}
                placeholder="e.g., Borewell, Canal, River"
                className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("roadAccess")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Road Access Available
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register("electricityConnection")}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                />
                <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                  Electricity Connection Available
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lease Information */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Lease Information
            </h3>
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("isLeased")}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Currently Leased
              </label>
            </div>
          </div>

          {isLeased && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lease Type *
                </label>
                <select
                  {...register("leaseType", {
                    required: isLeased ? "Lease type is required" : false,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="agricultural">Agricultural</option>
                  <option value="commercial">Commercial</option>
                  <option value="residential">Residential</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rent Amount *
                </label>
                <Input
                  type="number"
                  {...register("rentAmount", {
                    required: isLeased ? "Rent amount is required" : false,
                    min: { value: 0, message: "Rent amount must be positive" },
                  })}
                  placeholder="e.g., 50000"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.rentAmount && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {errors.rentAmount.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rent Frequency *
                </label>
                <select
                  {...register("rentFrequency", {
                    required: isLeased ? "Rent frequency is required" : false,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Security Deposit
                </label>
                <Input
                  type="number"
                  {...register("securityDeposit")}
                  placeholder="e.g., 100000"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Lease Duration (years) *
                </label>
                <Input
                  type="number"
                  {...register("leaseDuration", {
                    required: isLeased ? "Lease duration is required" : false,
                    min: {
                      value: 1,
                      message: "Lease duration must be at least 1 year",
                    },
                  })}
                  placeholder="e.g., 5"
                  className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                {errors.leaseDuration && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {errors.leaseDuration.message}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Renewal Terms
                </label>
                <textarea
                  {...register("renewalTerms")}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Terms and conditions for lease renewal"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Restrictions
                </label>
                <textarea
                  {...register("restrictions")}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="Any restrictions or limitations (comma-separated)"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Images */}
      <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Property Images
          </h3>
          <SimpleFileUpload
            images={images}
            onImagesChange={handleImagesChange}
            maxImages={5}
            acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
          />
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={loading}
          className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : land ? "Update Land" : "Add Land"}
        </Button>
      </div>
    </form>
  );
}
