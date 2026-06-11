"use client";

import { useState, useEffect } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useLocale } from "@/components/LocaleContext";

interface Breed {
  id: string;
  name: string;
}

interface BreedFilterProps {
  breeds: Breed[];
  selected: string;
  onSelect: (id: string) => void;
}

export function BreedFilter({ breeds, selected, onSelect }: BreedFilterProps) {
  const [open, setOpen] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const { t } = useLocale();

  useEffect(() => {
    if (open) setTimeout(() => setAnimating(true), 10);
  }, [open]);

  const selectedBreed = breeds.find((b) => b.id === selected);

  const handleClose = () => {
    setAnimating(false);
    setTimeout(() => setOpen(false), 300);
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    handleClose();
  };

  const sortedBreeds = [...breeds].sort((a, b) => a.name.localeCompare(b.name));
  const letters = [...new Set(sortedBreeds.map((b) => b.name[0].toUpperCase()))];
  const filteredBreeds = selectedLetter
    ? sortedBreeds.filter((b) => b.name[0].toUpperCase() === selectedLetter)
    : sortedBreeds;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
      >
        <SlidersHorizontal size={16} />
        {selectedBreed ? selectedBreed.name : t.allBreeds}
      </button>

      {open && (
        <>
          <div
            onClick={handleClose}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 40,
              backgroundColor: "rgba(0,0,0,0.2)",
              backdropFilter: "blur(4px)",
              opacity: animating ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          />

          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              maxHeight: animating ? "80vh" : "0",
              overflow: "hidden",
              backgroundColor: "hsl(var(--background))",
              boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
              zIndex: 50,
              transition: "max-height 0.4s ease",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
              <h2 className="font-semibold text-lg">{t.filterByBreed}</h2>
              <button onClick={handleClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-1.5 px-4 py-3 border-b border-border flex-shrink-0">
              <button
                onClick={() => setSelectedLetter(null)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all hover:scale-105 ${
                  selectedLetter === null
                    ? "bg-primary text-primary-foreground"
                    : "border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All
              </button>
              {letters.map((letter) => (
                <button
                  key={letter}
                  onClick={() => setSelectedLetter(letter === selectedLetter ? null : letter)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all hover:scale-105 ${
                    selectedLetter === letter
                      ? "bg-primary text-primary-foreground"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {!selectedLetter && (
                  <button
                    onClick={() => handleSelect("")}
                    className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 ${
                      selected === ""
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {t.allBreeds}
                  </button>
                )}

                {filteredBreeds.map((breed) => (
                  <button
                    key={breed.id}
                    onClick={() => handleSelect(breed.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:scale-105 ${
                      selected === breed.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground border border-border"
                    }`}
                  >
                    {breed.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}