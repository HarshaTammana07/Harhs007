"use client";

import React from "react";
import { FamilyManagement } from "@/components/family";

export default function FamilyDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Family Management Demo
          </h1>
          <p className="text-lg text-gray-600">
            Testing the API-driven family management system with Supabase
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Now API-Driven!
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Data stored in Supabase PostgreSQL database</li>
              <li>✅ Real-time updates across devices</li>
              <li>✅ Proper error handling and loading states</li>
              <li>✅ Toast notifications for user feedback</li>
              <li>✅ Scalable and production-ready</li>
            </ul>
          </div>
        </div>
        
        <FamilyManagement />
      </div>
    </div>
  );
}