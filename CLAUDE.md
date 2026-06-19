# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Overview

An AI-powered flashcard generator that converts study notes into flashcards and quizzes. Built with Next.js 16 (App Router), React 19, Tailwind CSS v4, and TypeScript.

## Commands

```bash
npm run dev      # Start development server on http://localhost:3000
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Architecture

```
app/                  # Next.js App Router pages
  page.tsx            # Home page (currently default template)
  layout.tsx          # Root layout (Geist fonts, antialiased, dark mode support)
  globals.css         # Tailwind CSS v4 import + theme variables
data/                 # Data files accessible via MCP filesystem server
  flashcards.json     # Flashcard data store
slides/               # Slide content (pechakucha format)
.claude/
  agents/             # Custom Claude Code agents
    quiz-master.md    # Generates multiple-choice quizzes from flashcards
  skills/             # Custom Claude Code skills
    flashcard-generator/SKILL.md  # Converts study notes into Q&A flashcards
```

## Key Technical Details

- **Next.js 16.2.9** with App Router — before writing any Next.js code, consult the relevant guide in `node_modules/next/dist/docs/` (especially `01-app/` for app router docs).
- **Tailwind CSS v4** via `@tailwindcss/postcss` plugin (not the v3 PostCSS config pattern).
- **Path alias**: `@/*` maps to project root (`./*`).
- **TypeScript** in strict mode with `bundler` module resolution.
- **ESLint** uses flat config (`eslint.config.mjs`) with `eslint-config-next` (core-web-vitals + typescript).
- **MCP filesystem server** is configured to expose `./data` directory.
- **Fonts**: Geist Sans and Geist Mono loaded via `next/font/google` with CSS variables.

## Claude Code Integration

This project defines two Claude Code extensions:

- **Flashcard Generator** skill (`.claude/skills/flashcard-generator/SKILL.md`): Converts plain text study notes into short Q&A flashcards.
- **Quiz Master** agent (`.claude/agents/quiz-master.md`): Reads flashcards and generates multiple-choice quizzes with answer keys.

## Behavioral Guidelines

Tradeoff: These guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

State your assumptions explicitly. If uncertain, ask. If multiple interpretations exist, present them — don't pick silently. If a simpler approach exists, say so. Push back when warranted. If something is unclear, stop, name what's confusing, and ask.

### 2. Simplicity First

Minimum code that solves the problem. No features beyond what was asked. No abstractions for single-use code. No "flexibility" or "configurability" that wasn't requested. No error handling for impossible scenarios. If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes

Touch only what you must. Don't "improve" adjacent code, comments, or formatting. Don't refactor things that aren't broken. Match existing style, even if you'd do it differently. If you notice unrelated dead code, mention it — don't delete it. Remove imports/variables/functions that YOUR changes made unused. Don't remove pre-existing dead code unless asked.

### 4. Goal-Driven Execution

Transform tasks into verifiable goals: "Add validation" → "Write tests for invalid inputs, then make them pass." For multi-step tasks, state a brief plan with verification steps. Strong success criteria let you loop independently; weak criteria require constant clarification.
