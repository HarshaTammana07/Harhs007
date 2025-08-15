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
}

export function ExpiryReminders({ onViewDocument }: ExpiryRemindersProps) {
  const [expiryInfo, setExpiryInfo] = useState<DocumentExpiryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [dismissedDocuments, setDismissedDocuments] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    loadExpiryInfo();
  }, []);

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
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">
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
    <Card className="overflow-hidden">
      {/* Header */}
      <div
        className="p-4 bg-gradient-to-r from-yellow-50 to-red-50 border-b cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {expiredDocs.length > 0 && (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
              )}
              {expiringSoonDocs.length > 0 && (
                <ClockIcon className="h-5 w-5 text-yellow-500" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                Document Expiry Reminders
              </h3>
              <p className="text-sm text-gray-600">
                {expiredDocs.length > 0 && (
                  <span className="text-red-600 font-medium">
                    {expiredDocs.length} expired
                  </span>
                )}
                {expiredDocs.length > 0 && expiringSoonDocs.length > 0 && (
                  <span className="text-gray-500"> • </span>
                )}
                {expiringSoonDocs.length > 0 && (
                  <span className="text-yellow-600 font-medium">
                    {expiringSoonDocs.length} expiring soon
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Expired Documents */}
          {expiredDocs.length > 0 && (
            <div>
              <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                <ExclamationTriangleIcon className="h-4 w-4" />
                Expired Documents ({expiredDocs.length})
              </h4>
              <div className="space-y-2">
                {expiredDocs.map((info) => (
                  <div
                    key={info.document.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-red-900 truncate">
                        {info.document.title}
                      </p>
                      <p className="text-sm text-red-700">
                        {documentService.getCategoryDisplayName(
                          info.document.category
                        )}{" "}
                        • Expired {Math.abs(info.daysUntilExpiry)} days ago
                      </p>
                      {info.document.expiryDate && (
                        <p className="text-xs text-red-600">
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
                          className="text-red-700 hover:text-red-800 hover:bg-red-100"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(info.document.id)}
                        className="text-red-700 hover:text-red-800 hover:bg-red-100"
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
              <h4 className="font-medium text-yellow-800 mb-3 flex items-center gap-2">
                <ClockIcon className="h-4 w-4" />
                Expiring Soon ({expiringSoonDocs.length})
              </h4>
              <div className="space-y-2">
                {expiringSoonDocs.map((info) => (
                  <div
                    key={info.document.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-yellow-900 truncate">
                        {info.document.title}
                      </p>
                      <p className="text-sm text-yellow-700">
                        {documentService.getCategoryDisplayName(
                          info.document.category
                        )}{" "}
                        • Expires in {info.daysUntilExpiry} day
                        {info.daysUntilExpiry !== 1 ? "s" : ""}
                      </p>
                      {info.document.expiryDate && (
                        <p className="text-xs text-yellow-600">
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
                          className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDismiss(info.document.id)}
                        className="text-yellow-700 hover:text-yellow-800 hover:bg-yellow-100"
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
          <div className="flex justify-between items-center pt-3 border-t">
            <p className="text-xs text-gray-500">
              Dismissed reminders will reappear on page refresh
            </p>
            <Button size="sm" variant="outline" onClick={loadExpiryInfo}>
              Refresh
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
