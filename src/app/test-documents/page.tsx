"use client";

import React, { useState, useEffect } from "react";
import { ApiService } from "@/services/ApiService";
import {
  Document,
  FamilyMember,
  InsurancePolicy,
  DocumentCategory,
} from "@/types";
import toast from "react-hot-toast";

export default function TestDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [insurancePolicies, setInsurancePolicies] = useState<InsurancePolicy[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] =
    useState<DocumentCategory>("aadhar");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allDocuments, members, policies] = await Promise.all([
        ApiService.getDocuments(),
        ApiService.getFamilyMembers(),
        ApiService.getInsurancePolicies(),
      ]);
      setDocuments(allDocuments);
      setFamilyMembers(members);
      setInsurancePolicies(policies);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const createTestDocument = async () => {
    if (familyMembers.length === 0) {
      toast.error("Please add family members first");
      return;
    }

    try {
      // Create a simple test document with base64 data
      const testContent = `Test Document Content - ${new Date().toISOString()}`;
      const base64Data = btoa(testContent); // Convert to base64

      const testDocument = {
        title: `Test ${selectedCategory} Document`,
        category: selectedCategory,
        fileData: `data:text/plain;base64,${base64Data}`,
        fileName: `test-${selectedCategory}-${Date.now()}.txt`,
        fileSize: testContent.length,
        mimeType: "text/plain",
        familyMemberId: familyMembers[0].id,
        tags: ["test", selectedCategory],
        issuedDate: new Date(),
        expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        issuer: "Test Authority",
        documentNumber: `TEST-${Date.now()}`,
      };

      await ApiService.createDocument(testDocument);
      toast.success("Test document created successfully");
      await loadData();
    } catch (error: any) {
      console.error("Create failed:", error);
      toast.error(`Create failed: ${error.message}`);
    }
  };

  const testDelete = async (document: Document) => {
    try {
      await ApiService.deleteDocument(document.id);
      toast.success(`Deleted document ${document.title}`);
      await loadData();
    } catch (error: any) {
      console.error("Delete failed:", error);
      toast.error(`Delete failed: ${error.message}`);
    }
  };

  const testExpiredDocuments = async () => {
    try {
      const expired = await ApiService.getExpiredDocuments();
      toast.success(`Found ${expired.length} expired documents`);
      console.log("Expired documents:", expired);
    } catch (error: any) {
      console.error("Failed to get expired documents:", error);
      toast.error(`Failed: ${error.message}`);
    }
  };

  const testDocumentsByCategory = async () => {
    try {
      const byCategory = documents.filter(
        (doc) => doc.category === selectedCategory
      );
      toast.success(`Found ${byCategory.length} ${selectedCategory} documents`);
      console.log(`${selectedCategory} documents:`, byCategory);
    } catch (error: any) {
      console.error("Failed to filter documents:", error);
      toast.error(`Failed: ${error.message}`);
    }
  };

  const testDocumentsByFamilyMember = async () => {
    if (familyMembers.length === 0) {
      toast.error("No family members available");
      return;
    }

    try {
      const member = familyMembers[0];
      const memberDocs = documents.filter(
        (doc) => doc.familyMemberId === member.id
      );
      toast.success(
        `Found ${memberDocs.length} documents for ${member.fullName}`
      );
      console.log(`Documents for ${member.fullName}:`, memberDocs);
    } catch (error: any) {
      console.error("Failed to filter documents by family member:", error);
      toast.error(`Failed: ${error.message}`);
    }
  };

  const downloadDocument = (document: Document) => {
    try {
      // Create a download link
      const link = document.createElement("a");
      link.href = document.fileData;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Downloaded ${document.fileName}`);
    } catch (error: any) {
      console.error("Download failed:", error);
      toast.error(`Download failed: ${error.message}`);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getExpiryStatus = (document: Document) => {
    if (!document.expiryDate)
      return { text: "No expiry", color: "text-gray-500" };

    const today = new Date();
    const expiryDate = new Date(document.expiryDate);
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry < 0) {
      return {
        text: `Expired ${Math.abs(daysUntilExpiry)} days ago`,
        color: "text-red-600",
      };
    } else if (daysUntilExpiry <= 30) {
      return {
        text: `Expires in ${daysUntilExpiry} days`,
        color: "text-yellow-600",
      };
    } else {
      return {
        text: `${daysUntilExpiry} days to expiry`,
        color: "text-green-600",
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading documents data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Documents API Test</h1>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedCategory}
              onChange={(e) =>
                setSelectedCategory(e.target.value as DocumentCategory)
              }
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="aadhar">Aadhar Card</option>
              <option value="pan">PAN Card</option>
              <option value="driving_license">Driving License</option>
              <option value="passport">Passport</option>
              <option value="house_documents">House Documents</option>
              <option value="business_documents">Business Documents</option>
              <option value="insurance_documents">Insurance Documents</option>
              <option value="bank_documents">Bank Documents</option>
              <option value="educational_certificates">
                Educational Certificates
              </option>
              <option value="medical_records">Medical Records</option>
            </select>

            <button
              onClick={createTestDocument}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Create Test Document
            </button>

            <button
              onClick={testDocumentsByCategory}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Test By Category
            </button>

            <button
              onClick={testDocumentsByFamilyMember}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Test By Family Member
            </button>

            <button
              onClick={testExpiredDocuments}
              className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700"
            >
              Test Expired Documents
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
            <div className="text-3xl font-bold text-blue-600">
              {documents.length}
            </div>
            <div className="text-gray-600">Total Documents</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-green-600">
              {familyMembers.length}
            </div>
            <div className="text-gray-600">Family Members</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">
              {insurancePolicies.length}
            </div>
            <div className="text-gray-600">Insurance Policies</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600">
              {
                documents.filter((doc) => {
                  if (!doc.expiryDate) return false;
                  const daysUntilExpiry = Math.ceil(
                    (new Date(doc.expiryDate).getTime() -
                      new Date().getTime()) /
                      (1000 * 60 * 60 * 24)
                  );
                  return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
                }).length
              }
            </div>
            <div className="text-gray-600">Expiring Soon</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Documents by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              "aadhar",
              "pan",
              "driving_license",
              "passport",
              "house_documents",
              "business_documents",
              "insurance_documents",
              "bank_documents",
              "educational_certificates",
              "medical_records",
            ].map((category) => {
              const count = documents.filter(
                (doc) => doc.category === category
              ).length;
              return (
                <div
                  key={category}
                  className="text-center p-3 bg-gray-50 rounded"
                >
                  <div className="text-lg font-bold text-blue-600">{count}</div>
                  <div className="text-xs text-gray-600 capitalize">
                    {category.replace("_", " ")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Family Members */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Family Members ({familyMembers.length})
          </h2>
          {familyMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No family members found. Please add family members first.
              <div className="mt-2">
                <a
                  href="/demo/family"
                  className="text-blue-600 hover:underline"
                >
                  Go to Family Management →
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {familyMembers.map((member) => {
                const memberDocs = documents.filter(
                  (doc) => doc.familyMemberId === member.id
                );
                return (
                  <div key={member.id} className="border rounded-lg p-4">
                    <h3 className="font-medium">{member.fullName}</h3>
                    <p className="text-sm text-gray-600">
                      {member.nickname} • {member.relationship}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {memberDocs.length} documents
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold">
              Documents ({documents.length})
            </h2>
          </div>

          {documents.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No documents found. Create a test document to get started.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {documents.map((document) => {
                const familyMember = familyMembers.find(
                  (m) => m.id === document.familyMemberId
                );
                const expiryStatus = getExpiryStatus(document);

                return (
                  <div
                    key={document.id}
                    className="p-6 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg
                              className="w-6 h-6 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {document.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {document.category.replace("_", " ").toUpperCase()}{" "}
                            • {document.fileName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {formatFileSize(document.fileSize)} •{" "}
                            {document.mimeType}
                          </p>
                        </div>
                      </div>

                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Family Member:</span>
                          <div className="font-medium">
                            {familyMember
                              ? `${familyMember.fullName} (${familyMember.nickname})`
                              : "Unknown"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">
                            Document Number:
                          </span>
                          <div className="font-medium">
                            {document.documentNumber || "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Issuer:</span>
                          <div className="font-medium">
                            {document.issuer || "N/A"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Expiry:</span>
                          <div className={`font-medium ${expiryStatus.color}`}>
                            {expiryStatus.text}
                          </div>
                        </div>
                      </div>

                      {document.tags && document.tags.length > 0 && (
                        <div className="mt-2">
                          <span className="text-gray-500 text-sm">Tags: </span>
                          {document.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded mr-1"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      <button
                        onClick={() => downloadDocument(document)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => {
                          console.log("Document details:", document);
                          console.log("Family member:", familyMember);
                        }}
                        className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700"
                      >
                        Debug
                      </button>
                      <button
                        onClick={() => testDelete(document)}
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
          <h3 className="text-lg font-medium text-yellow-800 mb-2">
            Debug Info
          </h3>
          <p className="text-sm text-yellow-700">
            This page helps test the documents API integration. Check the
            browser console for detailed logs.
          </p>
          <div className="mt-2 text-xs text-yellow-600">
            <p>• Documents are linked to family members dynamically</p>
            <p>• Expiry tracking and alerts are calculated in real-time</p>
            <p>• All document categories are supported</p>
            <p>• File download functionality is included</p>
          </div>
        </div>
      </div>
    </div>
  );
}
