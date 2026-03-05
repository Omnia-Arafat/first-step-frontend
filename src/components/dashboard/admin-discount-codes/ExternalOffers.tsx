"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/promocodeService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, RefreshCw, Archive, Trash2 } from "lucide-react";
import ExternalOfferCard from "./ExternalOfferCard";
import ExternalOfferForm from "./ExternalOfferForm";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { FilterButtons } from "@/components/common/FilterButtons";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

function ExternalOfferCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-100 bg-white">
      <div className="p-4 flex flex-col md:flex-row h-full gap-4">
        <div className="absolute top-4 left-4 z-10">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        <div className="rounded-xl overflow-hidden w-full h-full md:w-[120px] bg-gray-100 order-1 relative shrink-0">
          <Skeleton className="h-full min-h-40 w-full rounded-xl" />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 z-10">
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-2 w-2 rounded-full" />
            <Skeleton className="h-2 w-2 rounded-full" />
          </div>
        </div>

        <div className="flex-1 p-6 flex flex-col lg:grid lg:grid-cols-2 gap-4 text-start order-2">
          <div className="space-y-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          <div className="space-y-2 mt-auto">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-48" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ExternalOffers() {
  const t = useTranslations("externalOffers");
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "deleted">("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<any | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isPermanentDelete, setIsPermanentDelete] = useState(false);

  const { data: offersData, isLoading } = useQuery({
    queryKey: ["external-offers"],
    queryFn: adminService.getExternalOffers,
  });

  const offers = useMemo(() => {
    const data = Array.isArray(offersData)
      ? offersData
      : offersData?.data || [];
    return data;
  }, [offersData]);

  const archiveMutation = useMutation({
    mutationFn: adminService.archiveExternalOffer,
    onSuccess: () => {
      toast.success(t("toast.archiveSuccess"));
      queryClient.invalidateQueries({ queryKey: ["external-offers"] });
      setDeleteId(null);
      setIsPermanentDelete(false);
    },
    onError: (error: any) => {
      toast.error(error.message || t("toast.archiveError"));
      setDeleteId(null);
      setIsPermanentDelete(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: adminService.deleteExternalOffer,
    onSuccess: () => {
      toast.success(t("toast.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["external-offers"] });
      setDeleteId(null);
      setIsPermanentDelete(false);
    },
    onError: (error: any) => {
      toast.error(error.message || t("toast.deleteError"));
      setDeleteId(null);
      setIsPermanentDelete(false);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: adminService.restoreExternalOffer,
    onSuccess: () => {
      toast.success(t("toast.restoreSuccess"));
      queryClient.invalidateQueries({ queryKey: ["external-offers"] });
    },
    onError: (error: any) => {
      toast.error(error.message || t("toast.restoreError"));
    },
  });

  const confirmDelete = () => {
    if (deleteId) {
      if (isPermanentDelete) {
        deleteMutation.mutate(deleteId);
      } else {
        archiveMutation.mutate(deleteId);
      }
    }
  };

  const filteredOffers = useMemo(() => {
    return offers.filter((offer: any) => {
      const matchesSearch =
        offer.center_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.descriptions?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filter === "all" ||
        (filter === "active" && offer.status !== "archived") ||
        (filter === "deleted" && offer.status === "archived");

      return matchesSearch && matchesFilter;
    });
  }, [offers, searchQuery, filter]);

  const handleEdit = (offer: any) => {
    setEditingOffer(offer);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingOffer(null);
  };

  const filters = [
    { value: "all" as const, label: t("filters.all") },
    { value: "active" as const, label: t("filters.active") },
    { value: "deleted" as const, label: t("filters.archived") },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <Skeleton className="h-9 w-28 rounded-md" />
          <Skeleton className="h-10 w-full sm:w-96 rounded-lg" />
        </div>
        <div className="grid gap-4">
          <ExternalOfferCardSkeleton />
          <ExternalOfferCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex justify-between items-center">
        <FilterButtons
          filters={filters}
          activeFilter={filter}
          onFilterChange={setFilter}
        />
      </div>

      {/* Search and Add */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <Button size="sm" variant="default" onClick={() => setIsFormOpen(true)}>
          <Plus className="w-5 h-5" />
          <span>{t("buttons.add")}</span>
        </Button>

        <div className="relative w-full sm:w-96">
          <Input
            placeholder={t("search.placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pr-10 text-right"
            dir="rtl"
          />
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        </div>
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOffers.length > 0 ? (
          filteredOffers.map((offer: any) => (
            <ExternalOfferCard
              key={offer.id}
              offer={offer}
              onDelete={setDeleteId}
              onEdit={handleEdit}
              onRestore={(id) => restoreMutation.mutate(id)}
            />
          ))
        ) : (
          <div className="text-center py-10 text-gray-500 col-span-full">
            {t("empty.noMatches")}
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <ExternalOfferForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        offer={editingOffer}
      />

      {/* Delete/Archive Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDeleteId(null);
            setIsPermanentDelete(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center justify-start gap-2 rtl:flex-row-reverse">
              <Archive className="w-5 h-5 text-primary" />
              {t("buttons.archive")}
            </DialogTitle>
            <div className="mt-2">
              {t("dialog.confirmDelete.archiveOption")}
            </div>
          </DialogHeader>

          <div className="flex items-center justify-start gap-2 py-4 px-2 bg-red-50/50 rounded-lg border border-red-100 mt-2 rtl:flex-row-reverse">
            <Checkbox
              id="permanent-delete"
              checked={isPermanentDelete}
              onCheckedChange={(checked: boolean) =>
                setIsPermanentDelete(checked)
              }
              className="border-red-300 data-[state=checked]:bg-red-500 data-[state=checked]:border-red-500"
            />
            <span
              // htmlFor="permanent-delete"
              className="text-xs font-medium text-red-600 cursor-pointer"
            >
              {t("dialog.confirmDelete.deleteTitle")} ({" "}
              {t("dialog.confirmDelete.deleteOption")} )
            </span>
          </div>

          <div className="flex flex-row-reverse gap-3 mt-6">
            <Button
              variant={isPermanentDelete ? "destructive" : "default"}
              className="flex-1"
              onClick={confirmDelete}
              disabled={archiveMutation.isPending || deleteMutation.isPending}
            >
              {(archiveMutation.isPending || deleteMutation.isPending) && (
                <RefreshCw className="w-4 h-4 ml-2 animate-spin" />
              )}
              {isPermanentDelete
                ? t("buttons.permanentDelete")
                : t("buttons.archive")}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setDeleteId(null);
                setIsPermanentDelete(false);
              }}
            >
              {t("buttons.cancel")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
