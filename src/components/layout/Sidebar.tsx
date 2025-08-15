"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/utils/cn";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Family Members", href: "/family", icon: UsersIcon },
  { name: "Properties", href: "/properties", icon: BuildingOfficeIcon },
  { name: "Tenants", href: "/tenants", icon: UsersIcon },
  { name: "Rent Management", href: "/rent", icon: DocumentTextIcon },
  { name: "Insurance", href: "/insurance", icon: ShieldCheckIcon },
  { name: "Documents", href: "/documents", icon: DocumentTextIcon },
  { name: "Theme Showcase", href: "/theme-showcase", icon: DocumentTextIcon },
  { name: "File Demo", href: "/file-demo", icon: DocumentTextIcon },
  { name: "Settings", href: "/settings", icon: Cog6ToothIcon },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  const pathname = usePathname();

  const SidebarContent = () => (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-black px-6 pb-4">
      <div className="flex h-16 shrink-0 items-center">
        <img
          className="h-8 w-auto"
          src="/satyanarayana-fancy-stores.png"
          alt="Satyanarayana Fancy Stores"
          onError={(e) => {
            // Fallback to text if image doesn't exist
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML =
                '<span class="text-lg font-bold gradient-text">SFS</span>';
            }
          }}
        />
      </div>
      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-7">
          <li>
            <ul role="list" className="-mx-2 space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      pathname === item.href
                        ? "nav-item-active"
                        : "nav-item text-slate-700 dark:text-zinc-200",
                      "group flex gap-x-3 rounded-lg p-3 text-sm font-semibold leading-6 mx-1"
                    )}
                    onClick={isMobile ? onClose : undefined}
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
                    {item.name}
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
    <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-slate-200 dark:border-zinc-700 bg-gradient-to-b from-white via-slate-50 to-blue-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-black px-6 pb-4">
      <SidebarContent />
    </div>
  );
};

export { Sidebar };
