import {
  RentPayment,
  RentReceipt,
  RentCollectionReport,
  PropertyRentBreakdown,
  TenantRentBreakdown,
  PaymentMethodBreakdown,
  Tenant,
  Building,
  Flat,
  Land,
} from "@/types";
import { propertyService } from "./PropertyService";
import { tenantService } from "./TenantService";
import {
  LocalStorageService,
  LocalStorageError,
  LocalStorageErrorCodes,
} from "./LocalStorageService";

/**
 * RentPaymentService - Comprehensive rent payment and financial management
 * Handles rent payments, receipts, reports, and analytics
 */
export class RentPaymentService {
  private static readonly KEYS = {
    RENT_PAYMENTS: "rent_payments",
    RENT_RECEIPTS: "rent_receipts",
    RENT_REPORTS: "rent_reports",
  } as const;

  private localStorageService: LocalStorageService;

  constructor() {
    this.localStorageService = new LocalStorageService();
  }

  // Rent Payment CRUD Operations
  public getRentPayments(): RentPayment[] {
    return this.getFromStorage<RentPayment>(
      RentPaymentService.KEYS.RENT_PAYMENTS
    );
  }

  public getRentPaymentById(id: string): RentPayment | null {
    const payments = this.getRentPayments();
    return payments.find((payment) => payment.id === id) || null;
  }

  public getRentPaymentsByTenant(tenantId: string): RentPayment[] {
    const payments = this.getRentPayments();
    return payments.filter((payment) => payment.tenantId === tenantId);
  }

  public getRentPaymentsByProperty(
    propertyId: string,
    unitId?: string
  ): RentPayment[] {
    const payments = this.getRentPayments();
    return payments.filter((payment) => {
      if (unitId) {
        return payment.propertyId === propertyId && payment.unitId === unitId;
      }
      return payment.propertyId === propertyId;
    });
  }

