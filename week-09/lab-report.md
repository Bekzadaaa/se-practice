# Week 09 — Lab Report: canBook as a Tool

Fill in every section. Do not delete or renumber the headings: the README and the checker point at
them. Replace every `<!-- comment -->` with your own text (comments are ignored by the checker).

**Name:** Sultan Bekzada
**Student ID:** 24B032035
**GitHub:** Bekzadaaa

---

## 1. Setup

| | |
| --- | --- |
| Assistant (frozen for the whole lab) | Claude (Anthropic), each request in a separate fresh session that saw only the prompt |
| Exact model (or "not displayed") | claude-opus-5-5 (Claude Opus 5.5) |
| Three fresh chats for R1, R2, R3? (yes / no) | yes — three separate sessions, none of which saw this conversation or each other |
| Python version (`python --version`) | Python 3.13.18 |

## 2. Your tool definition — a reason for every constraint

Paste your final `tool/check_room.json`, then fill the table: one row per constraint you wrote.

```json
{
  "name": "check_room",
  "description": "Checks whether one campus room is available for a requested time interval today. All times are whole minutes since midnight, from 0 to 1440 (for example 10:00 = 600, 24:00 = 1440). The interval includes start and excludes end. Returns Available or Unavailable. It only checks: it does not save, create or change any booking.",
  "inputSchema": {
    "type": "object",
    "properties": {
      "start": {
        "type": "integer",
        "minimum": 0,
        "maximum": 1440,
        "description": "Requested start, minutes since midnight."
      },
      "end": {
        "type": "integer",
        "minimum": 0,
        "maximum": 1440,
        "description": "Requested end, minutes since midnight. 1440 means 24:00."
      },
      "now": {
        "type": "integer",
        "minimum": 0,
        "maximum": 1440,
        "description": "The current time, minutes since midnight."
      },
      "blocked": {
        "type": "boolean",
        "description": "true if the room is blocked."
      },
      "bookings": {
        "type": "array",
        "description": "The room's existing bookings today. May be empty.",
        "items": {
          "type": "object",
          "properties": {
            "start": { "type": "integer", "minimum": 0, "maximum": 1440 },
            "end": { "type": "integer", "minimum": 0, "maximum": 1440 }
          },
          "required": ["start", "end"],
          "additionalProperties": false
        }
      }
    },
    "required": ["start", "end", "now", "blocked", "bookings"],
    "additionalProperties": false
  }
}
```

| Field | Constraint (e.g. `"type": "integer"`, `"maximum": 1440`) | What goes wrong without it |
| --- | --- | --- |
| (top level) | `"type": "object"`, `"required": [all five]` | a call could leave out `now` (S04) and the function would compare against `undefined`, so AC1's "after the current time" silently passes |
| (top level) | `"additionalProperties": false` | a model can invent fields such as `"room": "204"` (S05); the call looks valid, but the field is ignored, so the user thinks a specific room was checked |
| `start`, `end`, `now` | `"type": "integer"` | `"end": "11:00"` (S03) or `600.5` (S10) would reach `canBook`; a string compared with numbers gives wrong answers instead of an error |
| `start`, `end`, `now` | `"minimum": 0`, `"maximum": 1440` | -30 (S06) or 1500 (S07) are outside the day; the schema refuses them before the function runs. 1440 itself stays allowed for `end` (S11, 24:00) |
| `blocked` | `"type": "boolean"` | `"false"` as a string (S09) is truthy in JavaScript, so a free room would be reported as blocked (AC3 inverted) |
| `bookings` | `"type": "array"`, no `minItems` | must accept `[]` (S02, R2); a pair `[660, 720]` is refused by the item schema (S12) |
| `bookings.items` | `"type": "object"`, `"required": ["start", "end"]`, `"additionalProperties": false`, integer 0–1440 | a booking `{start: 660}` (S08) would have `end` undefined; the overlap test `end > b.start` then quietly ignores it and AC4 is not enforced |
| (description) | says minutes, 0–1440, half-open, "does not save" | a model sends "10:00" or thinks the call reserves the room; R1 and R2 were converted correctly, and R3's question shows the model took "today" from it |

## 3. The twelve calls — first run and final run

Your **first** run's S verdicts (before any fix), and your final ones. For every case that changed,
say what you changed.

