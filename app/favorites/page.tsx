"use client";

import { useEffect, useState } from "react";
import { fetchFavorites, removeFavorite } from "@/lib/api";
import { CatCard } from "@/components/CatCard";
import { Heart } from "lucide-react";

const API_KEY = process.env.NEXT_PUBLIC_CAT_API_KEY;

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

  useEffect(() => {
    async function load() {
      const data = await fetchFavorites();

      // Busca todas as raças em paralelo com limite de 5 por vez
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
        // Mostra os resultados conforme chegam
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
      <div>
        <h1 className="text-3xl font-bold mb-2">Your Favorites ❤️</h1>
        <p className="text-muted-foreground">{favorites.length} cats saved</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {favorites.map((fav) => (
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

      {loading && (
        <div className="flex justify-center">
          <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}