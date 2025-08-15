"use client";

import { useState, useEffect } from "react";
import {
  documentService,
  DocumentStats as DocumentStatsType,
} from "@/services/DocumentService";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  DocumentIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  FolderIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

interface DocumentStatsProps {
  onClose: () => void;
}

export function DocumentStats({ onClose }: DocumentStatsProps) {
  const [stats, setStats] = useState<DocumentStatsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    setIsLoading(true);
    try {
      const documentStats = documentService.getDocumentStats();
      setStats(documentStats);
    } catch (error) {
      console.error("Error loading document statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Unable to load statistics</p>
        <Button onClick={onClose} className="mt-4">
          Close
        </Button>
      </div>
    );
  }

  const categoryEntries = Object.entries(stats.documentsByCategory)
    .filter(([_, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  const getPercentage = (count: number) => {
    return stats.totalDocuments > 0
      ? Math.round((count / stats.totalDocuments) * 100)
      : 0;
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <DocumentIcon className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">
            {stats.totalDocuments}
          </div>
          <div className="text-sm text-gray-500">Total Documents</div>
        </Card>

        <Card className="p-4 text-center">
          <ClockIcon className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-600">
            {stats.expiringDocuments}
          </div>
          <div className="text-sm text-gray-500">Expiring Soon</div>
        </Card>

        <Card className="p-4 text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600">
            {stats.expiredDocuments}
          </div>
          <div className="text-sm text-gray-500">Expired</div>
        </Card>

        <Card className="p-4 text-center">
          <FolderIcon className="h-8 w-8 text-gray-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-600">
            {stats.documentsWithoutExpiry}
          </div>
          <div className="text-sm text-gray-500">No Expiry</div>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5" />
          Documents by Category
        </h3>

        {categoryEntries.length > 0 ? (
          <div className="space-y-3">
            {categoryEntries.map(([category, count]) => {
              const percentage = getPercentage(count);
              const displayName = documentService.getCategoryDisplayName(
                category as any
              );

              return (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {displayName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No documents found</p>
        )}
      </Card>

      {/* Expiry Status Breakdown */}
      {stats.totalDocuments > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Expiry Status Overview
          </h3>

          <div className="space-y-4">
            {/* Expired Documents */}
            {stats.expiredDocuments > 0 && (
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-800">
                      Expired Documents
                    </p>
                    <p className="text-sm text-red-600">
                      {stats.expiredDocuments} document
                      {stats.expiredDocuments !== 1 ? "s" : ""} need immediate
                      attention
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {stats.expiredDocuments}
                </div>
              </div>
            )}

            {/* Expiring Soon */}
            {stats.expiringDocuments > 0 && (
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <ClockIcon className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="font-medium text-yellow-800">Expiring Soon</p>
                    <p className="text-sm text-yellow-600">
                      {stats.expiringDocuments} document
                      {stats.expiringDocuments !== 1 ? "s" : ""} expire within
                      30 days
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.expiringDocuments}
                </div>
              </div>
            )}

            {/* Valid Documents */}
            {stats.totalDocuments -
              stats.expiredDocuments -
              stats.expiringDocuments -
              stats.documentsWithoutExpiry >
              0 && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DocumentIcon className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="font-medium text-green-800">
                      Valid Documents
                    </p>
                    <p className="text-sm text-green-600">
                      Documents with valid expiry dates
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalDocuments -
                    stats.expiredDocuments -
                    stats.expiringDocuments -
                    stats.documentsWithoutExpiry}
                </div>
              </div>
            )}

            {/* No Expiry */}
            {stats.documentsWithoutExpiry > 0 && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <FolderIcon className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-800">No Expiry Date</p>
                    <p className="text-sm text-gray-600">
                      Documents without expiry dates
                    </p>
                  </div>
                </div>
                <div className="text-2xl font-bold text-gray-600">
                  {stats.documentsWithoutExpiry}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Summary */}
      <Card className="p-6 bg-blue-50">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Summary</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>
            You have <strong>{stats.totalDocuments}</strong> documents across{" "}
            <strong>{categoryEntries.length}</strong> categories.
          </p>
          {(stats.expiredDocuments > 0 || stats.expiringDocuments > 0) && (
            <p>
              <strong>
                {stats.expiredDocuments + stats.expiringDocuments}
              </strong>{" "}
              documents require attention due to expiry.
            </p>
          )}
          {stats.documentsWithoutExpiry > 0 && (
            <p>
              <strong>{stats.documentsWithoutExpiry}</strong> documents don't
              have expiry dates set.
            </p>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
