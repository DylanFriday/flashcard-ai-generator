---
marp: true
paginate: true
transition: fade
# PechaKucha: 6 slides, 20s auto-advance. Do not change the count.
auto-advance: 20
---

<!-- slide 1 -->
# Who's my person?
<!-- 20s -->
A university student with pages of study notes and PDF lecture slides — overwhelmed by content, short on time, and tired of making flashcards by hand.

---

<!-- slide 2 -->
# Their problem
Manually turning notes into flashcards takes hours. Quiz creation is even slower. They waste study time on formatting instead of actually learning. PDF lecture slides sit unused because there's no easy way to convert them.

---

<!-- slide 3 -->
# What I built
An AI-powered flashcard and quiz generator. Paste study notes or upload a PDF, choose how many flashcards and quiz questions you want, and hit Generate. Flashcards appear as flip-through cards. Quizzes are multiple-choice with instant scoring — all in one web app.

---

<!-- slide 4 -->
# How I built it
- MCP: Filesystem server reads/writes `flashcards.json` and `quiz.json` directly from the data layer
- Skill: Flashcard Generator skill converts raw notes into structured Q&A pairs
- Agent: Quiz Master agent builds multiple-choice quizzes with plausible distractors from existing flashcards
- Stack: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4

---

<!-- slide 5 -->
# Why it matters
Students get from "I have notes" to "I'm ready for the exam" in under a minute. No manual flashcard typing. No wasted study time. PDF support means even scanned lecture materials become usable. The AI handles formatting — the student handles learning.

---

<!-- slide 6 -->
# Done checklist
- [ ] repo public
- [ ] MCP + skill + agent used
- [ ] report.md in team repo
