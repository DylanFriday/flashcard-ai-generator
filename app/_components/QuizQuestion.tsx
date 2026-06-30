"use client";

import { useState, useEffect, useCallback } from "react";
import type { QuizItem } from "../_lib/types";

interface Props {
  question: QuizItem;
  index: number;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
  onAnswer: (correct: boolean, questionId: string) => void;
  isLast: boolean;
  isFirst: boolean;
}

export default function QuizQuestion({
  question,
  index,
  total,
  onNext,
  onPrevious,
  onAnswer,
  isLast,
  isFirst,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const isCorrect = submitted && selected === question.correctAnswer;

  const handleSelect = (key: string) => {
    if (submitted) return;
    setSelected(key);
  };

  const handleSubmit = () => {
    if (!selected || submitted) return;
    const correct = selected === question.correctAnswer;
    setSubmitted(true);
    onAnswer(correct, question.id);
  };

  const optionKeys = Object.keys(question.options) as string[];

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (submitted) {
        if (e.key === "Enter" || e.key === "ArrowRight") {
          e.preventDefault();
          onNext();
        }
        return;
      }

      // Number keys 1-4 or letter keys A-D to select options
      const numIndex = parseInt(e.key) - 1;
      if (numIndex >= 0 && numIndex < optionKeys.length) {
        setSelected(optionKeys[numIndex]);
        return;
      }

      const letterIndex = optionKeys.indexOf(e.key.toUpperCase());
      if (letterIndex !== -1) {
        setSelected(optionKeys[letterIndex]);
        return;
      }

      // Enter to submit
      if (e.key === "Enter" && selected) {
        e.preventDefault();
        handleSubmit();
        return;
      }

      // Arrow left for back
      if (e.key === "ArrowLeft" && !isFirst) {
        e.preventDefault();
        onPrevious();
      }
    },
    [submitted, selected, optionKeys, onNext, onPrevious, isFirst, handleSubmit],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-lg mx-auto">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        Question {index + 1} of {total}
      </p>

      <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
        {question.question}
      </h2>

      <div className="flex flex-col gap-2">
        {(
          Object.entries(question.options) as [
            string,
            string,
          ][]
        ).map(([key, value]) => {
          let buttonClass =
            "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors";

          if (submitted) {
            if (key === question.correctAnswer) {
              buttonClass += " border-green-500 bg-green-50 dark:bg-green-950 dark:border-green-600 text-green-800 dark:text-green-200";
            } else if (key === selected && key !== question.correctAnswer) {
              buttonClass += " border-red-500 bg-red-50 dark:bg-red-950 dark:border-red-600 text-red-800 dark:text-red-200";
            } else {
              buttonClass += " border-zinc-200 dark:border-zinc-700 opacity-50";
            }
          } else if (key === selected) {
            buttonClass += " border-blue-500 bg-blue-50 dark:bg-blue-950 dark:border-blue-600";
          } else {
            buttonClass +=
              " border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 cursor-pointer";
          }

          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              disabled={submitted}
              className={buttonClass}
            >
              <span className="font-semibold mr-2">{key}.</span>
              {value}
            </button>
          );
        })}
      </div>

      {!submitted && (
        <div className="flex items-center gap-3">
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="px-6 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
          >
            Check Answer
          </button>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Press <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">Enter</kbd> to submit
          </span>
        </div>
      )}

      {submitted && (
        <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
          <p
            className={`text-sm font-medium mb-1 ${isCorrect ? "text-green-700 dark:text-green-400" : "text-red-700 dark:text-red-400"}`}
          >
            {isCorrect ? "✓ Correct!" : "✗ Incorrect"}
          </p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            {question.explanation}
          </p>
          <div className="flex items-center gap-3 mt-3">
            {!isFirst && (
              <button
                onClick={onPrevious}
                className="px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                ← Back
              </button>
            )}
            <button
              onClick={onNext}
              className="px-4 py-2 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors"
            >
              {isLast ? "See Results →" : "Next →"}
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-zinc-400 dark:text-zinc-500">
        Press <kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">1</kbd>-<kbd className="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px]">4</kbd> to select an answer
      </p>
    </div>
  );
}
