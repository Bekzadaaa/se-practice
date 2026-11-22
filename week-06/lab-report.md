# Week 06 — Lab report

**Name:** Sultan Bekzada (24B032035)
**Group:** Software Engineering practice, Monday 16:00–19:00
**Date:** 2026-11-22

Fill in every section. **Do not delete, rename or renumber the headings** — the checker and the
grader find your answers by them. Add rows to any table; never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Tool | Bolt.new |
| Exact model (as Bolt shows it, or `not displayed`) | claude-opus-5-5 (Claude Opus 5.5) — the fallback builder, see the last row |
| Bolt project link (or `not shared`, and why) | not shared — no Bolt project exists; the prototype was generated in a Claude session, and its full source is in `original/` and `prototype/` |
| Browser and version | Google Chrome for Testing 153.0.8010.12 (headless, driven by Playwright 1.63 for the runs and screenshots) |
| If you could not use Bolt.new: the tool you used instead, and why | Claude (Anthropic), model claude-opus-5-5, used as the app builder. This practice was done late (after its deadline) only to have a working project for Practices 07–10, and it was done in a Claude session that has no access to a signed-in Bolt.new account. Same prompts, same nine cases. |

---

## 2. Task 1 — define before generating

**Two predictions, written BEFORE you send the first prompt.** Where do you expect v1 to go wrong?
Fill the first three columns now; fill the last one after Task 3.

| # | What I expect to go wrong | AC it concerns | Was I right? (after Task 3) |
| --- | --- | --- | --- |
| 1 | "Start is after the current time" will be coded as "start is not before now" (`start < now` rejected), so a request that starts exactly at the current time (T6, 09:00 with now 09:00) is wrongly Available. | AC1 | |
| 2 | The page will not let me *supply* the test state: the current time will come from the real clock and/or "blocked" will be fixed in the sample data, so T3 or T6 cannot be set up on the selected room. | AC1, AC3 | |

**The initial prompt exactly as I sent it** — the deck's prompt with AC1–AC6 pasted in place of
`[paste AC1–AC6]`, nothing else changed:

```text
Build a small responsive Smart Campus Room Availability Checker. Requirements: AC1: Accept a candidate interval only when 0 ≤ start < end ≤ 1440 and start is after the supplied current time.
AC2: Reject a booking longer than 120 minutes.
AC3: Reject the request when the selected room is blocked.
AC4: Reject any interval that overlaps an existing booking; touching endpoints are allowed.
AC5: Show a clear Available / Unavailable decision without changing the existing booking data.
AC6: The page remains usable at desktop and narrow/mobile width and gives understandable validation feedback. Use fictional sample data only. Keep the implementation simple and within one-page scope. Do not add authentication, backend services, analytics, or unrelated features. After building, briefly list the main files/components you created.
```

---

## 3. Task 2 — prototype v1

v1 export saved in `original/` and screenshot saved as `evidence/v1.png` **before** any cleanup
prompt: yes

**Bolt's list of the files/components it created, pasted unedited:** (the fallback builder's
answer, Claude claude-opus-5-5)

```text
I built a one-page Smart Campus Room Availability Checker (Vite + React + TypeScript, plain CSS, no backend or storage).

Main files/components:
- src/App.tsx — page layout and state (selected room, current time, start, end, result)
- src/components/RoomSelector.tsx — room drop-down
- src/components/AvailabilityForm.tsx — current time, start and end time inputs and the Check button
- src/components/ResultPanel.tsx — Available / Unavailable decision with the reasons and conflicts
- src/components/BookingList.tsx — the selected room's details and its existing bookings (read-only)
- src/utils/availability.ts — checkAvailability(): the AC1–AC4 rules, returns available + reasons
- src/utils/time.ts — HH:MM <-> minutes helpers and the current clock time
- src/data/rooms.ts — four fictional rooms with sample bookings (one room blocked for maintenance)
- src/types.ts — Room, Booking and AvailabilityResult types
- src/index.css — responsive styles (two columns on desktop, one column under 720 px)
```

**What v1 does — one line per thing that works, or visibly does not:**

- Shows four fictional rooms in a drop-down; the selected room's bookings are listed read-only on the right.
- Has a "Current time" input, but it is pre-filled from the real clock (`currentTimeString()` uses `new Date()`), so for every case I had to type 09:00 by hand first.
- Start and End are `type="time"` inputs (HH:MM); there is no way to type 24:00.
- "Blocked" is fixed in the sample data: only C-301 is blocked, and there is no control to block the selected room.
- The decision is shown as a big Available / Unavailable with a list of reasons; checking does not write anything to the bookings.
- No room has exactly one booking 10:00–11:00: B-204 has 10:00–11:00 and 15:00–16:00, so I used B-204 for the cases (no case reaches 15:00).
- On a phone width the two columns stack into one.

**Repair prompt** (only if the first build did not run — the deck allows one, then the result is
v1). Leave empty if you did not need it:

```text
```

---

## 4. Task 3 — the nine cases

