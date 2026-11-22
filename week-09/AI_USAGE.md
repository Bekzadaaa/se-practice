# AI Usage Disclosure — Week 09

Required by the course academic policy (Generative AI use level **D — AI-integrated**).
You are responsible for the accuracy, testing and integrity of everything you submit,
including anything an AI tool produced.

| Tool | Exact model / plan | Used for | Which files it touched |
| --- | --- | --- | --- |
| Claude (Anthropic), three separate fresh sessions, no tools | claude-opus-5-5 (Claude Opus 5.5) | Part 2 — writing the calls for R1, R2, R3 | calls/ (saved by me, unedited) |
| Claude (Anthropic), the working session | claude-opus-5-5 | writing `tool/check_room.json` (first draft and the two fixes after the first run), running the checker, drafting lab-report.md, this file and submission.yml | `tool/check_room.json`, `calls/` (saving the replies), `lab-report.md`, `AI_USAGE.md`, `submission.yml` |

**I wrote `tool/check_room.json` myself:** no
<!-- If an AI wrote or revised any of it, say which part, and how you checked it. -->
Claude (working session, claude-opus-5-5) wrote all of it. The first draft was committed with its
first checker run (S05 and S08 failed, §3); the two fixes (`additionalProperties: false` at the top
and in `bookings.items`, and `required` in the items) were made after that run. Checked with the
twelve S calls and by reading every constraint against §2.

**I used an AI to explain a JSON Schema keyword or a check:** no

**Every reply in `calls/` and in lab-report.md section 4 is exactly what the model returned:** yes
(each session's reply saved byte for byte; the harness's line indentation around the reply is not part
of it)

**Every terminal output in lab-report.md was pasted from a real run, unedited:** yes

**Anything I accepted from the AI without fully understanding it:**
Why the checker treats `600.0` as an integer but refuses `600.5` (its `_is_type` accepts whole floats).

Signed: Sultan Bekzada
Date: 2026-11-22
