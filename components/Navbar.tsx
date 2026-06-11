"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale } from "@/components/LocaleContext";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { locale, setLocale, t } = useLocale();

  useEffect(() => setMounted(true), []);

  return (
    <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-9 h-9 flex-shrink-0">
            {mounted ? (
              <Image
                src={theme === "dark" ? "/cat-dark.png" : "/cat-white.png"}
                alt="logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-9 h-9" />
            )}
          </div>
          <span>{t.appName}</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            {t.feed}
          </Link>

          <Link
            href="/favorites"
            className={`flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary ${
              pathname === "/favorites" ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Heart size={15} />
            {t.favorites}
          </Link>

          {/* Botão de idioma */}
          <button
            onClick={() => setLocale(locale === "en" ? "pt" : "en")}
            className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-xs font-bold text-muted-foreground hover:text-primary hover:border-primary transition-colors"
          >
            {locale === "en" ? "PT" : "EN"}
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-9 h-9 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
            >
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}