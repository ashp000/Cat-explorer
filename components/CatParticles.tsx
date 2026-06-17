"use client";

import { useEffect, useRef } from "react";

// Carinha de gato pixel art ~24x20 baseada na imagem
// 1 = corpo, 2 = olhos/nariz (mais claro), 0 = transparente
const CAT_SPRITE = [
  [0,0,1,1,0,0,0,0,0,0,0,0,1,1,0,0],
  [0,1,1,1,1,0,0,0,0,0,0,1,1,1,1,0],
  [0,1,1,0,1,1,0,0,0,0,1,1,0,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,1,1,1,2,1,1,1,1,1,1,2,1,1,1,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [0,1,1,1,1,1,1,2,2,1,1,1,1,1,1,0],
  [0,0,1,1,1,1,1,1,1,1,1,1,1,1,0,0],
  [0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0],
  [0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0],
  [0,0,0,0,1,1,1,0,0,1,1,1,0,0,0,0],
];

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  scale: number;
  opacity: number;
}

export function CatParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let particles: Particle[] = [];

    function resize() {
      canvas!.width = canvas!.clientWidth;
      canvas!.height = canvas!.clientHeight;
    }

    function spawnParticle(): Particle {
      const scale = Math.floor(Math.random() * 2) + 2;
      return {
        x: Math.random() * canvas!.width,
        y: canvas!.height + 50,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(0.4 + Math.random() * 0.5),
        scale,
        opacity: 0.12 + Math.random() * 0.2,
      };
    }

    function drawCat(p: Particle) {
      const px = p.scale;
      CAT_SPRITE.forEach((row, y) => {
        row.forEach((cell, x) => {
          if (cell === 1) {
            ctx.fillStyle = `rgba(120,190,255,${p.opacity})`;
          } else if (cell === 2) {
            ctx.fillStyle = `rgba(210,235,255,${p.opacity + 0.15})`;
          } else {
            return;
          }
          ctx.fillRect(
            Math.round(p.x + x * px),
            Math.round(p.y + y * px),
            px, px
          );
        });
      });
    }

    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < 6; i++) {
      const p = spawnParticle();
      p.y = Math.random() * canvas.height;
      particles.push(p);
    }

    let frame = 0;
    function render() {
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      frame++;
      if (frame % 100 === 0) particles.push(spawnParticle());
      particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        drawCat(p);
        return p.y + 20 * p.scale > -50;
      });
      rafRef.current = requestAnimationFrame(render);
    }

    rafRef.current = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    />
  );
}