  public recordRentPayment(
    payment: Omit<RentPayment, "id" | "createdAt" | "updatedAt">
  ): RentPayment {
    this.validateRentPayment(payment);

    const newPayment: RentPayment = {
      ...payment,
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      receiptNumber: this.generateReceiptNumber(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const payments = this.getRentPayments();
    payments.push(newPayment);
    this.saveToStorage(RentPaymentService.KEYS.RENT_PAYMENTS, payments);

    // Generate receipt if payment is completed
    if (newPayment.status === "paid") {
      this.generateRentReceipt(newPayment.id);
    }

    return newPayment;
  }

  public updateRentPayment(
    id: string,
    updates: Partial<RentPayment>
  ): RentPayment {
    const payments = this.getRentPayments();
    const index = payments.findIndex((payment) => payment.id === id);

    if (index === -1) {
      throw new LocalStorageError(
        `Rent payment with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const updatedPayment = {
      ...payments[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.validateRentPayment(updatedPayment);
    payments[index] = updatedPayment;
    this.saveToStorage(RentPaymentService.KEYS.RENT_PAYMENTS, payments);

    // Generate receipt if payment status changed to paid
    if (
      updates.status === "paid" &&
      payments[index].status !== "paid" &&
      updatedPayment.paidDate
    ) {
      this.generateRentReceipt(updatedPayment.id);
    }

    return updatedPayment;
  }

  public deleteRentPayment(id: string): void {
    const payments = this.getRentPayments();
    const filteredPayments = payments.filter((payment) => payment.id !== id);

    if (payments.length === filteredPayments.length) {
      throw new LocalStorageError(
        `Rent payment with id "${id}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    // Also delete associated receipt
    const receipts = this.getRentReceipts();
    const filteredReceipts = receipts.filter(
      (receipt) => receipt.paymentId !== id
    );
    this.saveToStorage(RentPaymentService.KEYS.RENT_RECEIPTS, filteredReceipts);

    this.saveToStorage(RentPaymentService.KEYS.RENT_PAYMENTS, filteredPayments);
  }

  // Rent Receipt Management
  public getRentReceipts(): RentReceipt[] {
    return this.getFromStorage<RentReceipt>(
      RentPaymentService.KEYS.RENT_RECEIPTS
    );
  }

  public getRentReceiptById(id: string): RentReceipt | null {
    const receipts = this.getRentReceipts();
    return receipts.find((receipt) => receipt.id === id) || null;
  }

  public getRentReceiptByPaymentId(paymentId: string): RentReceipt | null {
    const receipts = this.getRentReceipts();
    return receipts.find((receipt) => receipt.paymentId === paymentId) || null;
  }

  public generateRentReceipt(paymentId: string): RentReceipt {
    const payment = this.getRentPaymentById(paymentId);
    if (!payment) {
      throw new LocalStorageError(
        `Payment with id "${paymentId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    if (payment.status !== "paid" || !payment.paidDate) {
      throw new LocalStorageError(
        "Cannot generate receipt for unpaid payment",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }

    const tenant = propertyService.getTenantById(payment.tenantId);
    if (!tenant) {
      throw new LocalStorageError(
        `Tenant with id "${payment.tenantId}" not found`,
        LocalStorageErrorCodes.NOT_FOUND
      );
    }

    const propertyInfo = this.getPropertyInfo(
      payment.propertyId,
      payment.propertyType,
      payment.unitId
    );

    const receipt: RentReceipt = {
      id: `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      receiptNumber: payment.receiptNumber || this.generateReceiptNumber(),
      paymentId: payment.id,
      tenantId: payment.tenantId,
      propertyId: payment.propertyId,
      propertyType: payment.propertyType,
      unitId: payment.unitId,
      tenantName: tenant.personalInfo.fullName,
      propertyAddress: propertyInfo.address,
      rentPeriod: this.calculateRentPeriod(payment.dueDate),
      amount: payment.amount,
      lateFee: payment.lateFee || 0,
      discount: payment.discount || 0,
      totalAmount: payment.actualAmountPaid || payment.amount,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      paidDate: payment.paidDate,
      generatedDate: new Date(),
      generatedBy: "System", // Could be enhanced to track actual user
    };

    const receipts = this.getRentReceipts();
    receipts.push(receipt);
    this.saveToStorage(RentPaymentService.KEYS.RENT_RECEIPTS, receipts);

    return receipt;
  }

  // Payment Status Management
  public markPaymentAsPaid(
    paymentId: string,
    paidDate: Date,
    paymentMethod: string,
    transactionId?: string,
    actualAmountPaid?: number
  ): RentPayment {
    return this.updateRentPayment(paymentId, {
      status: "paid",
      paidDate,
      paymentMethod,
      transactionId,
      actualAmountPaid,
    });
  }

  public markPaymentAsOverdue(paymentId: string): RentPayment {
    return this.updateRentPayment(paymentId, {
      status: "overdue",
    });
  }

  // Automatic Payment Generation
  public generateMonthlyRentPayments(
    month: number,
    year: number
  ): RentPayment[] {
    const generatedPayments: RentPayment[] = [];
    const allTenants = propertyService.getTenants();
    const activeTenants = allTenants.filter((tenant) => tenant.isActive);

    activeTenants.forEach((tenant) => {
      const propertyInfo = this.findTenantProperty(tenant.id);
      if (!propertyInfo) return;

      const dueDate = new Date(year, month, tenant.rentalAgreement.rentDueDate);

      // Check if payment already exists for this period
      const existingPayment = this.getRentPaymentsByTenant(tenant.id).find(
        (payment) => {
          const paymentDueDate = new Date(payment.dueDate);
          return (
            paymentDueDate.getMonth() === month &&
            paymentDueDate.getFullYear() === year
          );
        }
      );

      if (!existingPayment) {
        const payment = this.recordRentPayment({
          tenantId: tenant.id,
          propertyId: propertyInfo.propertyId,
          propertyType: propertyInfo.propertyType,
          unitId: propertyInfo.unitId,
          amount: tenant.rentalAgreement.rentAmount,
          dueDate,
          status: "pending",
          paymentMethod: tenant.rentalAgreement.paymentMethod,
        });
        generatedPayments.push(payment);
      }
    });

    return generatedPayments;
  }

  // Overdue Payment Management
  public updateOverduePayments(): RentPayment[] {
    const payments = this.getRentPayments();
    const today = new Date();
    const updatedPayments: RentPayment[] = [];

    payments.forEach((payment) => {
      if (payment.status === "pending" && new Date(payment.dueDate) < today) {
        const updatedPayment = this.updateRentPayment(payment.id, {
          status: "overdue",
        });
        updatedPayments.push(updatedPayment);
      }
    });

    return updatedPayments;
  }

  public getOverduePayments(): RentPayment[] {
    const payments = this.getRentPayments();
    return payments.filter((payment) => payment.status === "overdue");
  }

  public getUpcomingPayments(daysAhead: number = 7): RentPayment[] {
    const payments = this.getRentPayments();
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);

    return payments.filter((payment) => {
      const dueDate = new Date(payment.dueDate);
      return (
        payment.status === "pending" &&
        dueDate >= today &&
        dueDate <= futureDate
      );
    });
  }

  // Rent Collection Reports
  public generateRentCollectionReport(
    startDate: Date,
    endDate: Date,
    reportType: "monthly" | "quarterly" | "yearly" | "custom" = "custom"
  ): RentCollectionReport {
    const payments = this.getRentPayments().filter((payment) => {
      const dueDate = new Date(payment.dueDate);
      return dueDate >= startDate && dueDate <= endDate;
    });

    const totalExpectedRent = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const totalCollectedRent = payments
      .filter((payment) => payment.status === "paid")
      .reduce(
        (sum, payment) => sum + (payment.actualAmountPaid || payment.amount),
        0
      );
    const totalOutstandingRent = totalExpectedRent - totalCollectedRent;
    const collectionRate =
      totalExpectedRent > 0
        ? (totalCollectedRent / totalExpectedRent) * 100
        : 0;

    const propertyBreakdown = this.generatePropertyBreakdown(payments);
    const tenantBreakdown = this.generateTenantBreakdown(payments);
    const paymentMethodBreakdown =
      this.generatePaymentMethodBreakdown(payments);

    const report: RentCollectionReport = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reportType,
      period: { startDate, endDate },
      totalExpectedRent,
      totalCollectedRent,
      totalOutstandingRent,
      collectionRate: Math.round(collectionRate * 100) / 100,
      propertyBreakdown,
      tenantBreakdown,
      paymentMethodBreakdown,
      generatedDate: new Date(),
      generatedBy: "System",
    };

    // Save report
    const reports = this.getFromStorage<RentCollectionReport>(
      RentPaymentService.KEYS.RENT_REPORTS
    );
    reports.push(report);
    this.saveToStorage(RentPaymentService.KEYS.RENT_REPORTS, reports);

    return report;
  }

  public getRentCollectionReports(): RentCollectionReport[] {
    return this.getFromStorage<RentCollectionReport>(
      RentPaymentService.KEYS.RENT_REPORTS
    );
  }

  // Analytics and Statistics
  public getRentAnalytics(
    startDate?: Date,
    endDate?: Date
  ): {
    totalProperties: number;
    totalTenants: number;
    totalExpectedRent: number;
    totalCollectedRent: number;
    totalOutstandingRent: number;
    collectionRate: number;
    averageRentPerProperty: number;
    overduePaymentsCount: number;
    upcomingPaymentsCount: number;
    paymentMethodStats: PaymentMethodBreakdown[];
  } {
    let payments = this.getRentPayments();

    if (startDate && endDate) {
      payments = payments.filter((payment) => {
        const dueDate = new Date(payment.dueDate);
        return dueDate >= startDate && dueDate <= endDate;
      });
    }

    const totalExpectedRent = payments.reduce(
      (sum, payment) => sum + payment.amount,
      0
    );
    const totalCollectedRent = payments
      .filter((payment) => payment.status === "paid")
      .reduce(
        (sum, payment) => sum + (payment.actualAmountPaid || payment.amount),
        0
      );
    const totalOutstandingRent = totalExpectedRent - totalCollectedRent;
    const collectionRate =
      totalExpectedRent > 0
        ? (totalCollectedRent / totalExpectedRent) * 100
        : 0;

    const uniqueProperties = new Set(payments.map((p) => p.propertyId)).size;
    const uniqueTenants = new Set(payments.map((p) => p.tenantId)).size;
    const averageRentPerProperty =
      uniqueProperties > 0 ? totalExpectedRent / uniqueProperties : 0;

    const overduePaymentsCount = payments.filter(
      (payment) => payment.status === "overdue"
    ).length;
    const upcomingPaymentsCount = this.getUpcomingPayments().length;

    const paymentMethodStats = this.generatePaymentMethodBreakdown(payments);

    return {
      totalProperties: uniqueProperties,
      totalTenants: uniqueTenants,
      totalExpectedRent,
      totalCollectedRent,
      totalOutstandingRent,
      collectionRate: Math.round(collectionRate * 100) / 100,
      averageRentPerProperty: Math.round(averageRentPerProperty * 100) / 100,
      overduePaymentsCount,
      upcomingPaymentsCount,
      paymentMethodStats,
    };
  }

  // Private helper methods
  private validateRentPayment(payment: Partial<RentPayment>): void {
    if (
      !payment.tenantId ||
      !payment.propertyId ||
      !payment.amount ||
      !payment.dueDate
    ) {
      throw new LocalStorageError(
        "Rent payment must have tenantId, propertyId, amount, and dueDate",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }

    if (payment.amount <= 0) {
      throw new LocalStorageError(
        "Rent payment amount must be positive",
        LocalStorageErrorCodes.VALIDATION_ERROR
      );
    }
  }

  private generateReceiptNumber(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const time = String(now.getTime()).slice(-6);
    return `RCP-${year}${month}${day}-${time}`;
  }

  private calculateRentPeriod(dueDate: Date): {
    startDate: Date;
    endDate: Date;
  } {
    const endDate = new Date(dueDate);
    const startDate = new Date(endDate);
    startDate.setMonth(startDate.getMonth() - 1);
    startDate.setDate(startDate.getDate() + 1);
    return { startDate, endDate };
  }

  private getPropertyInfo(
    propertyId: string,
    propertyType: "building" | "flat" | "land",
    unitId?: string
  ): { address: string; name: string } {
    if (propertyType === "building") {
      const building = propertyService.getBuildingById(propertyId);
      if (building && unitId) {
        const apartment = building.apartments?.find((apt) => apt.id === unitId);
        return {
          address: `${building.address}, Apt ${apartment?.doorNumber || ""}`,
          name: `${building.name} - ${apartment?.doorNumber || ""}`,
        };
      }
      return { address: building?.address || "", name: building?.name || "" };
    } else if (propertyType === "flat") {
      const flat = propertyService.getFlatById(propertyId);
      return { address: flat?.address || "", name: flat?.name || "" };
    } else if (propertyType === "land") {
      const land = propertyService.getLandById(propertyId);
      return { address: land?.address || "", name: land?.name || "" };
    }
    return { address: "", name: "" };
  }

  private findTenantProperty(tenantId: string): {
    propertyId: string;
    propertyType: "building" | "flat" | "land";
    unitId?: string;
  } | null {
    // Check buildings
    const buildings = propertyService.getBuildings();
    for (const building of buildings) {
      if (building.apartments) {
        for (const apartment of building.apartments) {
          if (apartment.currentTenant?.id === tenantId) {
            return {
              propertyId: building.id,
              propertyType: "building",
              unitId: apartment.id,
            };
          }
        }
      }
    }

    // Check flats
    const flats = propertyService.getFlats();
    for (const flat of flats) {
      if (flat.currentTenant?.id === tenantId) {
        return {
          propertyId: flat.id,
          propertyType: "flat",
        };
      }
    }

    // Check lands
    const lands = propertyService.getLands();
    for (const land of lands) {
      if (land.currentTenant?.id === tenantId) {
        return {
          propertyId: land.id,
          propertyType: "land",
        };
      }
    }

    return null;
  }

  private generatePropertyBreakdown(
    payments: RentPayment[]
  ): PropertyRentBreakdown[] {
    const propertyMap = new Map<string, PropertyRentBreakdown>();

    payments.forEach((payment) => {
      const key = `${payment.propertyId}-${payment.unitId || ""}`;
      const propertyInfo = this.getPropertyInfo(
        payment.propertyId,
        payment.propertyType,
        payment.unitId
      );

      if (!propertyMap.has(key)) {
        propertyMap.set(key, {
          propertyId: payment.propertyId,
          propertyName: propertyInfo.name,
          propertyType: payment.propertyType,
          expectedRent: 0,
          collectedRent: 0,
          outstandingRent: 0,
          collectionRate: 0,
          tenantCount: new Set<string>().size,
        });
      }

      const breakdown = propertyMap.get(key)!;
      breakdown.expectedRent += payment.amount;
      if (payment.status === "paid") {
        breakdown.collectedRent += payment.actualAmountPaid || payment.amount;
      }
    });

    // Calculate derived values
    propertyMap.forEach((breakdown) => {
      breakdown.outstandingRent =
        breakdown.expectedRent - breakdown.collectedRent;
      breakdown.collectionRate =
        breakdown.expectedRent > 0
          ? (breakdown.collectedRent / breakdown.expectedRent) * 100
          : 0;
      breakdown.collectionRate =
        Math.round(breakdown.collectionRate * 100) / 100;
    });

    return Array.from(propertyMap.values());
  }

  private generateTenantBreakdown(
    payments: RentPayment[]
  ): TenantRentBreakdown[] {
    const tenantMap = new Map<string, TenantRentBreakdown>();

    payments.forEach((payment) => {
      if (!tenantMap.has(payment.tenantId)) {
        const tenant = propertyService.getTenantById(payment.tenantId);
        const propertyInfo = this.getPropertyInfo(
          payment.propertyId,
          payment.propertyType,
          payment.unitId
        );

        tenantMap.set(payment.tenantId, {
          tenantId: payment.tenantId,
          tenantName: tenant?.personalInfo.fullName || "Unknown",
          propertyId: payment.propertyId,
          propertyName: propertyInfo.name,
          expectedRent: 0,
          collectedRent: 0,
          outstandingRent: 0,
          paymentHistory: [],
          daysPastDue: 0,
        });
      }

      const breakdown = tenantMap.get(payment.tenantId)!;
      breakdown.expectedRent += payment.amount;
      if (payment.status === "paid") {
        breakdown.collectedRent += payment.actualAmountPaid || payment.amount;
        breakdown.lastPaymentDate = payment.paidDate;
      }
      breakdown.paymentHistory.push(payment);

      // Calculate days past due
      if (payment.status === "overdue") {
        const daysPastDue = Math.ceil(
          (new Date().getTime() - new Date(payment.dueDate).getTime()) /
            (1000 * 60 * 60 * 24)
        );
        breakdown.daysPastDue = Math.max(breakdown.daysPastDue, daysPastDue);
      }
    });

    // Calculate outstanding rent
    tenantMap.forEach((breakdown) => {
      breakdown.outstandingRent =
        breakdown.expectedRent - breakdown.collectedRent;
    });

    return Array.from(tenantMap.values());
  }

  private generatePaymentMethodBreakdown(
    payments: RentPayment[]
  ): PaymentMethodBreakdown[] {
    const methodMap = new Map<string, { count: number; totalAmount: number }>();
    const paidPayments = payments.filter(
      (payment) => payment.status === "paid"
    );

    paidPayments.forEach((payment) => {
      const method = payment.paymentMethod;
      if (!methodMap.has(method)) {
        methodMap.set(method, { count: 0, totalAmount: 0 });
      }
      const breakdown = methodMap.get(method)!;
      breakdown.count++;
      breakdown.totalAmount += payment.actualAmountPaid || payment.amount;
    });

    const totalAmount = Array.from(methodMap.values()).reduce(
      (sum, breakdown) => sum + breakdown.totalAmount,
      0
    );

    return Array.from(methodMap.entries()).map(([method, data]) => ({
      method: method as any,
      count: data.count,
      totalAmount: data.totalAmount,
      percentage:
        totalAmount > 0
          ? Math.round((data.totalAmount / totalAmount) * 10000) / 100
          : 0,
    }));
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
  public exportRentPaymentData(): {
    payments: RentPayment[];
    receipts: RentReceipt[];
    reports: RentCollectionReport[];
    exportDate: string;
  } {
    return {
      payments: this.getRentPayments(),
      receipts: this.getRentReceipts(),
      reports: this.getRentCollectionReports(),
      exportDate: new Date().toISOString(),
    };
  }

  public importRentPaymentData(data: {
    payments?: RentPayment[];
    receipts?: RentReceipt[];
    reports?: RentCollectionReport[];
  }): void {
    if (data.payments) {
      this.saveToStorage(RentPaymentService.KEYS.RENT_PAYMENTS, data.payments);
    }
    if (data.receipts) {
      this.saveToStorage(RentPaymentService.KEYS.RENT_RECEIPTS, data.receipts);
    }
    if (data.reports) {
      this.saveToStorage(RentPaymentService.KEYS.RENT_REPORTS, data.reports);
    }
  }

  public clearAllRentPaymentData(): void {
    Object.values(RentPaymentService.KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
  }
}

// Export singleton instance
export const rentPaymentService = new RentPaymentService();
