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
| 1 | "Start is after the current time" will be coded as "start is not before now" (`start < now` rejected), so a request that starts exactly at the current time (T6, 09:00 with now 09:00) is wrongly Available. | AC1 | Yes. `src/utils/availability.ts` rejects only `start < now`, so T6 (09:00–09:30, now 09:00) said Available. |
| 2 | The page will not let me *supply* the test state: the current time will come from the real clock and/or "blocked" will be fixed in the sample data, so T3 or T6 cannot be set up on the selected room. | AC1, AC3 | Half right. "Blocked" is fixed in `src/data/rooms.ts` (only C-301), so T3 was Not testable. The current time is pre-filled from the real clock but editable, so T6 could be set up. |

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
| T1 | Touching | 11:00–12:00 | Available | AC4 | Available | Available | final-T1.png |
| T2 | Overlap | 10:30–11:30 | Unavailable | AC4 | Unavailable | Unavailable | final-T2.png |
| T3 | Blocked | 11:00–12:00, room blocked | Unavailable | AC3 | Not testable | Unavailable | final-T3.png |
| T4 | Exactly 2 hours | 12:00–14:00 | Available | AC2 | Available | Available | final-T4.png |
| T5 | Over 2 hours | 12:00–14:01 | Unavailable | AC2 | Unavailable | Unavailable | final-T5.png |
| T6 | Starts now | 09:00–09:30 (current time 09:00) | Unavailable | AC1 | Available | Unavailable | final-T6.png |
| T7 | Reversed times | 12:00–11:00, and the page says why | Unavailable | AC1, AC6 | Unavailable | Unavailable | final-T7.png |
| T8 | Same check twice | T1, then T1 again without reloading | Available | AC5 | Available | Available | final-T8.png |
| T9 | Narrow screen | T1 at about 375 px wide | Available | AC6 | Available | Available | final-T9.png |

---

## 5. Issue log — cleanup targets

One row per issue you chose to act on (or deliberately not act on). At least **two**: one
functional and one usability or code-quality issue when you have them. If v1 passed every case,
log a justified cleanup that preserves behaviour. Save a screenshot of each as
`evidence/issue-<n>.png`.

| # | Issue | Evidence: steps → expected → observed | Priority | Decision |
| --- | --- | --- | --- | --- |
| 1 | T6: a request that starts exactly at the current time is accepted (functional, AC1) | Room B-204, current time 09:00, 09:00–09:30, Check → expected **Unavailable** (AC1: start must be *after* the supplied current time) → observed **Available**. Cause: `checkAvailability` in `src/utils/availability.ts` rejects only `start < now`. Screenshot `issue-1.png`. | High | Fix |
| 2 | T3: the selected room cannot be blocked, so AC3 cannot be checked on it (functional/testability, AC3) | Room B-204, current time 09:00, want "room blocked" + 11:00–12:00 → expected **Unavailable** → observed: there is no blocked control; `blocked` is hard-coded in `src/data/rooms.ts` and only C-301 is blocked, so the case is **Not testable**. Screenshot `issue-2.png` (B-204, no way to block it). | High | Fix |
| 3 | Stale decision after editing the inputs (usability, AC5/AC6) | B-204, 09:00, check 11:00–12:00 → Available; then change Start to 10:30 without pressing Check → expected: the old decision disappears (it no longer describes the inputs) → observed: **Available** stays on screen next to 10:30–12:00, which actually overlaps 10:00–11:00. Screenshot `issue-3.png`. | Medium | Fix |
| 4 | End of day (24:00) cannot be entered (functional gap, AC1 allows end ≤ 1440) | B-204, Start 23:00, type 24:00 in End → expected: a way to ask for 23:00–24:00 → observed: the time input refuses 24:00 (value becomes empty) and the browser blocks the submit. Screenshot `issue-4.png`. | Low | Fix |

---

## 6. Task 4 — cleanup with focused prompts

One issue per prompt. Paste every prompt **as sent** (every `[bracketed field]` and `AC#` filled
in) and Bolt's answer, unedited.

Four prompts were sent, in this order: fix 1 (issue 1), fix 2 (issue 2), cleanup (issue 3), fix 3
(issue 4). The answers are the fallback builder's (Claude claude-opus-5-5), pasted unedited.

**Functional fix prompt, as sent, and Bolt's answer:** (prompt 1 of 4 — issue 1, T6)

```text
In the current prototype, selecting room B-204, setting the current time to 09:00 and checking 09:00–09:30 produces Available, but AC1 requires Unavailable, because an interval is accepted only when its start is after the supplied current time and 09:00 is not after 09:00. Make the smallest change that fixes this behavior. Preserve the other acceptance criteria. Explain which file/component you changed and why.

--- Answer ---
Fixed. The rule lives in src/utils/availability.ts, in checkAvailability(). It rejected only a start that is strictly before the current time (start < now), so a start equal to the current time slipped through. I changed the condition to start <= now and reworded the reason to "The start time must be after the current time." so the message matches AC1. Nothing else changed: the day bounds, the 2-hour limit, the blocked check and the overlap check are untouched, and the booking data is still only read.
```

