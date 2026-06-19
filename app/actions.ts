"use server";

import { revalidatePath } from "next/cache";
import { readFlashcards, writeFlashcards, writeQuiz } from "./_lib/data";
import type { Flashcard, QuizItem } from "./_lib/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateId(): string {
  return `gen-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Splits raw notes into individual segments (one per concept / paragraph).
 * Handles: prose, newline-separated notes, bullet points, numbered lists.
 */
function segmentNotes(notes: string): string[] {
  const normalized = notes.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const paragraphs = normalized.split(/\n\s*\n/);

  const lines: string[] = [];
  for (const paragraph of paragraphs) {
    const splitLines = paragraph
      .split(/\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    if (splitLines.length === 1 && splitLines[0].length > 120) {
      const proseSentences = splitLines[0]
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 10);
      lines.push(...proseSentences);
    } else {
      lines.push(...splitLines);
    }
  }

  return lines;
}

function stripListMarkers(line: string): string {
  return line
    .replace(/^[\s]*[-•*]\s*/, "")
    .replace(/^\d+[.)]\s*/, "")
    .replace(/^\[\s*\]\s*/, "")
    .replace(/^\[\s*x\s*\]\s*/i, "");
}

const DEFINITION_PATTERNS: RegExp[] = [
  /\b(\w+(?:\s+\w+){0,6})\s+is\s+(?:a(?:n)?\s+|the\s+)?(.+?)(?:\s*[.!?]\s*(?:\w|$)|$)/gi,
  /\b(\w+(?:\s+\w+){0,6})\s+are\s+(?:a(?:n)?\s+|the\s+)?(.+?)(?:\s*[.!?]\s*(?:\w|$)|$)/gi,
  /\b(\w+(?:\s+\w+){0,6})\s+means\s+(?:a(?:n)?\s+|the\s+)?(.+?)(?:\s*[.!?]\s*(?:\w|$)|$)/gi,
  /\b(\w+(?:\s+\w+){0,6})\s+refers?\s+to\s+(?:a(?:n)?\s+|the\s+)?(.+?)(?:\s*[.!?]\s*(?:\w|$)|$)/gi,
  /\b(\w+(?:\s+\w+){0,6})\s+allows?\s+(.+?)(?:\s*[.!?]\s*(?:\w|$)|$)/gi,
  /\b(\w+(?:\s+\w+){0,6})\s+enables?\s+(.+?)(?:\s*[.!?]\s*(?:\w|$)|$)/gi,
  /\b(\w+(?:\s+\w+){0,6})\s+consists?\s+of\s+(.+?)(?:\s*[.!?]\s*(?:\w|$)|$)/gi,
  /^(\w+(?:\s+\w+){0,4})\s*[:：-]\s*(.+?)(?:\s*[.!?]\s*$|$)/gim,
];

function extractDefinitions(
  segment: string
): { term: string; definition: string }[] {
  const results: { term: string; definition: string }[] = [];

  for (const pattern of DEFINITION_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = segment.matchAll(pattern);

    for (const match of matches) {
      const rawTerm = match[1]?.trim();
      const rawDefinition = match[2]
        ?.trim()
        .replace(/[.!?]$/, "")
        .replace(/^[:\-\s]+/, "");

      if (rawTerm && rawDefinition && rawTerm.length > 1 && rawDefinition.length > 3) {
        const isDuplicate = results.some(
          (r) => r.term.toLowerCase() === rawTerm.toLowerCase()
        );
        if (!isDuplicate) {
          results.push({
            term: rawTerm,
            definition:
              rawDefinition.charAt(0).toUpperCase() + rawDefinition.slice(1),
          });
        }
      }
    }
  }

  return results;
}

/**
 * Builds flashcard objects from raw definition pairs.
 */
function buildFlashcards(
  definitions: { term: string; definition: string }[]
): Flashcard[] {
  return definitions.map(({ term, definition }) => ({
    id: generateId(),
    question: `What is ${term.charAt(0).toLowerCase() + term.slice(1)}?`,
    answer: definition,
    topic: "Study Notes",
  }));
}

/**
 * Fallback: when no definition patterns match, treat each meaningful
 * segment as a concept and split it into a question/answer pair.
 */
function buildFallbackFlashcards(segments: string[]): Flashcard[] {
  const meaningful = segments.filter(
    (s) => s.length > 20 && /\w+\s+\w+\s+\w+/.test(s)
  );

  const cards: Flashcard[] = [];

  for (const segment of meaningful) {
    const subSegments =
      segment.length > 120
        ? segment
            .split(/(?<=[.!?])\s+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 15)
        : [segment];

    for (const sub of subSegments) {
      const words = sub.split(/\s+/);
      if (words.length < 5) continue;

      const connectors = [
        "is", "are", "means", "uses", "allows", "enables",
        "refers", "consists", "that", "which", "where", "because", "when",
      ];
      const connectorIdx = words.findIndex((w) =>
        connectors.includes(w.toLowerCase().replace(/[.,;:!?]$/, ""))
      );

      const splitIdx =
        connectorIdx > 1 && connectorIdx < words.length - 2
          ? connectorIdx
          : Math.ceil(words.length / 2);

      const phrase = words.slice(0, splitIdx).join(" ");
      const detail = words.slice(splitIdx).join(" ");

      cards.push({
        id: generateId(),
        question: `What is ${phrase}?`,
        answer: detail.charAt(0).toUpperCase() + detail.slice(1),
        topic: "Study Notes",
      });
    }
  }

  return cards;
}

// ---------------------------------------------------------------------------
// Scoring – used when we have more raw concepts than the user requested.
// ---------------------------------------------------------------------------

interface ScoredConcept {
  term: string;
  definition: string;
  score: number;
}

function scoreAndRankDefinitions(
  definitions: { term: string; definition: string }[],
  targetCount: number
): { term: string; definition: string }[] {
  if (definitions.length <= targetCount) return definitions;

  const scored: ScoredConcept[] = definitions.map((d) => {
    // Higher score = better concept
    const wordCount = d.term.split(/\s+/).length;
    const definitionLength = d.definition.length;
    const hasConnector = /(?:is|are|means|refers|allows|enables|consists)/i.test(
      d.term
    )
      ? -5
      : 0; // penalty for raw connector words in the term

    const score =
      Math.min(wordCount * 2, 8) + // specificity bonus (multi-word terms)
      Math.min(definitionLength / 10, 5) + // detail bonus
      hasConnector;

    return { ...d, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, targetCount);
}

// ---------------------------------------------------------------------------
// Quiz generation (quantity-aware)
// ---------------------------------------------------------------------------

function buildQuizItems(
  flashcards: Flashcard[],
  count: number
): QuizItem[] {
  // Shuffle flashcards to vary which ones become quiz questions
  const pool = [...flashcards].sort(() => Math.random() - 0.5);
  const selected = pool.slice(0, Math.min(count, pool.length));

  const items: QuizItem[] = [];

  for (let i = 0; i < count; i++) {
    const card = selected[i % Math.max(selected.length, 1)];

    // Build distractors: prefer answers from OTHER flashcards
    const otherAnswers = flashcards
      .filter((f) => f.id !== card.id && f.answer !== card.answer)
      .map((f) => f.answer);

    // Shuffle other answers so we don't always pick the same distractors
    const shuffledOthers = [...otherAnswers].sort(() => Math.random() - 0.5);
    const distractors = shuffledOthers.slice(0, 3);

    while (distractors.length < 3) {
      distractors.push("None of the above");
    }

    items.push({
      id: `quiz-${generateId()}`,
      question: card.question,
      options: {
        A: card.answer,
        B: distractors[0],
        C: distractors[1],
        D: distractors[2],
      },
      correctAnswer: "A",
      explanation: card.answer,
    });
  }

  return items;
}

// ---------------------------------------------------------------------------
// PDF text extraction (runs on the server inside a Server Action)
// ---------------------------------------------------------------------------

async function extractPdfText(file: File): Promise<string> {
  console.log("[extractPdfText] file name:", file.name);
  console.log("[extractPdfText] file type:", file.type);
  console.log("[extractPdfText] file size:", file.size, "bytes");

  const arrayBuffer = await file.arrayBuffer();
  console.log("[extractPdfText] ArrayBuffer byteLength:", arrayBuffer.byteLength);

  const buffer = Buffer.from(arrayBuffer);
  console.log("[extractPdfText] Buffer length:", buffer.length);

  // pdf-parse@1.x — pure JS, no pdfjs-dist workers. Works in Node.js / Next.js Server Actions.
  const pdf = (await import("pdf-parse")).default;
  const data = await pdf(buffer);
  const text = data.text.trim();

  console.log("[extractPdfText] extracted text length:", text.length);
  console.log("[extractPdfText] preview (first 300 chars):", text.slice(0, 300));

  if (!text) {
    throw new Error(
      "This PDF appears to be image-based/scanned or contains no selectable text. Please paste notes manually or upload a text-based PDF."
    );
  }

  return text;
}

// ---------------------------------------------------------------------------
// Result types
// ---------------------------------------------------------------------------

export interface GenerateResult {
  success: boolean;
  flashcards: Flashcard[];
  quizQuestions: QuizItem[];
  message: string;
  errors: string[];
}

// ---------------------------------------------------------------------------
// Combined generation — the main Server Action for the home page form
// ---------------------------------------------------------------------------

export async function generateAll(
  _initialState: GenerateResult,
  formData: FormData
): Promise<GenerateResult> {
  const errors: string[] = [];

  // --- Validation ----------------------------------------------------------

  const notesText = (formData.get("notes") as string) ?? "";
  const pdfFile = formData.get("pdf") as File | null;
  const hasPdf = pdfFile && pdfFile.size > 0 && pdfFile.name !== "";
  const hasNotes = notesText.trim().length > 0;

  if (!hasNotes && !hasPdf) {
    errors.push("Please paste study notes or upload a PDF file.");
  }

  const flashcardCountRaw = (formData.get("flashcardCount") as string) ?? "";
  const flashcardCount = parseInt(flashcardCountRaw, 10);

  if (!flashcardCountRaw || isNaN(flashcardCount) || flashcardCount < 1) {
    errors.push("Number of flashcards must be at least 1.");
  }

  const quizCountRaw = (formData.get("quizCount") as string) ?? "";
  const quizCount = parseInt(quizCountRaw, 10);

  if (!quizCountRaw || isNaN(quizCount) || quizCount < 1) {
    errors.push("Number of quiz questions must be at least 1.");
  }

  if (errors.length > 0) {
    return { success: false, flashcards: [], quizQuestions: [], message: "", errors };
  }

  // --- Extract text from PDF (if uploaded) ---------------------------------
  // Build the final source text by combining pasted notes with any PDF content.

  let sourceText = notesText;

  if (hasPdf) {
    try {
      const pdfText = await extractPdfText(pdfFile!);

      if (pdfText.trim().length < 20) {
        // Edge case: the v1 parser returned something but it's too short to be useful
        return {
          success: false,
          flashcards: [],
          quizQuestions: [],
          message: "",
          errors: [
            `The PDF contained only ${pdfText.trim().length} character(s) of text. Please upload a PDF with more content.`,
          ],
        };
      }

      // Combine: pasted notes first, then PDF content (when both exist)
      sourceText = hasNotes
        ? `${notesText.trim()}\n\n${pdfText}`
        : pdfText;

      console.log(
        "[generateAll] combined text length:",
        sourceText.length,
        "(notes:",
        hasNotes ? notesText.trim().length : 0,
        ", pdf:",
        pdfText.length + ")"
      );
    } catch (err) {
      console.error("[generateAll] PDF extraction failed:", err);
      const message =
        err instanceof Error
          ? `Failed to extract text from the PDF: ${err.message}`
          : "Failed to extract text from the PDF. The file may be corrupted or unreadable.";
      return {
        success: false,
        flashcards: [],
        quizQuestions: [],
        message: "",
        errors: [message],
      };
    }
  }

  // Final guard: do NOT generate flashcards from empty text
  if (sourceText.trim().length === 0) {
    return {
      success: false,
      flashcards: [],
      quizQuestions: [],
      message: "",
      errors: ["No text to generate from. Please paste study notes or upload a PDF."],
    };
  }

  // --- Generate flashcards -------------------------------------------------

  const segments = segmentNotes(sourceText);
  const cleanedSegments = segments
    .map(stripListMarkers)
    .filter((s) => s.length > 10);

  const rawDefinitions: { term: string; definition: string }[] = [];

  for (const segment of cleanedSegments) {
    rawDefinitions.push(...extractDefinitions(segment));
  }

  // Remove global duplicates (case-insensitive on the term)
  const seenTerms = new Set<string>();
  const uniqueDefinitions = rawDefinitions.filter((d) => {
    const key = d.term.toLowerCase();
    if (seenTerms.has(key)) return false;
    seenTerms.add(key);
    return true;
  });

  // Rank and cap at the user-requested count
  const selectedDefinitions = scoreAndRankDefinitions(uniqueDefinitions, flashcardCount);

  let flashcards = buildFlashcards(selectedDefinitions);

  // Fallback if patterns found nothing
  if (flashcards.length === 0) {
    const fallback = buildFallbackFlashcards(cleanedSegments);
    flashcards = fallback.slice(0, flashcardCount);
  }

  // Save flashcards to disk
  await writeFlashcards(flashcards);

  // --- Generate quiz questions ---------------------------------------------

  const quizQuestions = buildQuizItems(flashcards, quizCount);

  // Save quiz to disk
  await writeQuiz(quizQuestions);

  // --- Revalidate pages ----------------------------------------------------

  revalidatePath("/flashcards");
  revalidatePath("/quiz");

  // --- Build response message ----------------------------------------------

  const messages: string[] = [];
  messages.push(`Generated ${flashcards.length} flashcard${flashcards.length !== 1 ? "s" : ""}.`);

  if (flashcards.length < flashcardCount) {
    messages.push(
      `Note: Only ${flashcards.length} concept${flashcards.length !== 1 ? "s were" : " was"} found in the text (you requested ${flashcardCount}).`
    );
  }

  messages.push(`Generated ${quizQuestions.length} quiz question${quizQuestions.length !== 1 ? "s" : ""}.`);

  if (quizQuestions.length < quizCount) {
    messages.push(
      `Note: Only ${quizQuestions.length} question${quizQuestions.length !== 1 ? "s could" : " could"} be created (you requested ${quizCount}).`
    );
  }

  if (hasPdf) {
    messages.unshift(`Extracted ${sourceText.length} characters from PDF.`);
  }

  return {
    success: true,
    flashcards,
    quizQuestions,
    message: messages.join(" "),
    errors: [],
  };
}

// ---------------------------------------------------------------------------
// Legacy: standalone flashcard generation (kept for flashcards page)
// ---------------------------------------------------------------------------

export async function generateFlashcards(
  _initialState: { message: string; error: boolean },
  formData: FormData
): Promise<{ message: string; error: boolean }> {
  const notes = formData.get("notes") as string;

  if (!notes || notes.trim().length === 0) {
    return { message: "Please enter some study notes.", error: true };
  }

  if (notes.trim().length < 20) {
    return {
      message: "Notes are too short. Please enter more detailed study notes.",
      error: true,
    };
  }

  const segments = segmentNotes(notes);
  const cleanedSegments = segments
    .map(stripListMarkers)
    .filter((s) => s.length > 10);

  const definitions: { term: string; definition: string }[] = [];

  for (const segment of cleanedSegments) {
    definitions.push(...extractDefinitions(segment));
  }

  const seenTerms = new Set<string>();
  const uniqueDefinitions = definitions.filter((d) => {
    const key = d.term.toLowerCase();
    if (seenTerms.has(key)) return false;
    seenTerms.add(key);
    return true;
  });

  let flashcards = buildFlashcards(uniqueDefinitions);

  if (flashcards.length === 0) {
    flashcards = buildFallbackFlashcards(cleanedSegments);
  }

  await writeFlashcards(flashcards);
  revalidatePath("/flashcards");

  return {
    message: `Generated ${flashcards.length} flashcards from your notes!`,
    error: false,
  };
}

// ---------------------------------------------------------------------------
// Legacy: standalone quiz generation (kept for quiz / retake buttons)
// ---------------------------------------------------------------------------

export async function generateQuiz(): Promise<{
  message: string;
  error: boolean;
}> {
  const flashcards = await readFlashcards();

  if (flashcards.length === 0) {
    return {
      message: "No flashcards found. Generate some flashcards first.",
      error: true,
    };
  }

  const quizItems = buildQuizItems(flashcards, flashcards.length);
  await writeQuiz(quizItems);
  revalidatePath("/quiz");

  return {
    message: `Generated ${quizItems.length} quiz questions!`,
    error: false,
  };
}
