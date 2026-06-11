"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";

interface CatCardProps {
  id: string;
  url: string;
  breed?: string;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}

export function CatCard({ id, url, breed, isFavorited, onToggleFavorite }: CatCardProps) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(`/${id}`)}
      className="group relative rounded-xl overflow-hidden bg-card border border-border shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      <div className="relative w-full h-64">
        <Image
          src={url}
          alt={breed || "Cat"}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent">
        <span className="text-white text-sm font-medium drop-shadow">
          {breed || "Unknown breed"}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(id);
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            isFavorited
              ? "bg-red-500 text-white"
              : "bg-white/20 text-white hover:bg-red-500"
          }`}
        >
          <Heart size={15} className={isFavorited ? "fill-white" : ""} />
        </button>
      </div>
    </div>
  );
}