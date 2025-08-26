"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/AuthService";

export function SessionTimeout() {
  const { user, logout } = useAuth();
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    if (!user) return;

    const updateTimeRemaining = () => {
      const remaining = authService.getSessionTimeRemaining();
      setTimeRemaining(remaining);

      // Show warning when 5 minutes or less remaining
      const fiveMinutes = 5 * 60 * 1000;
      setShowWarning(remaining <= fiveMinutes && remaining > 0);

      // Auto logout when session expires
      if (remaining <= 0) {
        logout();
      }
    };

    // Update immediately
    updateTimeRemaining();

    // Update every 30 seconds
    const interval = setInterval(updateTimeRemaining, 30000);

    return () => clearInterval(interval);
  }, [user, logout]);

  const handleExtendSession = () => {
    authService.refreshSession();
    setShowWarning(false);
    setTimeRemaining(30 * 60 * 1000); // Reset to 30 minutes
  };

  const formatTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!user || !showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 bg-yellow-50 dark:bg-yellow-900/80 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 shadow-lg max-w-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-yellow-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Session Expiring Soon
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p>Your session will expire in {formatTime(timeRemaining)}</p>
          </div>
          <div className="mt-3 flex space-x-2">
            <button
              onClick={handleExtendSession}
              className="bg-yellow-100 dark:bg-yellow-800 px-3 py-1 rounded-md text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Extend Session
            </button>
            <button
              onClick={() => setShowWarning(false)}
              className="bg-transparent px-3 py-1 rounded-md text-sm font-medium text-yellow-800 dark:text-yellow-200 hover:bg-yellow-100 dark:hover:bg-yellow-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
