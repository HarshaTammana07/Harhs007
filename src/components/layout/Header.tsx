"use client";

import React from "react";
import {
  Bars3Icon,
  ArrowLeftIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { LogoutButton } from "../auth/LogoutButton";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Get page title based on current path
  const getPageTitle = () => {
    switch (pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/family":
        return "Family Members";
      case "/documents":
        return "Documents";
      case "/properties":
        return "Properties";
      case "/insurance":
        return "Insurance";
      default:
        return "Satyanarayana Fancy Stores";
    }
  };

  const showBackButton = pathname !== "/dashboard" && pathname !== "/";

  return (
    <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200 dark:border-slate-700 bg-white bg-opacity-90 dark:bg-slate-900 dark:bg-opacity-90 backdrop-blur-sm px-4 shadow-lg sm:gap-x-6 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Back button */}
      {showBackButton && (
        <button
          type="button"
          className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          onClick={() => router.back()}
          title="Go back"
        >
          <span className="sr-only">Go back</span>
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      )}

      {/* Home button */}
      <Link
        href="/dashboard"
        className="-m-2.5 p-2.5 text-slate-700 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        title="Go to Dashboard"
      >
        <span className="sr-only">Go to Dashboard</span>
        <HomeIcon className="h-5 w-5" aria-hidden="true" />
      </Link>

      {/* Separator */}
      <div
        className="h-6 w-px bg-slate-200 dark:bg-slate-700"
        aria-hidden="true"
      />

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1 items-center">
          <h1 className="text-lg font-semibold gradient-text">
            {getPageTitle()}
          </h1>
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          {/* User info */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-slate-200 dark:lg:bg-slate-700"
            aria-hidden="true"
          />

          <div className="flex items-center gap-x-4">
            <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-300 lg:block">
              Welcome, {user?.name?.split(" ")[0] || "User"}
            </span>
            <LogoutButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export { Header };
