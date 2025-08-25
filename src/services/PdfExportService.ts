import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RentPaymentWithMetadata {
  id: string;
  tenantName?: string;
  propertyName?: string;
  propertyAddress?: string;
  apartmentDoorNumber?: string;
  flatDoorNumber?: string;
  amount: number;
  actualAmountPaid?: number;
  dueDate: Date;
  paidDate?: Date;
  status: string;
  paymentMethod: string;
  receiptNumber?: string;
  transactionId?: string;
  notes?: string;
  lateFee: number;
  discount: number;
  propertyType: string;
}

interface FilterCriteria {
  dateRange: string;
  buildingId: string;
  flatId: string;
  searchTerm?: string;
}

export class PdfExportService {
  static exportRentPayments(
    payments: RentPaymentWithMetadata[],
    filters: FilterCriteria,
    statistics: {
      totalPayments: number;
      paidPayments: number;
      pendingPayments: number;
      overduePayments: number;
      totalAmount: number;
    }
  ) {
    // Use landscape orientation for better table display
    const doc = new jsPDF('landscape');
    
    // Set up the document
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Rent Payments Report', pageWidth / 2, 25, { align: 'center' });
    
    // Report generation date
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const currentDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Generated on: ${currentDate}`, pageWidth - margin, 35, { align: 'right' });
    
    let yPosition = 50;
    
    // Filter Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Filter Summary', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const filterSummary = [];
    if (filters.dateRange !== 'all') {
      filterSummary.push(`Date Range: ${this.formatDateRange(filters.dateRange)}`);
    }
    if (filters.buildingId !== 'all') {
      filterSummary.push(`Building Filter: Applied`);
    }
    if (filters.flatId !== 'all') {
      filterSummary.push(`Flat Filter: Applied`);
    }
    if (filters.searchTerm && filters.searchTerm.trim() !== '') {
      filterSummary.push(`Search: "${filters.searchTerm}"`);
    }
    
    if (filterSummary.length === 0) {
      doc.text('No filters applied - showing all payments', margin, yPosition);
      yPosition += 8;
    } else {
      filterSummary.forEach(filter => {
        doc.text(`• ${filter}`, margin, yPosition);
        yPosition += 6;
      });
    }
    
    yPosition += 10;
    
    // Statistics Summary
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary Statistics', margin, yPosition);
    yPosition += 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const stats = [
      `Total Payments: ${statistics.totalPayments}`,
      `Paid: ${statistics.paidPayments}`,
      `Pending: ${statistics.pendingPayments}`,
      `Overdue: ${statistics.overduePayments}`,
      `Total Amount Collected: ₹${statistics.totalAmount.toLocaleString('en-IN')}`
    ];
    
    stats.forEach(stat => {
      doc.text(`• ${stat}`, margin, yPosition);
      yPosition += 6;
    });
    
    yPosition += 15;
    
    // Payments Table
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Payment Details', margin, yPosition);
    yPosition += 10;
    
    // Prepare table data
    const tableHeaders = [
      'Receipt #',
      'Tenant',
      'Property',
      'Amount',
      'Status',
      'Due Date',
      'Paid Date',
      'Method'
    ];
    
    const tableData = payments.map(payment => [
      payment.receiptNumber || 'N/A',
      payment.tenantName || 'Unknown',
      this.formatPropertyName(payment),
      `₹${payment.amount.toLocaleString('en-IN')}`,
      this.capitalizeFirst(payment.status),
      this.formatCompactDate(payment.dueDate),
      payment.paidDate ? this.formatCompactDate(payment.paidDate) : 'Not Paid',
      this.formatPaymentMethod(payment.paymentMethod)
    ]);
    
    // Add table with better responsive layout
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: yPosition,
      styles: {
        fontSize: 9,
        cellPadding: 3,
        overflow: 'linebreak',
        cellWidth: 'wrap',
        valign: 'middle',
      },
      headStyles: {
        fillColor: [59, 130, 246], // Blue color
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 10,
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // Light gray
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Receipt #
        1: { cellWidth: 35 }, // Tenant
        2: { cellWidth: 45 }, // Property
        3: { cellWidth: 25 }, // Amount
        4: { cellWidth: 20 }, // Status
        5: { cellWidth: 25 }, // Due Date
        6: { cellWidth: 25 }, // Paid Date
        7: { cellWidth: 25 }, // Method
      },
      margin: { left: margin, right: margin },
      tableWidth: 'auto',
      theme: 'striped',
    });
    
    // Add footer with page numbers
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `rent-payments-report-${timestamp}.pdf`;
    
    // Save the PDF
    doc.save(filename);
  }
  
  private static formatDateRange(dateRange: string): string {
    switch (dateRange) {
      case 'this_month':
        return 'This Month';
      case 'last_month':
        return 'Last Month';
      case 'this_year':
        return 'This Year';
      case 'custom':
        return 'Custom Date Range';
      default:
        return 'All Time';
    }
  }
  
  private static formatPropertyName(payment: RentPaymentWithMetadata): string {
    let propertyName = payment.propertyName || 'Unknown Property';
    
    if (payment.apartmentDoorNumber) {
      propertyName += ` - Apt ${payment.apartmentDoorNumber}`;
    } else if (payment.flatDoorNumber) {
      propertyName += ` - Door ${payment.flatDoorNumber}`;
    }
    
    return propertyName;
  }
  
  private static capitalizeFirst(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
  
  private static truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
  
  private static formatCompactAmount(amount: number): string {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toLocaleString('en-IN');
  }
  
  private static formatCompactDate(date: Date): string {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear().toString().slice(-2)}`;
  }
  
  private static formatPaymentMethod(method: string): string {
    const methodMap: { [key: string]: string } = {
      'cash': 'Cash',
      'bank_transfer': 'Bank',
      'cheque': 'Cheque',
      'upi': 'UPI',
      'card': 'Card'
    };
    return methodMap[method] || method;
  }
}