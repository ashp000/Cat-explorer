"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { CometCard } from "@/components/CometCard";

interface CatCardProps {
  id: string;
  url: string;
  breed?: string;
  isFavorited: boolean;
  onToggleFavorite: (id: string) => void;
}

export function CatCard({
  id,
  url,
  breed,
  isFavorited,
  onToggleFavorite,
}: CatCardProps) {
  return (
    <CometCard className="rounded-2xl overflow-hidden group">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted">

        <Image
          src={url}
          alt={breed ?? "Cat"}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          draggable={false}
        />

        {/* gradiente inferior sempre visível */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent rounded-2xl" />

        {/* botão de favorito */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggleFavorite(id);
          }}
          aria-label={isFavorited ? "Remover dos favoritos" : "Adicionar aos favoritos"}
          className="absolute top-2.5 right-2.5 z-20 p-1.5 rounded-full bg-black/30 backdrop-blur-sm transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <Heart
            size={16}
            className={`transition-colors duration-200 ${
              isFavorited
                ? "fill-rose-400 stroke-rose-400"
                : "stroke-white fill-transparent"
            }`}
          />
        </button>

        {/* info + botão ver detalhes — aparece no hover */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-3 pb-3 flex flex-col gap-2">
          {breed && (
            <p className="text-white text-xs font-medium truncate drop-shadow-sm">
              {breed}
            </p>
          )}
          <Link
            href={`/${id}`}
            className="w-full text-center text-xs font-semibold py-1.5 rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          >
            Ver detalhes →
          </Link>
        </div>

      </div>
    </CometCard>
  );
}