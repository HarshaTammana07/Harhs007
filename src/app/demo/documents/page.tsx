"use client";

import React from "react";
import { DocumentManagement } from "@/components/documents";

export default function DocumentsDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Document Management Demo
          </h1>
          <p className="text-lg text-gray-600">
            Testing the API-driven document management system with dynamic integration
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              🚀 Now Fully API-Driven & Integrated!
            </h2>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Documents stored in Supabase database</li>
              <li>✅ Dynamic family member integration</li>
              <li>✅ Dynamic insurance policy integration</li>
              <li>✅ Real-time expiry tracking</li>
              <li>✅ Advanced search and filtering</li>
              <li>✅ File upload with metadata</li>
              <li>✅ Document statistics and analytics</li>
            </ul>
          </div>
        </div>
        
        <DocumentManagement />
      </div>
    </div>
  );
}