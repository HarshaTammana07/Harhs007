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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">Unable to load statistics</p>
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
        <Card className="p-4 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <DocumentIcon className="h-8 w-8 text-blue-500 dark:text-blue-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {stats.totalDocuments}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Total Documents</div>
        </Card>

        <Card className="p-4 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <ClockIcon className="h-8 w-8 text-yellow-500 dark:text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            {stats.expiringDocuments}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Expiring Soon</div>
        </Card>

        <Card className="p-4 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <ExclamationTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-red-600 dark:text-red-400">
            {stats.expiredDocuments}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">Expired</div>
        </Card>

        <Card className="p-4 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <FolderIcon className="h-8 w-8 text-gray-500 dark:text-gray-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
            {stats.documentsWithoutExpiry}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">No Expiry</div>
        </Card>
      </div>

      {/* Category Breakdown */}
      {categoryEntries.length > 0 && (
        <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
            <ChartBarIcon className="h-5 w-5" />
            Documents by Category
          </h3>
          <div className="space-y-3">
            {categoryEntries.map(([category, count]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium">
                    {category.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full"
                      style={{
                        width: `${getPercentage(count)}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem] text-right">
                    {count} ({getPercentage(count)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Status Breakdown */}
      <Card className="p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Document Status Overview
        </h3>
        <div className="space-y-3">
          {/* Expired Documents */}
          {stats.expiredDocuments > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
                <div>
                  <p className="font-medium text-red-800 dark:text-red-200">Expired</p>
                  <p className="text-sm text-red-600 dark:text-red-300">
                    {stats.expiredDocuments} document
                    {stats.expiredDocuments !== 1 ? "s" : ""} have expired
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.expiredDocuments}
              </div>
            </div>
          )}

          {/* Expiring Soon */}
          {stats.expiringDocuments > 0 && (
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
                <div>
                  <p className="font-medium text-yellow-800 dark:text-yellow-200">Expiring Soon</p>
                  <p className="text-sm text-yellow-600 dark:text-yellow-300">
                    {stats.expiringDocuments} document
                    {stats.expiringDocuments !== 1 ? "s" : ""} expire within
                    30 days
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
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
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-3">
                <DocumentIcon className="h-5 w-5 text-green-500 dark:text-green-400" />
                <div>
                  <p className="font-medium text-green-800 dark:text-green-200">
                    Valid Documents
                  </p>
                  <p className="text-sm text-green-600 dark:text-green-300">
                    Documents with valid expiry dates
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.totalDocuments -
                  stats.expiredDocuments -
                  stats.expiringDocuments -
                  stats.documentsWithoutExpiry}
              </div>
            </div>
          )}

          {/* No Expiry */}
          {stats.documentsWithoutExpiry > 0 && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
              <div className="flex items-center gap-3">
                <FolderIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                <div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">No Expiry Date</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Documents without expiry dates
                  </p>
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-600 dark:text-gray-300">
                {stats.documentsWithoutExpiry}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Summary */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">Summary</h3>
        <div className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
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
      <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button onClick={onClose}>Close</Button>
      </div>
    </div>
  );
}
