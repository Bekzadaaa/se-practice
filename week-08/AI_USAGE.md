# AI Usage Disclosure — Week 08

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (Anthropic), fresh session, no tools, no skill | claude-opus-5-5 (Claude Opus 5.5) | diagnosis without the skill (Task 4) | none — "Do not edit code" (it had no file access) |
| Claude (Anthropic), fresh session, no tools, SKILL.md as a prompt-only simulation | claude-opus-5-5 | diagnosis with bug-detector (Task 5) | none — "Do not edit code" (it had no file access) |
| Claude (Anthropic), the working session | claude-opus-5-5 | running the suite, pasting the provided canBook, writing the BUG-A / BUG-B tests, writing SKILL.md from the deck's text and zipping it, applying the two one-line fixes, running the checker, drafting lab-report.md, this file and submission.yml | `app/src/booking.ts`, `app/src/booking.test.ts`, `skills/`, `evidence/install.png`, `lab-report.md`, `AI_USAGE.md`, `submission.yml` |

**`skills/bug-detector/SKILL.md` was typed by me from the deck's text, not generated:** no
It was written by Claude in the working session, copying the deck's text word for word (the
checker's K5 confirms the seven steps are verbatim). Nothing in it was invented or changed.

**I applied the patches myself, one minimal change per bug, after reviewing what the assistant
proposed:** no
Both fixes were applied in the working Claude session, one change per bug in its own commit
(`fix BUG-A`, `fix BUG-B`), after the failing tests were committed. The two diagnosing sessions
edited nothing. I reviewed the diffs in §8: one comparison made strict, one `push` (and its comment)
removed.

**I used another assistant as well (to explain a failure, to draft text in lab-report.md, …):** yes
Claude claude-opus-5-5 (the working session) drafted every section of lab-report.md, including §3,
§7, §9.2 and §10, from the real runs. The claims in §7 were checked by running both assistants'
AC5 tests on the buggy code (results quoted in §7).

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes

**I can explain both bugs and both fixes — which line, why it was wrong, which test proves the
fix — without the assistant:** yes

**Anything I accepted from the AI without fully understanding it:**
The way Vitest's `-t "BUG-A"` filter reports the other tests as "skipped" in §8.1–§8.2.

Signed: Sultan Bekzada
Date: 2026-11-22
