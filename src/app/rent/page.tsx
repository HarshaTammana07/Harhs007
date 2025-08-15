"use client";

import React, { useState } from "react";
import { RentCollectionDashboard } from "@/components/rent/RentCollectionDashboard";
import { RentPaymentList } from "@/components/rent/RentPaymentList";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function RentManagementPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "payments">(
    "dashboard"
  );

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "payments", label: "Payment Records", icon: "💰" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rent Management</h1>
          <p className="mt-2 text-gray-600">
            Manage rent payments, track collections, and generate reports
          </p>
        </div>

        {/* Tab Navigation */}
        <Card className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </Card>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "dashboard" && <RentCollectionDashboard />}

          {activeTab === "payments" && <RentPaymentList showActions={true} />}
        </div>
      </div>
    </div>
  );
}
