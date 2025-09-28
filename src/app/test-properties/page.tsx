"use client";

import React, { useState, useEffect } from "react";
import { ApiService } from "@/services/ApiService";
import { Building, Flat, Land, Apartment, PropertyType } from "@/types";
import toast from "react-hot-toast";

export default function TestPropertiesPage() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [flats, setFlats] = useState<Flat[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType>("building");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [buildingsData, flatsData, landsData] = await Promise.all([
        ApiService.getBuildings(),
        ApiService.getFlats(),
        ApiService.getLands()
      ]);
      setBuildings(buildingsData);
      setFlats(flatsData);
      setLands(landsData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load properties data");
    } finally {
      setLoading(false);
    }
  };

  const createTestBuilding = async () => {
    try {
      const testBuilding = {
        name: `Test Building ${Date.now()}`,
        buildingCode: `TB-${Date.now()}`,
        address: "123 Test Street, Test City",
        description: "Test building for API testing",
        totalFloors: 5,
        totalApartments: 20,
        amenities: ["Parking", "Elevator", "Security", "Garden"],
        constructionYear: 2020,
        images: [],
      };

      await ApiService.createBuilding(testBuilding);
      toast.success("Test building created successfully");
      await loadData();
    } catch (error: any) {
      console.error("Create building failed:", error);
      toast.error(`Create failed: ${error.message}`);
    }
  };

  const createTestFlat = async () => {
    try {
      const testFlat = {
        name: `Test Flat ${Date.now()}`,
        doorNumber: `TF-${Date.now()}`,
        address: "456 Test Avenue, Test City",
        description: "Test flat for API testing",
        bedroomCount: 2,
        bathroomCount: 2,
        area: 1200,
        floor: 3,
        totalFloors: 5,
        rentAmount: 25000,
        securityDeposit: 50000,
        isOccupied: false,
        specifications: {
          furnished: true,
          parking: true,
          balcony: true,
          airConditioning: true,
          powerBackup: true,
          waterSupply: "24x7" as const,
          internetReady: true,
          societyName: "Test Society",
          maintenanceCharges: 2000,
          additionalFeatures: ["Swimming Pool", "Gym"],
        },
        images: [],
      };

      await ApiService.createFlat(testFlat);
      toast.success("Test flat created successfully");
      await loadData();
    } catch (error: any) {
      console.error("Create flat failed:", error);
      toast.error(`Create failed: ${error.message}`);
    }
  };

  const createTestLand = async () => {
    try {
      const testLand = {
        name: `Test Land ${Date.now()}`,
        address: "789 Test Road, Test City",
        description: "Test land for API testing",
        surveyNumber: `SN-${Date.now()}`,
        area: 5000,
        areaUnit: "sqft" as const,
        zoning: "residential" as const,
        soilType: "Clay",
        waterSource: "Borewell",
        roadAccess: true,
        electricityConnection: true,
        isLeased: false,
        images: [],
      };

      await ApiService.createLand(testLand);
      toast.success("Test land created successfully");
      await loadData();
    } catch (error: any) {
      console.error("Create land failed:", error);
      toast.error(`Create failed: ${error.message}`);
    }
  };

  const createTestApartment = async () => {
    if (buildings.length === 0) {
      toast.error("Please create a building first");
      return;
    }

    try {
      const building = buildings[0];
      const testApartment = {
        buildingId: building.id,
        doorNumber: `A-${Date.now()}`,
        floor: 2,
        bedroomCount: 3,
        bathroomCount: 2,
        area: 1500,
        rentAmount: 30000,
        securityDeposit: 60000,
        isOccupied: false,
        specifications: {
          furnished: false,
          parking: true,
          balcony: true,
          airConditioning: false,
          powerBackup: true,
          waterSupply: "24x7" as const,
          internetReady: true,
          additionalFeatures: ["Modular Kitchen"],
        },
      };

      await ApiService.createApartment(testApartment);
      toast.success("Test apartment created successfully");
      await loadData();
    } catch (error: any) {
      console.error("Create apartment failed:", error);
      toast.error(`Create failed: ${error.message}`);
    }
  };

  const deleteBuilding = async (building: Building) => {
    try {
      await ApiService.deleteBuilding(building.id);
      toast.success(`Deleted building ${building.name}`);
      await loadData();
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const deleteFlat = async (flat: Flat) => {
    try {
      await ApiService.deleteFlat(flat.id);
      toast.success(`Deleted flat ${flat.name}`);
      await loadData();
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const deleteLand = async (land: Land) => {
    try {
      await ApiService.deleteLand(land.id);
      toast.success(`Deleted land ${land.name}`);
      await loadData();
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const testPropertySearch = async () => {
    try {
      const searchResults = await ApiService.searchProperties("Test", selectedPropertyType);
      toast.success(`Found ${searchResults.length} properties matching "Test"`);
      console.log("Search results:", searchResults);
    } catch (error: any) {
      console.error("Search failed:", error);
      toast.error(`Search failed: ${error.message}`);
    }
  };

  const testPropertyStatistics = async () => {
    try {
      const stats = await ApiService.getPropertyStatistics();
      toast.success("Property statistics loaded");
      console.log("Property statistics:", stats);
    } catch (error: any) {
      console.error("Statistics failed:", error);
      toast.error(`Statistics failed: ${error.message}`);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatArea = (area: number, unit: string = 'sqft'): string => {
    return `${area.toLocaleString()} ${unit}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties data...</p>
        </div>
      </div>
    );
  }

  const totalProperties = buildings.length + flats.length + lands.length;
  const totalApartments = buildings.reduce((sum, building) => sum + (building.apartments?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Properties API Test</h1>
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedPropertyType}
              onChange={(e) => setSelectedPropertyType(e.target.value as PropertyType)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="building">Building</option>
              <option value="flat">Flat</option>
              <option value="land">Land</option>
            </select>
            
            <button
              onClick={createTestBuilding}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Test Building
            </button>
            
            <button
              onClick={createTestFlat}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Test Flat
            </button>
            
            <button
              onClick={createTestLand}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Create Test Land
            </button>
            
            <button
              onClick={createTestApartment}
              className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
            >
              Create Test Apartment
            </button>
            
            <button
              onClick={testPropertySearch}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Test Search
            </button>
            
            <button
              onClick={testPropertyStatistics}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Test Statistics
            </button>
            
            <button
              onClick={loadData}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{buildings.length}</div>
            <div className="text-gray-600">Buildings</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{flats.length}</div>
            <div className="text-gray-600">Flats</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{lands.length}</div>
            <div className="text-gray-600">Lands</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">{totalApartments}</div>
            <div className="text-gray-600">Apartments</div>
          </div>
        </div>

        {/* Property Type Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Property Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{buildings.length}</div>
              <div className="text-blue-800">Buildings</div>
              <div className="text-sm text-blue-600 mt-1">
                {totalApartments} total apartments
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{flats.length}</div>
              <div className="text-green-800">Standalone Flats</div>
              <div className="text-sm text-green-600 mt-1">
                {flats.filter(f => f.isOccupied).length} occupied
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{lands.length}</div>
              <div className="text-purple-800">Land Parcels</div>
              <div className="text-sm text-purple-600 mt-1">
                {lands.filter(l => l.isLeased).length} leased
              </div>
            </div>
          </div>
        </div>

        {/* Buildings List */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Buildings ({buildings.length})</h2>
          </div>
          
          {buildings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No buildings found. Create a test building to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {buildings.map((building) => (
                <div key={building.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {building.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Code: {building.buildingCode} • {building.address}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {building.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Floors:</span>
                          <div className="font-medium">{building.totalFloors}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Apartments:</span>
                          <div className="font-medium">{building.totalApartments}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Built:</span>
                          <div className="font-medium">{building.constructionYear || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Amenities:</span>
                          <div className="font-medium">{building.amenities.length}</div>
                        </div>
                      </div>

                      {building.amenities.length > 0 && (
                        <div className="mt-3">
                          <span className="text-gray-500 text-sm">Amenities: </span>
                          {building.amenities.slice(0, 3).map((amenity, index) => (
                            <span key={index} className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded mr-1">
                              {amenity}
                            </span>
                          ))}
                          {building.amenities.length > 3 && (
                            <span className="text-xs text-gray-500">+{building.amenities.length - 3} more</span>
                          )}
                        </div>
                      )}

                      {building.apartments && building.apartments.length > 0 && (
                        <div className="mt-3">
                          <span className="text-sm text-gray-600">
                            Apartments: {building.apartments.length} units
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log("Building details:", building);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Debug
                      </button>
                      <button
                        onClick={() => deleteBuilding(building)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Flats List */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Flats ({flats.length})</h2>
          </div>
          
          {flats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No flats found. Create a test flat to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {flats.map((flat) => (
                <div key={flat.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l4-4 4 4" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {flat.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Door: {flat.doorNumber} • Floor {flat.floor}/{flat.totalFloors}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {flat.address}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Bedrooms:</span>
                          <div className="font-medium">{flat.bedroomCount}BHK</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Area:</span>
                          <div className="font-medium">{formatArea(flat.area)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Rent:</span>
                          <div className="font-medium">{formatCurrency(flat.rentAmount)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div className={`font-medium ${flat.isOccupied ? 'text-red-600' : 'text-green-600'}`}>
                            {flat.isOccupied ? 'Occupied' : 'Vacant'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {flat.specifications.furnished && (
                          <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Furnished</span>
                        )}
                        {flat.specifications.parking && (
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Parking</span>
                        )}
                        {flat.specifications.balcony && (
                          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">Balcony</span>
                        )}
                        {flat.specifications.airConditioning && (
                          <span className="inline-block bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded">AC</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log("Flat details:", flat);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Debug
                      </button>
                      <button
                        onClick={() => deleteFlat(flat)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Lands List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Lands ({lands.length})</h2>
          </div>
          
          {lands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No lands found. Create a test land to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {lands.map((land) => (
                <div key={land.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {land.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Survey: {land.surveyNumber} • {land.zoning}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {land.address}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Area:</span>
                          <div className="font-medium">{formatArea(land.area, land.areaUnit)}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Soil:</span>
                          <div className="font-medium">{land.soilType || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Water:</span>
                          <div className="font-medium">{land.waterSource || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Status:</span>
                          <div className={`font-medium ${land.isLeased ? 'text-red-600' : 'text-green-600'}`}>
                            {land.isLeased ? 'Leased' : 'Available'}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-1">
                        {land.roadAccess && (
                          <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Road Access</span>
                        )}
                        {land.electricityConnection && (
                          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">Electricity</span>
                        )}
                        <span className={`inline-block text-xs px-2 py-1 rounded ${
                          land.zoning === 'residential' ? 'bg-purple-100 text-purple-700' :
                          land.zoning === 'commercial' ? 'bg-orange-100 text-orange-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {land.zoning}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log("Land details:", land);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Debug
                      </button>
                      <button
                        onClick={() => deleteLand(land)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Debug Info</h3>
          <p className="text-sm text-yellow-700">
            This page helps test the properties API integration. Check the browser console for detailed logs.
          </p>
          <div className="mt-2 text-xs text-yellow-600">
            <p>• Buildings can contain multiple apartments</p>
            <p>• Flats are standalone rental units</p>
            <p>• Lands can be leased for various purposes</p>
            <p>• All property types support comprehensive specifications</p>
            <p>• Search and statistics functionality included</p>
          </div>
        </div>
      </div>
    </div>
  );
}