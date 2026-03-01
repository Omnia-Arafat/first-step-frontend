import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sidebarService } from "@/services/dashboardApi";
import { useHasRole } from "@/store/authStore";

export type Occasion = {
  id: string;
  title: string;
  date: Date;
};

export const useOccasions = () => {
  const queryClient = useQueryClient();
  const isEstablishment = useHasRole(["center", "nursery", "branch_admin"]);

  const {
    data: occasions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["occasions"],
    queryFn: async () => {
      const response = await (isEstablishment
        ? sidebarService.getCenterOccasions()
        : sidebarService.getOccasions());
      return response.data.map((occasion: any) => ({
        id: occasion.id,
        title: occasion.title,
        date: new Date(occasion.date),
      }));
    },
  });

  const addOccasion = useMutation({
    mutationFn: async (item: Omit<Occasion, "id">) => {
      const response = await (isEstablishment
        ? sidebarService.createCenterOccasion({
            title: item.title,
            date: item.date.toISOString().split("T")[0],
          })
        : sidebarService.createOccasion({
            title: item.title,
            date: item.date.toISOString().split("T")[0],
          }));
      return response;
    },
    onMutate: async (newOccasion) => {
      await queryClient.cancelQueries({ queryKey: ["occasions"] });
      const previousOccasions = queryClient.getQueryData<Occasion[]>([
        "occasions",
      ]);

      queryClient.setQueryData<Occasion[]>(["occasions"], (old = []) => [
        ...old,
        { ...newOccasion, id: crypto.randomUUID() },
      ]);

      return { previousOccasions };
    },
    onError: (err, newOccasion, context) => {
      if (context?.previousOccasions) {
        queryClient.setQueryData(["occasions"], context.previousOccasions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["occasions"] });
    },
  });

  const updateOccasion = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Occasion>;
    }) => {
      await (isEstablishment
        ? sidebarService.updateCenterOccasion(id, {
            title: updates.title || "",
            date:
              updates.date?.toISOString().split("T")[0] ||
              new Date().toISOString().split("T")[0],
          })
        : sidebarService.updateOccasion(id, {
            title: updates.title || "",
            date:
              updates.date?.toISOString().split("T")[0] ||
              new Date().toISOString().split("T")[0],
          }));
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["occasions"] });
      const previousOccasions = queryClient.getQueryData<Occasion[]>([
        "occasions",
      ]);

      queryClient.setQueryData<Occasion[]>(["occasions"], (old = []) =>
        old.map((occasion: Occasion) =>
          occasion.id === id ? { ...occasion, ...updates } : occasion,
        ),
      );

      return { previousOccasions };
    },
    onError: (err, variables, context) => {
      if (context?.previousOccasions) {
        queryClient.setQueryData(["occasions"], context.previousOccasions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["occasions"] });
    },
  });

  const deleteOccasion = useMutation({
    mutationFn: async (id: string) => {
      await (isEstablishment
        ? sidebarService.deleteCenterOccasion(id)
        : sidebarService.deleteOccasion(id));
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["occasions"] });
      const previousOccasions = queryClient.getQueryData<Occasion[]>([
        "occasions",
      ]);

      queryClient.setQueryData<Occasion[]>(["occasions"], (old = []) =>
        old.filter((occasion) => occasion.id !== id),
      );

      return { previousOccasions };
    },
    onError: (err, id, context) => {
      if (context?.previousOccasions) {
        queryClient.setQueryData(["occasions"], context.previousOccasions);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["occasions"] });
    },
  });

  return {
    occasions,
    isLoading,
    error,
    addOccasion,
    updateOccasion,
    deleteOccasion,
  };
};
