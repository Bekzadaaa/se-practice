# AI Usage Disclosure — Week 10

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (Anthropic), fresh read-only agent session (plan mode) | claude-opus-5-5 (Claude Opus 5.5) | read-only risk review (Task 2) | none — "WITHOUT editing files" (`git status` clean afterwards) |
| Claude (Anthropic), fresh read-only agent session | claude-opus-5-5 | AGENTS.md review and patch draft (Task 6) | `app/AGENTS.md`, only after my approval — the session drafted, the change in §6.3 was applied in the working session after the decisions in §6.2 |
| Claude (Anthropic), fresh read-only agent session | claude-opus-5-5 | minimal patches for two risks (Task 8): the refactor diff for R1 | `app/src/booking.ts`, `app/src/utils/availability.ts` — its diff applied unchanged after review; R2 is the AGENTS.md patch above |
| Claude (Anthropic), fresh read-only agent session | claude-opus-5-5 | prompt 0: read AGENTS.md and summarise it (Part 1) | none |
| Claude (Anthropic), the working session | claude-opus-5-5 | running the commands and tests, the R1 regression test, the UI screenshots (Playwright, headless Chrome), applying the approved patches, drafting lab-report.md, this file and submission.yml | `app/AGENTS.md`, `app/src/booking.test.ts`, `app/src/booking.ts`, `app/src/utils/availability.ts`, `evidence/`, `lab-report.md`, `AI_USAGE.md`, `submission.yml` |

**The review in Task 2 ran in a mode where the assistant could not edit, and `git status` showed no
change afterwards:** yes

**I labelled every claim in lab-report.md §3.2 after opening the cited file myself:** yes
(the lines were opened and quoted, and the NaN claim was checked with a real run — §3.2)

**Every change to `app/` was reviewed by me as a diff before I accepted it:** yes
Rejected: the playbook answer's AC4 "word for word", its new heading and its "Add packages" change
(§6.2); the refactor answer's new "Enter a valid time." message (§8.1).

**I used another assistant as well (to explain a risk, to draft text in lab-report.md, …):** yes
The working Claude session (claude-opus-5-5) drafted every section of lab-report.md, including the
register, the decision and the conclusion, from the runs and the files.

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes

**I can explain every score in my register, and why my release decision follows from it, without
the assistant:** yes

**Anything I accepted from the AI without fully understanding it:**
The TypeScript generic `BookingRequest<B extends Interval = Interval>` in `app/src/booking.ts` — I
understand it keeps the `Booking` type of the conflicts for the page, less how the default works.

Signed: Sultan Bekzada
Date: 2026-11-22
