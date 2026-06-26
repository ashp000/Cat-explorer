"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { useLocale } from "@/components/LocaleContext";

export function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { locale, setLocale, t } = useLocale();
  const [spinning, setSpinning] = useState(false);

  const [hidden, setHidden] = useState(false);
  const [peek, setPeek] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentY = window.scrollY;
      const diff = currentY - lastScrollY.current;

      if (currentY < 80) {
        setHidden(false);
      } else if (diff > 6) {
        setHidden(true);
      } else if (diff < -6) {
        setHidden(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const visible = !hidden || peek;

  return (
    <>
      <div
        className="fixed top-0 inset-x-0 h-6 z-40"
        onMouseEnter={() => setPeek(true)}
      />

      <nav
        onMouseEnter={() => setPeek(true)}
        onMouseLeave={() => setPeek(false)}
        className={`fixed top-4 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-50 rounded-full border border-border/40 bg-background/60 backdrop-blur-xl shadow-lg shadow-black/10 transition-all duration-300 ease-out motion-reduce:transition-none ${
          visible ? "translate-y-0 opacity-100" : "-translate-y-[150%] opacity-0"
        }`}
      >
        <div className="px-5 sm:px-6 h-14 flex items-center justify-between">
          <Link
            href="/feed"
            className="group flex items-center font-mono uppercase tracking-[0.15em] text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-full"
          >
            <div className="w-7 h-7 flex-shrink-0">
              {mounted ? (
                <Image
                  src={theme === "dark" ? "/cat-dark.png" : "/cat-white.png"}
                  alt="logo"
                  width={28}
                  height={28}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-7 h-7" />
              )}
            </div>
            <span className="max-w-0 ml-0 group-hover:max-w-[160px] group-hover:ml-2 overflow-hidden whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out motion-reduce:transition-none">
              {t.appName}
            </span>
          </Link>

          <div className="flex items-center gap-5 sm:gap-7">
            <Link
              href="/feed"
              className={`font-mono uppercase tracking-[0.1em] text-xs transition-colors hover:text-primary ${
                pathname === "/feed" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {t.feed}
            </Link>

            <Link
              href="/favorites"
              className={`flex items-center gap-1.5 font-mono uppercase tracking-[0.1em] text-xs transition-colors hover:text-primary ${
                pathname === "/favorites" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Heart size={13} />
              {t.favorites}
            </Link>

            <div className="w-px h-4 bg-border/60" />

            <button
              onClick={() => {
                if (spinning) return;
                setSpinning(true);
                setTimeout(() => {
                  setLocale(locale === "en" ? "pt" : "en");
                }, 200);
                setTimeout(() => {
                  setSpinning(false);
                }, 400);
              }}
              className="w-7 h-7 flex items-center justify-center cursor-pointer"
              style={{
                transition: "transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease",
                transform: spinning ? "rotateY(90deg) scale(0.8)" : "rotateY(0deg) scale(1)",
                opacity: spinning ? 0 : 1,
              }}
            >
              <Image
                src={locale === "en" ? "/flag eua.png" : "/flag br.png"}
                alt={locale === "en" ? "English" : "Português"}
                width={22}
                height={22}
                className="object-contain"
              />
            </button>

            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-7 h-7 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors cursor-pointer"
              >
                {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}