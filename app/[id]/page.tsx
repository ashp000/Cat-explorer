"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

const API_KEY = process.env.NEXT_PUBLIC_CAT_API_KEY;

async function getCat(id: string) {
  const res = await fetch(`https://api.thecatapi.com/v1/images/${id}`, {
    headers: { "x-api-key": API_KEY! },
    cache: "no-store",
  });
  return res.json();
}

async function getMoreCats(breedId: string, excludeId: string) {
  const res = await fetch(
    `https://api.thecatapi.com/v1/images/search?breed_ids=${breedId}&limit=6`,
    { headers: { "x-api-key": API_KEY! } }
  );
  const data = await res.json();
  return data.filter((c: any) => c.id !== excludeId);
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/5</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${(value / 5) * 100}%` }}
        />
      </div>
    </div>
  );
}

export default function CatDetailPage() {
  const { t, locale } = useLocale();
  const params = useParams();
  const id = params.id as string;

  const [cat, setCat] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [moreCats, setMoreCats] = useState<any[]>([]);

  useEffect(() => {
    getCat(id).then((data) => {
      setCat(data);
      setLoading(false);

      const breedId = data.breeds?.[0]?.id;
      if (breedId) {
        getMoreCats(breedId, id).then(setMoreCats);
      }
    });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!cat) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground">
        {t.catNotFound}
      </div>
    );
  }

  const breed = cat.breeds?.[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Link
        href="/"
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={18} />
        {t.back}
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative aspect-square rounded-2xl overflow-hidden">
          <Image
            src={cat.url}
            alt={breed?.name || t.unknownBreed}
            fill
            className="object-cover"
          />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">{breed?.name || t.unknownBreed}</h1>
            {breed?.origin && (
              <p className="text-muted-foreground mt-1">🌍 {breed.origin}</p>
            )}
          </div>

          {breed?.description && (
            <div>
              <p className="text-muted-foreground leading-relaxed">{breed.description}</p>
              {locale === "pt" && (
                <p className="text-xs text-muted-foreground mt-1 opacity-60">
                  * Descrição disponível apenas em inglês
                </p>
              )}
            </div>
          )}

          {breed && (
            <div className="flex gap-4 text-sm">
              <div className="bg-muted rounded-lg px-3 py-2 text-center">
                <p className="text-muted-foreground">{t.lifespan}</p>
                <p className="font-semibold">{breed.life_span} {t.years}</p>
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-center">
                <p className="text-muted-foreground">{t.weight}</p>
                <p className="font-semibold">{breed.weight?.metric} {t.kg}</p>
              </div>
            </div>
          )}

          {breed?.temperament && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">{t.temperament}</p>
              <div className="flex flex-wrap gap-2">
                {breed.temperament.split(", ").map((temp: string) => (
                  <span key={temp} className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">
                    {temp}
                  </span>
                ))}
              </div>
            </div>
          )}

          {breed && (
            <div className="space-y-3">
              <StatBar label={t.adaptability} value={breed.adaptability} />
              <StatBar label={t.affection} value={breed.affection_level} />
              <StatBar label={t.energy} value={breed.energy_level} />
              <StatBar label={t.intelligence} value={breed.intelligence} />
              <StatBar label={t.socialNeeds} value={breed.social_needs} />
            </div>
          )}
        </div>
      </div>

      {moreCats.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {locale === "pt" ? "Mais gatos da raça" : "More"} {breed?.name}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {moreCats.map((c: any) => (
              <Link key={c.id} href={`/${c.id}`}>
                <div className="relative aspect-square rounded-xl overflow-hidden hover:opacity-80 transition-opacity cursor-pointer">
                  <Image
                    src={c.url}
                    alt={breed?.name || t.unknownBreed}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}