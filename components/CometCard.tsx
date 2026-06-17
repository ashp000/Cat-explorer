"use client";

import { useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface CometCardProps {
  children: React.ReactNode;
  className?: string;
  rotateDepth?: number;
  translateDepth?: number;
}

export function CometCard({
  children,
  className,
  rotateDepth = 17.5,
  translateDepth = 20,
}: CometCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const card = cardRef.current;
      if (!card) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2;
      const cy = rect.height / 2;
      const dx = (x - cx) / cx;
      const dy = (y - cy) / cy;

      const rotX = -dy * rotateDepth;
      const rotY = dx * rotateDepth;
      const tx = dx * translateDepth * 0.3;
      const ty = dy * translateDepth * 0.3;

      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translate(${tx}px, ${ty}px) scale(1.04)`;
      card.style.boxShadow = `${-dx * 20}px ${-dy * 20}px 45px rgba(0,0,0,0.25)`;

      const shimmer = card.querySelector<HTMLDivElement>("[data-shimmer]");
      if (shimmer) {
        shimmer.style.setProperty("--mx", `${(x / rect.width) * 100}%`);
        shimmer.style.setProperty("--my", `${(y / rect.height) * 100}%`);
        shimmer.style.opacity = "1";
      }
    },
    [rotateDepth, translateDepth]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;

    card.style.transition =
      "transform 0.45s cubic-bezier(0.17,0.67,0.45,1.2), box-shadow 0.45s";
    card.style.transform =
      "perspective(900px) rotateX(0deg) rotateY(0deg) translate(0,0) scale(1)";
    card.style.boxShadow = "none";

    const shimmer = card.querySelector<HTMLDivElement>("[data-shimmer]");
    if (shimmer) shimmer.style.opacity = "0";

    setTimeout(() => {
      if (card) card.style.transition = "";
    }, 450);
  }, []);

  return (
    <div style={{ perspective: "900px" }}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={cn("relative will-change-transform", className)}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* shimmer overlay — pointer-events-none para não bloquear cliques */}
        <div
          data-shimmer
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] opacity-0 transition-opacity duration-200"
          style={{
            background:
              "radial-gradient(circle at var(--mx, 50%) var(--my, 50%), rgba(255,255,255,0.15) 0%, transparent 60%)",
          }}
        />
        {children}
      </div>
    </div>
  );
}