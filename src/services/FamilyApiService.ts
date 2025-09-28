import { supabase } from "@/lib/supabase";
import { Document, InsurancePolicy } from "@/types";

export class FamilyApiService {
  /**
   * Get documents for a specific family member
   */
  static async getDocumentsByFamilyMember(
    familyMemberId: string
  ): Promise<Document[]> {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("family_member_id", familyMemberId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch documents: ${error.message}`);
      }

      // Transform database format to frontend format
      return (data || []).map((doc: any) => ({
        id: doc.id,
        title: doc.title,
        category: doc.category,
        fileData: doc.file_data,
        fileName: doc.file_name,
        fileSize: doc.file_size,
        mimeType: doc.mime_type,
        familyMemberId: doc.family_member_id,
        propertyId: doc.property_id,
        insurancePolicyId: doc.insurance_policy_id,
        expiryDate: doc.expiry_date ? new Date(doc.expiry_date) : undefined,
        issuedDate: doc.issued_date ? new Date(doc.issued_date) : undefined,
        issuer: doc.issuer,
        documentNumber: doc.document_number,
        tags: doc.tags || [],
        createdAt: new Date(doc.created_at),
        updatedAt: new Date(doc.updated_at),
      }));
    } catch (error) {
      console.error("Error fetching family member documents:", error);
      throw error;
    }
  }

  /**
   * Get insurance policies for a specific family member
   */
  static async getInsurancePoliciesByFamilyMember(
    familyMemberId: string
  ): Promise<InsurancePolicy[]> {
    try {
      const { data, error } = await supabase
        .from("insurance_policies")
        .select("*")
        .eq("family_member_id", familyMemberId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch insurance policies: ${error.message}`);
      }

