import React from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import { cn } from "@/utils/cn";

interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading...",
  className,
  size = "md",
}) => {
  return (
    <div
      className={cn("flex flex-col items-center justify-center p-8", className)}
    >
      <LoadingSpinner size={size} className="text-blue-600" />
      <p className="mt-4 text-sm text-gray-600">{message}</p>
    </div>
  );
};

export { LoadingState };
