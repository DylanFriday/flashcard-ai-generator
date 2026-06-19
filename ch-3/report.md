# ch-3 Personal Project — Report

github_username: DylanFriday
personal_repo_url: https://github.com/DylanFriday/flashcard-ai-generator
project_summary: AI-powered flashcard and quiz generator that converts study notes and PDFs into Q&A flashcards and multiple-choice quizzes.
slides_url: slides/pitch.md

## Methodology
<!-- How you worked: project-based approach + your git workflow (commit as you build). 2-4 sentences. -->

I used a project-based approach: planned the full architecture (Next.js 16 App Router, Server Actions, JSON file storage) in `PLAN.md`, then implemented in phases — data layer and types first, then Server Actions, then UI pages and components, then PDF support. I used Claude Code as my AI pair programmer throughout, committing frequently as each feature was completed. Git history shows incremental, working-state commits rather than monolithic pushes.

## Evidence — Claude Code usage
<!-- List the ACTUAL paths in your personal repo. The validator checks these exist. -->

- .mcp.json
- .claude/skills/flashcard-generator/SKILL.md
- .claude/agents/quiz-master.md

### MCP
- path: .mcp.json
- what: Filesystem MCP server (`@modelcontextprotocol/server-filesystem`) configured to expose the `./data` directory. Used by Claude Code agents and skills to read and write `flashcards.json` and `quiz.json` directly, including within Server Actions that revalidate pages after writes.

### Skill
- path: .claude/skills/flashcard-generator/SKILL.md
- what: Flashcard Generator skill — converts plain text study notes into structured Q&A flashcards. Defines the output schema (`{id, question, answer, topic}`), formatting rules (short questions, concise one-sentence answers, one card per concept), and instructs Claude to write the result to `data/flashcards.json`. Used both interactively in Claude Code and as the prompt template driving the web app's Server Action logic.

### Agent
- path: .claude/agents/quiz-master.md
- what: Quiz Master agent — reads flashcards from `data/flashcards.json`, generates multiple-choice quiz questions with plausible distractors, and writes the quiz to `data/quiz.json`. Defines the quiz item schema (`{id, question, options{A,B,C,D}, correctAnswer, explanation}`) and rules (correct answer always in option A, distractors drawn from other flashcards' answers, unique IDs). Used both as a standalone agent and as the template for the web app's quiz generation.
