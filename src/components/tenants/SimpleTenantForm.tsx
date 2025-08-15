"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Tenant } from "@/types";
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
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface SimpleTenantFormData {
  fullName: string;
  phone: string;
  email?: string;
  occupation: string;
  monthlyRent: number;
  securityDeposit: number;
  agreementNumber: string;
  startDate: string;
  endDate: string;
  moveInDate: string;
}

interface SimpleTenantFormProps {
  onSubmit: (tenantData: Tenant) => void;
  onCancel: () => void;
  isOpen: boolean;
  defaultRent?: number;
  title?: string;
}

export function SimpleTenantForm({
  onSubmit,
  onCancel,
  isOpen,
  defaultRent = 0,
  title = "Add Tenant",
}: SimpleTenantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SimpleTenantFormData>({
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      occupation: "",
      monthlyRent: defaultRent,
      securityDeposit: defaultRent * 2, // Default to 2x rent
      agreementNumber: "",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0], // 1 year from now
      moveInDate: new Date().toISOString().split("T")[0],
    },
  });

  const onFormSubmit = async (data: SimpleTenantFormData) => {
    try {
      setIsSubmitting(true);

      // Create a complete tenant object with minimal required data
      const tenant: Tenant = {
        id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        personalInfo: {
          firstName: data.fullName.split(" ")[0] || "",
          lastName: data.fullName.split(" ").slice(1).join(" ") || "",
          fullName: data.fullName,
          occupation: data.occupation,
          familySize: 1,
          nationality: "Indian",
          maritalStatus: "single",
        },
        contactInfo: {
          phone: data.phone,
          email: data.email || "",
        },
        emergencyContact: {
          name: "",
          relationship: "",
          phone: "",
        },
        identification: {},
        rentalAgreement: {
          agreementNumber: data.agreementNumber,
          startDate: new Date(data.startDate),
          endDate: new Date(data.endDate),
          rentAmount: data.monthlyRent,
          securityDeposit: data.securityDeposit,
          rentDueDate: 5, // Default to 5th of every month
          paymentMethod: "bank_transfer",
          noticePeriod: 30,
        },
        references: [],
        documents: [],
        moveInDate: new Date(data.moveInDate),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await onSubmit(tenant);
      reset();
      toast.success("Tenant added successfully");
    } catch (error) {
      console.error("Error adding tenant:", error);
      toast.error("Failed to add tenant");
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
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
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

          {/* Rental Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
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
                  label="Monthly Rent (₹) *"
                  type="number"
                  {...register("monthlyRent", {
                    valueAsNumber: true,
                    required: "Monthly rent is required",
                    min: {
                      value: 1,
                      message: "Rent must be greater than 0",
                    },
                  })}
                  error={errors.monthlyRent?.message}
                />
                <Input
                  label="Security Deposit (₹) *"
                  type="number"
                  {...register("securityDeposit", {
                    valueAsNumber: true,
                    required: "Security deposit is required",
                    min: {
                      value: 0,
                      message: "Security deposit cannot be negative",
                    },
                  })}
                  error={errors.securityDeposit?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Input
                  label="Move-in Date *"
                  type="date"
                  {...register("moveInDate", {
                    required: "Move-in date is required",
                  })}
                  error={errors.moveInDate?.message}
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
              {isSubmitting ? "Adding Tenant..." : "Add Tenant"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
