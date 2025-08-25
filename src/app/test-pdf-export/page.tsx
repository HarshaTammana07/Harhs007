"use client";

import { RentManagement } from "@/components/rent/RentManagement";

export default function TestPdfExportPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">
        Test PDF Export - Rent Management
      </h1>
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
        <h2 className="text-lg font-semibold text-yellow-800 mb-2">
          PDF Export Features:
        </h2>
        <ul className="text-yellow-700 space-y-1">
          <li>• Export all currently displayed rent payments to PDF</li>
          <li>• Includes filter summary and statistics</li>
          <li>• Professional table format with all payment details</li>
          <li>• Automatic filename with timestamp</li>
          <li>• Button is disabled when no payments are available</li>
        </ul>
      </div>
      <RentManagement />
    </div>
  );
}
