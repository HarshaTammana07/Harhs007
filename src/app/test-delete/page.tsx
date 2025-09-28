"use client";

import React, { useState, useEffect } from "react";
import { ApiService } from "@/services/ApiService";
import { FamilyMember } from "@/types";
import toast from "react-hot-toast";

export default function TestDeletePage() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getFamilyMembers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to load members:", error);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  };

  const testDelete = async (member: FamilyMember) => {
    try {
      console.log("Deleting member:", member);
      console.log("Member ID:", member.id);
      console.log("Member ID type:", typeof member.id);
      
      await ApiService.deleteFamilyMember(member.id);
      toast.success(`Deleted ${member.fullName}`);
      await loadMembers();
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const createTestMember = async () => {
    try {
      const testMember = {
        fullName: "Test Delete User",
        nickname: "TestDelete",
        relationship: "Other",
        contactInfo: {
          phone: "+1234567890",
          email: "test@delete.com",
          address: "123 Test St"
        },
        documents: [],
        insurancePolicies: []
      };

      await ApiService.createFamilyMember(testMember);
      toast.success("Created test member");
      await loadMembers();
    } catch (error: any) {
      console.error("Create failed:", error);
      toast.error(`Create failed: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Delete Functionality Test</h1>
        
        <div className="mb-6">
          <button
            onClick={createTestMember}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mr-4"
          >
            Create Test Member
          </button>
          <button
            onClick={loadMembers}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh List
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">Family Members ({members.length})</h2>
          </div>
          
          {members.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No family members found. Create a test member to test delete functionality.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div key={member.id} className="p-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {member.fullName}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {member.nickname} • {member.relationship}
                    </p>
                    <p className="text-xs text-gray-400 font-mono">
                      ID: {member.id}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        console.log("Member object:", member);
                        console.log("Member ID:", member.id);
                        console.log("ID type:", typeof member.id);
                      }}
                      className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                    >
                      Debug
                    </button>
                    <button
                      onClick={() => testDelete(member)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Debug Info</h3>
          <p className="text-sm text-yellow-700">
            This page helps debug the delete functionality. Check the browser console for detailed logs.
          </p>
        </div>
      </div>
    </div>
  );
}