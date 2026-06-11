"use client";

import { useEffect, useState } from "react";
import { fetchFavorites, removeFavorite } from "@/lib/api";
import { CatCard } from "@/components/CatCard";
import { useLocale } from "@/components/LocaleContext";
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
  const { t } = useLocale();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await fetchFavorites();

      const enriched = await Promise.all(
        data.map(async (fav: Favorite) => {
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

      setFavorites(enriched);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (favorites.length === 0) {
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
      <div>
        <h1 className="text-3xl font-bold mb-2">{t.favoritesTitle} ❤️</h1>
        <p className="text-muted-foreground">
          {favorites.length} {t.catsSaved}
        </p>
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
    </div>
  );
}