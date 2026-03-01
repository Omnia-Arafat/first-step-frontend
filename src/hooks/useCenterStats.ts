import { useQuery } from "@tanstack/react-query";
import { centerService } from "@/services/dashboardApi";
import { useHasRole, useAuthUser } from "@/store/authStore";
import { useSubscriptionStore } from "@/store/subscriptionStore";

export type Stats = {
  total_enrollments: number;
  total_active_enrollments: number;
  total_branches?: number; // Only for center role
  total_children: number;
  total_team_members: number;
  total_parents: number;
  enrollments_over_time: Record<string, number>;
  enrollment_status_breakdown: {
    pending: number;
    accepted: number;
    rejected: number;
  };
  child_demographics: {
    age_groups: Record<string, number>;
    gender_distribution: {
      boy: number;
      girl: number;
    };
  };
  parent_engagement: {
    most_active_parents: any[];
    total_messages: number;
  };
  total_revenue_for_the_lates_5_months: any[];
  branches_ordering_depending_on_the_number_of_enrollments?: Array<{
    nursery_name: string;
    enrollment_count: number;
  }>; // Only for center role
};

type Role = "center" | "branch";

export const useCenterStats = (role: Role) => {
  const isCenter = useHasRole(["center", "nursery", "branch_admin"]);
  const { subscriptionRequired } = useSubscriptionStore();

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["stats", role],
    queryFn: async () => {
      const response =
        role === "center"
          ? await centerService.getCenterStats()
          : await centerService.getBranchStats();
      return response;
    },
    enabled: isCenter,
    retry: (failureCount, error: any) => {
      // Don't retry if it's a subscription error
      if (error?.response?.status === 402 || subscriptionRequired) {
        return false;
      }
      return failureCount < 3;
    },
  });

  return {
    stats,
    isLoading,
    error,
    subscriptionRequired,
  };
};
