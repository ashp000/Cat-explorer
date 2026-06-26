"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useLocale } from "@/components/LocaleContext";
import { useState, useEffect } from "react";
import { DitherBackground } from "@/components/DitherBackground";
import { CatParticles } from "@/components/CatParticles";

export default function SplashPage() {
  const { theme } = useTheme();
  const { t } = useLocale();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem("entered")) {
      router.replace("/feed");
    }
    document.body.classList.add("splash-active");
    return () => document.body.classList.remove("splash-active");
  }, [router]);

  const handleClick = () => {
    setLeaving(true);
    sessionStorage.setItem("entered", "1");
    setTimeout(() => router.push("/feed"), 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 transition-all duration-500 overflow-hidden ${
        leaving ? "opacity-0 scale-110" : "opacity-100 scale-100"
      }`}
    >
      <DitherBackground
        color1={[0, 10, 30]}
        color2={[10, 60, 120]}
        speed={0.35}
        gridSize={4}
      />

      <CatParticles />

      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className={`transition-all duration-500 ${leaving ? "scale-150 opacity-0" : ""}`}>
          {mounted && (
            <Image
              src={theme === "dark" ? "/cat-dark.png" : "/cat-white.png"}
              alt="CatExplorer"
              width={130}
              height={130}
            />
          )}
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">
          {t.appName}
        </h1>
        <p className="text-white/70 text-center max-w-xs text-base">
          {t.appDescription}
        </p>
      </div>

      <button
        onClick={handleClick}
        className="relative z-10 group px-10 py-4 rounded-full bg-white/10 backdrop-blur-sm text-white border border-white/30 font-semibold text-lg transition-all duration-300 hover:scale-105 hover:bg-white/20 active:scale-95 shadow-lg overflow-hidden cursor-pointer"
      >
        <span className="relative z-10 flex items-center gap-2">
          {t.enterButton}
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </button>
    </div>
  );
}