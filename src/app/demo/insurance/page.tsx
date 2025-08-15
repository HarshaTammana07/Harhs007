"use client";

import React from "react";
import { InsuranceManagement } from "@/components/insurance";

export default function InsuranceDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Insurance Management Demo
          </h1>
          <p className="text-lg text-gray-600">
            Testing the API-driven insurance management system with dynamic family member integration
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Now API-Driven & Dynamic!
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Insurance policies stored in Supabase database</li>
              <li>✅ Family member dropdown populated from API</li>
              <li>✅ Real-time policy statistics</li>
              <li>✅ Dynamic expiry tracking</li>
              <li>✅ Comprehensive CRUD operations</li>
              <li>✅ Premium payment history</li>
            </ul>
          </div>
        </div>
        
        <InsuranceManagement />
      </div>
    </div>
  );
}