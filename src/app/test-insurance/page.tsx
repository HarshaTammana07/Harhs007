"use client";

import React, { useState, useEffect } from "react";
import { ApiService } from "@/services/ApiService";
import { InsurancePolicy, FamilyMember } from "@/types";
import toast from "react-hot-toast";

export default function TestInsurancePage() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<InsurancePolicy["type"]>("car");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allPolicies, members] = await Promise.all([
        ApiService.getInsurancePolicies(),
        ApiService.getFamilyMembers()
      ]);
      setPolicies(allPolicies);
      setFamilyMembers(members);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const createTestPolicy = async () => {
    if (familyMembers.length === 0) {
      toast.error("Please add family members first");
      return;
    }

    try {
      const testPolicy = {
        policyNumber: `TEST-${Date.now()}`,
        type: selectedType,
        provider: "Test Insurance Company",
        familyMemberId: familyMembers[0].id,
        premiumAmount: 15000,
        coverageAmount: 500000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: "active" as const,
      };

      await ApiService.createInsurancePolicy(testPolicy);
      toast.success("Test policy created successfully");
      await loadData();
    } catch (error: any) {
      console.error("Create failed:", error);
      toast.error(`Create failed: ${error.message}`);
    }
  };

  const testDelete = async (policy: InsurancePolicy) => {
    try {
      await ApiService.deleteInsurancePolicy(policy.id);
      toast.success(`Deleted policy ${policy.policyNumber}`);
      await loadData();
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const testExpiringSoon = async () => {
    try {
      const expiring = await ApiService.getPoliciesExpiringSoon(30);
      toast.success(`Found ${expiring.length} policies expiring in 30 days`);
      console.log("Expiring policies:", expiring);
    } catch (error: any) {
      console.error("Failed to get expiring policies:", error);
      toast.error(`Failed: ${error.message}`);
    }
  };

  const testByType = async () => {
    try {
      const byType = await ApiService.getPoliciesByType(selectedType);
      toast.success(`Found ${byType.length} ${selectedType} policies`);
      console.log(`${selectedType} policies:`, byType);
    } catch (error: any) {
      console.error("Failed to get policies by type:", error);
      toast.error(`Failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading insurance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Insurance API Test</h1>
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as InsurancePolicy["type"])}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="car">Car Insurance</option>
              <option value="bike">Bike Insurance</option>
              <option value="LIC">LIC Insurance</option>
              <option value="health">Health Insurance</option>
            </select>
            
            <button
              onClick={createTestPolicy}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Test Policy
            </button>
            
            <button
              onClick={testByType}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test By Type
            </button>
            
            <button
              onClick={testExpiringSoon}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Test Expiring Soon
            </button>
            
            <button
              onClick={loadData}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">{policies.length}</div>
            <div className="text-gray-600">Total Policies</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">{familyMembers.length}</div>
            <div className="text-gray-600">Family Members</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {policies.filter(p => p.status === 'active').length}
            </div>
            <div className="text-gray-600">Active Policies</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-red-600">
              {policies.filter(p => p.status === 'expired').length}
            </div>
            <div className="text-gray-600">Expired Policies</div>
          </div>
        </div>

        {/* Family Members */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Family Members ({familyMembers.length})</h2>
          {familyMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No family members found. Please add family members first.
              <div className="mt-2">
                <a href="/demo/family" className="text-blue-600 hover:underline">
                  Go to Family Management →
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.map((member) => (
                <div key={member.id} className="border rounded-lg p-4">
                  <h3 className="font-medium">{member.fullName}</h3>
                  <p className="text-sm text-gray-600">{member.nickname} • {member.relationship}</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">ID: {member.id}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insurance Policies */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Insurance Policies ({policies.length})</h2>
          </div>
          
          {policies.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No insurance policies found. Create a test policy to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {policies.map((policy) => {
                const familyMember = familyMembers.find(m => m.id === policy.familyMemberId);
                const daysUntilRenewal = Math.ceil(
                  (new Date(policy.renewalDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                );
                
                return (
                  <div key={policy.id} className="p-6 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {policy.policyNumber}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {policy.type.toUpperCase()} • {policy.provider}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          policy.status === 'active' ? 'bg-green-100 text-green-800' :
                          policy.status === 'expired' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {policy.status}
                        </span>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Family Member:</span>
                          <div className="font-medium">
                            {familyMember ? `${familyMember.fullName} (${familyMember.nickname})` : 'Unknown'}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Premium:</span>
                          <div className="font-medium">₹{policy.premiumAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Coverage:</span>
                          <div className="font-medium">₹{policy.coverageAmount.toLocaleString()}</div>
                        </div>
                        <div>
                          <span className="text-gray-500">Renewal:</span>
                          <div className={`font-medium ${
                            daysUntilRenewal < 0 ? 'text-red-600' :
                            daysUntilRenewal <= 30 ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {daysUntilRenewal < 0 
                              ? `Expired ${Math.abs(daysUntilRenewal)} days ago`
                              : `${daysUntilRenewal} days`
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          console.log("Policy details:", policy);
                          console.log("Family member:", familyMember);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Debug
                      </button>
                      <button
                        onClick={() => testDelete(policy)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Debug Info</h3>
          <p className="text-sm text-yellow-700">
            This page helps test the insurance API integration. Check the browser console for detailed logs.
          </p>
          <div className="mt-2 text-xs text-yellow-600">
            <p>• Family members are loaded dynamically from the API</p>
            <p>• Insurance policies support all CRUD operations</p>
            <p>• Expiry tracking and statistics are calculated in real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
}