import { Tenant, RentPayment, Document } from "@/types";
import { propertyService } from "./PropertyService";
import {
  LocalStorageService,
  LocalStorageError,
  LocalStorageErrorCodes,
} from "./LocalStorageService";

// Security Deposit Management interfaces
interface SecurityDeposit {
  id: string;
  tenantId: string;
  propertyId: string;
  amount: number;
  paidDate: Date;
  refundDate?: Date;
  refundAmount?: number;
  deductions: SecurityDepositDeduction[];
  status: "held" | "refunded" | "forfeited";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SecurityDepositDeduction {
  id: string;
  description: string;
  amount: number;
  category: "damage" | "cleaning" | "unpaid_rent" | "other";
  date: Date;
  documents: Document[];
}

/**
 * TenantService - Enhanced tenant management with security deposit tracking,
 * move-in/move-out functionality, and payment history
 */
export class TenantService {
  private static readonly KEYS = {
    SECURITY_DEPOSITS: "security_deposits",
    TENANT_PAYMENTS: "tenant_payments",
    TENANT_DOCUMENTS: "tenant_documents",
  } as const;

  private localStorageService: LocalStorageService;

  constructor() {
    this.localStorageService = new LocalStorageService();
  }

  // Security Deposit Management interfaces moved outside class

  // Get security deposits
  public getSecurityDeposits(): SecurityDeposit[] {
    return this.getFromStorage<SecurityDeposit>(
      TenantService.KEYS.SECURITY_DEPOSITS
    );
  }

  public getSecurityDepositByTenantId(
    tenantId: string
  ): SecurityDeposit | null {
    const deposits = this.getSecurityDeposits();
    return deposits.find((deposit) => deposit.tenantId === tenantId) || null;
  }

