"use client";

import React from "react";
import { PropertyTypeOverview } from "@/components/properties/PropertyTypeOverview";

export default function PropertiesDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Property Management Demo
          </h1>
          <p className="text-lg text-gray-600">
            Testing the API-driven property management system with dynamic integration
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              🏢 Now API-Driven & Dynamic!
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ All properties stored in Supabase database</li>
              <li>✅ Buildings with dynamic apartment management</li>
              <li>✅ Standalone flats with full specifications</li>
              <li>✅ Land parcels with lease management</li>
              <li>✅ Tenant assignments and tracking</li>
              <li>✅ Real-time occupancy statistics</li>
              <li>✅ Cross-property search and filtering</li>
            </ul>
          </div>
        </div>
        
        <PropertyTypeOverview />
      </div>
    </div>
  );
}