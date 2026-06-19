"use client";

import { useState } from "react";
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

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Card {current + 1} of {total}
      </p>

      {/* Card */}
      <button
        onClick={() => setFlipped(!flipped)}
        className="w-full min-h-[200px] p-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm hover:shadow-md transition-shadow text-left cursor-pointer"
        aria-label={flipped ? "Show question" : "Show answer"}
      >
        <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide mb-3">
          {flipped ? "Answer" : "Question"}
        </p>
        <p className="text-lg leading-relaxed text-zinc-900 dark:text-zinc-100">
          {flipped ? card.answer : card.question}
        </p>
        {card.topic && (
          <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
            Topic: {card.topic}
          </p>
        )}
      </button>

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Click the card to flip it
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
    </div>
  );
}
