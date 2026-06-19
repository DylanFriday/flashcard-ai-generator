# Implementation Plan: AI Flashcard Generator

## Goal

A Next.js 16 web application that converts study notes into flashcards, then generates multiple-choice quizzes from those flashcards. Designed for a university Chapter 3 Personal Project — small scope, clear deliverables.

---

## Architecture Overview

```
User Input (study notes)
       │
       ▼
  Server Action ─── Flashcard Generator (Skill prompt format)
       │
       ▼
  data/flashcards.json ─────── MCP Filesystem Server
       │
       ▼
  Server Action ─── Quiz Master (Agent prompt format)
       │
       ▼
  data/quiz.json
       │
       ▼
  Web App Pages (read JSON files at render time)
```

**Three tiers:**
1. **Web App** (Next.js 16 App Router) — UI for input, flashcard review, and quiz taking
2. **Claude Code Extensions** — Skill (Flashcard Generator) and Agent (Quiz Master) define the AI prompt templates
3. **Data Layer** — JSON files in `data/` served via Filesystem MCP, read by the web app at runtime

---

## Page Routes

### 1. `/` — Home Page (`app/page.tsx`)

**Purpose:** Input study notes and trigger flashcard generation.

**UI elements:**
- Heading + brief instructions
- `<textarea>` for pasting study notes (with placeholder example text)
- "Generate Flashcards" submit button
- After generation: success message with link to `/flashcards`

**Behavior:**
- Form uses a Server Action (`generateFlashcards`)
- Server Action applies the Flashcard Generator skill's prompt format to structure output
- Extracts key concepts as Q&A pairs
- Saves result to `data/flashcards.json`
- Uses `useActionState` for pending/error states

### 2. `/flashcards` — Flashcard Review (`app/flashcards/page.tsx`)

**Purpose:** Browse and review generated flashcards with a flip animation.

**UI elements:**
- Card counter ("Card 3 of 10")
- Front face: question text
- Back face: answer text (revealed on click/tap)
- Previous / Next navigation buttons
- Link to "Generate Quiz" → triggers quiz generation, then navigates to `/quiz`
- Empty state: "No flashcards yet. Go to Home to generate some."

**Behavior:**
- Server Component reads `data/flashcards.json` at request time via `fs`
- Clicking a card toggles between front (question) and back (answer)
- Flip interaction implemented as a Client Component with `useState`

### 3. `/quiz` — Take Quiz (`app/quiz/page.tsx`)

**Purpose:** Take a multiple-choice quiz generated from flashcard content.

**UI elements:**
- Question counter ("Question 3 of 5")
- Question text
- 4 option buttons (A, B, C, D)
- After answering: highlight correct/incorrect (green/red), show explanation
- "Next" button
- Final score summary at the end
- "Retake Quiz" button to regenerate questions
- Empty state: "No quiz yet. Generate one from the Flashcards page."

**Behavior:**
- Server Component reads `data/quiz.json` at request time
- Answer selection and score tracking is client-side state
- Score shown after all questions answered
- "Retake" triggers the quiz generation Server Action again

---

## Data Structures

### `data/flashcards.json`
```json
[
  {
    "id": "uuid-v4",
    "question": "What is recursion?",
    "answer": "A function that calls itself.",
    "topic": "Recursion"
  }
]
```

### `data/quiz.json`
```json
[
  {
    "id": "uuid-v4",
    "question": "What is recursion?",
    "options": {
      "A": "A function that calls another function",
      "B": "A function that calls itself",
      "C": "A loop that never ends",
      "D": "A data structure"
    },
    "correctAnswer": "B",
    "explanation": "Recursion is when a function calls itself to solve a problem."
  }
]
```

---

## File Tree (new and modified files)

```
app/
  layout.tsx              # MODIFY: add nav header and metadata
  page.tsx                # MODIFY: replace default template with notes input form
  globals.css             # MODIFY: add minimal card/quiz styles
  flashcards/
    page.tsx              # NEW: flashcard browser with flip interaction
  quiz/
    page.tsx              # NEW: multiple-choice quiz with scoring
  _components/
    Flashcard.tsx         # NEW: "use client" — individual card with flip state
    FlashcardList.tsx     # NEW: "use client" — card carousel with prev/next
    QuizQuestion.tsx      # NEW: "use client" — single question with options
    QuizScore.tsx         # NEW: "use client" — final score display
    NavHeader.tsx         # NEW: simple nav bar with app title and links
  _lib/
    data.ts               # NEW: read/write helpers for data/flashcards.json and data/quiz.json
    types.ts              # NEW: TypeScript interfaces (Flashcard, QuizItem)
  actions.ts              # NEW: Server Actions (generateFlashcards, generateQuiz)
data/
  flashcards.json         # MODIFY: seed with 3-5 sample flashcards for demo
  quiz.json               # NEW: sample quiz data for demo
.claude/
  agents/quiz-master.md   # MODIFY: add structured JSON output format
  skills/flashcard-generator/SKILL.md  # MODIFY: add structured JSON output format
```

