import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { centerService } from "@/services/dashboardApi";
import { PortfolioFormData } from "@/types";
import { toastSuccess, toastError } from "@/lib/toast";
import { useTranslations } from "next-intl";
import { ApiError } from "@/lib/error-handling";

// Transform API data to match our form structure
const transformApiData = (apiData: any): PortfolioFormData => {
  const initialData: PortfolioFormData = {
    title_of_hero: "",
    subtitle_of_hero: "",
    description: "",
    images_activities: [],
    contact_info: {
      facebook: "",
      instagram: "",
      linkedIn: "",
      twitter: "",
      website: "",
    },
  };

  if (!apiData) return initialData;

  return {
    title_of_hero: apiData.hero_section?.title_of_hero || "",
    subtitle_of_hero: apiData.hero_section?.subtitle_of_hero || "",
    description: apiData.hero_section?.description || "",
    images_activities: apiData.images_activities || [],
    contact_info: {
      facebook: apiData.contact_info?.facebook || "",
      instagram: apiData.contact_info?.instagram || "",
      linkedIn: apiData.contact_info?.linkedIn || "",
      twitter: apiData.contact_info?.twitter || "",
      website: apiData.contact_info?.website || "",
    },
  };
};

export const usePortfolio = () => {
  const queryClient = useQueryClient();
  const t = useTranslations("dashboard.profileEditor");

  // Query for portfolio data
  const portfolioQuery = useQuery({
    queryKey: ["portfolio"],
    queryFn: async () => {
      const response = await centerService.getPortfolio();
      return transformApiData(response.portofilo);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Mutation for saving portfolio
  const savePortfolioMutation = useMutation<any, ApiError, PortfolioFormData>({
    mutationFn: async (data: PortfolioFormData) => {
      return await centerService.savePortfolio(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["portfolio"] });
      toastSuccess(t("saveSuccess"));
    },
    onError: (error: ApiError) => {
      console.error("Failed to save portfolio:", error);

      // Extract details if available
      if (error.errors && Object.keys(error.errors).length > 0) {
        const firstErrorKey = Object.keys(error.errors)[0];
        const firstError = error.errors[firstErrorKey];
        const firstErrorMessage = Array.isArray(firstError)
          ? firstError[0]
          : firstError;

        toastError(t("saveError"), firstErrorMessage);
      } else {
        // Fallback to error message or translated generic error
        const message =
          error.message && !error.message.includes("server")
            ? error.message
            : t("saveError");
        toastError(message);
      }
    },
  });

  return {
    // Query data
    data: portfolioQuery.data,
    isLoading: portfolioQuery.isLoading,
    error: portfolioQuery.error,

    // Mutation
    savePortfolio: savePortfolioMutation.mutate,
    isSaving: savePortfolioMutation.isPending,
    saveData: savePortfolioMutation.data,
    saveError: savePortfolioMutation.error,

    // Refetch
    refetch: portfolioQuery.refetch,
  };
};
