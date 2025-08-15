"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, Bars3Icon } from "@heroicons/react/24/outline";
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Family Members", href: "/family", icon: UsersIcon },
  { name: "Properties", href: "/properties", icon: BuildingOfficeIcon },
  { name: "Tenants", href: "/tenants", icon: UsersIcon },
  { name: "Rent Management", href: "/rent", icon: DocumentTextIcon },
  { name: "Insurance", href: "/insurance", icon: ShieldCheckIcon },
  { name: "Documents", href: "/documents", icon: DocumentTextIcon },
];

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  isMobile,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div
      className={cn(
        "flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-black pb-4 transition-all duration-300",
        isCollapsed && !isMobile ? "px-2" : "px-6"
      )}
    >
      {/* Header with logo and collapse button */}
      {isCollapsed && !isMobile ? (
        /* Collapsed state - stack vertically */
        <div className="flex flex-col h-20 shrink-0 items-center justify-center space-y-2">
          {/* Collapse toggle button */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
              title="Expand sidebar"
            >
              <Bars3Icon className="h-4 w-4" />
            </button>
          )}
          {/* Compact logo */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-md p-1.5 shadow-md">
            <div className="text-white text-xs font-black text-center">SFS</div>
          </div>
        </div>
      ) : (
        /* Expanded state - horizontal layout */
        <div className="flex h-16 shrink-0 items-center justify-between">
          {/* Logo section */}
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg p-2 shadow-lg">
              <div className="text-white text-center">
                <div className="text-sm font-black leading-none">SFS</div>
              </div>
            </div>
            <div className="flex flex-col">
              <div className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Satyanarayana
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-tight">
                Fancy Stores
              </div>
            </div>
          </div>

          {/* Collapse toggle button - only show on desktop */}
          {!isMobile && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              title="Collapse sidebar"
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          )}
        </div>
      )}

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul
              role="list"
              className={cn(
                "space-y-1",
                isCollapsed && !isMobile ? "mx-0" : "-mx-2"
              )}
            >
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "nav-item-active"
                        : "nav-item text-slate-700 dark:text-zinc-200",
                      "group flex rounded-lg text-sm font-semibold leading-6 transition-all duration-200",
                      isCollapsed && !isMobile
                        ? "p-2 justify-center mx-1 tooltip-container"
                        : "gap-x-3 p-3 mx-1"
                    )}
                    onClick={isMobile ? onClose : undefined}
                    title={isCollapsed && !isMobile ? item.name : undefined}
                  >
                    <item.icon
                      className={cn(
                        pathname === item.href
                          ? "text-primary-600 dark:text-primary-400"
                          : "text-slate-400 dark:text-zinc-400 group-hover:text-primary-600 dark:group-hover:text-primary-400",
                        "h-6 w-6 shrink-0 transition-colors"
                      )}
                      aria-hidden="true"
                    />
                    {(!isCollapsed || isMobile) && (
                      <span className="transition-opacity duration-200">
                        {item.name}
                      </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && !isMobile && (
                      <div className="tooltip">{item.name}</div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  );

  if (isMobile) {
    return (
      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-slate-900/80 dark:bg-slate-950/90" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={onClose}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon
                        className="h-6 w-6 text-white"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    );
  }

  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 dark:border-zinc-700 bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-black">
      <SidebarContent />
    </div>
  );
};

export { Sidebar };