---

## Implementation Phases

### Phase 1: Data Layer & Types
**Files:** `app/_lib/types.ts`, `app/_lib/data.ts`

- Define `Flashcard` and `QuizItem` TypeScript interfaces
- Write `readFlashcards()`, `writeFlashcards()`, `readQuiz()`, `writeQuiz()` using Node.js `fs/promises`
- Seed `data/flashcards.json` with 5 sample computer science flashcards
- Seed `data/quiz.json` with 5 sample quiz questions

**Verify:** `npm run build` succeeds. Importing types works without errors.

### Phase 2: Server Actions for Generation
**Files:** `app/actions.ts`

- `generateFlashcards(notes: string)` — extracts key concepts from notes using the Flashcard Generator skill's prompt format, returns Q&A pairs, writes to `data/flashcards.json`
- `generateQuiz()` — reads flashcards, applies Quiz Master agent's prompt format to create multiple-choice questions, writes to `data/quiz.json`
- For the university assignment: use template-based extraction logic (no external AI API required). The skill/agent prompt formats define the rules the templates follow.
- Revalidate the `/flashcards` and `/quiz` pages after writes using `revalidatePath()`

**Verify:** Paste notes, click Generate, verify `flashcards.json` is populated. Click Generate Quiz, verify `quiz.json` is populated.

### Phase 3: UI Components
**Files:** `app/_components/*.tsx`, `app/page.tsx`

- `NavHeader.tsx` — app title ("AI Flashcard Generator") + nav links (Home, Flashcards, Quiz)
- `Flashcard.tsx` — single card with CSS flip animation on click
- `FlashcardList.tsx` — carousel with prev/next and card position indicator
- `QuizQuestion.tsx` — renders question + 4 options, highlights correct/incorrect after selection, disables further clicks
- `QuizScore.tsx` — shows X/Y score with message ("Great job!" / "Keep studying!")
- `app/page.tsx` — rewrite from default template → notes input form using `useActionState`

**Verify:** All pages render. Card flip works. Quiz scoring is accurate. Navigation between pages works.

### Phase 4: Claude Code Skill & Agent Enhancement
**Files:** `.claude/skills/flashcard-generator/SKILL.md`, `.claude/agents/quiz-master.md`

- Update Flashcard Generator skill to produce structured JSON matching the `Flashcard` interface
- Update Quiz Master agent to produce structured JSON matching the `QuizItem` interface
- Document the Claude Code workflow (paste notes → skill → save JSON → agent → quiz)

**Verify:** Invoke the skill and agent in Claude Code. Output matches expected JSON schema. Files are saved to `data/`.

### Phase 5: Polish & Edge Cases
- Empty state handling: show helpful messages when no flashcards or quiz data exists
- Error state: catch file read/write errors, show user-friendly message
- Loading state: spinner/skeleton during generation
- Mobile responsive: cards and quiz options should work on phone screens
- Add proper page `<title>` metadata

**Verify:** Test all empty, error, and loading states manually. Run `npm run lint`. Final `npm run build` passes.

---

## Technical Decisions

| Decision | Choice | Reason |
|----------|--------|--------|
| Data storage | JSON files in `data/` | Simple, no database needed, works with MCP filesystem |
| AI generation | Template-based rules using Skill/Agent prompt formats | No external API key needed; demonstrates prompt engineering concepts |
| State management | Server Components + `useActionState` | Next.js 16 idiomatic; minimizes client JS |
| Flip interaction | CSS `transform: rotateY` with `useState` toggle | Simple, no library needed |
| Routing | App Router file-system routing | Required by Next.js 16; clean URL structure |

---

## What This Project Demonstrates (for marking)

1. **Next.js 16 App Router** — Server Components, Server Actions, file-system routing, `useActionState`
2. **TypeScript** — typed interfaces, strict mode
3. **MCP Integration** — Filesystem MCP server for data access
4. **Prompt Engineering** — Skill and Agent markdown files as structured AI prompts
5. **Full-stack data flow** — user input → server processing → file persistence → UI rendering
6. **Client interactivity** — card flip animation, quiz answer selection, score tracking
