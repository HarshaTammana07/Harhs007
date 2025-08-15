"use client";

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Tenant,
  TenantPersonalInfo,
  ContactInfo,
  EmergencyContact,
  TenantIdentification,
  RentalAgreement,
  TenantReference,
  Document,
} from "@/types";
import {
  Button,
  Input,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Modal,
} from "@/components/ui";
import { SimpleFileUpload } from "@/components/ui/SimpleFileUpload";
import {
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  IdentificationIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  CalendarIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface TenantFormData {
  personalInfo: TenantPersonalInfo;
  contactInfo: ContactInfo;
  emergencyContact: EmergencyContact;
  identification: TenantIdentification;
  rentalAgreement: RentalAgreement;
  references: TenantReference[];
  moveInDate: string;
  moveOutDate?: string;
  isActive: boolean;
}

interface TenantFormProps {
  tenant?: Tenant;
  onSubmit: (
    tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt">
  ) => void;
  onCancel: () => void;
  isOpen: boolean;
  title?: string;
}

export function TenantForm({
  tenant,
  onSubmit,
  onCancel,
  isOpen,
  title = "Add Tenant",
}: TenantFormProps) {
  const [documents, setDocuments] = useState<Document[]>(
    tenant?.documents || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TenantFormData>({
    defaultValues: {
      personalInfo: {
        firstName: tenant?.personalInfo.firstName || "",
        lastName: tenant?.personalInfo.lastName || "",
        fullName: tenant?.personalInfo.fullName || "",
        dateOfBirth: tenant?.personalInfo.dateOfBirth
          ? new Date(tenant.personalInfo.dateOfBirth)
              .toISOString()
              .split("T")[0]
          : undefined,
        occupation: tenant?.personalInfo.occupation || "",
        employer: tenant?.personalInfo.employer || "",
        monthlyIncome: tenant?.personalInfo.monthlyIncome || 0,
        maritalStatus: tenant?.personalInfo.maritalStatus || "single",
        familySize: tenant?.personalInfo.familySize || 1,
        nationality: tenant?.personalInfo.nationality || "Indian",
        religion: tenant?.personalInfo.religion || "",
      },
      contactInfo: {
        phone: tenant?.contactInfo.phone || "",
        email: tenant?.contactInfo.email || "",
        address: tenant?.contactInfo.address || "",
      },
      emergencyContact: {
        name: tenant?.emergencyContact.name || "",
        relationship: tenant?.emergencyContact.relationship || "",
        phone: tenant?.emergencyContact.phone || "",
        email: tenant?.emergencyContact.email || "",
        address: tenant?.emergencyContact.address || "",
      },
      identification: {
        aadharNumber: tenant?.identification.aadharNumber || "",
        panNumber: tenant?.identification.panNumber || "",
        drivingLicense: tenant?.identification.drivingLicense || "",
        passport: tenant?.identification.passport || "",
        voterIdNumber: tenant?.identification.voterIdNumber || "",
      },
      rentalAgreement: {
        agreementNumber: tenant?.rentalAgreement.agreementNumber || "",
        startDate: tenant?.rentalAgreement.startDate
          ? new Date(tenant.rentalAgreement.startDate)
              .toISOString()
              .split("T")[0]
          : "",
        endDate: tenant?.rentalAgreement.endDate
          ? new Date(tenant.rentalAgreement.endDate).toISOString().split("T")[0]
          : "",
        rentAmount: tenant?.rentalAgreement.rentAmount || 0,
        securityDeposit: tenant?.rentalAgreement.securityDeposit || 0,
        maintenanceCharges: tenant?.rentalAgreement.maintenanceCharges || 0,
        rentDueDate: tenant?.rentalAgreement.rentDueDate || 1,
        paymentMethod: tenant?.rentalAgreement.paymentMethod || "bank_transfer",
        lateFeeAmount: tenant?.rentalAgreement.lateFeeAmount || 0,
        noticePeriod: tenant?.rentalAgreement.noticePeriod || 30,
        renewalTerms: tenant?.rentalAgreement.renewalTerms || "",
        specialConditions: tenant?.rentalAgreement.specialConditions || [],
      },
      references: tenant?.references || [],
      moveInDate: tenant?.moveInDate
        ? new Date(tenant.moveInDate).toISOString().split("T")[0]
        : "",
      moveOutDate: tenant?.moveOutDate
        ? new Date(tenant.moveOutDate).toISOString().split("T")[0]
        : "",
      isActive: tenant?.isActive ?? true,
    },
  });

  const {
    fields: referenceFields,
    append: appendReference,
    remove: removeReference,
  } = useFieldArray({
    control,
    name: "references",
  });

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: "rentalAgreement.specialConditions",
  });

  // Auto-generate full name from first and last name
  const firstName = watch("personalInfo.firstName");
  const lastName = watch("personalInfo.lastName");

  useEffect(() => {
    if (firstName || lastName) {
      const fullName = `${firstName} ${lastName}`.trim();
      if (fullName) {
        // Update the form value
        reset((prev) => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            fullName,
          },
        }));
      }
    }
  }, [firstName, lastName, reset]);

  const handleDocumentUpload = (newDocuments: Document[]) => {
    setDocuments((prev) => [...prev, ...newDocuments]);
  };

  const handleDocumentRemove = (documentId: string) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
  };

  const onFormSubmit = async (data: TenantFormData) => {
    try {
      setIsSubmitting(true);

      // Convert string dates to Date objects
      const tenantData: Omit<Tenant, "id" | "createdAt" | "updatedAt"> = {
        personalInfo: {
          ...data.personalInfo,
          dateOfBirth: data.personalInfo.dateOfBirth
            ? new Date(data.personalInfo.dateOfBirth)
            : undefined,
        },
        contactInfo: data.contactInfo,
        emergencyContact: data.emergencyContact,
        identification: data.identification,
        rentalAgreement: {
          ...data.rentalAgreement,
          startDate: new Date(data.rentalAgreement.startDate),
          endDate: new Date(data.rentalAgreement.endDate),
        },
        references: data.references,
        documents,
        moveInDate: new Date(data.moveInDate),
        moveOutDate: data.moveOutDate ? new Date(data.moveOutDate) : undefined,
        isActive: data.isActive,
      };

      await onSubmit(tenantData);
      toast.success(
        tenant ? "Tenant updated successfully" : "Tenant added successfully"
      );
    } catch (error) {
      console.error("Error submitting tenant form:", error);
      toast.error("Failed to save tenant information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addReference = () => {
    appendReference({
      name: "",
      relationship: "",
      phone: "",
      email: "",
      address: "",
      verified: false,
    });
  };

  const addCondition = () => {
    appendCondition("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onCancel} size="4xl">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  {...register("personalInfo.firstName", {
                    required: "First name is required",
                  })}
                  error={errors.personalInfo?.firstName?.message}
                />
                <Input
                  label="Last Name"
                  {...register("personalInfo.lastName", {
                    required: "Last name is required",
                  })}
                  error={errors.personalInfo?.lastName?.message}
                />
              </div>

              <Input
                label="Full Name"
                {...register("personalInfo.fullName", {
                  required: "Full name is required",
                })}
                error={errors.personalInfo?.fullName?.message}
                readOnly
                className="bg-gray-50"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date of Birth"
                  type="date"
                  {...register("personalInfo.dateOfBirth")}
                />
                <Input
                  label="Occupation"
                  {...register("personalInfo.occupation", {
                    required: "Occupation is required",
                  })}
                  error={errors.personalInfo?.occupation?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Employer"
                  {...register("personalInfo.employer")}
                />
                <Input
                  label="Monthly Income (₹)"
                  type="number"
                  {...register("personalInfo.monthlyIncome", {
                    valueAsNumber: true,
                  })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    {...register("personalInfo.maritalStatus")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                </div>
                <Input
                  label="Family Size"
                  type="number"
                  min="1"
                  {...register("personalInfo.familySize", {
                    valueAsNumber: true,
                    required: "Family size is required",
                  })}
                  error={errors.personalInfo?.familySize?.message}
                />
                <Input
                  label="Nationality"
                  {...register("personalInfo.nationality", {
                    required: "Nationality is required",
                  })}
                  error={errors.personalInfo?.nationality?.message}
                />
              </div>

              <Input
                label="Religion (Optional)"
                {...register("personalInfo.religion")}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  {...register("contactInfo.phone", {
                    required: "Phone number is required",
                  })}
                  error={errors.contactInfo?.phone?.message}
                />
                <Input
                  label="Email Address"
                  type="email"
                  {...register("contactInfo.email")}
                />
              </div>
              <Input
                label="Address"
                {...register("contactInfo.address")}
                multiline
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  {...register("emergencyContact.name", {
                    required: "Emergency contact name is required",
                  })}
                  error={errors.emergencyContact?.name?.message}
                />
                <Input
                  label="Relationship"
                  {...register("emergencyContact.relationship", {
                    required: "Relationship is required",
                  })}
                  error={errors.emergencyContact?.relationship?.message}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Phone Number"
                  {...register("emergencyContact.phone", {
                    required: "Emergency contact phone is required",
                  })}
                  error={errors.emergencyContact?.phone?.message}
                />
                <Input
                  label="Email Address"
                  type="email"
                  {...register("emergencyContact.email")}
                />
              </div>
              <Input
                label="Address"
                {...register("emergencyContact.address")}
                multiline
                rows={2}
              />
            </CardContent>
          </Card>

          {/* Identification */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <IdentificationIcon className="h-5 w-5 mr-2" />
                Identification Documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Aadhar Number"
                  {...register("identification.aadharNumber")}
                />
                <Input
                  label="PAN Number"
                  {...register("identification.panNumber")}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Driving License"
                  {...register("identification.drivingLicense")}
                />
                <Input
                  label="Passport Number"
                  {...register("identification.passport")}
                />
              </div>
              <Input
                label="Voter ID Number"
                {...register("identification.voterIdNumber")}
              />
            </CardContent>
          </Card>

          {/* Rental Agreement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Rental Agreement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Agreement Number"
                {...register("rentalAgreement.agreementNumber", {
                  required: "Agreement number is required",
                })}
                error={errors.rentalAgreement?.agreementNumber?.message}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date"
                  type="date"
                  {...register("rentalAgreement.startDate", {
                    required: "Start date is required",
                  })}
                  error={errors.rentalAgreement?.startDate?.message}
                />
                <Input
                  label="End Date"
                  type="date"
                  {...register("rentalAgreement.endDate", {
                    required: "End date is required",
                  })}
                  error={errors.rentalAgreement?.endDate?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Monthly Rent (₹)"
                  type="number"
                  {...register("rentalAgreement.rentAmount", {
                    valueAsNumber: true,
                    required: "Rent amount is required",
                  })}
                  error={errors.rentalAgreement?.rentAmount?.message}
                />
                <Input
                  label="Security Deposit (₹)"
                  type="number"
                  {...register("rentalAgreement.securityDeposit", {
                    valueAsNumber: true,
                    required: "Security deposit is required",
                  })}
                  error={errors.rentalAgreement?.securityDeposit?.message}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Maintenance Charges (₹)"
                  type="number"
                  {...register("rentalAgreement.maintenanceCharges", {
                    valueAsNumber: true,
                  })}
                />
                <Input
                  label="Rent Due Date (Day of Month)"
                  type="number"
                  min="1"
                  max="31"
                  {...register("rentalAgreement.rentDueDate", {
                    valueAsNumber: true,
                    required: "Rent due date is required",
                  })}
                  error={errors.rentalAgreement?.rentDueDate?.message}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    {...register("rentalAgreement.paymentMethod")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cheque">Cheque</option>
                    <option value="upi">UPI</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Late Fee Amount (₹)"
                  type="number"
                  {...register("rentalAgreement.lateFeeAmount", {
                    valueAsNumber: true,
                  })}
                />
                <Input
                  label="Notice Period (Days)"
                  type="number"
                  {...register("rentalAgreement.noticePeriod", {
                    valueAsNumber: true,
                    required: "Notice period is required",
                  })}
                  error={errors.rentalAgreement?.noticePeriod?.message}
                />
              </div>

              <Input
                label="Renewal Terms"
                {...register("rentalAgreement.renewalTerms")}
                multiline
                rows={2}
              />

              {/* Special Conditions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Special Conditions
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCondition}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Add Condition
                  </Button>
                </div>
                <div className="space-y-2">
                  {conditionFields.map((field, index) => (
                    <div key={field.id} className="flex items-center space-x-2">
                      <Input
                        {...register(
                          `rentalAgreement.specialConditions.${index}` as const
                        )}
                        placeholder="Enter special condition"
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeCondition(index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* References */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <UserIcon className="h-5 w-5 mr-2" />
                  References
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReference}
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Reference
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {referenceFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">
                        Reference {index + 1}
                      </h4>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeReference(index)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Name"
                        {...register(`references.${index}.name` as const, {
                          required: "Reference name is required",
                        })}
                      />
                      <Input
                        label="Relationship"
                        {...register(
                          `references.${index}.relationship` as const,
                          {
                            required: "Relationship is required",
                          }
                        )}
                      />
                      <Input
                        label="Phone"
                        {...register(`references.${index}.phone` as const, {
                          required: "Phone number is required",
                        })}
                      />
                      <Input
                        label="Email"
                        type="email"
                        {...register(`references.${index}.email` as const)}
                      />
                    </div>
                    <div className="mt-4">
                      <Input
                        label="Address"
                        {...register(`references.${index}.address` as const)}
                        multiline
                        rows={2}
                      />
                    </div>
                    <div className="mt-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register(`references.${index}.verified` as const)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Verified</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Move-in/Move-out Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2" />
                Move-in/Move-out Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Move-in Date"
                  type="date"
                  {...register("moveInDate", {
                    required: "Move-in date is required",
                  })}
                  error={errors.moveInDate?.message}
                />
                <Input
                  label="Move-out Date (Optional)"
                  type="date"
                  {...register("moveOutDate")}
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active Tenant</span>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Documents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SimpleFileUpload
                onFilesUploaded={handleDocumentUpload}
                maxFiles={10}
                acceptedTypes={[
                  "image/jpeg",
                  "image/png",
                  "application/pdf",
                  "application/msword",
                  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                ]}
              />
              {documents.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Uploaded Documents ({documents.length})
                  </h4>
                  <div className="space-y-2">
                    {documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span className="text-sm text-gray-700">
                          {doc.title}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleDocumentRemove(doc.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Saving..."
                : tenant
                  ? "Update Tenant"
                  : "Add Tenant"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
