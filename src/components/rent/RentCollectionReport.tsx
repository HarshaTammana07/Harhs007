"use client";

import React from "react";
import { RentCollectionReport as RentCollectionReportType } from "@/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface RentCollectionReportProps {
  report: RentCollectionReportType;
  onClose: () => void;
}

export const RentCollectionReport: React.FC<RentCollectionReportProps> = ({
  report,
  onClose,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleDownloadReport = () => {
    const reportData = {
      ...report,
      exportDate: new Date().toISOString(),
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `rent-collection-report-${report.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6">
      {/* Report Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Satyanarayana Fancy Stores
        </h1>
        <p className="text-gray-600">Family Business Management</p>
        <h2 className="text-xl font-semibold mt-4 text-blue-600">
          RENT COLLECTION REPORT
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          {formatDate(report.period.startDate)} -{" "}
          {formatDate(report.period.endDate)}
        </p>
      </div>

      {/* Summary Section */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Collection Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Expected</p>
            <p className="text-2xl font-bold text-blue-600">
              {formatCurrency(report.totalExpectedRent)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Total Collected</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(report.totalCollectedRent)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-2xl font-bold text-red-600">
              {formatCurrency(report.totalOutstandingRent)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Collection Rate</p>
            <p className="text-2xl font-bold text-purple-600">
              {formatPercentage(report.collectionRate)}
            </p>
          </div>
        </div>
      </Card>

      {/* Property Breakdown */}
      <Card className="p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Property Breakdown
        </h3>
        {report.propertyBreakdown.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No property data available
          </p>
        ) : (
          <div className="space-y-4">
            {report.propertyBreakdown.map((property) => (
              <div key={property.propertyId} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {property.propertyName}
                    </h4>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {property.propertyType}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Collection Rate</div>
                    <div className="font-bold text-lg">
                      {formatPercentage(property.collectionRate)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <div className="text-sm text-gray-600">Expected</div>
                    <div className="font-medium">
                      {formatCurrency(property.expectedRent)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Collected</div>
                    <div className="font-medium text-green-600">
                      {formatCurrency(property.collectedRent)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Outstanding</div>
                    <div className="font-medium text-red-600">
                      {formatCurrency(property.outstandingRent)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4 no-print">
        <Button variant="outline" onClick={handlePrintReport}>
          Print Report
        </Button>
        <Button variant="outline" onClick={handleDownloadReport}>
          Download JSON
        </Button>
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
};