      // Transform database format to frontend format
      return (data || []).map((policy: any) => ({
        id: policy.id,
        policyNumber: policy.policy_number,
        type: policy.type,
        provider: policy.provider,
        familyMemberId: policy.family_member_id,
        premiumAmount: policy.premium_amount,
        coverageAmount: policy.coverage_amount,
        startDate: new Date(policy.start_date),
        endDate: new Date(policy.end_date),
        renewalDate: new Date(policy.renewal_date),
        status: policy.status,
        documents: [], // Will be populated separately if needed
        premiumHistory: policy.premium_history || [],
      }));
    } catch (error) {
      console.error("Error fetching family member insurance policies:", error);
      throw error;
    }
  }

  /**
   * Create a new document for a family member
   */
  static async createDocument(
    familyMemberId: string,
    documentData: Partial<Document>
  ): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from("documents")
        .insert([
          {
            title: documentData.title,
            category: documentData.category,
            file_data: documentData.fileData,
            file_name: documentData.fileName,
            file_size: documentData.fileSize,
            mime_type: documentData.mimeType,
            family_member_id: familyMemberId,
            expiry_date: documentData.expiryDate?.toISOString(),
            issued_date: documentData.issuedDate?.toISOString(),
            issuer: documentData.issuer,
            document_number: documentData.documentNumber,
            tags: documentData.tags,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create document: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        category: data.category,
        fileData: data.file_data,
        fileName: data.file_name,
        fileSize: data.file_size,
        mimeType: data.mime_type,
        familyMemberId: data.family_member_id,
        propertyId: data.property_id,
        insurancePolicyId: data.insurance_policy_id,
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
        issuedDate: data.issued_date ? new Date(data.issued_date) : undefined,
        issuer: data.issuer,
        documentNumber: data.document_number,
        tags: data.tags || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error("Error creating document:", error);
      throw error;
    }
  }

  /**
   * Create a new insurance policy for a family member
   */
  static async createInsurancePolicy(
    familyMemberId: string,
    policyData: Partial<InsurancePolicy>
  ): Promise<InsurancePolicy> {
    try {
      const { data, error } = await supabase
        .from("insurance_policies")
        .insert([
          {
            policy_number: policyData.policyNumber,
            type: policyData.type,
            provider: policyData.provider,
            family_member_id: familyMemberId,
            premium_amount: policyData.premiumAmount,
            coverage_amount: policyData.coverageAmount,
            start_date: policyData.startDate?.toISOString(),
            end_date: policyData.endDate?.toISOString(),
            renewal_date: policyData.renewalDate?.toISOString(),
            status: policyData.status,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create insurance policy: ${error.message}`);
      }

      return {
        id: data.id,
        policyNumber: data.policy_number,
        type: data.type,
        provider: data.provider,
        familyMemberId: data.family_member_id,
        premiumAmount: data.premium_amount,
        coverageAmount: data.coverage_amount,
        startDate: new Date(data.start_date),
        endDate: new Date(data.end_date),
        renewalDate: new Date(data.renewal_date),
        status: data.status,
        documents: [],
        premiumHistory: [],
      };
    } catch (error) {
      console.error("Error creating insurance policy:", error);
      throw error;
    }
  }

  /**
   * Update a document
   */
  static async updateDocument(
    documentId: string,
    updates: Partial<Document>
  ): Promise<Document> {
    try {
      const { data, error } = await supabase
        .from("documents")
        .update({
          title: updates.title,
          category: updates.category,
          file_data: updates.fileData,
          file_name: updates.fileName,
          file_size: updates.fileSize,
          mime_type: updates.mimeType,
          expiry_date: updates.expiryDate?.toISOString(),
          issued_date: updates.issuedDate?.toISOString(),
          issuer: updates.issuer,
          document_number: updates.documentNumber,
          tags: updates.tags,
        })
        .eq("id", documentId)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update document: ${error.message}`);
      }

      return {
        id: data.id,
        title: data.title,
        category: data.category,
        fileData: data.file_data,
        fileName: data.file_name,
        fileSize: data.file_size,
        mimeType: data.mime_type,
        familyMemberId: data.family_member_id,
        propertyId: data.property_id,
        insurancePolicyId: data.insurance_policy_id,
        expiryDate: data.expiry_date ? new Date(data.expiry_date) : undefined,
        issuedDate: data.issued_date ? new Date(data.issued_date) : undefined,
        issuer: data.issuer,
        documentNumber: data.document_number,
        tags: data.tags || [],
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      };
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(documentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("documents")
        .delete()
        .eq("id", documentId);

      if (error) {
        throw new Error(`Failed to delete document: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  }

  /**
   * Delete an insurance policy
   */
  static async deleteInsurancePolicy(policyId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("insurance_policies")
        .delete()
        .eq("id", policyId);

      if (error) {
        throw new Error(`Failed to delete insurance policy: ${error.message}`);
      }
    } catch (error) {
      console.error("Error deleting insurance policy:", error);
      throw error;
    }
  }

  /**
   * Get document count for a specific family member
   */
  static async getDocumentCountByFamilyMember(
    familyMemberId: string
  ): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("documents")
        .select("*", { count: "exact", head: true })
        .eq("family_member_id", familyMemberId);

      if (error) {
        throw new Error(`Failed to fetch document count: ${error.message}`);
      }

      return count || 0;
    } catch (error) {
      console.error("Error fetching document count:", error);
      return 0;
    }
  }

  /**
   * Get insurance policy count for a specific family member
   */
  static async getInsurancePolicyCountByFamilyMember(
    familyMemberId: string
  ): Promise<number> {
    try {
      const { count, error } = await supabase
        .from("insurance_policies")
        .select("*", { count: "exact", head: true })
        .eq("family_member_id", familyMemberId);

      if (error) {
        throw new Error(
          `Failed to fetch insurance policy count: ${error.message}`
        );
      }

      return count || 0;
    } catch (error) {
      console.error("Error fetching insurance policy count:", error);
      return 0;
    }
  }

  /**
   * Get counts for multiple family members at once
   */
  static async getCountsForFamilyMembers(
    familyMemberIds: string[]
  ): Promise<Record<string, { documents: number; insurance: number }>> {
    try {
      const [documentsResult, insuranceResult] = await Promise.all([
        supabase
          .from("documents")
          .select("family_member_id")
          .in("family_member_id", familyMemberIds),
        supabase
          .from("insurance_policies")
          .select("family_member_id")
          .in("family_member_id", familyMemberIds),
      ]);

      if (documentsResult.error) {
        throw new Error(
          `Failed to fetch document counts: ${documentsResult.error.message}`
        );
      }

      if (insuranceResult.error) {
        throw new Error(
          `Failed to fetch insurance counts: ${insuranceResult.error.message}`
        );
      }

      // Count documents by family member
      const documentCounts: Record<string, number> = {};
      (documentsResult.data || []).forEach((doc: any) => {
        documentCounts[doc.family_member_id] =
          (documentCounts[doc.family_member_id] || 0) + 1;
      });

      // Count insurance policies by family member
      const insuranceCounts: Record<string, number> = {};
      (insuranceResult.data || []).forEach((policy: any) => {
        insuranceCounts[policy.family_member_id] =
          (insuranceCounts[policy.family_member_id] || 0) + 1;
      });

      // Combine results
      const result: Record<string, { documents: number; insurance: number }> =
        {};
      familyMemberIds.forEach((id) => {
        result[id] = {
          documents: documentCounts[id] || 0,
          insurance: insuranceCounts[id] || 0,
        };
      });

      return result;
    } catch (error) {
      console.error("Error fetching counts for family members:", error);
      // Return empty counts for all members
      const result: Record<string, { documents: number; insurance: number }> =
        {};
      familyMemberIds.forEach((id) => {
        result[id] = { documents: 0, insurance: 0 };
      });
      return result;
    }
  }
}
