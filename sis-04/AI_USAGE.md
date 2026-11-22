# AI Usage Disclosure — SIS #04

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Date | Used for | Which files it touched |
| --- | --- | --- | --- | --- |
| Claude (Anthropic), fresh chat, no file access | claude-opus-5-5 (Claude Opus 5.5) | 2026-11-22 | codebase analysis (Task 1) — report §8.1 | none (text answer only) |
| Claude (Anthropic), same chat, follow-up | claude-opus-5-5 | 2026-11-22 | improvement plan — report §8.2 | none |
| Claude (Anthropic), fresh chat, no file access | claude-opus-5-5 | 2026-11-22 | feature extension (Task 2): `filterRooms` — report §8.3 | `app/src/filter.ts` (its answer, used as returned) |
| Claude (Anthropic), the working session | claude-opus-5-5 | 2026-11-22 | refactoring (Task 3), the rest of the feature (`rooms.ts`, `checkRoom`, `explainRoom`, the page and components), the diagrams, the screenshots (Playwright, headless Chrome) | `app/src/**`, `app/README.md`, `diagrams/`, `evidence/` |
| Claude (Anthropic), the working session | claude-opus-5-5 | 2026-11-22 | tests (Task 4) and drafting report.md, this file and submission.yml | `app/src/catalog.test.ts`, `app/src/booking.test.ts` (B1–B4 ids, four direct `canBook` calls), `report.md`, `AI_USAGE.md`, `submission.yml` |

No Agent Skill and no MCP server were used (the optional extension was not done).

**The assistant wrote, or helped write, tests in `app/`:** yes
The working Claude session wrote `src/catalog.test.ts` and the B1–B4 ids. Every expected value comes
from F1–F5 and AC1–AC5, on a fixed catalog inside the test file, and the tests were run and seen
failing before `filterRooms` and `checkRoom` existed (§8.3, commits "tests written first").

**Every run pasted in report.md was produced by my code on my machine (or Codespace), unedited:** yes
(a Linux cloud workspace, Node 22 — the same kind of environment as a Codespace)

**Every number in report.md section 7 was measured the way its row says:** yes

**I shared no credentials, keys or private data with any tool:** yes

**Everything I submitted, I can explain and defend in class — including filterRooms, checkRoom and
why each module exists:** yes

**Anything I accepted from the AI without fully understanding it:**
`app/src/App.tsx`, the line `visible[0]?.id ?? null` (optional chaining and `??` together) — I know
what it picks, less the exact operator rules.

Signed: Sultan Bekzada
Date: 2026-11-22
