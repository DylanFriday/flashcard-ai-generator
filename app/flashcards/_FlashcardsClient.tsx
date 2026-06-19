"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FlashcardList from "../_components/FlashcardList";
import { generateQuiz } from "../actions";
import type { Flashcard } from "../_lib/types";

interface Props {
  flashcards: Flashcard[];
}

export default function FlashcardsClient({ flashcards }: Props) {
  const [current, setCurrent] = useState(0);
  const [quizPending, startQuizTransition] = useTransition();
  const [quizMessage, setQuizMessage] = useState("");
  const router = useRouter();

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          No flashcards yet. Generate some from your study notes first.
        </p>
        <Link
          href="/"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
        >
          ← Go to Home
        </Link>
      </div>
    );
  }

  const handleGenerateQuiz = () => {
    startQuizTransition(async () => {
      const result = await generateQuiz();
      setQuizMessage(result.message);
      if (!result.error) {
        router.push("/quiz");
      }
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Your Flashcards
      </h1>

      <FlashcardList
        card={flashcards[current]}
        current={current}
        total={flashcards.length}
        onPrevious={() => setCurrent((c) => Math.max(0, c - 1))}
        onNext={() =>
          setCurrent((c) => Math.min(flashcards.length - 1, c + 1))
        }
      />

      <div className="flex flex-col items-center gap-3">
        <button
          onClick={handleGenerateQuiz}
          disabled={quizPending}
          className="px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          {quizPending ? "Generating Quiz..." : "Generate Quiz from Flashcards"}
        </button>

        {quizMessage && (
          <p className="text-sm text-red-600 dark:text-red-400">
            {quizMessage}
          </p>
        )}
      </div>
    </div>
  );
}
