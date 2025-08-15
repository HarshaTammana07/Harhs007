"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { RentPayment, RentReceipt, Tenant } from "@/types";
import { rentPaymentService } from "@/services/RentPaymentService";
import { propertyService } from "@/services/PropertyService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface RentReceiptModalProps {
  payment: RentPayment;
  onClose: () => void;
}

export const RentReceiptModal: React.FC<RentReceiptModalProps> = ({
  payment,
  onClose,
}) => {
  const [receipt, setReceipt] = useState<RentReceipt | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [propertyInfo, setPropertyInfo] = useState<{
    name: string;
    address: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReceiptData();
  }, [payment]);

  const loadReceiptData = async () => {
    try {
      setLoading(true);

      // Get or generate receipt
      let receiptData = rentPaymentService.getRentReceiptByPaymentId(
        payment.id
      );
      if (!receiptData && payment.status === "paid") {
        receiptData = rentPaymentService.generateRentReceipt(payment.id);
      }
      setReceipt(receiptData);

      // Get tenant info
      const tenantData = propertyService.getTenantById(payment.tenantId);
      setTenant(tenantData);

      // Get property info
      const propInfo = getPropertyInfo(
        payment.propertyId,
        payment.propertyType,
        payment.unitId
      );
      setPropertyInfo(propInfo);
    } catch (error) {
      console.error("Error loading receipt data:", error);
      toast.error("Failed to load receipt data");
    } finally {
      setLoading(false);
    }
  };

  const getPropertyInfo = (
    propertyId: string,
    propertyType: "building" | "flat" | "land",
    unitId?: string
  ): { name: string; address: string } => {
    if (propertyType === "building") {
      const building = propertyService.getBuildingById(propertyId);
      if (building && unitId) {
        const apartment = building.apartments?.find((apt) => apt.id === unitId);
        return {
          name: `${building.name} - Apt ${apartment?.doorNumber || ""}`,
          address: `${building.address}, Apartment ${apartment?.doorNumber || ""}`,
        };
      }
      return { name: building?.name || "", address: building?.address || "" };
    } else if (propertyType === "flat") {
      const flat = propertyService.getFlatById(propertyId);
      return { name: flat?.name || "", address: flat?.address || "" };
    } else if (propertyType === "land") {
      const land = propertyService.getLandById(propertyId);
      return { name: land?.name || "", address: land?.address || "" };
    }
    return { name: "", address: "" };
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleDownloadReceipt = () => {
    // Create a printable version of the receipt
    const printContent = document.getElementById("receipt-content");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rent Receipt - ${receipt?.receiptNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .receipt-container { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .company-name { font-size: 24px; font-weight: bold; color: #1f2937; }
            .receipt-title { font-size: 18px; margin-top: 10px; }
            .receipt-details { margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 8px 0; }
            .detail-label { font-weight: bold; }
            .amount-section { border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 20px; }
            .total-amount { font-size: 18px; font-weight: bold; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateShort = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!receipt || !tenant || !propertyInfo) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">
          {payment.status !== "paid"
            ? "Receipt can only be generated for paid payments."
            : "Unable to load receipt data."}
        </p>
        <Button className="mt-4" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Receipt Content */}
      <div id="receipt-content" className="receipt-container max-w-2xl mx-auto">
        {/* Header */}
        <div className="header text-center mb-8">
          <h1 className="company-name text-2xl font-bold text-gray-900 mb-2">
            Satyanarayana Fancy Stores
          </h1>
          <p className="text-gray-600">Family Business Management</p>
          <h2 className="receipt-title text-lg font-semibold mt-4 text-blue-600">
            RENT RECEIPT
          </h2>
        </div>

        {/* Receipt Details */}
        <div className="receipt-details bg-gray-50 p-6 rounded-lg">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Receipt Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="detail-row flex justify-between">
                  <span className="detail-label font-medium">Receipt No:</span>
                  <span>{receipt.receiptNumber}</span>
                </div>
                <div className="detail-row flex justify-between">
                  <span className="detail-label font-medium">Date:</span>
                  <span>{formatDateShort(receipt.generatedDate)}</span>
                </div>
                <div className="detail-row flex justify-between">
                  <span className="detail-label font-medium">
                    Payment Date:
                  </span>
                  <span>{formatDateShort(receipt.paidDate)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Rent Period</h3>
              <div className="space-y-2 text-sm">
                <div className="detail-row flex justify-between">
                  <span className="detail-label font-medium">From:</span>
                  <span>{formatDateShort(receipt.rentPeriod.startDate)}</span>
                </div>
                <div className="detail-row flex justify-between">
                  <span className="detail-label font-medium">To:</span>
                  <span>{formatDateShort(receipt.rentPeriod.endDate)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Tenant Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="detail-label font-medium">Name:</span>
                  <div>{receipt.tenantName}</div>
                </div>
                <div>
                  <span className="detail-label font-medium">Contact:</span>
                  <div>{tenant.contactInfo.phone}</div>
                </div>
                {tenant.contactInfo.email && (
                  <div>
                    <span className="detail-label font-medium">Email:</span>
                    <div>{tenant.contactInfo.email}</div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Property Details
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="detail-label font-medium">Property:</span>
                  <div>{propertyInfo.name}</div>
                </div>
                <div>
                  <span className="detail-label font-medium">Address:</span>
                  <div>{receipt.propertyAddress}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Amount Details */}
        <div className="amount-section border-t-2 border-gray-200 pt-6 mt-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Details</h3>
          <div className="space-y-3">
            <div className="detail-row flex justify-between">
              <span className="detail-label font-medium">Rent Amount:</span>
              <span>{formatCurrency(receipt.amount)}</span>
            </div>

            {receipt.lateFee && receipt.lateFee > 0 && (
              <div className="detail-row flex justify-between text-red-600">
                <span className="detail-label font-medium">Late Fee:</span>
                <span>+{formatCurrency(receipt.lateFee)}</span>
              </div>
            )}

            {receipt.discount && receipt.discount > 0 && (
              <div className="detail-row flex justify-between text-green-600">
                <span className="detail-label font-medium">Discount:</span>
                <span>-{formatCurrency(receipt.discount)}</span>
              </div>
            )}

            <div className="detail-row flex justify-between border-t pt-3 total-amount text-lg font-bold">
              <span>Total Amount Paid:</span>
              <span>{formatCurrency(receipt.totalAmount)}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="detail-row flex justify-between">
              <span className="detail-label font-medium">Payment Method:</span>
              <span className="capitalize">
                {receipt.paymentMethod.replace("_", " ")}
              </span>
            </div>

            {receipt.transactionId && (
              <div className="detail-row flex justify-between">
                <span className="detail-label font-medium">
                  Transaction ID:
                </span>
                <span>{receipt.transactionId}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="footer mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>This is a computer-generated receipt.</p>
          <p className="mt-1">
            Generated on {formatDate(receipt.generatedDate)}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t no-print">
        <Button variant="outline" onClick={handlePrintReceipt}>
          Print Receipt
        </Button>
        <Button variant="outline" onClick={handleDownloadReceipt}>
          Download PDF
        </Button>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};
