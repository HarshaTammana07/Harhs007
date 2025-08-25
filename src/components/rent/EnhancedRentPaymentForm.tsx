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
      loadTenantsForBuilding(watchBuildingId);
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

  const loadTenantsForBuilding = async (buildingId: string) => {
    try {
      setLoadingTenants(true);
      const allTenants = await propertyService.getTenants();

      // Filter tenants for this building and add property metadata
      const buildingTenants = await Promise.all(
        allTenants
          .filter(
            (tenant) =>
              tenant.buildingId === buildingId &&
              tenant.propertyType === "apartment"
          )
          .map(async (tenant) => {
            const tenantWithInfo: TenantWithPropertyInfo = { ...tenant };

            try {
              // Get apartment details
              const apartments =
                await propertyService.getApartmentsByBuildingId(buildingId);
              const apartment = apartments.find(
                (apt) => apt.id === tenant.propertyId
              );
              const building = buildings.find((b) => b.id === buildingId);

              if (apartment && building) {
                tenantWithInfo.displayInfo = {
                  apartmentDoorNumber: apartment.doorNumber,
                  apartmentFloor: apartment.floor,
                  buildingName: building.name,
                };
              }
            } catch (error) {
              console.error("Error loading tenant property info:", error);
            }

            return tenantWithInfo;
          })
      );

      setTenants(buildingTenants);
    } catch (error) {
      console.error("Error loading tenants for building:", error);
      toast.error("Failed to load tenants");
    } finally {
      setLoadingTenants(false);
    }
  };

  const loadTenantsForFlat = async (flatId: string) => {
    try {
      setLoadingTenants(true);
      const allTenants = await propertyService.getTenants();

      // Filter tenants for this flat and add property metadata
      const flatTenants = await Promise.all(
        allTenants
          .filter(
            (tenant) =>
              tenant.propertyId === flatId && tenant.propertyType === "flat"
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
              console.error("Error loading tenant property info:", error);
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

      // Validate required fields
      if (!data.tenantId) {
        toast.error("Please select a tenant");
        return;
      }

      // Determine property details
      let propertyId = "";
      let propertyType = "";
      let unitId: string | undefined = undefined;

      if (
        data.propertyType === "building" &&
        data.buildingId &&
        data.apartmentId
      ) {
        propertyId = data.buildingId;
        propertyType = "building";
        unitId = data.apartmentId;
      } else if (data.propertyType === "flat" && data.flatId) {
        propertyId = data.flatId;
        propertyType = "flat";
        unitId = undefined; // Flats don't have unit_id
      } else {
        toast.error("Please select a valid property");
        return;
      }

      // Calculate actual amount
      const actualAmount =
        data.amount + (data.lateFee || 0) - (data.discount || 0);

      // Create payment data
      const paymentData: Omit<RentPayment, "id" | "createdAt" | "updatedAt"> = {
        tenantId: data.tenantId,
        propertyType: propertyType as "building" | "flat" | "land",
        propertyId: propertyId,
        unitId: unitId,
        amount: data.amount,
        dueDate: new Date(data.paymentDate),
        paidDate: new Date(data.paymentDate),
        status: "paid",
        paymentMethod: data.paymentMethod,
        transactionId: data.transactionId || undefined,
        notes: data.notes || undefined,
        lateFee: data.lateFee || 0,
        discount: data.discount || 0,
        actualAmountPaid: actualAmount,
        receiptNumber: `RCP-${Date.now()}`,
      };

      // Create the payment using ApiService
      const createdPayment = await ApiService.createRentPayment(paymentData);

      onSubmit(createdPayment);
      reset();
      toast.success("Rent payment recorded successfully!");
    } catch (error) {
      console.error("Error recording payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTenantDisplayText = (tenant: TenantWithPropertyInfo) => {
    const name = tenant.personalInfo.fullName;
    const phone = tenant.contactInfo.phone;

    if (tenant.displayInfo?.apartmentDoorNumber) {
      return `${name} - Door: ${tenant.displayInfo.apartmentDoorNumber}, Floor: ${tenant.displayInfo.apartmentFloor} (${phone})`;
    } else if (tenant.displayInfo?.flatDoorNumber) {
      return `${name} - Door: ${tenant.displayInfo.flatDoorNumber} (${phone})`;
    }

    return `${name} (${phone})`;
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Property Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Property Selection
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
                      Property Type *
                    </label>
                    <select
                      {...register("propertyType", {
                        required: "Property type is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select property type</option>
                      <option value="building">Building</option>
                      <option value="flat">Flat</option>
                    </select>
                    {errors.propertyType && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.propertyType.message}
                      </p>
                    )}
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

                      {watchBuildingId && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Apartment *
                          </label>
                          <select
                            {...register("apartmentId", {
                              required:
                                watchPropertyType === "building"
                                  ? "Please select an apartment"
                                  : false,
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                            <p className="text-red-600 text-sm mt-1">
                              {errors.apartmentId.message}
                            </p>
                          )}
                          {apartments.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                              No apartments found for the selected building
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
                            {flat.name} - {flat.doorNumber} ({flat.address})
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

          {/* Tenant Selection */}
          {((watchPropertyType === "building" &&
            watchBuildingId &&
            watchApartmentId) ||
            (watchPropertyType === "flat" && watchFlatId)) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <UserIcon className="h-5 w-5 mr-2" />
                  Tenant Selection
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTenants ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">
                      Loading tenants...
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tenant *
                    </label>
                    <select
                      {...register("tenantId", {
                        required: "Please select a tenant",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select tenant</option>
                      {tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {getTenantDisplayText(tenant)}
                        </option>
                      ))}
                    </select>
                    {errors.tenantId && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.tenantId.message}
                      </p>
                    )}
                    {tenants.length === 0 && !loadingTenants && (
                      <p className="text-sm text-gray-500 mt-1">
                        No tenants found for the selected property
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payment Details */}
          {watchTenantId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
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
                  />
                  <Input
                    label="Payment Date *"
                    type="date"
                    {...register("paymentDate", {
                      required: "Payment date is required",
                    })}
                    error={errors.paymentDate?.message}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Payment Method *
                    </label>
                    <select
                      {...register("paymentMethod", {
                        required: "Payment method is required",
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                    </select>
                    {errors.paymentMethod && (
                      <p className="text-red-600 text-sm mt-1">
                        {errors.paymentMethod.message}
                      </p>
                    )}
                  </div>
                  <Input
                    label="Transaction ID"
                    {...register("transactionId")}
                    placeholder="Enter transaction ID (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Late Fee (₹)"
                    type="number"
                    {...register("lateFee", { valueAsNumber: true })}
                    placeholder="0"
                  />
                  <Input
                    label="Discount (₹)"
                    type="number"
                    {...register("discount", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    {...register("notes")}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add any additional notes..."
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
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
