"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { RentPayment, Tenant } from "@/types";
import { rentPaymentService } from "@/services/RentPaymentService";
import { propertyService } from "@/services/PropertyService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

interface RentPaymentFormProps {
  payment?: RentPayment;
  tenantId?: string;
  propertyId?: string;
  propertyType?: "building" | "flat" | "land";
  unitId?: string;
  onSubmit: (payment: RentPayment) => void;
  onCancel: () => void;
}

interface FormData {
  tenantId: string;
  propertyId: string;
  propertyType: "building" | "flat" | "land";
  unitId?: string;
  amount: number;
  dueDate: string;
  paidDate?: string;
  status: "pending" | "paid" | "overdue" | "partial";
  paymentMethod: "cash" | "bank_transfer" | "cheque" | "upi" | "card";
  transactionId?: string;
  notes?: string;
  lateFee?: number;
  discount?: number;
  actualAmountPaid?: number;
}

export const RentPaymentForm: React.FC<RentPaymentFormProps> = ({
  payment,
  tenantId,
  propertyId,
  propertyType,
  unitId,
  onSubmit,
  onCancel,
}) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      tenantId: payment?.tenantId || tenantId || "",
      propertyId: payment?.propertyId || propertyId || "",
      propertyType: payment?.propertyType || propertyType || "flat",
      unitId: payment?.unitId || unitId || "",
      amount: payment?.amount || 0,
      dueDate: payment?.dueDate
        ? new Date(payment.dueDate).toISOString().split("T")[0]
        : "",
      paidDate: payment?.paidDate
        ? new Date(payment.paidDate).toISOString().split("T")[0]
        : "",
      status: payment?.status || "pending",
      paymentMethod: payment?.paymentMethod || "cash",
      transactionId: payment?.transactionId || "",
      notes: payment?.notes || "",
      lateFee: payment?.lateFee || 0,
      discount: payment?.discount || 0,
      actualAmountPaid: payment?.actualAmountPaid || undefined,
    },
  });

  const watchStatus = watch("status");
  const watchAmount = watch("amount");
  const watchLateFee = watch("lateFee");
  const watchDiscount = watch("discount");

  useEffect(() => {
    // Load tenants and properties
    const loadedTenants = propertyService.getTenants();
    setTenants(loadedTenants);

    const buildings = propertyService.getBuildings();
    const flats = propertyService.getFlats();
    const lands = propertyService.getLands();
    setProperties([...buildings, ...flats, ...lands]);
  }, []);

  useEffect(() => {
    // Calculate actual amount paid based on amount, late fee, and discount
    const baseAmount = watchAmount || 0;
    const lateFee = watchLateFee || 0;
    const discount = watchDiscount || 0;
    const actualAmount = baseAmount + lateFee - discount;
    setValue("actualAmountPaid", actualAmount > 0 ? actualAmount : 0);
  }, [watchAmount, watchLateFee, watchDiscount, setValue]);

  const onFormSubmit = async (data: FormData) => {
    try {
      setLoading(true);

      const paymentData = {
        ...data,
        dueDate: new Date(data.dueDate),
        paidDate: data.paidDate ? new Date(data.paidDate) : undefined,
        lateFee: data.lateFee || 0,
        discount: data.discount || 0,
      };

      let result: RentPayment;

      if (payment) {
        // Update existing payment
        result = rentPaymentService.updateRentPayment(payment.id, paymentData);
        toast.success("Rent payment updated successfully");
      } else {
        // Create new payment
        result = rentPaymentService.recordRentPayment(paymentData);
        toast.success("Rent payment recorded successfully");
      }

      onSubmit(result);
    } catch (error) {
      console.error("Error saving rent payment:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to save rent payment"
      );
    } finally {
      setLoading(false);
    }
  };

  const getPropertyName = (prop: any): string => {
    if (prop.type === "building") {
      return `${prop.name} (Building)`;
    } else if (prop.type === "flat") {
      return `${prop.name} (Flat)`;
    } else if (prop.type === "land") {
      return `${prop.name} (Land)`;
    }
    return prop.name || prop.address;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {payment ? "Edit Rent Payment" : "Record Rent Payment"}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tenant Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tenant *
            </label>
            <Select
              {...register("tenantId", { required: "Tenant is required" })}
              disabled={!!tenantId}
            >
              <option value="">Select Tenant</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.personalInfo.fullName}
                </option>
              ))}
            </Select>
            {errors.tenantId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.tenantId.message}
              </p>
            )}
          </div>

          {/* Property Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property *
            </label>
            <Select
              {...register("propertyId", { required: "Property is required" })}
              disabled={!!propertyId}
            >
              <option value="">Select Property</option>
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {getPropertyName(property)}
                </option>
              ))}
            </Select>
            {errors.propertyId && (
              <p className="mt-1 text-sm text-red-600">
                {errors.propertyId.message}
              </p>
            )}
          </div>

          {/* Rent Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rent Amount *
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("amount", {
                required: "Amount is required",
                min: { value: 0.01, message: "Amount must be positive" },
              })}
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Due Date *
            </label>
            <Input
              type="date"
              {...register("dueDate", { required: "Due date is required" })}
            />
            {errors.dueDate && (
              <p className="mt-1 text-sm text-red-600">
                {errors.dueDate.message}
              </p>
            )}
          </div>

          {/* Payment Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <Select {...register("status", { required: "Status is required" })}>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
            </Select>
            {errors.status && (
              <p className="mt-1 text-sm text-red-600">
                {errors.status.message}
              </p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method *
            </label>
            <Select
              {...register("paymentMethod", {
                required: "Payment method is required",
              })}
            >
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </Select>
            {errors.paymentMethod && (
              <p className="mt-1 text-sm text-red-600">
                {errors.paymentMethod.message}
              </p>
            )}
          </div>

          {/* Paid Date (only if status is paid) */}
          {watchStatus === "paid" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paid Date
              </label>
              <Input type="date" {...register("paidDate")} />
            </div>
          )}

          {/* Transaction ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction ID
            </label>
            <Input
              type="text"
              placeholder="Enter transaction ID"
              {...register("transactionId")}
            />
          </div>

          {/* Late Fee */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Late Fee
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("lateFee", {
                min: { value: 0, message: "Late fee cannot be negative" },
              })}
            />
            {errors.lateFee && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lateFee.message}
              </p>
            )}
          </div>

          {/* Discount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discount
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register("discount", {
                min: { value: 0, message: "Discount cannot be negative" },
              })}
            />
            {errors.discount && (
              <p className="mt-1 text-sm text-red-600">
                {errors.discount.message}
              </p>
            )}
          </div>

          {/* Actual Amount Paid (calculated) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual Amount Paid
            </label>
            <Input
              type="number"
              step="0.01"
              {...register("actualAmountPaid")}
              readOnly
              className="bg-gray-50"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            {...register("notes")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Add any additional notes..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : payment
                ? "Update Payment"
                : "Record Payment"}
          </Button>
        </div>
      </form>
    </Card>
  );
};
