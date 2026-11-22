# AI Usage Disclosure — Week 07

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (Anthropic) | claude-opus-5-5 (Claude Opus 5.5), claude.ai | the first test suite (Task 3) | `suites/first/booking.test.ts` (and its copy in `app/src/`) |
| Claude (Anthropic) | claude-opus-5-5 | the improvement prompt (Task 5) | `app/src/booking.test.ts` |
| Claude (Anthropic) | claude-opus-5-5 | running Vitest, the three mutants and the five UI checks (Playwright + headless Chrome); drafting lab-report.md, this file and submission.yml | `evidence/`, `lab-report.md`, `AI_USAGE.md`, `submission.yml` |

**I used an assistant to extract `canBook` (Task 1), or to fix a defect in it:** yes
Claude (claude-opus-5-5) moved the six conditions from `checkAvailability` in
`src/utils/availability.ts` into `canBook` in `src/booking.ts` and made `src/App.tsx` call it.
Checked by re-running T1–T9 from Week 06 in the browser (still 9/9) and by `tsc --noEmit`.
No defect fix was needed: the first run had no failure.

**I used another assistant as well (to explain a failure, to draft text in lab-report.md, …):** yes
The same Claude session (claude-opus-5-5) drafted every section of lab-report.md from the real runs.
Note: the same session that generated the Week 06 code also generated these tests, so the suite is
not an independent opinion of the code — this is why the expected values were checked against §3
(from the ACs) and not against the code.

**`suites/first/` holds the assistant's first test file exactly as it generated it:** yes

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes
(the mutant runs in §7 are filtered with grep to the RUN, test, FAIL and Tests lines, as stated there)

**I can explain every test in my final suite — its input, its expected result and the AC behind
it — without the assistant:** yes

**Anything I accepted from the AI without fully understanding it:**
`structuredClone` in the first suite's AC5 test (the final suite uses `JSON.stringify` instead), and
the `describe` / `test` structure of Vitest beyond the basics.

Signed: Sultan Bekzada
Date: 2026-11-22
