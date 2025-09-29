"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { RentPayment, Tenant, Building, Apartment, Flat } from "@/types";
import { propertyService } from "@/services/PropertyService";
import { ApiService } from "@/services/ApiService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import {
  CurrencyRupeeIcon,
  BuildingOfficeIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

interface EnhancedRentPaymentFormData {
  // Property Selection
  propertyType: "building" | "flat" | "";
  buildingId: string;
  apartmentId: string;
  flatId: string;
  tenantId: string;

  // Payment Details
  amount: number;
  paymentDate: string;
  paymentMethod: "cash" | "card" | "upi" | "bank_transfer" | "cheque";
  transactionId?: string;
  notes?: string;
  lateFee?: number;
  discount?: number;
}

interface EnhancedRentPaymentFormProps {
  isOpen: boolean;
  onSubmit: (paymentData: RentPayment) => void;
  onCancel: () => void;
  title?: string;
}

// Interface for tenant with property metadata for dropdown display
interface TenantWithPropertyInfo extends Tenant {
  displayInfo?: {
    apartmentDoorNumber?: string;
    apartmentFloor?: number;
    flatDoorNumber?: string;
    buildingName?: string;
    flatName?: string;
  };
}

export function EnhancedRentPaymentForm({
  isOpen,
  onSubmit,
  onCancel,
  title = "Record Rent Payment",
}: EnhancedRentPaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [tenants, setTenants] = useState<TenantWithPropertyInfo[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingTenants, setLoadingTenants] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EnhancedRentPaymentFormData>({
    defaultValues: {
      propertyType: "",
      buildingId: "",
      apartmentId: "",
      flatId: "",
      tenantId: "",
      amount: 0,
      paymentDate: new Date().toISOString().split("T")[0],
      paymentMethod: "cash",
      transactionId: "",
      notes: "",
      lateFee: 0,
      discount: 0,
    },
  });

  // Watch for changes
  const watchPropertyType = watch("propertyType");
  const watchBuildingId = watch("buildingId");
  const watchApartmentId = watch("apartmentId");
  const watchFlatId = watch("flatId");
  const watchTenantId = watch("tenantId");

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadProperties();
    }
  }, [isOpen]);

  // Load apartments when building changes
  useEffect(() => {
    if (watchBuildingId && watchPropertyType === "building") {
      loadApartments(watchBuildingId);
    } else {
      setApartments([]);
      setValue("apartmentId", "");
    }
  }, [watchBuildingId, watchPropertyType, setValue]);

  // Load tenants for building when apartment is selected
  useEffect(() => {
    if (
      watchPropertyType === "building" &&
      watchBuildingId &&
      watchApartmentId
    ) {
      loadTenantsForApartment(watchBuildingId, watchApartmentId);
    } else if (watchPropertyType === "building") {
      setTenants([]);
      setValue("tenantId", "");
    }
  }, [watchPropertyType, watchBuildingId, watchApartmentId, setValue]);

  // Load tenants for flat when flat is selected
  useEffect(() => {
    if (watchPropertyType === "flat" && watchFlatId) {
      loadTenantsForFlat(watchFlatId);
    } else if (watchPropertyType === "flat") {
      setTenants([]);
      setValue("tenantId", "");
    }
  }, [watchPropertyType, watchFlatId, setValue]);

  // Auto-fill rent amount when tenant is selected
  useEffect(() => {
    if (watchTenantId) {
      const selectedTenant = tenants.find((t) => t.id === watchTenantId);
      if (selectedTenant && selectedTenant.rentalAgreement.rentAmount) {
        setValue("amount", selectedTenant.rentalAgreement.rentAmount);
      }
    }
  }, [watchTenantId, tenants, setValue]);

  // Reset dependent fields when property type changes
  useEffect(() => {
    if (watchPropertyType === "building") {
      setValue("flatId", "");
    } else if (watchPropertyType === "flat") {
      setValue("buildingId", "");
      setValue("apartmentId", "");
    }
    setValue("tenantId", "");
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

  const loadTenantsForApartment = async (buildingId: string, apartmentId: string) => {
    try {
      setLoadingTenants(true);
      const allTenants = await propertyService.getTenants();

      // Only current active tenant for this specific apartment
      const buildingTenants = await Promise.all(
        allTenants
          .filter(
            (tenant) =>
              tenant.buildingId === buildingId &&
              tenant.propertyType === "apartment" &&
              tenant.propertyId === apartmentId &&
              tenant.isActive
          )
          .map(async (tenant) => {
            const tenantWithInfo: TenantWithPropertyInfo = { ...tenant };
            try {
              // Get apartment details
              const apartment = await propertyService.getApartmentById(apartmentId);
              if (apartment) {
                tenantWithInfo.displayInfo = {
                  apartmentDoorNumber: apartment.doorNumber,
                  apartmentFloor: apartment.floor,
                };
              }

              // Get building details
              const building = await propertyService.getBuildingById(buildingId);
              if (building) {
                tenantWithInfo.displayInfo = {
                  ...tenantWithInfo.displayInfo,
                  buildingName: building.name,
                };
              }
            } catch (error) {
              console.error("Error loading tenant metadata:", error);
            }
            return tenantWithInfo;
          })
      );

      setTenants(buildingTenants);
    } catch (error) {
      console.error("Error loading tenants for apartment:", error);
      toast.error("Failed to load tenants");
    } finally {
      setLoadingTenants(false);
    }
  };

  const loadTenantsForFlat = async (flatId: string) => {
    try {
      setLoadingTenants(true);
      const allTenants = await propertyService.getTenants();

      // Only current active tenant for this flat
      const flatTenants = await Promise.all(
        allTenants
          .filter(
            (tenant) =>
              tenant.propertyId === flatId &&
              tenant.propertyType === "flat" &&
              tenant.isActive
          )
          .map(async (tenant) => {
            const tenantWithInfo: TenantWithPropertyInfo = { ...tenant };
            try {
              // Get flat details
              const flat = flats.find((f) => f.id === flatId);
              if (flat) {
                tenantWithInfo.displayInfo = {
                  flatDoorNumber: flat.doorNumber,
                  flatName: flat.name,
                };
              }
            } catch (error) {
              console.error("Error loading tenant metadata:", error);
            }
            return tenantWithInfo;
          })
      );

      setTenants(flatTenants);
    } catch (error) {
      console.error("Error loading tenants for flat:", error);
      toast.error("Failed to load tenants");
    } finally {
      setLoadingTenants(false);
    }
  };

  const onFormSubmit = async (data: EnhancedRentPaymentFormData) => {
    try {
      setIsSubmitting(true);

      // Determine property details based on selection
      let propertyId = "";
      let unitId = "";

      if (data.propertyType === "building") {
        propertyId = data.buildingId;
        unitId = data.apartmentId;
      } else if (data.propertyType === "flat") {
        propertyId = data.flatId;
      }

      // Get tenant details
      const selectedTenant = tenants.find((t) => t.id === data.tenantId);
      if (!selectedTenant) {
        throw new Error("Selected tenant not found");
      }

      // Create payment data
      const paymentData: RentPayment = {
        id: `payment_${Date.now()}`,
        tenantId: data.tenantId,
        propertyId,
        propertyType: data.propertyType as "building" | "flat",
        unitId: unitId || undefined,
        amount: data.amount,
        dueDate: new Date(data.paymentDate),
        paidDate: new Date(data.paymentDate),
        status: "paid",
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId || undefined,
        notes: data.notes || undefined,
        lateFee: data.lateFee || 0,
        discount: data.discount || 0,
        actualAmountPaid: data.amount + (data.lateFee || 0) - (data.discount || 0),
        receiptNumber: `RCP-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save payment
      await ApiService.createRentPayment(paymentData);

      toast.success("Rent payment recorded successfully!");
      onSubmit(paymentData);
      reset();
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to record payment"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    reset();
    onCancel();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="xl">
      <div className="p-6 bg-white dark:bg-gray-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <CurrencyRupeeIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Property Selection */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center text-gray-900 dark:text-white">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Property Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Property Type *
                </label>
                <select
                  {...register("propertyType", {
                    required: "Please select a property type",
                  })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                >
                  <option value="">Select property type</option>
                  <option value="building">Building</option>
                  <option value="flat">Flat</option>
                </select>
                {errors.propertyType && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                    {errors.propertyType.message}
                  </p>
                )}
              </div>

              {watchPropertyType === "building" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Building *
                    </label>
                    <select
                      {...register("buildingId", {
                        required:
                          watchPropertyType === "building"
                            ? "Please select a building"
                            : false,
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
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
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {errors.buildingId.message}
                      </p>
                    )}
                  </div>

                  {watchBuildingId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Apartment *
                      </label>
                      <select
                        {...register("apartmentId", {
                          required:
                            watchPropertyType === "building"
                              ? "Please select an apartment"
                              : false,
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      >
                        <option value="">Select apartment</option>
                        {apartments.map((apartment) => (
                          <option key={apartment.id} value={apartment.id}>
                            Door: {apartment.doorNumber}, Floor:{" "}
                            {apartment.floor}
                            {apartment.type && ` - ${apartment.type}`}
                          </option>
                        ))}
                      </select>
                      {errors.apartmentId && (
                        <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                          {errors.apartmentId.message}
                        </p>
                      )}
                      {apartments.length === 0 && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          No apartments found for the selected building
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {watchPropertyType === "flat" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Flat *
                  </label>
                  <select
                    {...register("flatId", {
                      required:
                        watchPropertyType === "flat"
                          ? "Please select a flat"
                          : false,
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  >
                    <option value="">Select flat</option>
                    {flats.map((flat) => (
                      <option key={flat.id} value={flat.id}>
                        {flat.name} - {flat.doorNumber} ({flat.address})
                      </option>
                    ))}
                  </select>
                  {errors.flatId && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errors.flatId.message}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tenant Selection */}
          {((watchPropertyType === "building" && watchApartmentId) ||
            (watchPropertyType === "flat" && watchFlatId)) && (
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Tenant Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tenant *
                  </label>
                  {loadingTenants ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Loading tenants...
                      </p>
                    </div>
                  ) : (
                    <select
                      {...register("tenantId", {
                        required: "Please select a tenant",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="">Select tenant</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.personalInfo.fullName}
                          {tenant.displayInfo?.apartmentDoorNumber &&
                            ` - Apt ${tenant.displayInfo.apartmentDoorNumber}`}
                          {tenant.displayInfo?.flatDoorNumber &&
                            ` - Flat ${tenant.displayInfo.flatDoorNumber}`}
                          {tenant.rentalAgreement.rentAmount &&
                            ` (₹${tenant.rentalAgreement.rentAmount}/month)`}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.tenantId && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                      {errors.tenantId.message}
                    </p>
                  )}
                  {tenants.length === 0 && !loadingTenants && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      No tenants found for the selected property
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          {watchTenantId && (
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center text-gray-900 dark:text-white">
                  <CurrencyRupeeIcon className="h-5 w-5 mr-2" />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Amount (₹) *"
                    type="number"
                    {...register("amount", {
                      valueAsNumber: true,
                      required: "Amount is required",
                      min: {
                        value: 1,
                        message: "Amount must be greater than 0",
                      },
                    })}
                    error={errors.amount?.message}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <Input
                    label="Payment Date *"
                    type="date"
                    {...register("paymentDate", {
                      required: "Payment date is required",
                    })}
                    error={errors.paymentDate?.message}
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Payment Method *
                    </label>
                    <select
                      {...register("paymentMethod", {
                        required: "Payment method is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                    {errors.paymentMethod && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                        {errors.paymentMethod.message}
                      </p>
                    )}
                  </div>
                  <Input
                    label="Transaction ID"
                    {...register("transactionId")}
                    placeholder="Enter transaction ID (optional)"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Late Fee (₹)"
                    type="number"
                    {...register("lateFee", { valueAsNumber: true })}
                    placeholder="0"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                  <Input
                    label="Discount (₹)"
                    type="number"
                    {...register("discount", { valueAsNumber: true })}
                    placeholder="0"
                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button type="button" variant="outline" onClick={onCancel} className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !watchTenantId}>
              {isSubmitting ? "Recording..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
