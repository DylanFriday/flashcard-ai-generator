"use client";

import Link from "next/link";

interface Props {
  score: number;
  total: number;
  onRetake: () => void;
}

export default function QuizScore({ score, total, onRetake }: Props) {
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="flex flex-col items-center gap-4 p-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 max-w-lg mx-auto text-center">
      <p className="text-sm text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
        Quiz Complete
      </p>

      <p className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
        {score} / {total}
      </p>
      <p className="text-lg text-zinc-600 dark:text-zinc-400">
        {percentage}%
      </p>

      <p className="text-zinc-600 dark:text-zinc-400">
        {percentage >= 80
          ? "🌟 Great job! You really know this material."
          : percentage >= 60
            ? "👍 Good effort! Review the flashcards and try again."
            : "📚 Keep studying! Review the flashcards to improve your score."}
      </p>

      <div className="flex gap-3 mt-2">
        <Link
          href="/flashcards"
          className="px-6 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
        >
          Review Flashcards
        </Link>
        <button
          onClick={onRetake}
          className="px-6 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          Retake Quiz
        </button>
      </div>
    </div>
  );
}
