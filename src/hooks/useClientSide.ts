import { useEffect, useState } from "react";

/**
 * Hook to determine if we're running on the client side
 * Useful for SSR-safe operations that require browser APIs
 */
export function useClientSide() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
}

/**
 * Hook for client-side only data loading
 * Prevents SSR issues with localStorage and other browser APIs
 */
export function useClientSideEffect(
  effect: () => void,
  deps?: React.DependencyList
) {
  const isClient = useClientSide();

  useEffect(() => {
    if (isClient) {
      effect();
    }
  }, [isClient, ...(deps || [])]);

  return isClient;
}
