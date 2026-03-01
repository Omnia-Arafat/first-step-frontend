import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { sidebarService } from "@/services/dashboardApi";
import { useHasRole } from "@/store/authStore";

export type Task = {
  id: string;
  title: string;
  date: Date;
  done: boolean;
};

export const useTasks = () => {
  const queryClient = useQueryClient();
  const isEstablishment = useHasRole(["center", "nursery", "branch_admin"]);

  const {
    data: tasks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const response = await (isEstablishment
        ? sidebarService.getCenterTasks()
        : sidebarService.getTasks());
      return response.map((task: any) => ({
        id: task.id,
        title: task.title,
        date: new Date(task.date),
        done: task.done,
      }));
    },
  });

  const addTask = useMutation({
    mutationFn: async (item: Omit<Task, "id">) => {
      const response = await (isEstablishment
        ? sidebarService.createCenterTask({
            title: item.title,
            date: item.date.toISOString().split("T")[0],
            done: item.done,
          })
        : sidebarService.createTask({
            title: item.title,
            date: item.date.toISOString().split("T")[0],
            done: item.done,
          }));
      return response;
    },
    onMutate: async (newTask) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["tasks"] });

      // Snapshot the previous value
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      // Optimistically update to the new value
      queryClient.setQueryData<Task[]>(["tasks"], (old = []) => [
        ...old,
        { ...newTask, id: crypto.randomUUID() },
      ]);

      // Return a context object with the snapshotted value
      return { previousTasks };
    },
    onError: (err, newTask, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure data is in sync
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const updateTask = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Task>;
    }) => {
      await (isEstablishment
        ? sidebarService.updateCenterTask(id, {
            title: updates.title || "",
            date:
              updates.date?.toISOString().split("T")[0] ||
              new Date().toISOString().split("T")[0],
            done: updates.done ?? false,
          })
        : sidebarService.updateTask(id, {
            title: updates.title || "",
            date:
              updates.date?.toISOString().split("T")[0] ||
              new Date().toISOString().split("T")[0],
            done: updates.done ?? false,
          }));
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((task: Task) =>
          task.id === id ? { ...task, ...updates } : task,
        ),
      );

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      await (isEstablishment
        ? sidebarService.deleteCenterTask(id)
        : sidebarService.deleteTask(id));
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.filter((task) => task.id !== id),
      );

      return { previousTasks };
    },
    onError: (err, id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const toggleTaskDone = useMutation({
    mutationFn: async ({ id, done }: { id: string; done: boolean }) => {
      const task = tasks.find((t: Task) => t.id === id);
      if (!task) throw new Error("Task not found");

      await (isEstablishment
        ? sidebarService.updateCenterTask(id, {
            title: task.title,
            date: task.date.toISOString().split("T")[0],
            done,
          })
        : sidebarService.updateTask(id, {
            title: task.title,
            date: task.date.toISOString().split("T")[0],
            done,
          }));
    },
    onMutate: async ({ id, done }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousTasks = queryClient.getQueryData<Task[]>(["tasks"]);

      queryClient.setQueryData<Task[]>(["tasks"], (old = []) =>
        old.map((task) => (task.id === id ? { ...task, done } : task)),
      );

      return { previousTasks };
    },
    onError: (err, variables, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(["tasks"], context.previousTasks);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskDone,
  };
};
