"use client";

import { useState, useEffect, useCallback } from "react";
import type { Flashcard } from "../_lib/types";

interface Props {
  card: Flashcard;
  current: number;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

export default function FlashcardList({
  card,
  current,
  total,
  onPrevious,
  onNext,
}: Props) {
  const [flipped, setFlipped] = useState(false);

  // Reset flip state when card changes
  const handlePrevious = () => {
    setFlipped(false);
    onPrevious();
  };

  const handleNext = () => {
    setFlipped(false);
    onNext();
  };

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          if (current > 0) handlePrevious();
          break;
        case "ArrowRight":
          if (current < total - 1) handleNext();
          break;
        case " ":
        case "Enter":
          e.preventDefault();
          setFlipped((f) => !f);
          break;
      }
    },
    [current, total, handlePrevious, handleNext],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Card {current + 1} of {total}
      </p>

      {/* Card with flip animation */}
      <div
        className="w-full min-h-[200px] cursor-pointer"
        onClick={() => setFlipped(!flipped)}
        role="button"
        aria-label={flipped ? "Show question" : "Show answer"}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped(!flipped);
          }
        }}
      >
        <div className={`flashcard-inner ${flipped ? "flipped" : ""}`}>
          {/* Front face - Question */}
          <div className="flashcard-face p-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
              Question
            </p>
            <p className="text-lg leading-relaxed text-zinc-900 dark:text-zinc-100">
              {card.question}
            </p>
            {card.topic && (
              <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
                Topic: {card.topic}
              </p>
            )}
          </div>

          {/* Back face - Answer */}
          <div className="flashcard-face flashcard-back p-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
            <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
              Answer
            </p>
            <p className="text-lg leading-relaxed text-zinc-900 dark:text-zinc-100">
              {card.answer}
            </p>
            {card.topic && (
              <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
                Topic: {card.topic}
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Click the card or press <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">Space</kbd> to flip
      </p>

      {/* Navigation */}
      <div className="flex gap-4">
        <button
          onClick={handlePrevious}
          disabled={current === 0}
          className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          ← Previous
        </button>
        <button
          onClick={handleNext}
          disabled={current === total - 1}
          className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Next →
        </button>
      </div>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Use <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">→</kbd> arrow keys to navigate
      </p>
    </div>
  );
}