| Case | First run | Final run | What you changed |
| --- | --- | --- | --- |
| S01 | PASS | PASS | nothing |
| S02 | PASS | PASS | nothing |
| S03 | PASS | PASS | nothing |
| S04 | PASS | PASS | nothing |
| S05 | FAIL | PASS | added `"additionalProperties": false` to the top-level `inputSchema`: without it any extra field (`room`) was allowed |
| S06 | PASS | PASS | nothing |
| S07 | PASS | PASS | nothing |
| S08 | FAIL | PASS | added `"required": ["start", "end"]` (and `additionalProperties: false`) to `bookings.items`: the item schema listed the two fields but did not require them |
| S09 | PASS | PASS | nothing |
| S10 | PASS | PASS | nothing |
| S11 | PASS | PASS | nothing |
| S12 | PASS | PASS | nothing |

## 4. Function calling — what the model wrote

For each request, paste the model's reply exactly, then judge it against the request.

### R1

```text
{"name": "check_room", "arguments": {"start": 600, "end": 660, "now": 540, "blocked": false, "bookings": [{"start": 660, "end": 720}]}}
```

R1 matches the request and F3: 9:00 → `now` 540, 10:00–11:00 → 600–660, not blocked → `false`, the
11:00–12:00 booking → `[{"start": 660, "end": 720}]`. One JSON object, no prose, no fence, as the
prompt asked. `canBook` would answer Available: 600–660 only touches 660–720 (AC4).

### R2

```text
{"name": "check_room", "arguments": {"start": 840, "end": 990, "now": 810, "blocked": true, "bookings": []}}
```

R2 matches F6: 13:30 → 810, 14:00 → 840, 16:30 → 990 (16 × 60 + 30, not 960), blocked → `true`, no
other bookings → `[]`. The model did call although the answer will be Unavailable: it did not decide
for the function. `canBook` rejects it twice over — the room is blocked (AC3) and 840–990 is
150 minutes (AC2). The schema accepts it, because every value is a valid integer in range: that is
exactly the "shape, not meaning" point.

### R3

```text
I can only check rooms for today, not tomorrow. Do you want to check a time today instead, and if so, what are the exact start and end times, the current time, whether the room is blocked, and what bookings it already has?
```

<!-- What information was missing? Did the model ask, or call? If it called, which values did it invent, and from where? -->

R3 gives no current time, no exact start or end ("afternoon", "a couple of hours"), nothing about
blocked or bookings — and it is about tomorrow. The model asked instead of calling (saved as
`calls/r3.txt`) and invented no values. Two things are worth noting. First, it refused "tomorrow"
because my description says "for a requested time interval today": the description, not the
schema, set that limit, and nothing in the schema could have expressed it. Second, the prompt asked
for "one short question", and it asked for five things in one sentence — it obeyed "do not guess"
but not "short".

## 5. What the schema cannot check

<!-- Name the acceptance criteria (AC1-AC6, README section 3) that a JSON Schema with the allowed keywords cannot
     enforce, and say why for each. At least two, by their AC number. Which part of AC1 CAN the schema enforce? -->

- **AC1, the relations:** `start < end` and `start > now` compare two fields. Every allowed keyword
  (`minimum`, `maximum`, `exclusiveMinimum` …) compares one field with a constant, so `start = 600,
  end = 600` or `start = 540, now = 540` are valid calls. The part of AC1 the schema *can* enforce is
  the range: each of `start`, `end`, `now` is a whole number with `0 ≤ x ≤ 1440`.
- **AC2:** "at most 120 minutes" is `end − start ≤ 120`, arithmetic on two fields. R2 (840–990,
  150 minutes) is a valid call that only `canBook` rejects.
- **AC3:** the schema can say `blocked` is a boolean, not that `true` must make the answer
  Unavailable. That is the function's decision (R2 again).
- **AC4:** overlap compares the request with every item of `bookings`, with strict `<` so touching is
  allowed. No allowed keyword relates array items to other fields.
