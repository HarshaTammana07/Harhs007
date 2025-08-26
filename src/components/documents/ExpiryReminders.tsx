"use client";

import { useState, useEffect } from "react";
import { Document } from "@/types";
import {
  documentService,
  DocumentExpiryInfo,
} from "@/services/DocumentService";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  ExclamationTriangleIcon,
  ClockIcon,
  EyeIcon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { format } from "date-fns";

interface ExpiryRemindersProps {
  onViewDocument?: (document: Document) => void;
  refreshTrigger?: number;
}

export function ExpiryReminders({ onViewDocument, refreshTrigger }: ExpiryRemindersProps) {
  const [expiryInfo, setExpiryInfo] = useState<DocumentExpiryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedDocuments, setDismissedDocuments] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadExpiryInfo();
  }, []);

  // Refresh data when refreshTrigger changes
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadExpiryInfo();
    }
  }, [refreshTrigger]);

  const loadExpiryInfo = () => {
    setIsLoading(true);
    try {
      const info = documentService.getExpiringDocuments();
      setExpiryInfo(info);
    } catch (error) {
      console.error("Error loading expiry information:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = (documentId: string) => {
    setDismissedDocuments((prev) => new Set([...prev, documentId]));
  };

  const visibleExpiryInfo = expiryInfo.filter(
    (info) => !dismissedDocuments.has(info.document.id)
  );
  const expiredDocs = visibleExpiryInfo.filter((info) => info.isExpired);
  const expiringSoonDocs = visibleExpiryInfo.filter(
    (info) => info.isExpiringSoon && !info.isExpired
  );

  if (isLoading) {
    return (
      <Card className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">
            Checking document expiry...
          </span>
        </div>
      </Card>
    );
  }

  if (visibleExpiryInfo.length === 0) {
    return null; // Don't show anything if no expiring documents
  }

  return (
    <Card className="overflow-hidden bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div
        className="p-4 bg-gradient-to-r from-yellow-50 to-red-50 dark:from-yellow-900/20 dark:to-red-900/20 border-b border-gray-200 dark:border-gray-700 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {expiredDocs.length > 0 && (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
              )}
              {expiringSoonDocs.length > 0 && (
                <ClockIcon className="h-5 w-5 text-yellow-500 dark:text-yellow-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Document Expiry Reminders
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {expiredDocs.length > 0 && expiringSoonDocs.length > 0
                  ? `${expiredDocs.length} expired, ${expiringSoonDocs.length} expiring soon`
                  : expiredDocs.length > 0
                  ? `${expiredDocs.length} document${expiredDocs.length !== 1 ? "s" : ""} expired`
                  : `${expiringSoonDocs.length} document${expiringSoonDocs.length !== 1 ? "s" : ""} expiring soon`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Expired Documents */}
          {expiredDocs.length > 0 && (
            <div>
              <h4 className="font-medium text-red-800 dark:text-red-200 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Expired Documents ({expiredDocs.length})
              </h4>
              <div className="space-y-2">
                {expiredDocs.map((info) => (
                  <div
                    key={info.document.id}
                    className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-red-900 dark:text-red-200 truncate">
                        {info.document.title}
                      </p>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        {documentService.getCategoryDisplayName(
                          info.document.category
                        )}{" "}
                        • Expired {Math.abs(info.daysUntilExpiry)} day
                        {Math.abs(info.daysUntilExpiry) !== 1 ? "s" : ""} ago
                      </p>
                      {info.document.expiryDate && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          Expired:{" "}
                          {format(
                            new Date(info.document.expiryDate),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {onViewDocument && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewDocument(info.document)}
                          className="text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(info.document.id)}
                        className="text-red-700 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 hover:bg-red-100 dark:hover:bg-red-900/30"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expiring Soon Documents */}
          {expiringSoonDocs.length > 0 && (
            <div>
              <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Expiring Soon ({expiringSoonDocs.length})
              </h4>
              <div className="space-y-2">
                {expiringSoonDocs.map((info) => (
                  <div
                    key={info.document.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-yellow-900 dark:text-yellow-200 truncate">
                        {info.document.title}
                      </p>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        {documentService.getCategoryDisplayName(
                          info.document.category
                        )}{" "}
                        • Expires in {info.daysUntilExpiry} day
                        {info.daysUntilExpiry !== 1 ? "s" : ""}
                      </p>
                      {info.document.expiryDate && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          Expiry:{" "}
                          {format(
                            new Date(info.document.expiryDate),
                            "MMM dd, yyyy"
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {onViewDocument && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onViewDocument(info.document)}
                          className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(info.document.id)}
                        className="text-yellow-700 dark:text-yellow-300 hover:text-yellow-800 dark:hover:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                      >
                        <XMarkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Dismissed reminders will reappear on page refresh
            </p>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={loadExpiryInfo}
              className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Refresh
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
