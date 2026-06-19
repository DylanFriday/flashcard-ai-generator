# Flashcard Generator

## Purpose

Convert study notes into flashcards and save them to `data/flashcards.json`.

## Input

Plain text study notes.

Example:

```
Recursion is a function that calls itself.
A closure allows a function to access variables from its outer scope.
A stack is a data structure that uses LIFO ordering.
```

## Output

Write the flashcards directly to `data/flashcards.json` as a JSON array. Each flashcard follows this structure:

```json
[
  {
    "id": "<unique-id>",
    "question": "<short question about the concept>",
    "answer": "<concise answer>",
    "topic": "<category or subject of the concept>"
  }
]
```

### Output Rules

- Keep questions short and direct.
- Keep answers concise — one sentence when possible.
- Generate one flashcard for each important concept in the notes.
- Each flashcard must have a unique `id`.
- Always write the full array to `data/flashcards.json` (overwrite, don't append).
- After writing, confirm how many flashcards were generated.
