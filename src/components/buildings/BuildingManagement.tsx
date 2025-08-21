"use client";

import React, { useState, useEffect } from "react";
import { Building, Apartment } from "@/types";
import { propertyService } from "@/services/PropertyService";

interface BuildingFormData {
  name: string;
  buildingCode: string;
  address: string;
  description: string;
  totalFloors: number;
  totalApartments: number;
  amenities: string[];
  constructionYear: number;
  images: string[];
}

const initialFormData: BuildingFormData = {
  name: "",
  buildingCode: "",
  address: "",
  description: "",
  totalFloors: 1,
  totalApartments: 1,
  amenities: [],
  constructionYear: new Date().getFullYear(),
  images: [],
};

export default function BuildingManagement() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null
  );
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [formData, setFormData] = useState<BuildingFormData>(initialFormData);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Load buildings on component mount
  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    try {
      setLoading(true);
      console.log("Loading buildings...");
      const data = await propertyService.getBuildings();
      console.log("Buildings loaded:", data);
      setBuildings(data);
    } catch (err: any) {
      console.error("Error loading buildings:", err);
      setError(`Failed to load buildings: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadApartments = async (buildingId: string) => {
    try {
      console.log("Loading apartments for building ID:", buildingId);
      const data = await propertyService.getApartmentsByBuildingId(buildingId);
      console.log("Apartments loaded:", data.length, data);
      setApartments(data);
    } catch (err: unknown) {
      console.error("Error loading apartments:", err);
      setError(`Failed to load apartments: ${err.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    console.log("Form submitted with data:", formData);

    try {
      if (isEditing && selectedBuilding) {
        console.log("Updating building:", selectedBuilding.id);
        const updated = await propertyService.updateBuilding(
          selectedBuilding.id,
          formData
        );
        console.log("Building updated:", updated);
        setBuildings(buildings.map((b) => (b.id === updated.id ? updated : b)));
        setSuccess("Building updated successfully!");
      } else {
        console.log("Creating new building...");
        const newBuilding = await propertyService.saveBuilding(formData);
        console.log("Building created:", newBuilding);
        setBuildings([newBuilding, ...buildings]);
        setSuccess("Building created successfully!");
      }

      resetForm();
    } catch (err: unknown) {
      console.error("Error in handleSubmit:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (building: Building) => {
    setSelectedBuilding(building);
    setFormData({
      name: building.name,
      buildingCode: building.buildingCode,
      address: building.address,
      description: building.description || "",
      totalFloors: building.totalFloors,
      totalApartments: building.totalApartments,
      amenities: building.amenities || [],
      constructionYear: building.constructionYear || new Date().getFullYear(),
      images: building.images || [],
    });
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this building?")) return;

    try {
      setLoading(true);
      await propertyService.deleteBuilding(id);
      setBuildings(buildings.filter((b) => b.id !== id));
      setSuccess("Building deleted successfully!");
      if (selectedBuilding?.id === id) {
        setSelectedBuilding(null);
        setApartments([]);
      }
    } catch (err: unknown) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (building: Building) => {
    console.log(
      "Redirecting to apartment management for building:",
      building.name
    );
    // Redirect to the proper apartment management page
    window.location.href = `/properties/buildings/${building.id}/apartments`;
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setSelectedBuilding(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "totalFloors" ||
        name === "totalApartments" ||
        name === "constructionYear"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amenities = e.target.value
      .split(",")
      .map((a) => a.trim())
      .filter((a) => a);
    setFormData((prev) => ({ ...prev, amenities }));
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Building Management
        </h1>
        <p className="text-gray-600">Manage your buildings and apartments</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Building Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {isEditing ? "Edit Building" : "Add New Building"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Building Code *
              </label>
              <input
                type="text"
                name="buildingCode"
                value={formData.buildingCode}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Floors *
                </label>
                <input
                  type="number"
                  name="totalFloors"
                  value={formData.totalFloors}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Apartments *
                </label>
                <input
                  type="number"
                  name="totalApartments"
                  value={formData.totalApartments}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Construction Year
              </label>
              <input
                type="number"
                name="constructionYear"
                value={formData.constructionYear}
                onChange={handleInputChange}
                min="1900"
                max={new Date().getFullYear() + 10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amenities (comma-separated)
              </label>
              <input
                type="text"
                value={formData.amenities.join(", ")}
                onChange={handleAmenitiesChange}
                placeholder="Parking, Elevator, Security, Garden"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {loading
                  ? "Saving..."
                  : isEditing
                    ? "Update Building"
                    : "Create Building"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Buildings List */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Buildings ({buildings.length})
          </h2>

          {loading && buildings.length === 0 ? (
            <p className="text-gray-500">Loading buildings...</p>
          ) : buildings.length === 0 ? (
            <p className="text-gray-500">
              No buildings found. Create your first building!
            </p>
          ) : (
            <div className="space-y-4">
              {buildings.map((building) => (
                <div
                  key={building.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{building.name}</h3>
                      <p className="text-sm text-gray-600">
                        Code: {building.buildingCode}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(building)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleEdit(building)}
                        className="text-green-600 hover:text-green-800 text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(building.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-2">
                    {building.address}
                  </p>

                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Floors: {building.totalFloors}</span>
                    <span>Apartments: {building.totalApartments}</span>
                    <span>Built: {building.constructionYear}</span>
                  </div>

                  {building.amenities && building.amenities.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {building.amenities.map((amenity, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                          >
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Building Details Modal */}
      {selectedBuilding && !isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedBuilding.name}</h2>
                <button
                  onClick={() => {
                    setSelectedBuilding(null);
                    setApartments([]);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold mb-2">Building Information</h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Code:</strong> {selectedBuilding.buildingCode}
                    </p>
                    <p>
                      <strong>Address:</strong> {selectedBuilding.address}
                    </p>
                    <p>
                      <strong>Description:</strong>{" "}
                      {selectedBuilding.description || "N/A"}
                    </p>
                    <p>
                      <strong>Floors:</strong> {selectedBuilding.totalFloors}
                    </p>
                    <p>
                      <strong>Total Apartments:</strong>{" "}
                      {selectedBuilding.totalApartments}
                    </p>
                    <p>
                      <strong>Construction Year:</strong>{" "}
                      {selectedBuilding.constructionYear}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Amenities</h3>
                  {selectedBuilding.amenities &&
                  selectedBuilding.amenities.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedBuilding.amenities.map((amenity, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">No amenities listed</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">
                  Apartments ({apartments.length})
                </h3>
                {apartments.length === 0 ? (
                  <p className="text-gray-500">
                    No apartments found for this building.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {apartments.map((apartment) => (
                      <div
                        key={apartment.id}
                        className="border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">
                            Unit {apartment.doorNumber}
                          </h4>
                          <span
                            className={`px-2 py-1 text-xs rounded ${
                              apartment.isOccupied
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {apartment.isOccupied ? "Occupied" : "Vacant"}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Floor: {apartment.floor}</p>
                          <p>Bedrooms: {apartment.bedroomCount}</p>
                          <p>Bathrooms: {apartment.bathroomCount}</p>
                          <p>Area: {apartment.area} sq ft</p>
                          <p>Rent: ₹{apartment.rentAmount?.toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
