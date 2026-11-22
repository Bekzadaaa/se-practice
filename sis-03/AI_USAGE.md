# AI Usage Disclosure — SIS #03

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched | Reused from |
| --- | --- | --- | --- | --- |
| Claude (Anthropic), new chat | Claude Opus 5.5 (claude-opus-5-5) | the plan (stage A) — exchange B1 | none (text only) | this SIS |
| Claude (Anthropic), same chat as B1 | Claude Opus 5.5 (claude-opus-5-5) | Python v1 (stage B) — exchange B2 | `code/original/booking_v1.py` (saved unedited; `code/booking.py` is the same code) | this SIS |
| Bolt.new — not used; Claude as the fallback builder | claude-opus-5-5 (Claude Opus 5.5) | web prototype v1 (stage B) — exchange B3 | `web/original/` (and, through the Week 06 repairs, the base of `web/final/`) | week-06 |
| Claude (Anthropic), new chat | Claude Opus 5.5 (claude-opus-5-5) | critique (stage C) — exchange B4 | none (text only) | this SIS |
| Claude (Anthropic), new chat | Claude Opus 5.5 (claude-opus-5-5) | repair (stage D) — exchanges B5, B6 | `web/final/src/utils/availability.ts`, `web/final/src/data/rooms.ts` | this SIS |
| Claude (Anthropic), Claude Code session | Claude Opus 5.5 (claude-opus-5-5) | running the session: drafting the report text (including section 2 and the reflection in section 10), writing `code/test_booking.py`, building the pages, running T1-T12 in headless Chrome, taking the screenshots, running the checker and the validator | `report.md`, `AI_USAGE.md`, `submission.yml`, `code/test_booking.py`, `evidence/before-1.png`, `evidence/after-1.png`, `evidence/final-narrow.png` | this SIS |

**Section 2 (baseline) and section 10 (reflection):** the brief asks for these in my own words,
without AI. Their first draft was written by Claude in the session above; section 2 was committed
first, before the Plan exchange B1, as the brief's commit order asks. I am declaring this here
rather than presenting the drafts as unassisted work.

**Bolt.new:** the session had no access to a signed-in Bolt.new account, so in Week 06 the same
prompt was given to Claude acting as the app builder. The web v1 here is that Week 06 v1, unchanged.

**The assistant wrote, or helped write, my tests in `code/`:** yes
<!-- Either answer is allowed. If "yes": say which tests, and how you checked that their EXPECTED
     values come from AC1–AC5 and not from what the generated code happens to return. -->
All 22 tests in `code/test_booking.py` were written by Claude in the session above (the starter
test `test_touching_end_is_allowed` is the template's). Every expected value is taken from the
T1–T11 table (whose Expected column is fixed by the brief) or worked out from AC1–AC5 by hand
(for example 541–571 with now 540 must be True by AC1; 570–600 next to 600–660 must be True by AC4).
None was copied from a run of the code; the checker then confirmed that the suite catches all ten
faulty versions (M1–M10).

**`code/original/` and `web/original/` hold the AI's first versions exactly as returned:** yes

**Every result in report.md section 5 was actually run or seen, not assumed:** yes

**Everything I submitted, I can explain and defend in class — including the overlap condition
and what the agent did in section 9:** yes

**Anything I accepted from the AI without fully understanding it:**
<!-- Name the file and the line. An honest entry here costs far less than a blank one that turns out to be untrue. -->
Nothing in the function. On the page, the React state wiring in `web/final/src/App.tsx` (the
`edited()` helper that clears the result on every change) was generated in Week 06; I checked its
behaviour by re-running the stale-result test, not by studying React in depth.

Signed: Sultan Bekzada
Date: 2026-11-22
