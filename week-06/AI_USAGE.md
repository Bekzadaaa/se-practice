# AI Usage Disclosure — Week 06

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (Anthropic) — fallback instead of Bolt.new | claude-opus-5-5 (Claude Opus 5.5), claude.ai | prototype v1 (Task 2), from the deck's initial prompt | everything in `original/` |
| Claude (Anthropic) — fallback instead of Bolt.new | claude-opus-5-5 | cleanup prompts (Task 4): 3 fix prompts + 1 cleanup prompt | `prototype/src/utils/availability.ts`, `prototype/src/App.tsx`, `prototype/src/components/AvailabilityForm.tsx`, `prototype/src/index.css` |
| Claude (Anthropic) | claude-opus-5-5 | running T1–T9 in headless Chrome with Playwright and taking the screenshots; drafting lab-report.md, this file and submission.yml | `evidence/`, `lab-report.md`, `AI_USAGE.md`, `submission.yml` |

**Why not Bolt.new:** this practice was done after its deadline, only to have a working Week 06
project for Practices 07–10. It was done in a Claude session that has no signed-in Bolt.new account.
Same prompts, same nine cases, same file layout.

**I used another assistant as well (to explain code, to draft text in lab-report.md, …):** yes
Claude claude-opus-5-5 drafted the text of every section of lab-report.md (including §8, §9 and §10)
from the real runs. I read it and must be able to explain it myself.

**`original/` holds Bolt's first version exactly as downloaded, and `evidence/v1.png` shows it:** yes
(the fallback builder's first version, saved before any cleanup prompt; committed in "v1 as generated")

**Every screenshot in `evidence/` is an unedited capture of the page as it behaved:** yes
(captured by Playwright from the running page; none edited or composited)

**I can explain the component I chose in lab-report.md section 8 — and how the page decides
availability — without the assistant:** yes

**Anything I accepted from the AI without fully understanding it:**
The `edited(setter)` helper in `prototype/src/App.tsx` (a function that returns a function) — I
understand what it does (update the value and clear the result), less so the TypeScript generic `<T>`.

Signed: Sultan Bekzada
Date: 2026-11-22
