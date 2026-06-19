export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  topic: string;
}

export interface QuizItem {
  id: string;
  question: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: "A" | "B" | "C" | "D";
  explanation: string;
}
