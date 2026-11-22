# Week 07 — Lab report

**Name:** Sultan Bekzada (24B032035)
**Group:** Software Engineering practice, Monday 16:00–19:00
**Date:** 2026-11-22

Fill in every section. **Do not delete, rename or renumber the headings.** The checker and the
grader find your answers by them. You can add rows to any table, but never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Project I continue (`week-06` = my Week 06 Bolt project, `starter` = the provided starter) | week-06 (my Week 06 final, `week-06/prototype`, generated with the fallback builder Claude) |
| Bolt project link (or `not shared`, and why) | not shared — Week 06 was built without Bolt (see Week 06 §1); the source is in `app/` |
| Assistant that generated the tests (tool) | Claude (Anthropic) |
| Exact model (with its version, or `not displayed`) | claude-opus-5-5 (Claude Opus 5.5) |
| Where I ran the tests (Bolt terminal / my computer / Codespace) | a Linux terminal (Node 22, npm) in a Claude cloud workspace — same as a Codespace |
| Vitest version (the `RUN  v…` line of a run) | |
| Test command | `npx vitest run` (also `npm test`) inside `week-07/app/` |

---

## 2. Task 1 — baseline and the booking function

**Before editing:** where did the booking decision live in the project you started from?

| | |
| --- | --- |
| File and function (or "inside the page component") | `src/utils/availability.ts`, `checkAvailability(room, start, end, now)` |
| Its inputs | the whole `Room` object (with `blocked` and `bookings`), and `start`, `end`, `now` in minutes |
| What it returned | an object `{ available, reasons, conflicts }` — `available` was `reasons.length === 0` |
| How the page used it | `App.tsx` `handleCheck()` converted HH:MM to minutes, called it with a copy of the room (blocked flag from the checkbox) and stored the whole object as the result shown by `ResultPanel` |

**What I changed to extract `canBook`.** Say which file it now lives in, what you moved, and why
the behaviour did not change. Also say which file of the page now calls it. 40 words or more.

<!-- Write below this line -->

The decision now lives in `src/booking.ts` as `canBook({ start, end, now, blocked, bookings })`,
which returns only true or false. I moved the six conditions out of `checkAvailability` in the same
order and with the same comparisons (`start < 0 || end > 1440`, `start >= end`, `start <= now`,
`end - start > 120`, `blocked`, and `start < b.end && end > b.start` for each booking), so every input
gives the same decision as before. `MAX_DURATION` and `DAY_END` moved with it. `checkAvailability`
stays in `src/utils/availability.ts` but now returns only the reasons and conflicts for the messages.
`src/App.tsx` imports `canBook` from `./booking` and calls it in `handleCheck()` for the Available /
Unavailable decision. I reran T1–T9 in the browser after the change: still 9/9, same messages.

---

## 3. Task 2 — the test plan

Default fixture: `now = 540`, `blocked = false`, `bookings = [{ start: 600, end: 660 }]`, fresh
for every test. **The Expected column comes from AC1–AC4, never from the code.** Write the
**reason** for each expected result **before** you send the generation prompt.

