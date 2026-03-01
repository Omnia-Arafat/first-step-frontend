"use client";
import { useState, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { useSubscriptionRequired } from "@/store/subscriptionStore";
import { useAuthUser } from "@/store/authStore";
import Header from "@/components/dashboard/Header";
import DashboardSideBar from "@/components/dashboard/Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import SecondarySidebar from "@/components/dashboard/SecondarySidebar";
import {
  useSecondarySidebarOpen,
  useSetSecondarySidebarOpen,
} from "@/store/sidebarStore";
import SubscriptionGate from "@/components/dashboard/SubscriptionGate";
import WarningBar from "@/components/dashboard/WarningBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const user = useAuthUser();

  // Sidebar open state (for main sidebar only) - default to open
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Secondary sidebar state from global store
  const secondarySidebarOpen = useSecondarySidebarOpen();
  const setSecondarySidebarOpen = useSetSecondarySidebarOpen();

  const allowedPathnames = ["/dashboard/center/billing"];
  const subscriptionRequired = useSubscriptionRequired();
  const isSubscriptionRequired =
    !allowedPathnames.includes(pathname) && subscriptionRequired;

  // Authentication is now handled by middleware
  // No need for client-side guards
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent components from crashing if user state is cleared during a logout transition.
  if (mounted && !user) {
    return null;
  }

  return (
    <div className="relative h-screen">
      <SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <DashboardSideBar />
        <div className="w-full">
          <Header
            onToggleFullscreen={() => {
              if (sidebarOpen || secondarySidebarOpen) {
                setSidebarOpen(false);
                setSecondarySidebarOpen(false);
              } else {
                setSidebarOpen(true);
                setSecondarySidebarOpen(true);
              }
            }}
            sidebarOpen={sidebarOpen}
            secondarySidebarOpen={secondarySidebarOpen}
          />

          {/* Warning Bar */}
          {user?.role === "center" ||
          user?.role === "nursery" ||
          user?.role === "branch_admin" ? (
            <WarningBar />
          ) : null}

          <div className="px-4 md:px-10 py-10">
            {isSubscriptionRequired ? <SubscriptionGate /> : children}
          </div>
        </div>
        {/* SecondarySidebar only on xl screens, toggleable */}
        <div className="hidden xl:block">
          <SidebarProvider
            open={secondarySidebarOpen}
            onOpenChange={setSecondarySidebarOpen}
          >
            <SecondarySidebar />
          </SidebarProvider>
        </div>
      </SidebarProvider>
    </div>
  );
}
