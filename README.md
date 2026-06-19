# AI Flashcard Generator

A Next.js 16 study tool that turns pasted notes or selectable-text PDF content into flashcards and multiple-choice quizzes.

The app is built as a small university personal project. It demonstrates Server Actions, file-based JSON storage, prompt-engineering-style generation rules, and Claude Code skill/agent workflows without requiring an external AI API key.

## Features

- Paste study notes or upload a PDF.
- Choose how many flashcards and quiz questions to generate.
- Review flashcards with a click-to-flip card interface.
- Take a multiple-choice quiz with instant feedback and final score.
- Store generated flashcards and quiz questions in local JSON files.
- Includes Claude Code extensions for flashcard and quiz generation workflows.

## Tech Stack

- Next.js 16.2.9 App Router
- React 19
- TypeScript
- Tailwind CSS v4
- Server Actions
- `pdf-parse` for selectable-text PDF extraction
- JSON files in `data/` for local storage

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Available Scripts

```bash
npm run dev      # Start the development server
npm run build    # Create a production build
npm run start    # Start the production server
npm run lint     # Run ESLint
```

## App Routes

- `/` - Generate flashcards and quiz questions from notes or a PDF.
- `/flashcards` - Review generated flashcards.
- `/quiz` - Take the generated quiz.

## Project Structure

```text
app/
  page.tsx                  Home page and generation form
  actions.ts                Server Actions for flashcard and quiz generation
  flashcards/               Flashcard review route
  quiz/                     Quiz route
  _components/              Shared UI components
  _lib/
    data.ts                 JSON read/write helpers
    types.ts                Flashcard and quiz TypeScript types
data/
  flashcards.json           Generated flashcard data
  quiz.json                 Generated quiz data
.claude/
  skills/flashcard-generator/SKILL.md
  agents/quiz-master.md
slides/                     Presentation materials
ch-3/                       Chapter 3 report materials
```

## Data Format

Flashcards are stored in `data/flashcards.json`:

```json
[
  {
    "id": "gen-example",
    "question": "What is recursion?",
    "answer": "A function that calls itself.",
    "topic": "Study Notes"
  }
]
```

Quiz questions are stored in `data/quiz.json`:

```json
[
  {
    "id": "quiz-example",
    "question": "What is recursion?",
    "options": {
      "A": "A function that calls itself.",
      "B": "A loop that never ends.",
      "C": "A type of database.",
      "D": "A CSS layout method."
    },
    "correctAnswer": "A",
    "explanation": "Recursion means a function calls itself."
  }
]
```

## Claude Code Integration

This repo includes two Claude Code extensions:

- `.claude/skills/flashcard-generator/SKILL.md` converts study notes into structured flashcard JSON.
- `.claude/agents/quiz-master.md` generates multiple-choice quiz JSON from existing flashcards.

The web app follows the same schemas and generation rules, then writes results to `data/flashcards.json` and `data/quiz.json`.

## Notes and Limitations

- PDF upload works with PDFs that contain selectable text. Scanned image-only PDFs are not OCR processed.
- Generated data is stored locally in JSON files, so this is not a multi-user production database setup.
- The current implementation uses template-based extraction and quiz generation rules instead of calling an external AI provider.
- Generated JSON files are overwritten on each new generation.