Base for every case unless the row says otherwise: **current time 09:00**, room **not blocked**,
the room's **only booking 10:00–11:00**. The Expected column comes from AC1–AC6 — do not change it.
Write each result exactly as **Available**, **Unavailable** or **Not testable** (the page gives you
no way to set up the case). Save each final run as `evidence/final-T<n>.png`.

| # | Case | What you set up and request | Expected | AC | Result on v1 | Result on final | Final screenshot |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | Touching | 11:00–12:00 | Available | AC4 | Available / Unavailable / Not testable | Available / Unavailable / Not testable | final-T1.png |
| T2 | Overlap | 10:30–11:30 | Unavailable | AC4 | Available / Unavailable / Not testable | Available / Unavailable / Not testable | final-T2.png |
| T3 | Blocked | 11:00–12:00, room blocked | Unavailable | AC3 | Available / Unavailable / Not testable | Available / Unavailable / Not testable | final-T3.png |
| T4 | Exactly 2 hours | 12:00–14:00 | Available | AC2 | Available / Unavailable / Not testable | Available / Unavailable / Not testable | final-T4.png |
| T5 | Over 2 hours | 12:00–14:01 | Unavailable | AC2 | Available / Unavailable / Not testable | Available / Unavailable / Not testable | final-T5.png |
| T6 | Starts now | 09:00–09:30 (current time 09:00) | Unavailable | AC1 | Available / Unavailable / Not testable | Available / Unavailable / Not testable | final-T6.png |
| T7 | Reversed times | 12:00–11:00, and the page says why | Unavailable | AC1, AC6 | Available / Unavailable / Not testable | Available / Unavailable / Not testable | final-T7.png |
| T8 | Same check twice | T1, then T1 again without reloading | Available | AC5 | Available / Unavailable / Not testable | Available / Unavailable / Not testable | final-T8.png |
| T9 | Narrow screen | T1 at about 375 px wide | Available | AC6 | Available / Unavailable / Not testable | Available / Unavailable / Not testable | final-T9.png |

---

## 5. Issue log — cleanup targets

One row per issue you chose to act on (or deliberately not act on). At least **two**: one
functional and one usability or code-quality issue when you have them. If v1 passed every case,
log a justified cleanup that preserves behaviour. Save a screenshot of each as
`evidence/issue-<n>.png`.

| # | Issue | Evidence: steps → expected → observed | Priority | Decision |
| --- | --- | --- | --- | --- |
| 1 | | | High / Medium / Low | Fix / Reject / Defer |
| 2 | | | High / Medium / Low | Fix / Reject / Defer |

---

## 6. Task 4 — cleanup with focused prompts

One issue per prompt. Paste every prompt **as sent** (every `[bracketed field]` and `AC#` filled
in) and Bolt's answer, unedited.

**Functional fix prompt, as sent, and Bolt's answer:**

```text
(paste here)
```

**Cleanup prompt, as sent, and Bolt's answer:**

```text
(paste here)
```

Add further blocks for further prompts.

**Every change or suggestion Bolt made, judged.** Accepting is a decision; so is rejecting. Cite
the AC (or the scope) that justifies it.

| # | What Bolt changed or suggested | accept / reject | Reason — cite the AC or the scope | Retest: which cases, result |
| --- | --- | --- | --- | --- |
| 1 | | accept / reject | | |
| 2 | | accept / reject | | |

---

## 7. Change log — v1 to final

Two to four concrete changes, each one retested.

| # | Issue | Decision | Change (file or component) | Result after retest |
| --- | --- | --- | --- | --- |
| 1 | | | | |
| 2 | | | | |

---

## 8. One generated component, in my own words

Pick one file or component Bolt generated that matters for AC1–AC5 — the one that decides
availability is the best choice. Name its path in backticks, then explain in your own words, without
the assistant, what it does and how it decides. 60 words or more.

**File:** `(write here, e.g. src/App.tsx)`

<!-- Write your explanation below this line -->

---

## 9. What still fails, and what the criteria do not say

### 9.1 Checks I am keeping as FAIL or ERROR

The same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| | |

### 9.2 The end of the day

AC1 allows `end ≤ 1440` — a booking may end at 24:00. Can a user of your final page ask for
23:00–24:00? How — and if not, why is that acceptable or not? (This is the value you declare in
`submission.yml` under `assumptions.end_of_day`.)

-

### 9.3 Which "now"?

AC1 says "after the supplied current time". What did **v1** use as the current time, and what did
that mean for testing case T6?

-

---

## 10. Conclusion (120–180 words)

<!-- Answer all three, in your own words, without the assistant:
     (a) Which of your two predictions in section 2 was right, and what did v1 actually get wrong?
     (b) Which AI suggestion did you reject, or would have been wrong to accept, and why?
     (c) What is the difference between "the prototype looks finished" and "the prototype meets
         AC1-AC6" - shown with one case from section 4?
     Worthless: "Bolt made some mistakes and I fixed them."
     Worth everything: "T8 failed on v1: the Check button also added the booking to the list, so
     checking 11:00-12:00 a second time said Unavailable. AC5 says the check must not change the
     booking data." -->

<!-- Write your conclusion below this line -->
