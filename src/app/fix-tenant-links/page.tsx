"use client";

import { useState, useEffect } from "react";
import { propertyService } from "@/services/PropertyService";
import { ApiService } from "@/services/ApiService";

export default function FixTenantLinksPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [apartments, setApartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get all tenants
      const tenantsData = await propertyService.getTenants();
      setTenants(tenantsData);

      // Get all apartments
      const buildingsData = await propertyService.getBuildings();
      const allApartments: any[] = [];
      buildingsData.forEach(building => {
        if (building.apartments) {
          building.apartments.forEach(apt => {
            allApartments.push({
              ...apt,
              buildingId: building.id,
              buildingName: building.name
            });
          });
        }
      });
      setApartments(allApartments);

    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const linkTenantToApartment = async (tenantId: string, apartmentId: string, buildingId: string) => {
    try {
      setUpdating(tenantId);
      
      // Update tenant with property linking information
      const updateData = {
        property_id: apartmentId,
        property_type: "apartment", 
        building_id: buildingId
      };

      // Update tenant property link
      await propertyService.updateTenantPropertyLink(tenantId, apartmentId, "apartment", buildingId);

      // Update apartment occupancy
      await propertyService.updateApartment(apartmentId, {
        isOccupied: true
      });

      alert("Tenant linked successfully!");
      await loadData(); // Reload data
      
    } catch (error) {
      console.error("Error linking tenant:", error);
      alert("Error linking tenant: " + error.message);
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return <div className="p-8">Loading tenant and apartment data...</div>;
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Fix Tenant Links</h1>
      <p className="text-gray-600">
        This page helps you manually link existing tenants to their apartments.
      </p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tenants */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Tenants ({tenants.length})</h2>
          <div className="space-y-4">
            {tenants.map((tenant) => (
              <div key={tenant.id} className="border p-4 rounded-lg bg-gray-50">
                <div className="font-medium">{tenant.personalInfo?.fullName}</div>
                <div className="text-sm text-gray-600">
                  Phone: {tenant.contactInfo?.phone} | 
                  Rent: ₹{tenant.rentalAgreement?.rentAmount}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Property ID: {tenant.propertyId || "Not linked"} | 
                  Property Type: {tenant.propertyType || "Not set"}
                </div>
                
                {!tenant.propertyId && (
                  <div className="mt-3">
                    <label className="text-sm font-medium">Link to Apartment:</label>
                    <select 
                      className="mt-1 block w-full border rounded px-2 py-1 text-sm"
                      onChange={(e) => {
                        if (e.target.value) {
                          const [apartmentId, buildingId] = e.target.value.split('|');
                          linkTenantToApartment(tenant.id, apartmentId, buildingId);
                        }
                      }}
                      disabled={updating === tenant.id}
                    >
                      <option value="">Select apartment...</option>
                      {apartments.map(apt => (
                        <option key={apt.id} value={`${apt.id}|${apt.buildingId}`}>
                          {apt.buildingName} - Door {apt.doorNumber} (Floor {apt.floor})
                        </option>
                      ))}
                    </select>
                    {updating === tenant.id && (
                      <div className="text-sm text-blue-600 mt-1">Linking...</div>
                    )}
                  </div>
                )}
                
                {tenant.propertyId && (
                  <div className="mt-2 text-sm text-green-600">
                    ✅ Linked to apartment {tenant.propertyId}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Apartments */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Apartments ({apartments.length})</h2>
          <div className="space-y-4">
            {apartments.map((apartment) => (
              <div key={apartment.id} className="border p-4 rounded-lg bg-blue-50">
                <div className="font-medium">
                  {apartment.buildingName} - Door {apartment.doorNumber}
                </div>
                <div className="text-sm text-gray-600">
                  Floor {apartment.floor} | {apartment.bedroomCount}BR/{apartment.bathroomCount}BA
                </div>
                <div className="text-sm">
                  Occupied: {apartment.isOccupied ? "Yes" : "No"}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  ID: {apartment.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}