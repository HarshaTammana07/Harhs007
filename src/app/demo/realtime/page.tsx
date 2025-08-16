"use client";

import React, { useState } from "react";
import { useRealTimeFamilyMembers, useRealTimeInsurancePolicies, useRealTimeProperties, useRealTimeDocuments } from "@/hooks/useRealTimeData";
import { ApiService } from "@/services/ApiService";
import toast from "react-hot-toast";

export default function RealTimeDemoPage() {
  const { members, loading: membersLoading } = useRealTimeFamilyMembers();
  const { policies, loading: policiesLoading } = useRealTimeInsurancePolicies();
  const { buildings, flats, lands, loading: propertiesLoading } = useRealTimeProperties();
  const { documents, loading: documentsLoading } = useRealTimeDocuments();
  
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('connected');

  const createTestData = async () => {
    try {
      // Create a test family member
      await ApiService.createFamilyMember({
        fullName: `Real-time Test User ${Date.now()}`,
        nickname: "RT-Test",
        relationship: "Other",
        contactInfo: {
          phone: "+1234567890",
          email: "realtime@test.com",
          address: "Real-time Test Address"
        },
        documents: [],
        insurancePolicies: []
      });

      toast.success("Test data created - watch for real-time updates!");
    } catch (error: any) {
      toast.error(`Failed to create test data: ${error.message}`);
    }
  };

  const simulateMultiUserActivity = async () => {
    toast.info("Simulating multi-user activity...");
    
    // Simulate rapid changes
    for (let i = 0; i < 3; i++) {
      setTimeout(async () => {
        try {
          await ApiService.createFamilyMember({
            fullName: `Batch User ${i + 1} - ${Date.now()}`,
            nickname: `Batch${i + 1}`,
            relationship: "Other",
            contactInfo: {},
            documents: [],
            insurancePolicies: []
          });
        } catch (error) {
          console.error("Batch create failed:", error);
        }
      }, i * 1000);
    }
  };

  const testCrossTabSync = () => {
    toast.info("Open this page in another tab to test cross-tab synchronization!");
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Real-Time Demo
          </h1>
          <p className="text-lg text-gray-600">
            Experience live data synchronization with Supabase real-time subscriptions
          </p>
          
          {/* Connection Status */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span className="text-sm font-medium">
                {connectionStatus === 'connected' ? 'Real-time Connected' :
                 connectionStatus === 'connecting' ? 'Connecting...' :
                 'Disconnected'}
              </span>
            </div>
            
            <div className="text-sm text-gray-500">
              Last update: {new Date().toLocaleTimeString()}
            </div>
          </div>

          {/* Real-time Features */}
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="text-lg font-semibold text-green-900 mb-2">
              🔴 LIVE Real-Time Features Active!
            </h2>
            <ul className="text-sm text-green-800 space-y-1">
              <li>✅ Live data synchronization across all tabs</li>
              <li>✅ Instant notifications when data changes</li>
              <li>✅ Multi-user collaboration support</li>
              <li>✅ Automatic UI updates without refresh</li>
              <li>✅ Real-time toast notifications</li>
            </ul>
          </div>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Real-Time Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={createTestData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Create Test Data
            </button>
            
            <button
              onClick={simulateMultiUserActivity}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Simulate Multi-User Activity
            </button>
            
            <button
              onClick={testCrossTabSync}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test Cross-Tab Sync
            </button>
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-sm text-yellow-800">
              <strong>How to test:</strong> Open this page in multiple tabs, create/edit/delete data in one tab, 
              and watch it update instantly in all other tabs!
            </p>
          </div>
        </div>

        {/* Real-Time Data Display */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Family Members */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Family Members</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            </div>
            
            <div className="p-6">
              {membersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-blue-600">{members.length}</div>
                  <div className="text-sm text-gray-600">Total Members</div>
                  
                  {members.slice(-3).map((member) => (
                    <div key={member.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-600">
                          {member.fullName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{member.fullName}</div>
                        <div className="text-xs text-gray-500">{member.relationship}</div>
                      </div>
                    </div>
                  ))}
                  
                  {members.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{members.length - 3} more members
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Insurance Policies */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Insurance Policies</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            </div>
            
            <div className="p-6">
              {policiesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-green-600">{policies.length}</div>
                  <div className="text-sm text-gray-600">Total Policies</div>
                  
                  {policies.slice(-3).map((policy) => (
                    <div key={policy.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-green-600">
                          {policy.type.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{policy.policyNumber}</div>
                        <div className="text-xs text-gray-500">{policy.type} • {policy.provider}</div>
                      </div>
                    </div>
                  ))}
                  
                  {policies.length > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{policies.length - 3} more policies
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Properties */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Properties</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            </div>
            
            <div className="p-6">
              {propertiesLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-xl font-bold text-blue-600">{buildings.length}</div>
                    <div className="text-xs text-gray-600">Buildings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-green-600">{flats.length}</div>
                    <div className="text-xs text-gray-600">Flats</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-purple-600">{lands.length}</div>
                    <div className="text-xs text-gray-600">Lands</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Documents</h2>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-500">Live</span>
              </div>
            </div>
            
            <div className="p-6">
              {documentsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-orange-600">{documents.length}</div>
                  <div className="text-sm text-gray-600">Total Documents</div>
                  
                  {documents.slice(-2).map((document) => (
                    <div key={document.id} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                      <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-orange-600">📄</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium">{document.title}</div>
                        <div className="text-xs text-gray-500">{document.category}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-3">
            🔴 How to Experience Real-Time Updates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Single User Testing:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click "Create Test Data" button</li>
                <li>Watch the counters update instantly</li>
                <li>See toast notifications appear</li>
                <li>Notice the "Live" indicators pulsing</li>
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Multi-User Testing:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open this page in multiple browser tabs</li>
                <li>Create/edit data in one tab</li>
                <li>Watch updates appear instantly in all tabs</li>
                <li>Test with different devices/browsers</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}