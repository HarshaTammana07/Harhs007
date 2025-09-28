"use client";

import React, { useState, useEffect } from "react";
import { ApiService } from "@/services/ApiService";
import { InsurancePolicy, FamilyMember } from "@/types";
import toast from "react-hot-toast";

export default function TestRefreshPage() {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    loadData();
  }, [refreshCount]); // This will reload when refreshCount changes

  const loadData = async () => {
    try {
      setLoading(true);
      console.log("Loading data... (refresh count:", refreshCount, ")");
      
      const [allPolicies, members] = await Promise.all([
        ApiService.getInsurancePolicies(),
        ApiService.getFamilyMembers()
      ]);
      
      setPolicies(allPolicies);
      setFamilyMembers(members);
      
      console.log("Data loaded:", {
        policies: allPolicies.length,
        familyMembers: members.length
      });
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
        policyNumber: `REFRESH-TEST-${Date.now()}`,
        type: "car" as const,
        provider: "Refresh Test Insurance",
        familyMemberId: familyMembers[0].id,
        premiumAmount: 12000,
        coverageAmount: 300000,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        status: "active" as const,
      };

      console.log("Creating test policy...");
      await ApiService.createInsurancePolicy(testPolicy);
      toast.success("Test policy created!");
      
      // Trigger refresh
      console.log("Triggering refresh...");
      setRefreshCount(prev => prev + 1);
      
    } catch (error: any) {
      console.error("Create failed:", error);
      toast.error(`Create failed: ${error.message}`);
    }
  };

  const deleteLastPolicy = async () => {
    if (policies.length === 0) {
      toast.error("No policies to delete");
      return;
    }

    const lastPolicy = policies[policies.length - 1];
    
    try {
      console.log("Deleting policy:", lastPolicy.policyNumber);
      await ApiService.deleteInsurancePolicy(lastPolicy.id);
      toast.success(`Deleted ${lastPolicy.policyNumber}`);
      
      // Trigger refresh
      console.log("Triggering refresh...");
      setRefreshCount(prev => prev + 1);
      
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const manualRefresh = () => {
    console.log("Manual refresh triggered");
    setRefreshCount(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Refresh Functionality Test</h1>
        
        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={createTestPolicy}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Loading..." : "Create Test Policy"}
            </button>
            
            <button
              onClick={deleteLastPolicy}
              disabled={loading || policies.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              Delete Last Policy
            </button>
            
            <button
              onClick={manualRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Manual Refresh
            </button>
            
            <div className="text-sm text-gray-600">
              Refresh Count: <span className="font-mono font-bold">{refreshCount}</span>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-blue-600">
              {policies.length}
            </div>
            <div className="text-gray-600">Insurance Policies</div>
            {loading && <div className="text-xs text-yellow-600 mt-1">Loading...</div>}
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {familyMembers.length}
            </div>
            <div className="text-gray-600">Family Members</div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {refreshCount}
            </div>
            <div className="text-gray-600">Refresh Count</div>
          </div>
        </div>

        {/* Recent Policies */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Recent Policies</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading policies...</p>
            </div>
          ) : policies.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No policies found. Create a test policy to see refresh in action.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {policies.slice(-5).reverse().map((policy, index) => {
                const familyMember = familyMembers.find(m => m.id === policy.familyMemberId);
                
                return (
                  <div key={policy.id} className="p-6 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {policy.policyNumber}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {policy.type.toUpperCase()} • {policy.provider}
                      </p>
                      <p className="text-xs text-gray-400">
                        Family Member: {familyMember ? `${familyMember.fullName} (${familyMember.nickname})` : 'Unknown'}
                      </p>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        ₹{policy.premiumAmount.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {index === 0 && "← Most Recent"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Test Instructions</h3>
          <ol className="text-sm text-yellow-700 space-y-1 list-decimal list-inside">
            <li>Click "Create Test Policy" - the policy count should update immediately</li>
            <li>Click "Delete Last Policy" - the count should decrease immediately</li>
            <li>Watch the "Refresh Count" increment with each operation</li>
            <li>Check browser console for detailed logs</li>
            <li>No manual refresh should be needed!</li>
          </ol>
        </div>
      </div>
    </div>
  );
}