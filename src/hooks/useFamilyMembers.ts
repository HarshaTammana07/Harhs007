import { useState, useEffect, useCallback } from "react";
import { FamilyMember } from "@/types";
import { ApiService } from "@/services/ApiService";
import toast from "react-hot-toast";

/**
 * Custom hook for family members management with reliable state updates
 * This hook ensures immediate UI updates after CRUD operations
 */
export function useFamilyMembers() {
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ApiService.getFamilyMembers();
      setMembers(data);
    } catch (err) {
      console.error("Failed to load family members:", err);
      setError("Failed to load family members. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createMember = useCallback(async (memberData: any) => {
    try {
      const newMember = await ApiService.createFamilyMember(memberData);
      setMembers((prev) => [newMember, ...prev]);
      toast.success("Family member added successfully!");
      return newMember;
    } catch (err) {
      console.error("Failed to create family member:", err);
      toast.error("Failed to add family member");
      throw err;
    }
  }, []);

  const updateMember = useCallback(async (id: string, updates: any) => {
    try {
      const updatedMember = await ApiService.updateFamilyMember(id, updates);
      setMembers((prev) =>
        prev.map((member) => (member.id === id ? updatedMember : member))
      );
      toast.success("Family member updated successfully!");
      return updatedMember;
    } catch (err) {
      console.error("Failed to update family member:", err);
      toast.error("Failed to update family member");
      throw err;
    }
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    try {
      await ApiService.deleteFamilyMember(id);
      setMembers((prev) => prev.filter((member) => member.id !== id));
      toast.success("Family member deleted successfully!");
    } catch (err) {
      console.error("Failed to delete family member:", err);
      toast.error("Failed to delete family member");
      throw err;
    }
  }, []);

  const refresh = useCallback(() => {
    loadMembers();
  }, [loadMembers]);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  return {
    members,
    loading,
    error,
    createMember,
    updateMember,
    deleteMember,
    refresh,
  };
}
