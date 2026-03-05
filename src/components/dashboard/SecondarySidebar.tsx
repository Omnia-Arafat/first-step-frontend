"use client";

import React from "react";
import { useLocale, useTranslations } from "next-intl";
import { PlusCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
} from "@/components/ui/sidebar";
import Header from "./secondary-sidebar/Header";
import TaskCard from "./secondary-sidebar/TaskCard";
import Card from "./secondary-sidebar/Card";
import EmptyState from "./secondary-sidebar/EmptyState";
import { Task, useTasks } from "@/hooks/useTasks";
import { useOccasions, Occasion } from "@/hooks/useOccasions";
import { useBirthdays, Birthday } from "@/hooks/useBirthdays";
import { useSubscriptionRequired } from "@/store/subscriptionStore";
import { Skeleton } from "@/components/ui/skeleton";

const SidebarSectionSkeleton = ({
  variant = "cards",
}: {
  variant?: "cards" | "tasks";
}) => {
  return (
    <div className="mt-2 flex flex-col items-center gap-y-2">
      {Array.from({ length: 3 }).map((_, index) =>
        variant === "tasks" ? (
          <div
            key={index}
            className="relative w-full rounded-xl border border-gray-100 bg-white px-3 py-3"
          >
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-sm" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4 rounded-sm" />
                <Skeleton className="h-4 w-4 rounded-sm" />
              </div>
            </div>
          </div>
        ) : (
          <div
            key={index}
            className="w-full rounded-xl border border-gray-100 bg-white px-4 py-3"
          >
            <div className="space-y-2 text-center">
              <Skeleton className="mx-auto h-4 w-28" />
              <Skeleton className="mx-auto h-3 w-18" />
            </div>
          </div>
        ),
      )}
      <div className="h-px w-4/5 rounded-full bg-gray-100" />
    </div>
  );
};

const SecondarySidebar = () => {
  const locale = useLocale();
  const t = useTranslations("dashboard.secondary-sidebar");
  const subscriptionRequired = useSubscriptionRequired();

  // Map locale to proper locale string for date formatting
  const dateLocale = locale === "ar" ? "ar-SA" : "en-US";
  const [newItemId, setNewItemId] = React.useState<string | null>(null);
  const [isAddingTask, setIsAddingTask] = React.useState(false);
  const [isAddingOccasion, setIsAddingOccasion] = React.useState(false);

  const {
    occasions,
    isLoading: occasionsLoading,
    error: occasionsError,
    addOccasion,
  } = useOccasions();
  const {
    birthdays,
    isLoading: birthdaysLoading,
    error: birthdaysError,
  } = useBirthdays();
  const { tasks, isLoading, error, addTask } = useTasks();

  return (
    <Sidebar
      className="bg-sidebar h-screen py-10 px-4 fixed top-0 ltr:right-0 rtl:left-0 z-30"
      side={locale === "ar" ? "left" : "right"}
      collapsible="offcanvas"
    >
      <SidebarHeader className="mb-9 px-0">
        <Header />
      </SidebarHeader>

      <SidebarContent>
        {subscriptionRequired ? (
          <div></div>
        ) : (
          <>
            <SidebarGroup className="px-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-xl text-primary">
                  {t("upcoming-occasions")}
                </p>
                <PlusCircle
                  onClick={() => {
                    setIsAddingOccasion(true);
                    addOccasion.mutate({
                      title: t("add.occasion"),
                      date: new Date(),
                    });
                  }}
                  className="size-4 text-light-gray hover:text-primary cursor-pointer"
                />
              </div>

              {occasionsLoading ? (
                <SidebarSectionSkeleton />
              ) : occasionsError ? (
                <div className="mt-4 text-center text-error">
                  {occasionsError instanceof Error
                    ? occasionsError.message
                    : t("error")}
                </div>
              ) : occasions.length === 0 ? (
                <EmptyState
                  onAdd={() => {
                    setIsAddingOccasion(true);
                    addOccasion.mutate({
                      title: t("add.occasion"),
                      date: new Date(),
                    });
                  }}
                />
              ) : (
                <div className="mt-2 flex flex-col items-center gap-y-2">
                  {occasions.map((item: Occasion, index: number) => (
                    <Card
                      key={item.id}
                      id={item.id}
                      type="occasion"
                      title={item.title}
                      rawDate={item.date}
                      date={item.date.toLocaleDateString(dateLocale, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                      isNew={isAddingOccasion && index === occasions.length - 1}
                      onEditComplete={() => setIsAddingOccasion(false)}
                    />
                  ))}
                  <div className="w-4/5 h-px bg-light-gray rounded-full" />
                </div>
              )}
            </SidebarGroup>

            <SidebarGroup className="px-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-xl text-primary">
                  {t("birthdays")}
                </p>
              </div>

              {birthdaysLoading ? (
                <SidebarSectionSkeleton />
              ) : birthdaysError ? (
                <div className="mt-4 text-center text-error">
                  {birthdaysError instanceof Error
                    ? birthdaysError.message
                    : t("error")}
                </div>
              ) : birthdays.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="mt-2 flex flex-col items-center gap-y-2">
                  {birthdays.map((item: Birthday) => (
                    <Card
                      key={item.id}
                      id={item.id}
                      type="birthday"
                      title={item.title}
                      rawDate={item.date}
                      date={item.date.toLocaleDateString(dateLocale, {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    />
                  ))}
                  <div className="w-4/5 h-px bg-light-gray rounded-full" />
                </div>
              )}
            </SidebarGroup>

            <SidebarGroup>
              <div className="flex items-center justify-between">
                <p className="font-medium text-xl text-primary">{t("tasks")}</p>

                <div className="flex items-center gap-x-2">
                  <p className="text-xs text-success">
                    {t("tasks-progress", {
                      completed: tasks.filter((t: Task) => t.done).length,
                      total: tasks.length,
                    })}
                  </p>
                  <PlusCircle
                    onClick={() => {
                      setIsAddingTask(true);
                      addTask.mutate({
                        title: t("add.task"),
                        date: new Date(),
                        done: false,
                      });
                    }}
                    className="size-4 text-light-gray hover:text-primary cursor-pointer"
                  />
                </div>
              </div>

              {isLoading && tasks.length === 0 ? (
                <SidebarSectionSkeleton variant="tasks" />
              ) : error ? (
                <div className="mt-4 text-center text-error">
                  {error instanceof Error ? error.message : t("error")}
                </div>
              ) : tasks.length === 0 ? (
                <EmptyState
                  onAdd={() => {
                    setIsAddingTask(true);
                    addTask.mutate({
                      title: t("add.task"),
                      date: new Date(),
                      done: false,
                    });
                  }}
                />
              ) : (
                <div className="mt-2 flex flex-col gap-y-2">
                  {/* Tasks list */}
                  <div className="flex flex-col items-center gap-y-2">
                    {tasks.map((item: Task, index: number) => (
                      <TaskCard
                        key={item.id}
                        id={item.id}
                        title={item.title}
                        rawDate={item.date}
                        date={item.date.toLocaleDateString(dateLocale, {
                          day: "numeric",
                          month: "numeric",
                          year: "numeric",
                        })}
                        done={item.done}
                        isNew={isAddingTask && index === tasks.length - 1}
                        onEditComplete={() => setIsAddingTask(false)}
                      />
                    ))}
                    <div className="w-4/5 h-px bg-light-gray rounded-full mt-1" />
                  </div>
                </div>
              )}
            </SidebarGroup>
          </>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default SecondarySidebar;
