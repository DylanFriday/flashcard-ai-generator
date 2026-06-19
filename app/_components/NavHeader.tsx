import Link from "next/link";

export default function NavHeader() {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <nav className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="font-semibold text-zinc-900 dark:text-zinc-100 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
        >
          🎴 AI Flashcard Generator
        </Link>
        <div className="flex gap-4 text-sm font-medium">
          <Link
            href="/"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/flashcards"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Flashcards
          </Link>
          <Link
            href="/quiz"
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            Quiz
          </Link>
        </div>
      </nav>
    </header>
  );
}