- **AC5:** "does not change or save anything" is behaviour, not input shape; the description can
  promise it, only the code (and a test like Week 08's BUG-B) can keep it.
- **AC6:** page feedback is not part of a tool call at all.

## 6. Permissions — allow, ask or block

| # | Action | Decision (allow / ask / block) | Reason (the risk, in one sentence or more) |
| --- | --- | --- | --- |
| A1 | call `check_room` with the times the user just typed | allow | It only reads: the schema validates the call and the tool never saves (AC5), so the worst case is a wrong answer to the user, not changed data. |
| A2 | read `week-08/app/src/booking.ts` | allow | Reading one source file changes nothing and the file holds no secrets; the agent needs it to explain a decision. |
| A3 | edit `booking.ts` to raise the 120-minute limit to 180 | block | It changes an acceptance criterion (AC2) because one user asked; T06/T07 would break and the rule is the course owner's decision, not the agent's. |
| A4 | run `npm test` in `week-08/app` | ask | It runs whatever the test script in package.json says with my shell rights, and npm can reach the network; harmless here, but I want to see it first. |
| A5 | run `git reset --hard` to undo its own last three edits | block | git reset --hard throws away every uncommitted change in the working tree, including my own edits, not just its last three; it cannot be undone. |
| A6 | `git commit` its change on the `week-09` branch | ask | A commit on the week-09 branch is reversible, but it puts the agent's change into history under my name, so I review the diff first. |
| A7 | `git push` to `main` | block | Pushing to main skips the pull request and review that the course requires; main must never receive direct commits. |
| A8 | send the contents of `.env` to an MCP server it found online | block | It sends secrets to an unknown third-party server: data exfiltration that no configuration reason justifies. |

## 7. Checkpoint

<!-- The commit you would make before letting such an agent edit anything: its real SHA (git log --oneline),
     the exact command that returns you to it, and what that command would throw away. -->

Checkpoint: `deeb1d9 week-09: model calls for R1-R3 saved exactly as returned (three fresh sessions)`
— the commit with the definition and the three calls, made before any agent touches the folder.

To return to it: `git reset --hard deeb1d9` (on the `week-09` branch).

What it throws away: every commit on `week-09` after `deeb1d9` and every uncommitted change in the
whole working tree — tracked files go back to the checkpoint. Untracked files (for example a new file
the agent created) stay, so after the reset I also check `git status` and remove them by hand
(`git clean -n` first to see the list). A gentler option that keeps my other work is
`git checkout deeb1d9 -- week-09`, which only restores the files in `week-09/`.

## 8. Checker output

Paste the **whole** output of your last `python tests/check_tool.py`, unedited.

```text
$ python tests/check_tool.py
PASS  D1    tool/check_room.json exists and is valid JSON
PASS  D2    has name, description and inputSchema
PASS  D3    name is exactly "check_room"
PASS  D4    description: 25+ words, says minutes, 1440, and that it does not save
PASS  D5    inputSchema: an object with exactly the five fields, all required
PASS  D6    inputSchema uses only the keywords listed in README section 5
PASS  S01   the R1 call, valid -> accept
PASS  S02   no existing bookings: bookings = [] -> accept
PASS  S03   end as a string: "11:00" -> refuse
PASS  S04   now missing -> refuse
PASS  S05   an extra field: "room": "204" -> refuse
PASS  S06   start below the day: -30 -> refuse
PASS  S07   end beyond the day: 1500 -> refuse
PASS  S08   a booking with no end: {start: 660} -> refuse
PASS  S09   blocked as a string: "false" -> refuse
PASS  S10   start not a whole minute: 600.5 -> refuse
PASS  S11   end at the end of the day: 1440 -> accept
PASS  S12   a booking as a pair: [660, 720] -> refuse
PASS  F1    calls/r1.json: a call to check_room
PASS  F2    calls/r1.json: arguments valid against your schema
PASS  F3    calls/r1.json: arguments equal the expected ones (README section 5, Part 2)
PASS  F4    calls/r2.json: a call to check_room
PASS  F5    calls/r2.json: arguments valid against your schema
PASS  F6    calls/r2.json: arguments equal the expected ones (README section 5, Part 2)
PASS  F7    calls/r3: exactly one of r3.json (it called) or r3.txt (it asked), not empty
PASS  L1    section 5 names at least two acceptance criteria (AC1-AC6) the schema cannot check
PASS  L2    section 6: A1-A8 each have allow / ask / block and a reason of 5+ words
PASS  L3    section 7 names the checkpoint commit (a SHA)
PASS  L4    section 10: a conclusion of 80-150 words
PASS  L5    AI_USAGE.md filled in (a tool row, and signed)

SUMMARY: 30 PASS · 0 FAIL · 0 ERROR  (of 30 checks)
Paste this whole output into lab-report.md section 8, and these three numbers into submission.yml.
```

## 9. What still fails

<!-- Every check in submission.yml known_fails, with the reason. "None" if all 30 pass. -->

None — the last run is 30 PASS · 0 FAIL · 0 ERROR (section 8).

## 10. Conclusion (80–150 words)

<!-- What did you learn about the line between the schema, the model and the function? Be specific:
     name a case, a request or an action. "Tool definitions are important" is worth nothing. -->

The three layers caught different things. My first schema let through an invented `room` field (S05)
and a booking with no end (S08), because I listed properties without forbidding extras or requiring
them; only the fixed calls showed that. The model converted R1 and R2 correctly, including 16:30 to
990, and it called for R2 although the room is blocked — deciding Unavailable is `canBook`'s job,
and the schema happily accepts a 150-minute request. For R3 the limit came from my description:
"today" made it ask instead of inventing a time. For an agent, the line I drew is reads and
checks allowed, commits asked, and anything destructive or secret-sending (A5, A7, A8) blocked.
