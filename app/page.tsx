"use client";

import { useActionState, useState, useRef } from "react";
import Link from "next/link";
import { generateAll } from "./actions";
import type { GenerateResult } from "./actions";

const initialState: GenerateResult = {
  success: false,
  flashcards: [],
  quizQuestions: [],
  message: "",
  errors: [],
};

export default function HomePage() {
  const [state, formAction, pending] = useActionState(generateAll, initialState);
  const [inputMode, setInputMode] = useState<"notes" | "pdf">("notes");
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPdfFileName(file ? file.name : "");
  };

  const handleModeSwitch = (mode: "notes" | "pdf") => {
    setInputMode(mode);
    // Clear the other input when switching modes
    if (mode === "pdf") {
      // textarea is handled by form reset via key
    } else {
      setPdfFileName("");
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-12 px-4 max-w-lg mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Convert Your Notes into Flashcards
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Paste your study notes or upload a PDF. Choose how many flashcards and
          quiz questions you want, then click Generate.
        </p>
      </div>

      <form action={formAction} className="flex flex-col gap-5 w-full">
        {/* ---- Input mode toggle ---- */}
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
          <button
            type="button"
            onClick={() => handleModeSwitch("notes")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              inputMode === "notes"
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black"
                : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            ✏️ Paste Notes
          </button>
          <button
            type="button"
            onClick={() => handleModeSwitch("pdf")}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              inputMode === "pdf"
                ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black"
                : "bg-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            📄 Upload PDF
          </button>
        </div>

        {/* ---- Notes textarea ---- */}
        {inputMode === "notes" && (
          <div className="flex flex-col gap-1">
            <label htmlFor="notes" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Study Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={10}
              placeholder={`Paste your study notes here...

Examples:
- Recursion is a function that calls itself.
- A closure allows a function to access variables from its outer scope.
- REST refers to Representational State Transfer.
- A stack uses LIFO ordering for data access.`}
              className="w-full p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        {/* ---- PDF upload ---- */}
        {inputMode === "pdf" && (
          <div className="flex flex-col gap-1">
            <label htmlFor="pdf" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              PDF File
            </label>
            <div className="relative">
              <input
                ref={fileRef}
                id="pdf"
                name="pdf"
                type="file"
                accept="application/pdf"
                onChange={handlePdfChange}
                className="w-full text-sm text-zinc-600 dark:text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-zinc-100 dark:file:bg-zinc-800 file:text-zinc-900 dark:file:text-zinc-100 hover:file:bg-zinc-200 dark:hover:file:bg-zinc-700 file:cursor-pointer cursor-pointer"
              />
            </div>
            {pdfFileName && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Selected: {pdfFileName}
              </p>
            )}
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              The PDF must contain selectable text (not scanned images).
            </p>
          </div>
        )}

        {/* ---- Quantity inputs ---- */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="flashcardCount" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Flashcards
            </label>
            <input
              id="flashcardCount"
              name="flashcardCount"
              type="number"
              min={1}
              max={50}
              defaultValue={5}
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="quizCount" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Quiz Questions
            </label>
            <input
              id="quizCount"
              name="quizCount"
              type="number"
              min={1}
              max={50}
              defaultValue={5}
              required
              className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* ---- Submit ---- */}
        <button
          type="submit"
          disabled={pending}
          className="px-6 py-3 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors flex items-center justify-center gap-2"
        >
          {pending ? (
            <>
              <span className="spinner" />
              Generating...
            </>
          ) : (
            "Generate Flashcards & Quiz"
          )}
        </button>
      </form>

      {/* ---- Validation errors ---- */}
      {state.errors.length > 0 && (
        <div
          className="w-full p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm"
          role="alert"
        >
          <p className="font-medium mb-1">Please fix the following:</p>
          <ul className="list-disc list-inside space-y-1">
            {state.errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ---- Success result ---- */}
      {state.success && (
        <div className="w-full p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
          <p className="font-medium">{state.message}</p>
          <div className="flex gap-4 mt-3">
            <Link
              href="/flashcards"
              className="inline-block font-medium underline underline-offset-2"
            >
              View {state.flashcards.length} Flashcard{state.flashcards.length !== 1 ? "s" : ""} →
            </Link>
            <Link
              href="/quiz"
              className="inline-block font-medium underline underline-offset-2"
            >
              Take {state.quizQuestions.length} Question Quiz →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
