import type { Metadata } from "next";
import NavHeader from "./_components/NavHeader";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Flashcard Generator",
  description:
    "Convert study notes into flashcards and quiz questions using AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
        <NavHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
