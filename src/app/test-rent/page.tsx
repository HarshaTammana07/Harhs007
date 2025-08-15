"use client";

import React, { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { rentPaymentService } from "@/services/RentPaymentService";
import { propertyService } from "@/services/PropertyService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toast } from "react-hot-toast";

export default function TestRentPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const allPayments = rentPaymentService.getRentPayments();
      setPayments(allPayments);

      const analyticsData = rentPaymentService.getRentAnalytics();
      setAnalytics(analyticsData);
    } catch (error) {
      console.error("Error loading rent data:", error);
      toast.error("Failed to load rent data");
    }
  };

  const createSampleData = () => {
    try {
      // Get some tenants and properties
      const tenants = propertyService.getTenants();
      const buildings = propertyService.getBuildings();
      const flats = propertyService.getFlats();

      if (tenants.length === 0) {
        toast.error("No tenants found. Please create some tenants first.");
        return;
      }

      // Create sample rent payments
      const samplePayments = [];
      const now = new Date();

      tenants.slice(0, 3).forEach((tenant, index) => {
        const dueDate = new Date(now.getFullYear(), now.getMonth(), 5 + index);

        const payment = {
          tenantId: tenant.id,
          propertyId: buildings[0]?.id || flats[0]?.id || "sample-property",
          propertyType:
            buildings.length > 0 ? ("building" as const) : ("flat" as const),
          unitId: buildings[0]?.apartments?.[0]?.id,
          amount: 15000 + index * 2000,
          dueDate,
          status: index === 0 ? ("paid" as const) : ("pending" as const),
          paymentMethod: "bank_transfer" as const,
          paidDate: index === 0 ? dueDate : undefined,
        };

        const createdPayment = rentPaymentService.recordRentPayment(payment);
        samplePayments.push(createdPayment);
      });

      toast.success(`Created ${samplePayments.length} sample rent payments`);
      loadData();
    } catch (error) {
      console.error("Error creating sample data:", error);
      toast.error("Failed to create sample data");
    }
  };

  const clearData = () => {
    try {
      rentPaymentService.clearAllRentPaymentData();
      toast.success("Cleared all rent payment data");
      loadData();
    } catch (error) {
      console.error("Error clearing data:", error);
      toast.error("Failed to clear data");
    }
  };

  return (
    <ProtectedRoute>
      <AppLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Rent System Test
            </h1>
            <p className="text-gray-600 mt-1">
              Test the rent payment functionality
            </p>
          </div>
          {/* Actions */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Actions</h2>
            <div className="flex space-x-4">
              <Button onClick={createSampleData}>Create Sample Data</Button>
              <Button variant="outline" onClick={loadData}>
                Refresh Data
              </Button>
              <Button variant="outline" onClick={clearData}>
                Clear All Data
              </Button>
            </div>
          </Card>

          {/* Analytics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Analytics</h2>
            {analytics ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Total Properties</div>
                  <div className="text-2xl font-bold">
                    {analytics.totalProperties}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Tenants</div>
                  <div className="text-2xl font-bold">
                    {analytics.totalTenants}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Expected Rent</div>
                  <div className="text-2xl font-bold">
                    ₹{analytics.totalExpectedRent}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Collection Rate</div>
                  <div className="text-2xl font-bold">
                    {analytics.collectionRate}%
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No analytics data available</p>
            )}
          </Card>

          {/* Payments */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              Rent Payments ({payments.length})
            </h2>
            {payments.length === 0 ? (
              <p className="text-gray-500">No rent payments found</p>
            ) : (
              <div className="space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          Payment ID: {payment.id.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Tenant: {payment.tenantId.slice(-8)}
                        </div>
                        <div className="text-sm text-gray-600">
                          Property: {payment.propertyId.slice(-8)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">₹{payment.amount}</div>
                        <div
                          className={`text-sm px-2 py-1 rounded ${
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "overdue"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.status}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Due: {new Date(payment.dueDate).toLocaleDateString()}
                      {payment.paidDate && (
                        <span>
                          {" "}
                          | Paid:{" "}
                          {new Date(payment.paidDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
