"use client";

import BuildingManagement from "@/components/buildings/BuildingManagement";

export default function TestBuildingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏢 Building Management Test
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete CRUD operations for buildings and apartments. Test creating, reading, updating, and deleting buildings with full apartment management.
          </p>
        </div>

        <BuildingManagement />

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-green-600 mb-2">✅ Create Building</h3>
              <p className="text-sm text-gray-600">
                Add new buildings with all details including amenities, floors, and construction year.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-blue-600 mb-2">👁️ View Building</h3>
              <p className="text-sm text-gray-600">
                View complete building details with apartment listings and occupancy status.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-yellow-600 mb-2">✏️ Edit Building</h3>
              <p className="text-sm text-gray-600">
                Update building information including name, address, amenities, and specifications.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-red-600 mb-2">🗑️ Delete Building</h3>
              <p className="text-sm text-gray-600">
                Remove buildings from the system with confirmation dialog.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-purple-600 mb-2">🏠 Apartment Management</h3>
              <p className="text-sm text-gray-600">
                View all apartments within a building with occupancy status and details.
              </p>
            </div>
            
            <div className="p-4 border border-gray-200 rounded-lg">
              <h3 className="font-semibold text-indigo-600 mb-2">📊 Real-time Updates</h3>
              <p className="text-sm text-gray-600">
                All operations update the UI immediately with success/error feedback.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">🔧 API Integration Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Building CRUD operations - Fully integrated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Apartment listing by building - Fully integrated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Real-time data updates - Working</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-green-500 rounded-full"></span>
              <span>Error handling and validation - Implemented</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}