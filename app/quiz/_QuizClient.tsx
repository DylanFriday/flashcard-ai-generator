"use client";

import { useState, useTransition, useEffect, useCallback } from "react";
import Link from "next/link";
import QuizQuestion from "../_components/QuizQuestion";
import QuizScore from "../_components/QuizScore";
import { generateQuiz } from "../actions";
import type { QuizItem } from "../_lib/types";

interface Props {
  quiz: QuizItem[];
}

interface SavedState {
  currentIndex: number;
  answers: { questionId: string; correct: boolean }[];
}

const STORAGE_KEY = "quiz-progress";

export default function QuizClient({ quiz }: Props) {
  // Restore from localStorage if available
  const [current, setCurrent] = useState(() => {
    if (typeof window === "undefined") return 0;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: SavedState = JSON.parse(saved);
        // Only restore if the quiz length matches (same quiz)
        if (parsed.currentIndex < quiz.length) {
          return parsed.currentIndex;
        }
      }
    } catch {
      // Ignore parse errors
    }
    return 0;
  });

  const [answers, setAnswers] = useState<{ questionId: string; correct: boolean }[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: SavedState = JSON.parse(saved);
        // Filter answers to only include questions from current quiz
        const validIds = new Set(quiz.map((q) => q.id));
        const validAnswers = parsed.answers.filter((a) => validIds.has(a.questionId));
        return validAnswers;
      }
    } catch {
      // Ignore parse errors
    }
    return [];
  });

  const [finished, setFinished] = useState(false);
  const [, startRetake] = useTransition();

  // Persist to localStorage
  useEffect(() => {
    const state: SavedState = { currentIndex: current, answers };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [current, answers]);

  // Clear on finish
  useEffect(() => {
    if (finished) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [finished]);

  if (quiz.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
          <span className="text-3xl">📝</span>
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
            No quiz questions yet
          </p>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Generate a quiz from your flashcards to test your knowledge.
          </p>
        </div>
        <Link
          href="/flashcards"
          className="px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
        >
          Go to Flashcards →
        </Link>
      </div>
    );
  }

  const handleAnswer = (correct: boolean, questionId: string) => {
    // Replace answer if re-answering (going back and forth)
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId);
      if (existing !== -1) {
        const updated = [...prev];
        updated[existing] = { questionId, correct };
        return updated;
      }
      return [...prev, { questionId, correct }];
    });
  };

  const handleNext = () => {
    if (current < quiz.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  const handlePrevious = useCallback(() => {
    if (current > 0) {
      setCurrent((c) => c - 1);
    }
  }, [current]);

  const handleRetake = () => {
    startRetake(async () => {
      const result = await generateQuiz();
      if (!result.error) {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    });
  };

  if (finished) {
    const correctCount = answers.filter((a) => a.correct).length;
    return <QuizScore score={correctCount} total={quiz.length} onRetake={handleRetake} />;
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        Quiz
      </h1>

      <QuizQuestion
        key={quiz[current].id}
        question={quiz[current]}
        index={current}
        total={quiz.length}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onAnswer={handleAnswer}
        isLast={current === quiz.length - 1}
        isFirst={current === 0}
      />
    </div>
  );
}
