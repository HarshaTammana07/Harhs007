"use client";

import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { RentPayment, Tenant } from "@/types";
import { rentPaymentService } from "@/services/RentPaymentService";
import { propertyService } from "@/services/PropertyService";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { RentPaymentForm } from "./RentPaymentForm";
import { RentReceiptModal } from "./RentReceiptModal";

interface RentPaymentListProps {
  tenantId?: string;
  propertyId?: string;
  showActions?: boolean;
}

export const RentPaymentList: React.FC<RentPaymentListProps> = ({
  tenantId,
  propertyId,
  showActions = true,
}) => {
  const [payments, setPayments] = useState<RentPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<RentPayment[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("");
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<RentPayment | null>(
    null
  );

  useEffect(() => {
    loadData();
  }, [tenantId, propertyId]);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, paymentMethodFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      let loadedPayments: RentPayment[];

      if (tenantId) {
        loadedPayments = rentPaymentService.getRentPaymentsByTenant(tenantId);
      } else if (propertyId) {
        loadedPayments =
          rentPaymentService.getRentPaymentsByProperty(propertyId);
      } else {
        loadedPayments = rentPaymentService.getRentPayments();
      }

      // Sort by due date (newest first)
      loadedPayments.sort(
        (a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
      );

      setPayments(loadedPayments);

      // Load tenants for display names
      const loadedTenants = propertyService.getTenants();
      setTenants(loadedTenants);
    } catch (error) {
      console.error("Error loading rent payments:", error);
      toast.error("Failed to load rent payments");
    } finally {
      setLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = payments;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((payment) => {
        const tenant = tenants.find((t) => t.id === payment.tenantId);
        const tenantName = tenant?.personalInfo.fullName.toLowerCase() || "";
        const receiptNumber = payment.receiptNumber?.toLowerCase() || "";
        const transactionId = payment.transactionId?.toLowerCase() || "";

        return (
          tenantName.includes(term) ||
          receiptNumber.includes(term) ||
          transactionId.includes(term) ||
          payment.amount.toString().includes(term)
        );
      });
    }

    if (statusFilter) {
      filtered = filtered.filter((payment) => payment.status === statusFilter);
    }

    if (paymentMethodFilter) {
      filtered = filtered.filter(
        (payment) => payment.paymentMethod === paymentMethodFilter
      );
    }

    setFilteredPayments(filtered);
  };

  const handleEditPayment = (payment: RentPayment) => {
    setSelectedPayment(payment);
    setShowPaymentForm(true);
  };

  const handleDeletePayment = async (payment: RentPayment) => {
    if (!confirm("Are you sure you want to delete this payment record?")) {
      return;
    }

    try {
      rentPaymentService.deleteRentPayment(payment.id);
      toast.success("Payment record deleted successfully");
      loadData();
    } catch (error) {
      console.error("Error deleting payment:", error);
      toast.error("Failed to delete payment record");
    }
  };

  const handleMarkAsPaid = async (payment: RentPayment) => {
    try {
      rentPaymentService.markPaymentAsPaid(
        payment.id,
        new Date(),
        payment.paymentMethod,
        payment.transactionId,
        payment.actualAmountPaid || payment.amount
      );
      toast.success("Payment marked as paid");
      loadData();
    } catch (error) {
      console.error("Error marking payment as paid:", error);
      toast.error("Failed to mark payment as paid");
    }
  };

  const handleViewReceipt = (payment: RentPayment) => {
    setSelectedPayment(payment);
    setShowReceiptModal(true);
  };

  const handlePaymentFormSubmit = (payment: RentPayment) => {
    setShowPaymentForm(false);
    setSelectedPayment(null);
    loadData();
  };

  const getTenantName = (tenantId: string): string => {
    const tenant = tenants.find((t) => t.id === tenantId);
    return tenant?.personalInfo.fullName || "Unknown Tenant";
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      overdue: "bg-red-100 text-red-800",
      partial: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusStyles[status as keyof typeof statusStyles] ||
          "bg-gray-100 text-gray-800"
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            Rent Payments
            {filteredPayments.length > 0 && (
              <span className="ml-2 text-sm text-gray-500">
                ({filteredPayments.length})
              </span>
            )}
          </h2>
          {showActions && (
            <Button onClick={() => setShowPaymentForm(true)}>
              Record Payment
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="partial">Partial</option>
            </Select>
          </div>
          <div>
            <Select
              value={paymentMethodFilter}
              onChange={(e) => setPaymentMethodFilter(e.target.value)}
            >
              <option value="">All Payment Methods</option>
              <option value="cash">Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cheque">Cheque</option>
              <option value="upi">UPI</option>
              <option value="card">Card</option>
            </Select>
          </div>
          <div>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("");
                setPaymentMethodFilter("");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>

        {/* Payments Table */}
        {filteredPayments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No rent payments found.</p>
            {showActions && (
              <Button className="mt-4" onClick={() => setShowPaymentForm(true)}>
                Record First Payment
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tenant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paid Date
                  </th>
                  {showActions && (
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {getTenantName(payment.tenantId)}
                      </div>
                      {payment.receiptNumber && (
                        <div className="text-sm text-gray-500">
                          Receipt: {payment.receiptNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(payment.amount)}
                      </div>
                      {(payment.lateFee || payment.discount) && (
                        <div className="text-xs text-gray-500">
                          {payment.lateFee &&
                            `+${formatCurrency(payment.lateFee)} late fee`}
                          {payment.discount &&
                            ` -${formatCurrency(payment.discount)} discount`}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(payment.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.paymentMethod.replace("_", " ").toUpperCase()}
                      {payment.transactionId && (
                        <div className="text-xs text-gray-500">
                          ID: {payment.transactionId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.paidDate ? formatDate(payment.paidDate) : "-"}
                    </td>
                    {showActions && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {payment.status === "paid" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewReceipt(payment)}
                            >
                              Receipt
                            </Button>
                          )}
                          {payment.status !== "paid" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkAsPaid(payment)}
                            >
                              Mark Paid
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditPayment(payment)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeletePayment(payment)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Payment Form Modal */}
      <Modal
        isOpen={showPaymentForm}
        onClose={() => {
          setShowPaymentForm(false);
          setSelectedPayment(null);
        }}
        title={selectedPayment ? "Edit Payment" : "Record Payment"}
        size="lg"
      >
        <RentPaymentForm
          payment={selectedPayment || undefined}
          tenantId={tenantId}
          propertyId={propertyId}
          onSubmit={handlePaymentFormSubmit}
          onCancel={() => {
            setShowPaymentForm(false);
            setSelectedPayment(null);
          }}
        />
      </Modal>

      {/* Receipt Modal */}
      <Modal
        isOpen={showReceiptModal}
        onClose={() => {
          setShowReceiptModal(false);
          setSelectedPayment(null);
        }}
        title="Rent Receipt"
        size="lg"
      >
        {selectedPayment && (
          <RentReceiptModal
            payment={selectedPayment}
            onClose={() => {
              setShowReceiptModal(false);
              setSelectedPayment(null);
            }}
          />
        )}
      </Modal>
    </>
  );
};
