import { InsurancePolicy, PremiumPayment } from "@/types";
import { LocalStorageService } from "./LocalStorageService";

export class InsuranceService {
  private localStorageService: LocalStorageService;

  constructor() {
    this.localStorageService = new LocalStorageService();
  }

  // Get all insurance policies
  getAllPolicies(): InsurancePolicy[] {
    return this.localStorageService.getInsurancePolicies();
  }

  // Get policies by type
  getPoliciesByType(type: InsurancePolicy["type"]): InsurancePolicy[] {
    return this.getAllPolicies().filter((policy) => policy.type === type);
  }

  // Get policy by ID
  getPolicyById(id: string): InsurancePolicy | null {
    return this.getAllPolicies().find((policy) => policy.id === id) || null;
  }

  // Create new policy
  createPolicy(
    policyData: Omit<InsurancePolicy, "id" | "premiumHistory">
  ): InsurancePolicy {
    const newPolicy: InsurancePolicy = {
      ...policyData,
      id: this.generateId(),
      premiumHistory: [],
    };

    this.localStorageService.saveInsurancePolicy(newPolicy);
    return newPolicy;
  }

  // Update existing policy
  updatePolicy(
    id: string,
    updates: Partial<InsurancePolicy>
  ): InsurancePolicy | null {
    const existingPolicy = this.getPolicyById(id);
    if (!existingPolicy) return null;

    const updatedPolicy = { ...existingPolicy, ...updates };
    this.localStorageService.updateInsurancePolicy(id, updatedPolicy);
    return updatedPolicy;
  }

  // Delete policy
  deletePolicy(id: string): boolean {
    const policy = this.getPolicyById(id);
    if (!policy) return false;

    this.localStorageService.deleteInsurancePolicy(id);
    return true;
  }

  // Add premium payment
  addPremiumPayment(
    policyId: string,
    payment: Omit<PremiumPayment, "id">
  ): boolean {
    const policy = this.getPolicyById(policyId);
    if (!policy) return false;

    const newPayment: PremiumPayment = {
      ...payment,
      id: this.generateId(),
    };

    policy.premiumHistory.push(newPayment);
    this.updatePolicy(policyId, { premiumHistory: policy.premiumHistory });
    return true;
  }

  // Get policies expiring soon (within days)
  getPoliciesExpiringSoon(days: number = 30): InsurancePolicy[] {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    return this.getAllPolicies().filter((policy) => {
      const renewalDate = new Date(policy.renewalDate);
      return renewalDate >= today && renewalDate <= futureDate;
    });
  }

  // Get expired policies
  getExpiredPolicies(): InsurancePolicy[] {
    const today = new Date();
    return this.getAllPolicies().filter((policy) => {
      const renewalDate = new Date(policy.renewalDate);
      return renewalDate < today;
    });
  }

  // Get policy statistics by type
  getPolicyStatsByType(): Record<
    "car" | "bike" | "LIC" | "health",
    { count: number; expiringSoon: number; expired: number }
  > {
    const types: ("car" | "bike" | "LIC" | "health")[] = [
      "car",
      "bike",
      "LIC",
      "health",
    ];
    const stats: Record<
      "car" | "bike" | "LIC" | "health",
      { count: number; expiringSoon: number; expired: number }
    > = {
      car: { count: 0, expiringSoon: 0, expired: 0 },
      bike: { count: 0, expiringSoon: 0, expired: 0 },
      LIC: { count: 0, expiringSoon: 0, expired: 0 },
      health: { count: 0, expiringSoon: 0, expired: 0 },
    };

    const expiringSoon = this.getPoliciesExpiringSoon();
    const expired = this.getExpiredPolicies();

    types.forEach((type) => {
      stats[type].count = this.getPoliciesByType(type).length;
      stats[type].expiringSoon = expiringSoon.filter(
        (p) => p.type === type
      ).length;
      stats[type].expired = expired.filter((p) => p.type === type).length;
    });

    return stats;
  }

  // Calculate days until renewal
  getDaysUntilRenewal(policy: InsurancePolicy): number {
    const today = new Date();
    const renewalDate = new Date(policy.renewalDate);
    const diffTime = renewalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Update policy status based on renewal date
  updatePolicyStatus(policy: InsurancePolicy): InsurancePolicy["status"] {
    const daysUntilRenewal = this.getDaysUntilRenewal(policy);

    if (daysUntilRenewal < 0) {
      return "expired";
    } else if (daysUntilRenewal <= 30) {
      return "active"; // Still active but expiring soon
    } else {
      return "active";
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

export const insuranceService = new InsuranceService();
