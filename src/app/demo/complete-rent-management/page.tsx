"use client";

import { useState } from "react";
import { RentManagement } from "@/components/rent/RentManagement";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { propertyService } from "@/services/PropertyService";
import { ApiService } from "@/services/ApiService";
import { RentPayment } from "@/types";
import toast from "react-hot-toast";

export default function CompleteRentManagementPage() {
  const [loading, setLoading] = useState(false);

  const createSampleRentPayments = async () => {
    try {
      setLoading(true);
      
      // Get existing tenants
      const tenants = await propertyService.getTenants();
      if (tenants.length === 0) {
        toast.error("Please create some tenants first using the tenant management system");
        return;
      }

      // Create sample rent payments for existing tenants
      const samplePayments = [
        {
          tenantId: tenants[0]?.id,
          propertyType: tenants[0]?.propertyType || "flat",
          propertyId: tenants[0]?.propertyId || "",
          unitId: tenants[0]?.propertyType === "apartment" ? tenants[0]?.propertyId : undefined,
          amount: tenants[0]?.rentalAgreement?.rentAmount || 25000,
          dueDate: new Date(2024, 0, 5), // January 5, 2024
          paidDate: new Date(2024, 0, 3), // January 3, 2024
          status: "paid" as const,
          paymentMethod: "account_transfer" as const,
          transactionId: "TXN123456789",
          receiptNumber: "RCP-2024-001",
          notes: "January rent payment - paid on time",
          lateFee: 0,
          discount: 0,
          actualAmountPaid: tenants[0]?.rentalAgreement?.rentAmount || 25000,
        },
        {
          tenantId: tenants[1]?.id || tenants[0]?.id,
          propertyType: tenants[1]?.propertyType || tenants[0]?.propertyType || "flat",
          propertyId: tenants[1]?.propertyId || tenants[0]?.propertyId || "",
          unitId: (tenants[1]?.propertyType || tenants[0]?.propertyType) === "apartment" 
            ? (tenants[1]?.propertyId || tenants[0]?.propertyId) : undefined,
          amount: tenants[1]?.rentalAgreement?.rentAmount || tenants[0]?.rentalAgreement?.rentAmount || 30000,
          dueDate: new Date(2024, 1, 5), // February 5, 2024
          paidDate: new Date(2024, 1, 8), // February 8, 2024 (3 days late)
          status: "paid" as const,
          paymentMethod: "cash" as const,
          receiptNumber: "RCP-2024-002",
          notes: "February rent payment - paid with late fee",
          lateFee: 500,
          discount: 0,
          actualAmountPaid: (tenants[1]?.rentalAgreement?.rentAmount || tenants[0]?.rentalAgreement?.rentAmount || 30000) + 500,
        },
        {
          tenantId: tenants[2]?.id || tenants[0]?.id,
          propertyType: tenants[2]?.propertyType || tenants[0]?.propertyType || "flat",
          propertyId: tenants[2]?.propertyId || tenants[0]?.propertyId || "",
          unitId: (tenants[2]?.propertyType || tenants[0]?.propertyType) === "apartment" 
            ? (tenants[2]?.propertyId || tenants[0]?.propertyId) : undefined,
          amount: tenants[2]?.rentalAgreement?.rentAmount || tenants[0]?.rentalAgreement?.rentAmount || 35000,
          dueDate: new Date(2024, 2, 5), // March 5, 2024
          status: "pending" as const,
          paymentMethod: "bank_transfer" as const,
          receiptNumber: "RCP-2024-003",
          notes: "March rent payment - pending",
          lateFee: 0,
          discount: 1000, // Early payment discount
          actualAmountPaid: (tenants[2]?.rentalAgreement?.rentAmount || tenants[0]?.rentalAgreement?.rentAmount || 35000) - 1000,
        },
        {
          tenantId: tenants[0]?.id,
          propertyType: tenants[0]?.propertyType || "flat",
          propertyId: tenants[0]?.propertyId || "",
          unitId: tenants[0]?.propertyType === "apartment" ? tenants[0]?.propertyId : undefined,
          amount: tenants[0]?.rentalAgreement?.rentAmount || 25000,
          dueDate: new Date(2024, 2, 5), // March 5, 2024
          status: "overdue" as const,
          paymentMethod: "cash" as const,
          receiptNumber: "RCP-2024-004",
          notes: "March rent payment - overdue",
          lateFee: 1000,
          discount: 0,
          actualAmountPaid: 0, // Not paid yet
        },
      ];

      // Create payments
      for (const paymentData of samplePayments) {
        if (paymentData.tenantId && paymentData.propertyId) {
          try {
            await ApiService.createRentPayment(paymentData);
          } catch (error) {
            console.error("Error creating payment:", error);
          }
        }
      }

      toast.success("Sample rent payments created successfully!");
    } catch (error) {
      console.error("Error creating sample payments:", error);
      toast.error("Failed to create sample payments");
    } finally {
      setLoading(false);
    }
  };

  const clearAllPayments = async () => {
    try {
      if (!confirm("Are you sure you want to delete all rent payment records? This cannot be undone.")) {
        return;
      }

      setLoading(true);
      const payments = await ApiService.getRentPayments();
      
      for (const payment of payments) {
        await ApiService.deleteRentPayment(payment.id);
      }

      toast.success("All rent payment records cleared!");
    } catch (error) {
      console.error("Error clearing payments:", error);
      toast.error("Failed to clear payment records");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900">
              Complete Rent Management System
            </h1>
            <p className="text-xl text-gray-600 mt-4">
              The heart of your property management application
            </p>
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">🎯 Key Features:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-800">
                <div>
                  <h4 className="font-medium mb-2">Smart Property Selection:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Choose property type (Building/Flat)</li>
                    <li>✅ Select specific building</li>
                    <li>✅ Choose tenant from property</li>
                    <li>✅ Auto-fill rent amount</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Complete Payment Management:</h4>
                  <ul className="space-y-1 text-sm">
                    <li>✅ Multiple payment methods</li>
                    <li>✅ Late fees and discounts</li>
                    <li>✅ Transaction tracking</li>
                    <li>✅ Receipt generation</li>
                  </ul>
                </div>
              </div>
              <div className="mt-4 text-sm text-green-700">
                <strong>Enhanced Display:</strong> View tenant names, property details, payment status, and complete payment history!
              </div>
            </div>
          </div>

          {/* Test Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Test Data Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={createSampleRentPayments}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Sample Rent Payments"}
                </Button>
                <Button 
                  onClick={clearAllPayments}
                  disabled={loading}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  {loading ? "Clearing..." : "Clear All Payments"}
                </Button>
              </div>
              <div className="mt-3 text-sm text-gray-600">
                <p><strong>Create Sample Payments:</strong> Creates various payment records with different statuses (paid, pending, overdue)</p>
                <p><strong>Clear All Payments:</strong> Removes all rent payment records (use for testing)</p>
                <p className="mt-2 text-blue-600"><strong>Note:</strong> Make sure you have tenants created first using the tenant management system!</p>
              </div>
            </CardContent>
          </Card>

          {/* Workflow Guide */}
          <Card>
            <CardHeader>
              <CardTitle>💡 How to Use the Rent Management System</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Recording a Payment:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                    <li>Click "Record Payment" button</li>
                    <li>Select property type (Building or Flat)</li>
                    <li>Choose specific building/flat</li>
                    <li>Select tenant (shows door number and details)</li>
                    <li>Rent amount auto-fills from tenant agreement</li>
                    <li>Set payment date and method</li>
                    <li>Add late fees or discounts if needed</li>
                    <li>Submit to record the payment</li>
                  </ol>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Managing Payments:</h4>
                  <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                    <li>View all payments with tenant and property details</li>
                    <li>Filter by payment status (paid, pending, overdue)</li>
                    <li>Search by tenant name, property, or receipt number</li>
                    <li>Edit payment details using the edit button</li>
                    <li>Delete payment records if needed</li>
                    <li>View statistics and total collections</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Rent Management System */}
          <RentManagement />
        </div>
      </div>
    </div>
  );
}