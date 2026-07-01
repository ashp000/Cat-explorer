"use client";

import { useEffect, useState } from "react";
import { fetchFavorites, removeFavorite } from "@/lib/api";
import { CatCard } from "@/components/CatCard";
import { SkeletonCard } from "@/components/ui/SkeletonCard";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";

const API_KEY = process.env.NEXT_PUBLIC_CAT_API_KEY;
const ITEMS_PER_PAGE = 12;

interface Favorite {
  id: number;
  image_id: string;
  image: {
    id: string;
    url: string;
  };
  breed?: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const { t } = useLocale();

  const totalPages = Math.ceil(favorites.length / ITEMS_PER_PAGE);
  const paginatedFavorites = favorites.slice(
    currentPage * ITEMS_PER_PAGE,
    (currentPage + 1) * ITEMS_PER_PAGE
  );

  useEffect(() => {
    async function load() {
      const data = await fetchFavorites();

      const chunks = [];
      for (let i = 0; i < data.length; i += 5) {
        chunks.push(data.slice(i, i + 5));
      }

      const enriched: Favorite[] = [];
      for (const chunk of chunks) {
        const results = await Promise.all(
          chunk.map(async (fav: Favorite) => {
            try {
              const res = await fetch(
                `https://api.thecatapi.com/v1/images/${fav.image.id}`,
                { headers: { "x-api-key": API_KEY! } }
              );
              const detail = await res.json();
              return { ...fav, breed: detail.breeds?.[0]?.name };
            } catch {
              return fav;
            }
          })
        );
        enriched.push(...results);
        setFavorites([...enriched]);
      }

      setLoading(false);
    }

    load();
  }, []);

  const handleRemove = async (imageId: string) => {
    const existing = favorites.find((f) => f.image_id === imageId);
    if (existing) {
      await removeFavorite(existing.id);
      setFavorites((prev) => prev.filter((f) => f.image_id !== imageId));
      if (paginatedFavorites.length === 1 && currentPage > 0) {
        setCurrentPage((p) => p - 1);
      }
    }
  };

  if (loading && favorites.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-h-[600px] content-start">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
          <SkeletonCard key={`skeleton-${i}`} />
        ))}
      </div>
    );
  }

  if (!loading && favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground">
        <Heart size={48} className="opacity-30" />
        <p className="text-lg">{t.noFavorites}</p>
        <p className="text-sm">{t.noFavoritesDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">{t.favoritesTitle} ❤️</h1>
          <p className="text-muted-foreground">{favorites.length} {t.catsSaved}</p>
        </div>
        {loading && (
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 min-h-[600px] content-start">
        {paginatedFavorites.map((fav) => (
          <CatCard
            key={fav.id}
            id={fav.image.id}
            url={fav.image.url}
            breed={fav.breed}
            isFavorited={true}
            onToggleFavorite={handleRemove}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/10 hover:scale-110 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i)}
              className={`w-9 h-9 rounded-lg border text-sm font-medium transition-all duration-150 cursor-pointer hover:scale-110 ${
                currentPage === i
                  ? "border-primary text-primary bg-primary/10 shadow-sm shadow-primary/30"
                  : "border-border text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/10 hover:shadow-sm hover:shadow-primary/20"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary hover:bg-primary/10 hover:scale-110 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}