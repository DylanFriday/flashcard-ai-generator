import { readFlashcards } from "../_lib/data";
import FlashcardsClient from "./_FlashcardsClient";

export const metadata = {
  title: "Flashcards — AI Flashcard Generator",
  description: "Browse and review your generated flashcards",
};

export default async function FlashcardsPage() {
  const flashcards = await readFlashcards();

  return (
    <div className="py-12 px-4">
      <FlashcardsClient flashcards={flashcards} />
    </div>
  );
}