  public recordSecurityDeposit(
    deposit: Omit<SecurityDeposit, "id" | "createdAt" | "updatedAt">
  ): void {
    const newDeposit: SecurityDeposit = {
      ...deposit,
      id: `deposit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const deposits = this.getSecurityDeposits();
    deposits.push(newDeposit);
    this.saveToStorage(TenantService.KEYS.SECURITY_DEPOSITS, deposits);
  }

  public addSecurityDepositDeduction(
    tenantId: string,
    deduction: Omit<SecurityDepositDeduction, "id">
  ): void {
    const deposits = this.getSecurityDeposits();
    const depositIndex = deposits.findIndex((d) => d.tenantId === tenantId);

    if (depositIndex === -1) {
      throw new LocalStorageError(
        `Security deposit not found for tenant ${tenantId}`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const newDeduction: SecurityDepositDeduction = {
      ...deduction,
      id: `deduction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    deposits[depositIndex].deductions.push(newDeduction);
    deposits[depositIndex].updatedAt = new Date();

    this.saveToStorage(TenantService.KEYS.SECURITY_DEPOSITS, deposits);
  }

  public refundSecurityDeposit(
    tenantId: string,
    refundAmount: number,
    notes?: string
  ): void {
    const deposits = this.getSecurityDeposits();
    const depositIndex = deposits.findIndex((d) => d.tenantId === tenantId);

    if (depositIndex === -1) {
      throw new LocalStorageError(
        `Security deposit not found for tenant ${tenantId}`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    deposits[depositIndex].refundDate = new Date();
    deposits[depositIndex].refundAmount = refundAmount;
    deposits[depositIndex].status = "refunded";
    deposits[depositIndex].notes = notes;
    deposits[depositIndex].updatedAt = new Date();

    this.saveToStorage(TenantService.KEYS.SECURITY_DEPOSITS, deposits);
  }

  // Move-in/Move-out Management
  public processTenantMoveIn(
    tenantId: string,
    propertyId: string,
    propertyType: "building" | "flat" | "land",
    unitId?: string
  ): void {
    const tenant = propertyService.getTenantById(tenantId);
    if (!tenant) {
      throw new LocalStorageError(
        `Tenant with id "${tenantId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    // Update tenant status
    propertyService.updateTenant(tenantId, {
      isActive: true,
      moveInDate: new Date(),
      moveOutDate: undefined,
    });

    // Update property occupancy
    if (propertyType === "building" && unitId) {
      const building = propertyService.getBuildingById(propertyId);
      if (building) {
        const apartment = building.apartments?.find((apt) => apt.id === unitId);
        if (apartment) {
          propertyService.updateApartment(unitId, {
            currentTenant: tenant,
            isOccupied: true,
          });
        }
      }
    } else if (propertyType === "flat") {
      propertyService.updateFlat(propertyId, {
        currentTenant: tenant,
        isOccupied: true,
      });
    } else if (propertyType === "land") {
      propertyService.updateLand(propertyId, {
        currentTenant: tenant,
        isLeased: true,
      });
    }

    // Record security deposit if applicable
    if (tenant.rentalAgreement.securityDeposit > 0) {
      this.recordSecurityDeposit({
        tenantId,
        propertyId,
        amount: tenant.rentalAgreement.securityDeposit,
        paidDate: new Date(),
        deductions: [],
        status: "held",
      });
    }
  }

  public processTenantMoveOut(
    tenantId: string,
    propertyId: string,
    propertyType: "building" | "flat" | "land",
    unitId?: string,
    moveOutDate?: Date
  ): void {
    const tenant = propertyService.getTenantById(tenantId);
    if (!tenant) {
      throw new LocalStorageError(
        `Tenant with id "${tenantId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    // Update tenant status
    propertyService.updateTenant(tenantId, {
      isActive: false,
      moveOutDate: moveOutDate || new Date(),
    });

    // Update property occupancy
    if (propertyType === "building" && unitId) {
      propertyService.updateApartment(unitId, {
        currentTenant: undefined,
        isOccupied: false,
      });
    } else if (propertyType === "flat") {
      propertyService.updateFlat(propertyId, {
        currentTenant: undefined,
        isOccupied: false,
      });
    } else if (propertyType === "land") {
      propertyService.updateLand(propertyId, {
        currentTenant: undefined,
        isLeased: false,
      });
    }
  }

  // Tenant Payment History
  public getTenantPaymentHistory(tenantId: string): RentPayment[] {
    const allPayments = this.getFromStorage<RentPayment>(
      TenantService.KEYS.TENANT_PAYMENTS
    );
    return allPayments.filter((payment) => payment.tenantId === tenantId);
  }

  public recordTenantPayment(payment: Omit<RentPayment, "id">): void {
    const newPayment: RentPayment = {
      ...payment,
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const payments = this.getFromStorage<RentPayment>(
      TenantService.KEYS.TENANT_PAYMENTS
    );
    payments.push(newPayment);
    this.saveToStorage(TenantService.KEYS.TENANT_PAYMENTS, payments);
  }

  // Tenant Document Management
  public getTenantDocuments(tenantId: string): Document[] {
    const tenant = propertyService.getTenantById(tenantId);
    return tenant?.documents || [];
  }

  public addTenantDocument(tenantId: string, document: Document): void {
    const tenant = propertyService.getTenantById(tenantId);
    if (!tenant) {
      throw new LocalStorageError(
        `Tenant with id "${tenantId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedDocuments = [...tenant.documents, document];
    propertyService.updateTenant(tenantId, {
      documents: updatedDocuments,
    });
  }

  public removeTenantDocument(tenantId: string, documentId: string): void {
    const tenant = propertyService.getTenantById(tenantId);
    if (!tenant) {
      throw new LocalStorageError(
        `Tenant with id "${tenantId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedDocuments = tenant.documents.filter(
      (doc) => doc.id !== documentId
    );
    propertyService.updateTenant(tenantId, {
      documents: updatedDocuments,
    });
  }

  // Tenant Analytics and Reports
  public getTenantAnalytics(tenantId: string): {
    totalRentPaid: number;
    averageMonthlyRent: number;
    paymentHistory: RentPayment[];
    securityDepositStatus: SecurityDeposit | null;
    tenancyDuration: number; // in days
    documentCount: number;
    referenceCount: number;
  } {
    const tenant = propertyService.getTenantById(tenantId);
    if (!tenant) {
      throw new LocalStorageError(
        `Tenant with id "${tenantId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const paymentHistory = this.getTenantPaymentHistory(tenantId);
    const totalRentPaid = paymentHistory
      .filter((payment) => payment.status === "paid")
      .reduce((sum, payment) => sum + payment.amount, 0);

    const averageMonthlyRent =
      paymentHistory.length > 0
        ? totalRentPaid / paymentHistory.length
        : tenant.rentalAgreement.rentAmount;

    const securityDepositStatus = this.getSecurityDepositByTenantId(tenantId);

    const moveInDate = new Date(tenant.moveInDate);
    const endDate = tenant.moveOutDate
      ? new Date(tenant.moveOutDate)
      : new Date();
    const tenancyDuration = Math.ceil(
      (endDate.getTime() - moveInDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      totalRentPaid,
      averageMonthlyRent,
      paymentHistory,
      securityDepositStatus,
      tenancyDuration,
      documentCount: tenant.documents.length,
      referenceCount: tenant.references.length,
    };
  }

  // Tenant Search and Filtering
  public searchTenants(query: string): Tenant[] {
    const allTenants = propertyService.getTenants();
    const searchTerm = query.toLowerCase();

    return allTenants.filter(
      (tenant) =>
        tenant.personalInfo.fullName.toLowerCase().includes(searchTerm) ||
        tenant.personalInfo.occupation.toLowerCase().includes(searchTerm) ||
        tenant.contactInfo.phone.includes(searchTerm) ||
        tenant.contactInfo.email?.toLowerCase().includes(searchTerm) ||
        tenant.rentalAgreement.agreementNumber
          .toLowerCase()
          .includes(searchTerm) ||
        tenant.identification.aadharNumber?.includes(searchTerm) ||
        tenant.identification.panNumber?.toLowerCase().includes(searchTerm)
    );
  }

  public getTenantsWithExpiringAgreements(daysAhead: number = 30): Tenant[] {
    const allTenants = propertyService.getTenants();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() + daysAhead);

    return allTenants.filter((tenant) => {
      const endDate = new Date(tenant.rentalAgreement.endDate);
      return endDate <= cutoffDate && tenant.isActive;
    });
  }

  public getOverdueRentTenants(): Array<{
    tenant: Tenant;
    daysPastDue: number;
    overdueAmount: number;
  }> {
    const allTenants = propertyService.getTenants();
    const today = new Date();
    const overdueResults: Array<{
      tenant: Tenant;
      daysPastDue: number;
      overdueAmount: number;
    }> = [];

    allTenants.forEach((tenant) => {
      if (!tenant.isActive) return;

      const rentDueDate = tenant.rentalAgreement.rentDueDate;
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();

      // Calculate the due date for current month
      const dueDate = new Date(currentYear, currentMonth, rentDueDate);

      if (today > dueDate) {
        const paymentHistory = this.getTenantPaymentHistory(tenant.id);
        const currentMonthPayment = paymentHistory.find((payment) => {
          const paymentDate = new Date(payment.dueDate);
          return (
            paymentDate.getMonth() === currentMonth &&
            paymentDate.getFullYear() === currentYear
          );
        });

        if (!currentMonthPayment || currentMonthPayment.status !== "paid") {
          const daysPastDue = Math.ceil(
            (today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          const overdueAmount = tenant.rentalAgreement.rentAmount;

          overdueResults.push({
            tenant,
            daysPastDue,
            overdueAmount,
          });
        }
      }
    });

    return overdueResults.sort((a, b) => b.daysPastDue - a.daysPastDue);
  }

  // Utility methods
  private getFromStorage<T>(key: string): T[] {
    try {
      const item = localStorage.getItem(key);
      if (!item) return [];
      return JSON.parse(item, this.dateReviver);
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error);
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data, this.dateReplacer));
    } catch (error) {
      if (error instanceof DOMException && error.code === 22) {
        throw new LocalStorageError(
          "Storage quota exceeded",
          LocalStorageErrorCodes.QUOTA_EXCEEDED
        );
      }
      throw error;
    }
  }

  private dateReplacer(key: string, value: any): any {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }
    return value;
  }

  private dateReviver(key: string, value: any): any {
    if (
      typeof value === "object" &&
      value !== null &&
      value.__type === "Date"
    ) {
      return new Date(value.value);
    }
    return value;
  }

  // Data Export/Import
  public exportTenantData(): {
    tenants: Tenant[];
    securityDeposits: SecurityDeposit[];
    payments: RentPayment[];
    exportDate: string;
  } {
    return {
      tenants: propertyService.getTenants(),
      securityDeposits: this.getSecurityDeposits(),
      payments: this.getFromStorage<RentPayment>(
        TenantService.KEYS.TENANT_PAYMENTS
      ),
      exportDate: new Date().toISOString(),
    };
  }

  public importTenantData(data: {
    tenants?: Tenant[];
    securityDeposits?: SecurityDeposit[];
    payments?: RentPayment[];
  }): void {
    if (data.securityDeposits) {
      this.saveToStorage(
        TenantService.KEYS.SECURITY_DEPOSITS,
        data.securityDeposits
      );
    }
    if (data.payments) {
      this.saveToStorage(TenantService.KEYS.TENANT_PAYMENTS, data.payments);
    }
    // Tenants are handled by PropertyService
  }

  public clearAllTenantData(): void {
    Object.values(TenantService.KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
export const tenantService = new TenantService();
