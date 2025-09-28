import { useState, useEffect } from "react";
import { FamilyApiService } from "@/services/FamilyApiService";

export interface FamilyMemberCounts {
  documents: number;
  insurance: number;
}

export function useFamilyMemberCounts(familyMemberIds: string[]) {
  const [counts, setCounts] = useState<Record<string, FamilyMemberCounts>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (familyMemberIds.length === 0) {
      setCounts({});
      return;
    }

    const loadCounts = async () => {
      try {
        setLoading(true);
        setError(null);
        const countsData = await FamilyApiService.getCountsForFamilyMembers(familyMemberIds);
        setCounts(countsData);
      } catch (err) {
        console.error("Error loading family member counts:", err);
        setError(err instanceof Error ? err.message : "Failed to load counts");
        // Set empty counts for all members on error
        const emptyCounts: Record<string, FamilyMemberCounts> = {};
        familyMemberIds.forEach((id) => {
          emptyCounts[id] = { documents: 0, insurance: 0 };
        });
        setCounts(emptyCounts);
      } finally {
        setLoading(false);
      }
    };

    loadCounts();
  }, [familyMemberIds]);

  const getCountsForMember = (familyMemberId: string): FamilyMemberCounts => {
    return counts[familyMemberId] || { documents: 0, insurance: 0 };
  };

  const refreshCounts = async () => {
    if (familyMemberIds.length === 0) return;
    
    try {
      setLoading(true);
      const countsData = await FamilyApiService.getCountsForFamilyMembers(familyMemberIds);
      setCounts(countsData);
    } catch (err) {
      console.error("Error refreshing counts:", err);
      setError(err instanceof Error ? err.message : "Failed to refresh counts");
    } finally {
      setLoading(false);
    }
  };

  return {
    counts,
    loading,
    error,
    getCountsForMember,
    refreshCounts,
  };
}