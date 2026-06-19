import { readFile, writeFile } from "fs/promises";
import path from "path";
import type { Flashcard, QuizItem } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

async function readJSON<T>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  const raw = await readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJSON<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(DATA_DIR, filename);
  await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

export async function readFlashcards(): Promise<Flashcard[]> {
  return readJSON<Flashcard[]>("flashcards.json");
}

export async function writeFlashcards(flashcards: Flashcard[]): Promise<void> {
  await writeJSON("flashcards.json", flashcards);
}

export async function readQuiz(): Promise<QuizItem[]> {
  return readJSON<QuizItem[]>("quiz.json");
}

export async function writeQuiz(quiz: QuizItem[]): Promise<void> {
  await writeJSON("quiz.json", quiz);
}