**Functional fix prompt 2, as sent, and the answer:** (prompt 2 of 4 — issue 2, T3)

```text
In the current prototype, selecting room B-204, setting the current time to 09:00 and trying to mark the room as blocked before checking 11:00–12:00 produces no way to block the room (blocked is fixed in the sample data and only C-301 is blocked), but AC3 requires Unavailable when the selected room is blocked. Make the smallest change that fixes this behavior. Preserve the other acceptance criteria. Explain which file/component you changed and why.

--- Answer ---
Done with a small change in two files:
- src/components/AvailabilityForm.tsx: added a "Room is blocked" checkbox (id="blocked") above the Check button.
- src/App.tsx: added a `blocked` state. It starts from the selected room's sample value and is reset when you pick another room. When you check, the page passes a copy of the room with that flag ({ ...room, blocked }) to checkAvailability, so the sample data in src/data/rooms.ts is never modified (AC5).
The rule itself (room.blocked -> "This room is blocked.") was already in checkAvailability and is unchanged.
Optional: I could also remember the checkbox in localStorage so the blocked state survives a page reload.
```

**Cleanup prompt, as sent, and Bolt's answer:** (prompt 3 of 4 — issue 3)

```text
Review only the result panel feedback (src/App.tsx state handling and src/components/ResultPanel.tsx) for unnecessary duplication, confusing naming, or UI feedback problems. Suggest one small cleanup. Do not add features or redesign the whole application. Implement it only if it preserves AC1–AC6.

--- Answer ---
One UI feedback problem: the decision stays on screen after you edit any input. Check 11:00–12:00 (Available), then change Start to 10:30, and the panel still says Available although it now describes a different request. Changing the room already cleared the result; the time inputs and the checkbox did not.
Cleanup (implemented): in src/App.tsx a small helper edited(setter) wraps each input setter so that it updates the value and clears the result in one place, instead of repeating setResult(null) in four handlers. The panel then shows the prompt "Choose a time and press Check availability" until the user checks again. checkAvailability and the data are untouched, so AC1–AC5 behave exactly as before.
Not implemented (would be a feature): showing the checked interval and room name inside the result panel.
```

**Functional fix prompt 3, as sent, and the answer:** (prompt 4 of 4 — issue 4, end of day)

```text
In the current prototype, selecting room B-204, setting Start to 23:00 and typing 24:00 into End produces an empty End field and a blocked submit, but AC1 requires accepting an interval that ends at 24:00 (end ≤ 1440), so 23:00–24:00 should be Available. Make the smallest change that fixes this behavior. Preserve the other acceptance criteria. Explain which file/component you changed and why.

--- Answer ---
An <input type="time"> only accepts 00:00–23:59, so 24:00 can never be typed. Smallest fix:
- src/components/AvailabilityForm.tsx: a checkbox "Ends at 24:00 (end of day)" under Start/End. When it is ticked the End input is disabled and no longer required.
- src/App.tsx: when the checkbox is ticked, the end is DAY_END (1440, already exported from src/utils/availability.ts) instead of the converted End value.
The rules are unchanged: 23:00–24:00 passes AC1 (end ≤ 1440) and AC2 (60 min), and 21:59–24:00 is still rejected as longer than 2 hours.
Alternative I did not use: replacing the time inputs with free-text HH:MM fields that accept 24:00 (more validation code, bigger change).
```

**Every change or suggestion Bolt made, judged.** Accepting is a decision; so is rejecting. Cite
the AC (or the scope) that justifies it.

| # | What Bolt changed or suggested | accept / reject | Reason — cite the AC or the scope | Retest: which cases, result |
| --- | --- | --- | --- | --- |
| 1 | `src/utils/availability.ts`: `start < now` → `start <= now`, reason reworded | accept | AC1: "start is after the supplied current time" — equal is not after | T6 first: Unavailable ✓; then T1–T9: all nine as expected except T3 (still Not testable at this point) |
| 2 | `AvailabilityForm.tsx` + `App.tsx`: "Room is blocked" checkbox, applied to a copy of the room | accept | AC3 needs a way to block the *selected* room; the copy keeps the sample data unchanged (AC5) | T3 first: Unavailable ✓; then T1–T9: 9/9 |
| 3 | Suggestion: remember the blocked checkbox in localStorage | reject | Scope: no storage/database; AC5 and the checker's P3 treat browser storage as out of scope; nothing in AC1–AC6 asks to persist state | not implemented, nothing to retest |
| 4 | `App.tsx`: `edited(setter)` clears the result whenever an input changes | accept | AC5/AC6: the shown decision must clearly belong to the current inputs; no rule changed | issue-3 steps: panel cleared after editing Start ✓; T1–T9: 9/9 |
| 5 | Suggestion: show the checked interval and room inside the result panel | reject | Scope of the cleanup prompt: one small cleanup, no new features; not required by any AC | not implemented |
| 6 | `AvailabilityForm.tsx` + `App.tsx`: "Ends at 24:00 (end of day)" checkbox, end = 1440 | accept | AC1 allows end ≤ 1440; smallest change, rules untouched | 23:00–24:00 → Available ✓, 21:59–24:00 → Unavailable (AC2) ✓; T1–T9: 9/9 |
| 7 | Alternative: free-text HH:MM inputs that accept 24:00 | reject | Not the smallest change; more validation code and a worse input on phones (AC6) | not implemented |