| ID | Candidate / changed input | Expected | AC | Reason (in your words) |
| --- | --- | --- | --- | --- |
| T01 | 660–720 (touching after) | true | AC4 | The booking is [600, 660); the end 660 is excluded, so 660–720 only touches it and nothing overlaps. 540 < 660, 60 min, not blocked. |
| T02 | 540–570 (starts now) | false | AC1 | start 540 equals now 540; AC1 needs start strictly after the current time, so a request starting now is rejected. |
| T03 | 720–720 (zero duration) | false | AC1 | start 720 is not less than end 720; AC1 needs start < end, a zero-length interval is not a booking. |
| T04 | 750–720 (reversed) | false | AC1 | start 750 is after end 720, so start < end fails; a reversed interval is rejected even though it does not overlap. |
| T05 | 1380–1441 (past day end) | false | AC1 | end 1441 is one minute past 1440 (24:00); AC1 needs end ≤ 1440, so it is rejected though the length is only 61 min. |
| T06 | 720–840 (120 minutes) | true | AC2 | 840 − 720 = 120 minutes; AC2 rejects only bookings longer than 120, so exactly 2 hours is allowed. No overlap with 600–660. |
| T07 | 720–841 (121 minutes) | false | AC2 | 841 − 720 = 121 minutes, one minute longer than 120, so AC2 rejects it. |
| T08 | 570–600 (touching before) | true | AC4 | The request [570, 600) excludes 600, where the booking starts, so they only touch. 570 > now 540, 30 min. |
| T09 | 630–690 (partial overlap) | false | AC4 | 630 is inside 600–660 and 690 is after it: the minutes 630–659 belong to both, so it overlaps. |
| T10 | 570–690 (contains booking) | false | AC4 | 570–690 starts before and ends after the booking, so it covers all of 600–660: overlap. |
| T11 | 615–645 (inside booking) | false | AC4 | 615–645 lies completely inside 600–660; every minute of it is already booked. |
| T12 | 600–660 (identical interval) | false | AC4 | The same interval as the booking: all 60 minutes overlap, touching does not apply. |
| T13 | 660–720, blocked = true | false | AC3 | 660–720 would be Available (T01), but the room is blocked, and AC3 rejects any request for a blocked room. |
| T14 | 630–690, bookings = [] | true | AC4 | 630–690 overlapped only because of the 600–660 booking (T09); with no bookings there is nothing to overlap and AC1/AC2 hold. |
| AC5 | an Available request — the bookings after the call equal the bookings before | true, data unchanged | AC5 | A check is only a question: after an Available 660–720 the bookings array must still be exactly [{600,660}] — nothing added or changed. |
| X1 | 1380–1440 (23:00–24:00, ends exactly at the end of the day) | true | AC1 | AC1 allows end ≤ 1440, so ending exactly at 24:00 is valid; 60 min, after now, no overlap. T05 checks 1441 (just past), X1 checks the other side of the same boundary. |
| X2 | 660–720 with bookings = [{600–660}, {720–780}] (touches two bookings) | true | AC4 | The request starts where one booking ends and ends where the next starts; both ends only touch, so no minute is shared. T01/T08 test one touching side at a time, never both at once. |

X1 and X2 are **your own two cases**: a boundary or a state that T01–T14 do not reach. Fill all
five columns.

---

## 4. Task 3 — the generation prompt and the first suite

**The prompt exactly as I sent it.** Use the deck's prompt with `[our test framework]` replaced by
`Vitest`, followed by the case table from section 3:

```text
(paste here)
```

**The assistant's answer: run command, AC mapping and any unclear requirements it flagged,
pasted unedited.** Its test file goes to `suites/first/` and is not pasted here:

```text
(paste here)
```

The first suite was saved to `suites/first/` **before** I changed anything in it: yes / no

---

## 5. Task 4 — review of the first suite

Review it **before** you run it. Look at the imports, the expected values, isolation, duplicates
and skipped tests. Make one row per decision. At least **two** rows, and each one names the kind of
weakness (the deck's table: *no exception occurred* · *expected = current output* · *only valid
requests* · *mocked booking function*, or your own) and the AC that decides it.

| # | Test or part of the suite | What is weak or wrong | Decision: accept / revise / reject | AC or reason |
| --- | --- | --- | --- | --- |
| 1 | | | accept / revise / reject | |
| 2 | | | accept / revise / reject | |

---

## 6. Task 5 — running, diagnosing, improving

### 6.1 The first run

The **real** terminal output of the first run of the first suite, pasted unedited. Include the
`RUN  v…` line and the `Tests` summary line. A build message or the assistant saying "tests pass"
is not a run.

```text
(paste here)
```

