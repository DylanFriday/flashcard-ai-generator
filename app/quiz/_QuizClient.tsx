"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import QuizQuestion from "../_components/QuizQuestion";
import QuizScore from "../_components/QuizScore";
import { generateQuiz } from "../actions";
import type { QuizItem } from "../_lib/types";

interface Props {
  quiz: QuizItem[];
}

export default function QuizClient({ quiz }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<
    { questionId: string; correct: boolean }[]
  >([]);
  const [finished, setFinished] = useState(false);
  const [, startRetake] = useTransition();

  if (quiz.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          No quiz questions yet. Generate a quiz from your flashcards first.
        </p>
        <Link
          href="/flashcards"
          className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline underline-offset-2"
        >
          ← Go to Flashcards
        </Link>
      </div>
    );
  }

  const handleAnswer = (correct: boolean, questionId: string) => {
    setAnswers((prev) => [...prev, { questionId, correct }]);
  };

  const handleNext = () => {
    if (current < quiz.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  const handleRetake = () => {
    startRetake(async () => {
      const result = await generateQuiz();
      if (!result.error) {
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
        onAnswer={handleAnswer}
        isLast={current === quiz.length - 1}
      />
    </div>
  );
}
