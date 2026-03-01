import { useAuthStore } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";
import { useRouter } from "@/i18n/navigation";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Centralized logout utility that handles:
 * - Clearing authentication state
 * - Resetting subscription requirements
 * - Clearing any cached data
 * - Redirecting to sign-in page
 */
export const handleLogout = () => {
  try {
    // Clear authentication state
    useAuthStore.getState().clearAuth();

    // Reset subscription requirements
    useSubscriptionStore.getState().clear();

    // Clear any cached data from localStorage (optional)
    if (typeof window !== "undefined") {
      // Clear any other app-specific cached data
      const keysToRemove = [
        "auth-storage",
        "dashboard-search-history",
        "user-preferences",
        "recent-activities",
      ];

      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          // Ignore errors for individual items
        }
      });
    }

    // Redirect to sign-in page, preserving locale
    if (typeof window !== "undefined") {
      const pathSegments = window.location.pathname.split("/");
      const locale = pathSegments[1];
      const hasLocale = locale === "en" || locale === "ar" || locale === "ku";
      window.location.href = hasLocale ? `/${locale}/sign-in` : "/sign-in";
    }
  } catch (error) {
    console.error("Error during logout:", error);
    // Fallback: force redirect even if stores fail
    if (typeof window !== "undefined") {
      window.location.href = "/sign-in";
    }
  }
};

/**
 * Hook-based logout function for components that need router access.
 * This is preferred for components that are already using Next.js router.
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    try {
      // Clear all react query data
      queryClient.clear();

      // Clear authentication state
      useAuthStore.getState().clearAuth();

      // Reset subscription requirements
      useSubscriptionStore.getState().clear();

      // Clear any cached data from localStorage (optional)
      if (typeof window !== "undefined") {
        // Clear any other app-specific cached data
        const keysToRemove = [
          "auth-storage",
          "dashboard-search-history",
          "user-preferences",
          "recent-activities",
        ];

        keysToRemove.forEach((key) => {
          try {
            localStorage.removeItem(key);
          } catch (e) {
            // Ignore errors for individual items
          }
        });
      }

      // Redirect to sign-in page
      router.push("/sign-in");
    } catch (error) {
      console.error("Error during logout:", error);
      // Fallback: force redirect even if stores fail
      router.push("/sign-in");
    }
  };
};