---

## 7. Change log — v1 to final

Two to four concrete changes, each one retested.

| # | Issue | Decision | Change (file or component) | Result after retest |
| --- | --- | --- | --- | --- |
| 1 | Issue 1 — T6 start equal to now accepted | Fix (prompt 1) | `src/utils/availability.ts` — `start <= now` rejected | T6 Unavailable; T1–T9 rerun, no regression |
| 2 | Issue 2 — T3 not testable, no way to block the selected room | Fix (prompt 2) | `src/components/AvailabilityForm.tsx`, `src/App.tsx` — blocked checkbox applied to a copy of the room | T3 Unavailable; T1–T9 rerun: 9/9 |
| 3 | Issue 3 — stale decision after editing inputs | Fix (cleanup prompt) | `src/App.tsx` — `edited()` helper clears the result on every input change | result cleared after edit; T1–T9 rerun: 9/9 |
| 4 | Issue 4 — 24:00 cannot be entered | Fix (prompt 4) | `src/components/AvailabilityForm.tsx`, `src/App.tsx` — "Ends at 24:00" checkbox | 23:00–24:00 Available, 21:59–24:00 Unavailable; T1–T9 rerun: 9/9 |

---

## 8. One generated component, in my own words

Pick one file or component Bolt generated that matters for AC1–AC5 — the one that decides
availability is the best choice. Name its path in backticks, then explain in your own words, without
the assistant, what it does and how it decides. 60 words or more.

**File:** `src/utils/availability.ts`

<!-- Write your explanation below this line -->

This file holds the function `checkAvailability(room, start, end, now)`. The page converts the
HH:MM inputs to minutes after midnight and calls it when I press Check. It does not stop at the first
problem: it collects a list of reasons. A start below 0 or an end above 1440 adds "within the day";
start not before end adds "end must be after start"; start not after now (after the fix `start <= now`)
adds the current-time reason; a length over 120 minutes adds the 2-hour reason; a blocked room adds the
blocked reason. Then it filters the room's bookings with `start < b.end && end > b.start` — this is the
half-open overlap test, so 11:00–12:00 against 10:00–11:00 gives 660 < 660 = false and touching is
allowed. The result is Available only when the list of reasons is empty. It only reads `room.bookings`
and returns a new object, so a check never changes the bookings (AC5).

---

## 9. What still fails, and what the criteria do not say

### 9.1 Checks I am keeping as FAIL or ERROR

The same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| none | The last checker run is clean (27/27). |

### 9.2 The end of the day

AC1 allows `end ≤ 1440` — a booking may end at 24:00. Can a user of your final page ask for
23:00–24:00? How — and if not, why is that acceptable or not? (This is the value you declare in
`submission.yml` under `assumptions.end_of_day`.)

- Yes. The final page has a checkbox "Ends at 24:00 (end of day)" under Start/End (`end-of-day-option`).
  Ticking it disables the End input and the page sends end = 1440. 23:00–24:00 gives Available,
  21:59–24:00 gives Unavailable (121 minutes, AC2). I chose this over a free-text field because it keeps
  the native time picker on phones (AC6) and is the smallest change. v1 could not express 24:00 at all
  (issue 4).

### 9.3 Which "now"?

AC1 says "after the supplied current time". What did **v1** use as the current time, and what did
that mean for testing case T6?

- v1 pre-fills the "Current time" input from the real clock (`currentTimeString()` in `src/utils/time.ts`
  uses `new Date()`), but the input is editable, so the time is still *supplied*. For T6 I first typed
  09:00 into it; only then could I see the real defect: 09:00–09:30 with now 09:00 said Available because
  of `start < now`. The final page keeps the editable input (the default still comes from the clock), so
  every case must start by setting the current time to 09:00 — a page left at its default gives
  different answers on different days.

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

My first prediction was right: v1 coded "start after now" as "start not before now", so T6
(09:00–09:30, current time 09:00) said Available, while AC1 requires Unavailable. The second was half
right: the current time came from the clock but could be edited, while "blocked" was hard-coded for one
other room, so T3 could not be set up at all until the second fix added a checkbox.

I rejected the suggestion to keep the blocked checkbox in localStorage. It sounds helpful, but the
scope says no storage, and AC5 is about not changing data, so persisting state is exactly what the page
must not do.

v1 looked finished: clean layout, reasons in red, it even worked on a phone. But "looks finished" only
meant T1, T2, T4, T5, T7, T8 and T9 matched. T6 was wrong and T3 was not testable, so v1 met seven of
nine cases. The final version meets all nine, and each change was retested on all nine.
