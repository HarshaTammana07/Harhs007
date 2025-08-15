"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface LogoProps {
  variant?: "full" | "compact" | "icon";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  variant = "full",
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: {
      container: "h-8",
      icon: "h-6 w-6",
      text: "text-sm",
      subtext: "text-xs",
    },
    md: {
      container: "h-10",
      icon: "h-8 w-8",
      text: "text-base",
      subtext: "text-sm",
    },
    lg: {
      container: "h-12",
      icon: "h-10 w-10",
      text: "text-lg",
      subtext: "text-base",
    },
    xl: {
      container: "h-16",
      icon: "h-12 w-12",
      text: "text-xl",
      subtext: "text-lg",
    },
  };

  const currentSize = sizeClasses[size];

  // Icon component - stylized "SFS" in a square
  const LogoIcon = () => (
    <div
      className={cn(
        "bg-gradient-to-br from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center shadow-lg",
        currentSize.icon
      )}
    >
      <div className="text-white font-bold leading-none">
        <div className="text-center">
          <div
            className={cn(
              "font-black",
              size === "sm"
                ? "text-xs"
                : size === "md"
                  ? "text-sm"
                  : "text-base"
            )}
          >
            SFS
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "icon") {
    return (
      <div className={cn("flex items-center", className)}>
        <LogoIcon />
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div
        className={cn(
          "flex items-center gap-2",
          currentSize.container,
          className
        )}
      >
        <LogoIcon />
        <div className="flex flex-col justify-center">
          <div
            className={cn(
              "font-bold text-slate-900 dark:text-white leading-tight",
              currentSize.text
            )}
          >
            SFS
          </div>
          <div
            className={cn(
              "text-slate-600 dark:text-slate-400 leading-tight",
              currentSize.subtext
            )}
          >
            Stores
          </div>
        </div>
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={cn(
        "flex items-center gap-3",
        currentSize.container,
        className
      )}
    >
      <LogoIcon />
      <div className="flex flex-col justify-center">
        <div
          className={cn(
            "font-bold text-slate-900 dark:text-white leading-tight",
            currentSize.text
          )}
        >
          Satyanarayana
        </div>
        <div
          className={cn(
            "text-slate-600 dark:text-slate-400 leading-tight",
            currentSize.subtext
          )}
        >
          Fancy Stores
        </div>
      </div>
    </div>
  );
};

export { Logo };