**Each failure, diagnosed** (the deck's table: import/runner error · assertion mismatch · result
changing per run · no tests discovered). Write `none` in the first row if nothing failed.

| Failing test | Observed failure | First check | Test repair or implementation fix? | Action taken |
| --- | --- | --- | --- | --- |
| | | | | |

### 6.2 The improvement prompt

The deck's improvement prompt exactly as sent, followed by the actual output from 6.1. Then
paste the assistant's answer, unedited:

```text
(paste here)
```

### 6.3 The final run

The **real** output of the final suite (`booking.test.*` beside your module), after every
change and after restoring the correct code from section 7. Every test must pass. If a real defect
is still open, leave its test failing and explain it in 9.1.

```text
(paste here)
```

---

## 7. Task 6 — deliberate defects

You need a reviewed, passing suite first. Then introduce **one** defect at a time in your booking
module, leave the tests unchanged, run, record, and **restore** the code. A syntax or import
error does not count as detection.

| Trial | Intentional change | Detected / Survived | Failing test ID(s) | If it survived: why, and what you added |
| --- | --- | --- | --- | --- |
| M1 | Reject duration >= 120 instead of > 120 | Detected / Survived | | |
| M2 | Treat touching endpoints as an overlap | Detected / Survived | | |
| M3 | Remove the blocked-room rejection | Detected / Survived | | |

**The run of each mutant, pasted unedited.** Paste the `Tests` summary line and the failing test
names at least:

```text
(paste here)
```

All three changes reverted, and the full suite run again (section 6.3): yes / no

---

## 8. Task 7 — manual UI checks

Use `now = 09:00` and an existing `10:00–11:00` booking. Do them in the page in a browser. Save a
screenshot of each as `evidence/ui-1.png` … `evidence/ui-5.png`. Take **ui-4 at phone width**
(about 375 px, portrait).

| # | Action | Expected observation | AC | What I observed | Pass / Fail / Not testable |
| --- | --- | --- | --- | --- | --- |
| U1 | Check 11:00–12:00, unblocked | Available, with the fixed sample booking | AC5 | | Pass / Fail / Not testable |
| U2 | Enable blocked, then check again | Unavailable replaces the earlier result | AC3, AC5 | | Pass / Fail / Not testable |
| U3 | Clear a required input and submit | Understandable validation feedback | AC6 | | Pass / Fail / Not testable |
| U4 | Use a narrow (phone) width | Controls and result remain usable | AC6 | | Pass / Fail / Not testable |
| U5 | Repeat the checks on the same data | Existing bookings remain unchanged | AC5 | | Pass / Fail / Not testable |

---

## 9. Comparison and what still fails

### 9.1 Checks I am keeping as FAIL or ERROR

Use the same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| | |

### 9.2 Original and improved suites

| Measure | First suite | Improved suite |
| --- | --- | --- |
| Executed / passed / failed | | |
| Requirements with meaningful tests (AC IDs and gaps) | | |
| Selected mutants detected | | |
| Accepted / revised / rejected tests | | |
| Remaining limitations | | |

### 9.3 What no AC decides

Call your function with `bookings = [{ start: 700, end: 650 }]` (a reversed existing booking)
and a request of 660–720. What does it return? Does any AC say what it should return? (This is
the value you declare in `submission.yml` under `assumptions.invalid_existing_booking`.)

-

---

## 10. Conclusion (120–180 words)

<!-- Answer all three in your own words, without the assistant:
     (a) Which mistake in the FIRST suite would have let a wrong canBook pass, and how did you find it?
     (b) What does your final green run prove, and what does it NOT prove? Use a mutant or a UI check.
     (c) One testing limitation that remains.
     Worthless: "The AI wrote good tests and they all passed."
     Worth everything: "The first suite expected T06 (exactly 120 minutes) to be rejected. That
     contradicts AC2, and it failed on a correct canBook. If I had changed the code to make it
     pass, M1 would have become the real behaviour." -->

<!-- Write your conclusion below this line -->
