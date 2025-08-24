"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Tenant, Building, Apartment, Flat } from "@/types";
import { propertyService } from "@/services/PropertyService";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Modal,
} from "@/components/ui";
import {
  UserIcon,
  PhoneIcon,
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

interface EnhancedTenantFormData {
  fullName: string;
  phone: string;
  email?: string;
  occupation: string;
  monthlyRent: number;
  securityDeposit: number;
  agreementNumber: string;
  startDate: string;
  endDate: string;
  // Property assignment fields
  propertyType: "building" | "flat" | "";
  buildingId: string;
  apartmentId: string;
  flatId: string;
}

interface EnhancedTenantFormProps {
  onSubmit: (tenantData: Tenant) => void;
  onCancel: () => void;
  isOpen: boolean;
  title?: string;
  tenant?: Tenant | null;
}

export function EnhancedTenantForm({
  onSubmit,
  onCancel,
  isOpen,
  title = "Add Tenant",
  tenant,
}: EnhancedTenantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EnhancedTenantFormData>({
    defaultValues: {
      fullName: tenant?.personalInfo?.fullName || "",
      phone: tenant?.contactInfo?.phone || "",
      email: tenant?.contactInfo?.email || "",
      occupation: tenant?.personalInfo?.occupation || "",
      monthlyRent: tenant?.rentalAgreement?.rentAmount || 0,
      securityDeposit: tenant?.rentalAgreement?.securityDeposit || 0,
      agreementNumber: tenant?.rentalAgreement?.agreementNumber || "",
      startDate: tenant?.rentalAgreement?.startDate
        ? new Date(tenant.rentalAgreement.startDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      endDate: tenant?.rentalAgreement?.endDate
        ? new Date(tenant.rentalAgreement.endDate).toISOString().split("T")[0]
        : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
      propertyType: (tenant?.propertyType as "building" | "flat") || "",
      buildingId: tenant?.buildingId || "",
      apartmentId:
        tenant?.propertyType === "apartment" ? tenant?.propertyId || "" : "",
      flatId: tenant?.propertyType === "flat" ? tenant?.propertyId || "" : "",
    },
  });

  // Watch for property type changes
  const watchPropertyType = watch("propertyType");
  const watchBuildingId = watch("buildingId");

  // Load properties on component mount
  useEffect(() => {
    loadProperties();
  }, []);

  // Load apartments when building changes
  useEffect(() => {
    if (watchBuildingId && watchPropertyType === "building") {
      loadApartments(watchBuildingId);
    } else {
      setApartments([]);
    }
  }, [watchBuildingId, watchPropertyType]);

  // Reset dependent fields when property type changes
  useEffect(() => {
    if (watchPropertyType === "building") {
      setValue("flatId", "");
    } else if (watchPropertyType === "flat") {
      setValue("buildingId", "");
      setValue("apartmentId", "");
    }
  }, [watchPropertyType, setValue]);

  const loadProperties = async () => {
    try {
      setLoadingProperties(true);
      const [buildingsData, flatsData] = await Promise.all([
        propertyService.getBuildings(),
        propertyService.getFlats(),
      ]);
      setBuildings(buildingsData);
      setFlats(flatsData);
    } catch (error) {
      console.error("Error loading properties:", error);
      toast.error("Failed to load properties");
    } finally {
      setLoadingProperties(false);
    }
  };

  const loadApartments = async (buildingId: string) => {
    try {
      const apartmentsData =
        await propertyService.getApartmentsByBuildingId(buildingId);
      setApartments(apartmentsData);
    } catch (error) {
      console.error("Error loading apartments:", error);
      toast.error("Failed to load apartments");
    }
  };

  const onFormSubmit = async (data: EnhancedTenantFormData) => {
    try {
      setIsSubmitting(true);

      // Determine property assignment
      let propertyId = "";
      let propertyType = "";
      let buildingId = "";

      if (data.propertyType === "building" && data.apartmentId) {
        propertyId = data.apartmentId;
        propertyType = "apartment";
        buildingId = data.buildingId;
      } else if (data.propertyType === "flat" && data.flatId) {
        propertyId = data.flatId;
        propertyType = "flat";
      }

      // Get rent amount from selected property if not manually set
      let rentAmount = data.monthlyRent;
      if (!rentAmount && propertyId) {
        if (propertyType === "apartment") {
          const apartment = apartments.find((apt) => apt.id === propertyId);
          rentAmount = apartment?.rentAmount || 0;
        } else if (propertyType === "flat") {
          const flat = flats.find((f) => f.id === propertyId);
          rentAmount = flat?.rentAmount || 0;
        }
      }

      // Create tenant object
      const tenantData: Tenant = {
        id:
          tenant?.id ||
          `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        personalInfo: {
          firstName: data.fullName.split(" ")[0] || "",
          lastName: data.fullName.split(" ").slice(1).join(" ") || "",
          fullName: data.fullName,
          occupation: data.occupation,
          familySize: tenant?.personalInfo?.familySize || 1,
          nationality: tenant?.personalInfo?.nationality || "Indian",
          maritalStatus: tenant?.personalInfo?.maritalStatus || "single",
          dateOfBirth: tenant?.personalInfo?.dateOfBirth,
          employer: tenant?.personalInfo?.employer,
          monthlyIncome: tenant?.personalInfo?.monthlyIncome,
          religion: tenant?.personalInfo?.religion,
        },
        contactInfo: {
          phone: data.phone,
          email: data.email || "",
          address: tenant?.contactInfo?.address || "",
        },
        emergencyContact: tenant?.emergencyContact || {
          name: "",
          relationship: "",
          phone: "",
        },
        identification: tenant?.identification || {},
        rentalAgreement: {
          agreementNumber: data.agreementNumber,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          rentAmount: rentAmount,
          securityDeposit: data.securityDeposit || rentAmount * 2,
          rentDueDate: tenant?.rentalAgreement?.rentDueDate || 5,
          paymentMethod:
            tenant?.rentalAgreement?.paymentMethod || "bank_transfer",
          noticePeriod: tenant?.rentalAgreement?.noticePeriod || 30,
          maintenanceCharges: tenant?.rentalAgreement?.maintenanceCharges,
          lateFeeAmount: tenant?.rentalAgreement?.lateFeeAmount,
          renewalTerms: tenant?.rentalAgreement?.renewalTerms,
          specialConditions: tenant?.rentalAgreement?.specialConditions || [],
        },
        references: tenant?.references || [],
        documents: tenant?.documents || [],
        moveInDate: tenant?.moveInDate || new Date(data.startDate),
        moveOutDate: tenant?.moveOutDate,
        isActive: tenant?.isActive !== undefined ? tenant.isActive : true,
        propertyId: propertyId || tenant?.propertyId,
        propertyType: propertyType || tenant?.propertyType,
        buildingId: buildingId || tenant?.buildingId,
        createdAt: tenant?.createdAt || new Date(),
        updatedAt: new Date(),
      };

      await onSubmit(tenantData);

      // Update property occupancy if a property is assigned
      if (propertyId && propertyType) {
        try {
          if (propertyType === "apartment") {
            await propertyService.updateApartment(propertyId, {
              isOccupied: true,
            });
          } else if (propertyType === "flat") {
            await propertyService.updateFlat(propertyId, { isOccupied: true });
          }
        } catch (error) {
          console.error("Error updating property occupancy:", error);
          // Don't fail the tenant creation if property update fails
          toast.error("Tenant created but failed to update property occupancy");
        }
      }

      reset();
    } catch (error) {
      console.error("Error submitting tenant:", error);
      toast.error("Failed to save tenant");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="2xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <UserIcon className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Full Name *"
                {...register("fullName", {
                  required: "Full name is required",
                })}
                error={errors.fullName?.message}
                placeholder="Enter tenant's full name"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number *"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[+]?[\d\s\-()]+$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  error={errors.phone?.message}
                  placeholder="+91-9876543210"
                />
                <Input
                  label="Email Address"
                  type="email"
                  {...register("email")}
                  placeholder="tenant@example.com"
                />
              </div>

              <Input
                label="Occupation *"
                {...register("occupation", {
                  required: "Occupation is required",
                })}
                error={errors.occupation?.message}
                placeholder="Software Engineer, Teacher, etc."
              />
            </CardContent>
          </Card>

          {/* Property Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Property Assignment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProperties ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">
                    Loading properties...
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Property Type
                    </label>
                    <select
                      {...register("propertyType")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select property type</option>
                      <option value="building">Building (Apartment)</option>
                      <option value="flat">Standalone Flat</option>
                    </select>
                  </div>

                  {watchPropertyType === "building" && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Building *
                        </label>
                        <select
                          {...register("buildingId", {
                            required:
                              watchPropertyType === "building"
                                ? "Please select a building"
                                : false,
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select building</option>
                          {buildings.map((building) => (
                            <option key={building.id} value={building.id}>
                              {building.name} ({building.buildingCode}) -{" "}
                              {building.address}
                            </option>
                          ))}
                        </select>
                        {errors.buildingId && (
                          <p className="text-red-600 text-sm mt-1">
                            {errors.buildingId.message}
                          </p>
                        )}
                      </div>

                      {watchBuildingId && apartments.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apartment *
                          </label>
                          <select
                            {...register("apartmentId", {
                              required: watchBuildingId
                                ? "Please select an apartment"
                                : false,
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select apartment</option>
                            {apartments.map((apartment) => (
                              <option key={apartment.id} value={apartment.id}>
                                Door No: {apartment.doorNumber} - Floor{" "}
                                {apartment.floor}({apartment.bedroomCount}BHK, ₹
                                {apartment.rentAmount.toLocaleString()}/month)
                                {apartment.isOccupied &&
                                  " - Currently Occupied"}
                              </option>
                            ))}
                          </select>
                          {errors.apartmentId && (
                            <p className="text-red-600 text-sm mt-1">
                              {errors.apartmentId.message}
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {watchPropertyType === "flat" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Flat *
                      </label>
                      <select
                        {...register("flatId", {
                          required:
                            watchPropertyType === "flat"
                              ? "Please select a flat"
                              : false,
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select flat</option>
                        {flats.map((flat) => (
                          <option key={flat.id} value={flat.id}>
                            {flat.name} - {flat.doorNumber}({flat.bedroomCount}
                            BHK, ₹{flat.rentAmount.toLocaleString()}/month)
                            {flat.isOccupied && " - Currently Occupied"}
                          </option>
                        ))}
                      </select>
                      {errors.flatId && (
                        <p className="text-red-600 text-sm mt-1">
                          {errors.flatId.message}
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Rental Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                Rental Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Agreement Number *"
                {...register("agreementNumber", {
                  required: "Agreement number is required",
                })}
                error={errors.agreementNumber?.message}
                placeholder="AGR-001"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Monthly Rent (₹)"
                  type="number"
                  {...register("monthlyRent", {
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Rent cannot be negative",
                    },
                  })}
                  error={errors.monthlyRent?.message}
                  placeholder="Will auto-fill from selected property"
                />
                <Input
                  label="Security Deposit (₹)"
                  type="number"
                  {...register("securityDeposit", {
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: "Security deposit cannot be negative",
                    },
                  })}
                  error={errors.securityDeposit?.message}
                  placeholder="Will auto-calculate if empty"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Agreement Start Date *"
                  type="date"
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                  error={errors.startDate?.message}
                />
                <Input
                  label="Agreement End Date *"
                  type="date"
                  {...register("endDate", {
                    required: "End date is required",
                  })}
                  error={errors.endDate?.message}
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? tenant
                  ? "Updating..."
                  : "Creating..."
                : tenant
                  ? "Update Tenant"
                  : "Create Tenant"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
