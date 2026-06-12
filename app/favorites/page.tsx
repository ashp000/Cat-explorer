"use client";

import { useEffect, useState } from "react";
import { fetchFavorites, removeFavorite } from "@/lib/api";
import { CatCard } from "@/components/CatCard";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";

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
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!loading && favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4 text-muted-foreground">
        <Heart size={48} className="opacity-30" />
        <p className="text-lg">No favorites yet</p>
        <p className="text-sm">Go explore some cats and heart your favorites!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Favorites ❤️</h1>
          <p className="text-muted-foreground">{favorites.length} cats saved</p>
        </div>
        {loading && (
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="text-sm text-muted-foreground">
            {currentPage + 1} / {totalPages}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={currentPage === totalPages - 1}
            className="flex items-center gap-1 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}