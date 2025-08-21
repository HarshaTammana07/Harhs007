"use client";

import { useState, useEffect } from "react";
import { propertyService } from "@/services/PropertyService";

export default function TestTenantDataPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get all tenants
      const tenantsData = await propertyService.getTenants();
      console.log("All tenants:", tenantsData);
      setTenants(tenantsData);

      // Get all buildings and apartments
      const buildingsData = await propertyService.getBuildings();
      const allApartments: any[] = [];
      buildingsData.forEach(building => {
        if (building.apartments) {
          building.apartments.forEach(apt => {
            allApartments.push({
              ...apt,
              buildingName: building.name
            });
          });
        }
      });
      console.log("All apartments:", allApartments);
      setApartments(allApartments);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">Loading tenant and apartment data...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Tenant Data Debug</h1>
      
      {/* Tenants Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tenants ({tenants.length})</h2>
        <div className="space-y-4">
          {tenants.map((tenant, index) => (
            <div key={tenant.id || index} className="border p-4 rounded-lg bg-gray-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>ID:</strong> {tenant.id}</div>
                <div><strong>Property ID:</strong> {tenant.propertyId || "Not set"}</div>
                <div><strong>Property Type:</strong> {tenant.propertyType || "Not set"}</div>
                <div><strong>Building ID:</strong> {tenant.buildingId || "Not set"}</div>
                <div><strong>Full Name:</strong> {tenant.personalInfo?.fullName || "Not set"}</div>
                <div><strong>Phone:</strong> {tenant.contactInfo?.phone || "Not set"}</div>
                <div><strong>Email:</strong> {tenant.contactInfo?.email || "Not set"}</div>
                <div><strong>Rent Amount:</strong> {tenant.rentalAgreement?.rentAmount || "Not set"}</div>
              </div>
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">View Full Tenant Object</summary>
                <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                  {JSON.stringify(tenant, null, 2)}
                </pre>
              </details>
            </div>
          ))}
          {tenants.length === 0 && (
            <div className="text-gray-500">No tenants found</div>
          )}
        </div>
      </div>

      {/* Apartments Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Apartments ({apartments.length})</h2>
        <div className="space-y-4">
          {apartments.map((apartment, index) => (
            <div key={apartment.id || index} className="border p-4 rounded-lg bg-blue-50">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Apartment ID:</strong> {apartment.id}</div>
                <div><strong>Building:</strong> {apartment.buildingName}</div>
                <div><strong>Door Number:</strong> {apartment.doorNumber}</div>
                <div><strong>Is Occupied:</strong> {apartment.isOccupied ? "Yes" : "No"}</div>
                <div><strong>Current Tenant:</strong> {apartment.currentTenant ? "Has tenant" : "No tenant"}</div>
              </div>
              {apartment.currentTenant && (
                <div className="mt-2 p-2 bg-green-100 rounded">
                  <strong>Tenant Info:</strong> {apartment.currentTenant.personalInfo?.fullName || "Name not found"}
                </div>
              )}
            </div>
          ))}
          {apartments.length === 0 && (
            <div className="text-gray-500">No apartments found</div>
          )}
        </div>
      </div>

      {/* Matching Analysis */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Tenant-Apartment Matching Analysis</h2>
        <div className="space-y-2">
          {apartments.map(apartment => {
            const matchingTenant = tenants.find(tenant => 
              tenant.propertyId === apartment.id && tenant.propertyType === "apartment"
            );
            
            return (
              <div key={apartment.id} className="border p-3 rounded">
                <div className="font-medium">
                  Apartment {apartment.doorNumber} (ID: {apartment.id})
                </div>
                <div className="text-sm text-gray-600">
                  Occupied: {apartment.isOccupied ? "Yes" : "No"} | 
                  Matching Tenant: {matchingTenant ? matchingTenant.personalInfo?.fullName : "None found"}
                </div>
                {matchingTenant && (
                  <div className="text-xs text-green-600 mt-1">
                    ✅ Tenant {matchingTenant.id} matches apartment {apartment.id}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}