"use client";

import { useEffect, useState, useCallback } from "react";
import { fetchCats, fetchBreeds, addFavorite, removeFavorite, fetchFavorites } from "@/lib/api";
import { CatCard } from "@/components/CatCard";
import { BreedFilter } from "@/components/BreedFilter";
import Image from "next/image";
import { useTheme } from "next-themes";
import { useLocale } from "@/components/LocaleContext";

interface Cat {
  id: string;
  url: string;
  breeds: { id: string; name: string }[];
}

interface Breed {
  id: string;
  name: string;
}

interface Favorite {
  id: number;
  image_id: string;
}

function SplashScreen({ onEnter }: { onEnter: () => void }) {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    document.body.classList.add("splash-active");
    return () => document.body.classList.remove("splash-active");
  }, []);

  const handleClick = () => {
    setLeaving(true);
    setTimeout(() => onEnter(), 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background gap-10 transition-all duration-500 ${
        leaving ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <div className={`transition-all duration-500 ${leaving ? "scale-150 opacity-0" : ""}`}>
          <Image
            src={theme === "dark" ? "/cat-dark.png" : "/cat-white.png"}
            alt="CatExplorer"
            width={130}
            height={130}
          />
        </div>
        <h1 className="text-5xl font-bold tracking-tight">{t.appName}</h1>
        <p className="text-muted-foreground text-center max-w-xs text-base">
          {t.appDescription}
        </p>
      </div>

      <button
        onClick={handleClick}
        className="group relative px-10 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-primary/40 overflow-hidden"
      >
        <span className="relative z-10 flex items-center gap-2">
          {t.enterButton}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
        <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    </div>
  );
}

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const [visible, setVisible] = useState(false);
  const [cats, setCats] = useState<Cat[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [selectedBreed, setSelectedBreed] = useState("");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const { t } = useLocale();

  const loadCats = useCallback(async (pageNum: number, breedId: string) => {
    setLoading(true);
    const data = await fetchCats(pageNum, breedId);
    if (pageNum === 0) {
      setCats(data);
    } else {
      setCats((prev) => [...prev, ...data]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchBreeds().then((data) => setBreeds(data));
    fetchFavorites().then(setFavorites);
  }, []);

  useEffect(() => {
    setPage(0);
    loadCats(0, selectedBreed);
  }, [selectedBreed, loadCats]);

  const handleEnter = () => {
    setShowSplash(false);
    setTimeout(() => setVisible(true), 50);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadCats(nextPage, selectedBreed);
  };

  const handleToggleFavorite = async (imageId: string) => {
    const existing = favorites.find((f) => f.image_id === imageId);
    if (existing) {
      await removeFavorite(existing.id);
      setFavorites((prev) => prev.filter((f) => f.image_id !== imageId));
    } else {
      const data = await addFavorite(imageId);
      setFavorites((prev) => [...prev, { id: data.id, image_id: imageId }]);
    }
  };

  if (showSplash) return <SplashScreen onEnter={handleEnter} />;

  return (
    <div
      className={`space-y-6 transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex flex-col items-center text-center py-6">
        <Image
          src={theme === "dark" ? "/cat-dark.png" : "/cat-white.png"}
          alt="CatExplorer"
          width={80}
          height={80}
          className="mb-4"
        />
        <h1 className="text-3xl font-bold mb-2">{t.exploreTitle}</h1>
        <p className="text-muted-foreground">{t.exploreDescription}</p>
      </div>

      <div className="flex justify-center">
        <BreedFilter
          breeds={breeds}
          selected={selectedBreed}
          onSelect={setSelectedBreed}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {cats.map((cat) => (
          <CatCard
            key={cat.id}
            id={cat.id}
            url={cat.url}
            breed={cat.breeds?.[0]?.name}
            isFavorited={favorites.some((f) => f.image_id === cat.id)}
            onToggleFavorite={handleToggleFavorite}
          />
        ))}
      </div>

      {!loading && (
        <div className="flex justify-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          >
            {t.loadMore}
          </button>
        </div>
      )}
    </div>
  );
}