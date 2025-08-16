import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { ApiService } from "@/services/ApiService";
import toast from "react-hot-toast";

/**
 * Custom hook for real-time data synchronization
 * Automatically updates data when changes occur in the database
 */

export function useRealTimeFamilyMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMembers = useCallback(async () => {
    try {
      const data = await ApiService.getFamilyMembers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to load family members:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial load
    loadMembers();

    // Set up real-time subscription
    const subscription = supabase
      .channel("family_members_changes")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "family_members",
        },
        (payload) => {
          console.log("Real-time update received:", payload);

          switch (payload.eventType) {
            case "INSERT":
              toast.success(
                `New family member added: ${payload.new.full_name}`
              );
              break;
            case "UPDATE":
              toast.info(`Family member updated: ${payload.new.full_name}`);
              break;
            case "DELETE":
              toast.error(`Family member deleted`);
              break;
          }

          // Reload data to get fresh state
          loadMembers();
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [loadMembers]);

  return { members, loading, refresh: loadMembers };
}

export function useRealTimeInsurancePolicies() {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPolicies = useCallback(async () => {
    try {
      const data = await ApiService.getInsurancePolicies();
      setPolicies(data);
    } catch (error) {
      console.error("Failed to load insurance policies:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicies();

    const subscription = supabase
      .channel("insurance_policies_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "insurance_policies",
        },
        (payload) => {
          console.log("Insurance policy real-time update:", payload);

          switch (payload.eventType) {
            case "INSERT":
              toast.success(
                `New insurance policy added: ${payload.new.policy_number}`
              );
              break;
            case "UPDATE":
              toast.info(
                `Insurance policy updated: ${payload.new.policy_number}`
              );
              break;
            case "DELETE":
              toast.error(`Insurance policy deleted`);
              break;
          }

          loadPolicies();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadPolicies]);

  return { policies, loading, refresh: loadPolicies };
}

export function useRealTimeProperties() {
  const [buildings, setBuildings] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [lands, setLands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProperties = useCallback(async () => {
    try {
      const [buildingsData, flatsData, landsData] = await Promise.all([
        ApiService.getBuildings(),
        ApiService.getFlats(),
        ApiService.getLands(),
      ]);
      setBuildings(buildingsData);
      setFlats(flatsData);
      setLands(landsData);
    } catch (error) {
      console.error("Failed to load properties:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProperties();

    // Subscribe to all property table changes
    const buildingsSubscription = supabase
      .channel("buildings_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "buildings" },
        (payload) => {
          console.log("Building real-time update:", payload);
          toast.info("Buildings updated");
          loadProperties();
        }
      )
      .subscribe();

    const flatsSubscription = supabase
      .channel("flats_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "flats" },
        (payload) => {
          console.log("Flat real-time update:", payload);
          toast.info("Flats updated");
          loadProperties();
        }
      )
      .subscribe();

    const landsSubscription = supabase
      .channel("lands_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lands" },
        (payload) => {
          console.log("Land real-time update:", payload);
          toast.info("Lands updated");
          loadProperties();
        }
      )
      .subscribe();

    return () => {
      buildingsSubscription.unsubscribe();
      flatsSubscription.unsubscribe();
      landsSubscription.unsubscribe();
    };
  }, [loadProperties]);

  return { buildings, flats, lands, loading, refresh: loadProperties };
}

export function useRealTimeDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = useCallback(async () => {
    try {
      const data = await ApiService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to load documents:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();

    const subscription = supabase
      .channel("documents_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "documents",
        },
        (payload) => {
          console.log("Document real-time update:", payload);

          switch (payload.eventType) {
            case "INSERT":
              toast.success(`New document added: ${payload.new.title}`);
              break;
            case "UPDATE":
              toast.info(`Document updated: ${payload.new.title}`);
              break;
            case "DELETE":
              toast.error(`Document deleted`);
              break;
          }

          loadDocuments();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [loadDocuments]);

  return { documents, loading, refresh: loadDocuments };
}
