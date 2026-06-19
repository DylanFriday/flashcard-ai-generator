import { readQuiz } from "../_lib/data";
import QuizClient from "./_QuizClient";

export const metadata = {
  title: "Quiz — AI Flashcard Generator",
  description: "Test your knowledge with multiple-choice questions",
};

export default async function QuizPage() {
  const quiz = await readQuiz();

  return (
    <div className="py-12 px-4">
      <QuizClient quiz={quiz} />
    </div>
  );
}
