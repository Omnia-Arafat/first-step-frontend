"use client";

import { useEffect, useRef, useState } from "react";
import { Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PhotoAlbumItem {
  id?: number;
  image?: File | string;
  kind?: string;
}

export interface PhotoAlbumSectionViewProps {
  items: PhotoAlbumItem[];
  uploadTitle: string;
  uploadHint: string;
  formatsNote: string;
  uploadedTitle: string;
  onFilesSelected: (files: FileList | null) => void;
  onRemove: (index: number) => void;
  error?: string;
}

const PhotoAlbumPreview = ({
  item,
  alt,
  onRemove,
}: {
  item: PhotoAlbumItem;
  alt: string;
  onRemove: () => void;
}) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (item.image instanceof File) {
      const url = URL.createObjectURL(item.image);
      setObjectUrl(url);
      return () => URL.revokeObjectURL(url);
    }

    setObjectUrl(null);
    return undefined;
  }, [item.image]);

  const src =
    typeof item.image === "string" && item.image ? item.image : objectUrl;

  if (!src) return null;

  return (
    <div className="relative aspect-square rounded-2xl overflow-hidden border border-light-gray group bg-gray-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          type="button"
          variant="destructive"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-9 h-9 rounded-full"
        >
          <Trash2 className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export function PhotoAlbumSectionView({
  items,
  uploadTitle,
  uploadHint,
  formatsNote,
  uploadedTitle,
  onFilesSelected,
  onRemove,
  error,
}: PhotoAlbumSectionViewProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-6 lg:space-y-8 text-start">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          onFilesSelected(e.dataTransfer.files);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative border-2 border-dashed rounded-3xl p-6 lg:p-12 text-center transition-all cursor-pointer group",
          isDragging
            ? "border-primary bg-primary/5 scale-[0.99]"
            : "border-gray-200 bg-gray-50/30 hover:border-primary/50 hover:bg-gray-50",
        )}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={(e) => onFilesSelected(e.target.files)}
          multiple
          accept="image/*"
          className="hidden"
        />
        <div className="flex flex-col items-center">
          <div className="space-y-1 mb-4 sm:mb-6">
            <h4 className="text-lg sm:text-xl font-bold text-gray-800">
              {uploadTitle}
            </h4>
            <p className="text-mid-gray text-base sm:text-lg">{uploadHint}</p>
          </div>

          <div className="w-14 h-14 rounded-full bg-primary/5 flex items-center justify-center text-primary mb-4">
            <Upload className="w-6 h-6" />
          </div>

          <p className="text-xs text-mid-gray mt-2">{formatsNote}</p>
        </div>
      </div>

      {items.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-bold text-primary text-lg px-1">
            {uploadedTitle}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item, index) => (
              <PhotoAlbumPreview
                key={item.id ?? index}
                item={item}
                alt={item.kind || `Activity ${index + 1}`}
                onRemove={() => onRemove(index)}
              />
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-destructive px-1">{error}</p>}
    </div>
  );
}
