# SIS #03 — Report: Smart Campus Room Availability Checker

<!-- The ONLY file you write prose in. Keep every numbered heading (## 1. … ## 13.) and every
     ### sub-heading, and the **Label:** words — the checker finds your answers by them.
     Replace every "(write here)" and "(paste here)". Delete these <!-- --> comments if you like. -->

## 1. Setup and reuse

| Item | Value |
| --- | --- |
| Coding assistant (tool) | Claude (Anthropic), a separate clean chat session for each stage: one for Plan + Generate, one for Critique, one for Repair |
| Coding assistant model | Claude Opus 5.5 (claude-opus-5-5) |
| Bolt.new model | claude-opus-5-5 (Claude Opus 5.5) - Bolt.new itself was not used; the Week 06 page was built by Claude as a fallback builder, see section 4 and AI_USAGE.md |
| Bolt project link | not-shared - no Bolt project exists; the full source of v1 and of the final is in `web/original/` and `web/final/` |
| Language | Python |
| Path | A |
| Python v1 from | fresh |
| Web v1 from | week-06 |

My Week 05 `booking_v1.py` is not in this branch, so the Python v1 was generated fresh for this SIS (B1, B2). The web v1 is `week-06/original/` and `week-06/evidence/v1.png`, copied unchanged. The final page started from my Week 06 final (`week-06/prototype/`) and was improved here with two focused prompts (B5, B6).

## 2. Baseline — before any new AI exchange

<!-- Written by you, without AI, before the first exchange of this SIS. Commit and push it
     first (README §2). Reusing Week 05/06 work does not exempt you: this section is new. -->

### 2.1 Scope in my own words

**Scope:** One page and one Python function for one selected campus room. Given a start and an end time in minutes after midnight, the current time, whether the room is blocked and the room's existing bookings, it only answers Available or Unavailable. It does not create, save or confirm a booking. No login, no database, no backend, no external API, no payments; the booking data is fictional.

### 2.2 The acceptance criteria in my own words

| AC | In my own words |
| --- | --- |
| AC1 | Times are whole minutes from 0 to 1440, the start comes before the end, and the start must be later than now (starting exactly now is not allowed). |
| AC2 | The booking can be 120 minutes at most; 120 is fine, 121 is too long. |
| AC3 | If the room is blocked, every request is refused, even one that is otherwise fine. |
| AC4 | The request must not overlap any existing booking. Intervals are [start, end), so a booking that ends at 11:00 and a request that starts at 11:00 only touch and that is allowed. |
| AC5 | The answer is a clear yes or no (True / False, Available / Unavailable) and checking never changes the existing bookings, so checking twice gives the same answer. |
| AC6 | When the input is wrong the page says what is wrong in plain words, and the page is still usable on a phone-width screen. |

### 2.3 Likely failure points

| # | Failure point | AC | How I will check it |
| --- | --- | --- | --- |
| 1 | Endpoint overlap: the overlap test is written with `<=` instead of `<`, so a request that starts exactly when a booking ends (660–720 after 600–660) is wrongly rejected. | AC4 | T1 on both artifacts, plus a test where the request ends exactly at a booking's start (570–600). |
| 2 | Starts now: "after now" is coded as "not before now" (`start < now` rejected), so 540–570 with now = 540 is wrongly accepted. | AC1 | T6 on both artifacts, plus a test with start = now + 1 that must be True. |
| 3 | Only the first booking is compared, or the list is sorted in place, so a clash with the second booking is missed or the input list changes. | AC4, AC5 | T10, a test with an unsorted list, and a test that compares `existing` before and after the call. |
| 4 | The page cannot set up some cases (blocked room, 24:00, a second booking), so they cannot be checked at all on v1. | AC3, AC1, AC4 | I will try T3, T8, T9 and T10 on the page and write Not testable where the page gives no way to do it. |

### 2.4 The contract

| Parameter | Meaning | Type and allowed values |
| --- | --- | --- |
| `start` | start of the requested interval, included | int, minutes after midnight; valid only if 0 <= start < end and start > now |
| `end` | end of the requested interval, excluded | int, minutes after midnight; valid only if end <= 1440 and end - start <= 120 |
| `now` | the current time that the caller supplies (not the computer clock) | int, minutes after midnight, 0-1440 |
| `blocked` | whether the selected room is closed for bookings | bool: True means every request is refused |
| `existing` | the room's existing bookings, each a half-open pair | list (or other collection) of (start, end) int pairs, any order, may be empty; must not be changed |
| returns | the decision | bool: True only when AC1-AC4 all hold, otherwise False; never None, never a string |

### 2.5 Initial assumptions and manual checks

**Assumptions:**

1. All five arguments are of the right type (ints, a bool and a list of pairs); the function does not have to handle strings or None.
2. The existing bookings are already valid intervals inside one day and do not overlap each other.
3. `now` is given by the caller in the same unit (minutes after midnight, same day); the function never reads the real clock.

**Checked manually:**

- I worked out T1-T12 by hand from AC1-AC6 before running anything, so the Expected column comes from the criteria and not from the code.
- I will run every case on the page myself (v1 and final) and look at what it shows, including the 375 px width.
- I will compare the overlap condition in v1 with `start < b_end and end > b_start` by reading the code line by line.

## 3. Python v1 review

| Branch in v1 (quoted) | AC | Satisfies it? | Why |
| --- | --- | --- | --- |
| `if not (0 <= start < end <= 1440): return False` | AC1 | Yes | One chained comparison covers start >= 0, start < end (so reversed and zero-length are rejected) and end <= 1440. T7 (720-660) False, T8 (1380-1440) True, T9 (1380-1441) False. |
| `if start <= now: return False` | AC1 | Yes | `<=` rejects a start equal to now, which is failure point 2 from my baseline. T6 (540-570, now 540) False; 541-571 True. |
| `if end - start > 120: return False` | AC2 | Yes | Strict `>` keeps exactly 120 allowed and rejects 121. T4 (720-840) True, T5 (720-841) False. |
| `if blocked: return False` | AC3 | Yes | Rejects before the overlap loop, so a blocked room refuses even a request with no clash and even with no bookings. T3 False. It relies on `blocked` being a real bool (contract). |
| `for s, e in existing: if start < e and s < end: return False` | AC4 | Yes | Half-open overlap test with strict `<` on both sides, so touching ends (660-720 after 600-660) do not count (T1 True), and every pair is visited, in any order (T10 False). |
| `return True` (end of the function) | AC5 | Yes | Only literal `True` / `False` are returned, and `existing` is only iterated, never sorted or appended to; T11 gives True twice and the list is unchanged. |

## 4. Prototype v1 in Bolt.new

The web v1 is my Week 06 v1, reused unchanged (Web v1 from: week-06). Bolt.new was not available in the session I worked in, so in Week 06 the same prompt was given to Claude (claude-opus-5-5) acting as the app builder; this is disclosed in the Week 06 report and in AI_USAGE.md. The prompt is the one I sent in Week 06, word for word.

**Prompt as sent:**

~~~~text
Build a small responsive Smart Campus Room Availability Checker. Requirements: AC1: Accept a candidate interval only when 0 ≤ start < end ≤ 1440 and start is after the supplied current time.
AC2: Reject a booking longer than 120 minutes.
AC3: Reject the request when the selected room is blocked.
AC4: Reject any interval that overlaps an existing booking; touching endpoints are allowed.
AC5: Show a clear Available / Unavailable decision without changing the existing booking data.
AC6: The page remains usable at desktop and narrow/mobile width and gives understandable validation feedback. Use fictional sample data only. Keep the implementation simple and within one-page scope. Do not add authentication, backend services, analytics, or unrelated features. After building, briefly list the main files/components you created.
~~~~

| Generated file or component | Path | Its role |
| --- | --- | --- |
| `checkAvailability()` | `src/utils/availability.ts` | The rules AC1-AC4: day bounds, start before end, start vs current time, 2-hour limit, blocked room, overlap; returns available + reasons + conflicts |
| `App` | `src/App.tsx` | Page layout and state: selected room, current time, start, end and the last result |
| `AvailabilityForm` | `src/components/AvailabilityForm.tsx` | The Current time, Start and End inputs (`type="time"`) and the Check button |
| `ResultPanel` | `src/components/ResultPanel.tsx` | Shows Available / Unavailable with the reasons and the conflicting booking |
| Sample data | `src/data/rooms.ts` | Four fictional rooms; only C-301 is blocked; B-204 has 10:00-11:00 and 15:00-16:00 |

**What v1 does:**

- One page with a room drop-down, the selected room's bookings (read-only) and a form with Current time, Start and End.
- Shows a large Available / Unavailable and a list of reasons; checking never writes to the bookings (T11 gives Available twice).
- Accepts a request that starts exactly at the current time: T6 (09:00-09:30, now 09:00) shows Available.
- Has no way to block the selected room (T3 Not testable), no way to enter 24:00 in a time input (T8, T9 Not testable) and no room with the two bookings T10 needs (T10 Not testable).
- Keeps the last decision on screen after the inputs are edited, until Check is pressed again.
- At 375 px the two columns stack into one and T1 still works (T12 Available).

## 5. Test cases — executed on both artifacts

Python columns: the result of a real run of `code/original/booking_v1.py` and `code/booking.py` (the checker runs both and prints them; I also ran them myself). Page columns: what the page showed in headless Chrome 153 at 1280x800 (T12 at 375x812), current time 09:00, room B-204 (booking 10:00-11:00; its other booking 15:00-16:00 is never reached), for T10 room E-210 on the final. The v1 page was built from `web/original/`, the final page from `web/final/`.

| Case | Name | Input | Expected | Python v1 | Python final | Page v1 | Page final |
| --- | --- | --- | --- | --- | --- | --- | --- |
| T1 | Touching | 660–720 | Available | True | True | Available | Available |
| T2 | Overlap | 630–690 | Unavailable | False | False | Unavailable | Unavailable |
| T3 | Blocked | 660–720, blocked | Unavailable | False | False | Not testable | Unavailable |
| T4 | Exactly 120 min | 720–840 | Available | True | True | Available | Available |
| T5 | 121 min | 720–841 | Unavailable | False | False | Unavailable | Unavailable |
| T6 | Starts now | 540–570 | Unavailable | False | False | Available | Unavailable |
| T7 | Reversed | 720–660 | Unavailable | False | False | Unavailable | Unavailable |
| T8 | Ends at midnight | 1380–1440 | Available | True | True | Not testable | Available |
| T9 | Past midnight | 1380–1441 | Unavailable | False | False | Not testable | Not testable |
| T10 | Second booking | 720–780, existing (600–660), (700–760) | Unavailable | False | False | Not testable | Unavailable |
| T11 | Same check twice | 660–720, twice | Available | True | True | Available | Available |
| T12 | Narrow screen | T1 at ~375 px wide | Available | n/a | n/a | Available | Available |

Notes: T3 v1 - there is no control to block B-204. T8/T9 v1 - the End `type="time"` input refuses 24:00 and 24:01 ("Malformed value"). T8 final - "Ends at 24:00 (end of day)" checkbox. T9 final - 24:01 still cannot be entered, which C4 accepts (a time input stops at 23:59). T10 v1 - no room has bookings 10:00-11:00 and 11:40-12:40.

## 6. Traceability

| AC | Implementation / file | Test input | Expected | v1 actual | Final actual |
| --- | --- | --- | --- | --- | --- |
| AC1 | `code/booking.py` lines 11-15 (range, `start <= now`); page `src/utils/availability.ts` `checkAvailability()` day/order/now checks + `#endOfDay` in `AvailabilityForm.tsx` | T6, T7, T8, T9 | T6 Unavailable, T7 Unavailable, T8 Available, T9 Unavailable | Python: all four as expected. Page: T6 Available (wrong), T7 Unavailable, T8 and T9 Not testable | Python: all four as expected. Page: T6 Unavailable, T7 Unavailable, T8 Available, T9 Not testable |
| AC2 | `code/booking.py` line 17 (`end - start > 120`); page `checkAvailability()` `MAX_DURATION` | T4, T5 | T4 Available, T5 Unavailable | Python True / False; page Available / Unavailable | Python True / False; page Available / Unavailable |
| AC3 | `code/booking.py` line 20 (`if blocked`); page `#blocked` checkbox in `AvailabilityForm.tsx` + `room.blocked` in `checkAvailability()` | T3 | Unavailable | Python False; page Not testable (no control) | Python False; page Unavailable ("This room is blocked.") |
| AC4 | `code/booking.py` lines 23-25 (loop, `start < e and s < end`); page `room.bookings.filter(...)` in `checkAvailability()`, room E-210 in `src/data/rooms.ts` | T1, T2, T10 | T1 Available, T2 Unavailable, T10 Unavailable | Python as expected; page T1 Available, T2 Unavailable, T10 Not testable | Python as expected; page T1 Available, T2 Unavailable, T10 Unavailable (conflict: Project Team Meeting) |
| AC5 | `code/booking.py` returns only `True`/`False`, `existing` only read; page `ResultPanel.tsx` decision text, `App.tsx` checks a copy of the room and clears the result on edit | T11, test_existing_is_not_changed | Available twice, list unchanged | Python True twice, list unchanged; page Available twice, but the decision stays after an edit | Python True twice, list unchanged; page Available twice, decision cleared after an edit |
| AC6 | page `ResultPanel.tsx` reasons list, `src/index.css` one-column layout under 720 px, `checkAvailability()` reasons | T7, T12, reversed 10:40-10:20 | clear reasons; usable at 375 px | T12 Available at 375 px; reversed 10:40-10:20 shows a false "overlaps" reason | T12 Available at 375 px (`evidence/final-narrow.png`); reversed shows only "The end time must be after the start time." |

## 7. Issue log

The Python v1 passed T1-T11 and all checker groups F1-F10, so there was no functional defect to log for the function; `code/booking.py` is v1 unchanged (see section 13). All issues below are from the page v1. Issues 1, 4, 5 and 6 were fixed with my Week 06 prompts (the final page started from the Week 06 final); issues 2 and 3 were fixed in this SIS with prompts B6 and B5.

| # | Issue | Reproduction | Priority | Prompt / change | Retest result |
| --- | --- | --- | --- | --- | --- |
| 1 | Functional: a request that starts exactly at the current time is accepted | T6: B-204, now 09:00, 09:00-09:30 → Available; AC1 says Unavailable | High | Week 06 prompt: "...checking 09:00–09:30 produces Available, but AC1 requires Unavailable, because an interval is accepted only when its start is after the supplied current time... Make the smallest change that fixes this behavior." Change: `start < now` → `start <= now` in `src/utils/availability.ts` | T6 Unavailable on the final ("The start time must be after the current time.") |
| 2 | Testability: no room has a second booking near the request, so AC4 "every booking is checked" cannot be shown on the page | T10: needs bookings 10:00-11:00 and 11:40-12:40; no such room in v1 → Not testable | Medium | B6: "...there is no room whose bookings are 10:00–11:00 and 11:40–12:40, so test case T10 ... cannot be set up... add one fictional room ... with exactly those two bookings". Change: room E-210 added to `src/data/rooms.ts`, nothing else | T10 Unavailable on the final, conflict "Project Team Meeting (11:40–12:40)"; T1-T9, T11, T12 unchanged |
| 3 | Usability: a reversed interval also gets a false "overlaps an existing booking" reason | AC6 / T7 variant: B-204, now 09:00, 10:40-10:20 → two reasons + "Conflicts with: Study Group: Databases" | Low | B5: "...checking the reversed interval 10:40–10:20 shows two reasons... only the first reason should be shown... run the overlap check only when start < end." Change: `conflicts` computed only when `start < end` in `src/utils/availability.ts` | Only "The end time must be after the start time." (`evidence/after-1.png`); T7 still Unavailable |
| 4 | Functional/testability: the selected room cannot be blocked | T3: B-204 has no blocked control → Not testable (AC3) | High | Week 06 prompt: "...trying to mark the room as blocked before checking 11:00–12:00 produces no way to block the room ... AC3 requires Unavailable". Change: "Room is blocked" checkbox; the check uses a copy of the room | T3 Unavailable on the final |
| 5 | Functional gap: 24:00 cannot be entered | T8: End input refuses 24:00 → Not testable (AC1 allows end = 1440) | Low | Week 06 prompt: "...typing 24:00 into End produces an empty End field ... AC1 requires accepting an interval that ends at 24:00". Change: "Ends at 24:00 (end of day)" checkbox sends 1440 | T8 Available on the final; T9 still Not testable (section 13) |
| 6 | Usability: the last decision stays on screen after the inputs change | AC5: B-204, 11:00-12:00 → Available, then Start set to 10:30 without Check → still Available | Medium | Week 06 prompt: "Review only the result panel feedback ... Suggest one small cleanup." Change: every edit clears the result in `src/App.tsx` | Final: the decision disappears after editing Start (re-run in this SIS) |

**Before / after:** `evidence/before-1.png` → `evidence/after-1.png` show issue 3: B-204, now 09:00, reversed 10:40-10:20 - before, two reasons and a false conflict with Study Group: Databases; after, only "The end time must be after the start time."

## 8. Critique decisions

The critique is exchange B4: a new chat reviewed `code/original/booking_v1.py` and the v1 page source against AC1-AC6.

| # | AI claim or recommendation | How I verified it | Decision | Reason (AC or case) |
| --- | --- | --- | --- | --- |
| 1 | The TS version accepts a start equal to now (`start < now` should be `start <= now`) | Ran T6 on the v1 page: 09:00-09:30 with now 09:00 → Available; on the final → Unavailable | accept | AC1, T6; already fixed by my Week 06 prompt, kept in the final |
| 2 | Python: add `isinstance(start, int)` checks, because `can_book(600.5, 660, 0, False, [])` returns True | Ran the call: it does return True. Compared with my contract (2.4) and assumption 1 (2.5): the caller always passes ints | reject | Outside the contract; README asks the final to add nothing beyond it, and F1-F10 only use ints. I had already dropped type checks when approving the plan (B2) |
| 3 | The page keeps a stale result when now/start/end change | Re-ran on both pages: v1 keeps "Available" after Start is changed to 10:30; the final clears it | accept | AC5 / AC6; fixed in Week 06, confirmed by the re-run |
| 4 | End 1440 cannot be entered; treat an End of 00:00 as 1440 when start > 0 | T8/T9 on v1: the time input refuses 24:00 → Not testable | modify | AC1, T8: I kept the explicit "Ends at 24:00" checkbox from Week 06 instead; reading 00:00 as 24:00 is hidden and confusing. T8 is Available on the final, T9 stays Not testable |
| 5 | A reversed interval also reports a false overlap (09:10-08:40 in A-101) | Reproduced on the final with B-204 10:40-10:20: two reasons and a conflict (`evidence/before-1.png`) | accept | AC6; fixed with the focused prompt B5, retested (`evidence/after-1.png`) |
| 6 | Add a NaN guard because `toMinutes('')` gives NaN and only `required` stops it | Pressed Check on the final with End empty: no decision, the browser says "Please fill out this field." | reject | AC6 is met: the empty field is reported and nothing is decided; a second guard adds code without a failing case |

## 9. Coding-agent analysis

### 9.1 The loop

| Step | What happened in this assignment |
| --- | --- |
| User goal | Make the reversed interval 10:40-10:20 on B-204 show only "The end time must be after the start time." without changing any AC1-AC5 decision (issue 3). |
| Model / plan | Claude Opus 5.5 in a new chat read the focused prompt B5 and planned to guard the overlap filter with `start < end` so `conflicts` stays empty for a reversed interval. |
| Tool call | It returned the complete new `src/utils/availability.ts`; I copied that file into `web/final/` and ran `npx tsc --noEmit` and `npx vite build` in a scratch copy. |
| Observation | Type check and build passed; the re-run of T1-T12 in headless Chrome gave the same decisions as before and 10:40-10:20 showed one reason only. |
| Next step | The same repair chat got the second focused prompt (B6) for the missing T10 room, then I ran the full case set again on the final page. |
| Human review | I read the diff (one changed line plus a comment), checked that T7 is still Unavailable, compared before-1/after-1 and then committed. |

### 9.2 Context, tools and permissions

| Tool | Context it used | Tools or permissions | Observed or assumed |
| --- | --- | --- | --- |
| Claude chat, Plan + Generate (B1, B2) | Only my two messages: the ACs, the signature and my approval of its plan | No file access, no code execution; it answered with text and one code block, which I saved myself | Observed - it only returned text and one code block; nothing in my repository changed until I saved the code |
| Claude chat, Critique (B4) | The ACs plus the pasted v1 sources (5 files); it said it could not see the CSS or ResultPanel | Read-only: it could not run the page, so every "Test:" in its answer was a prediction I had to run | Observed - it wrote "I can't verify the layout" for the files I did not paste |
| Claude chat, Repair (B5, B6) | The focused prompt plus the one file to change; the second prompt in the same chat also had the first answer in context | Could not write to my repository; I applied the returned file myself and reviewed the diff | Observed - "I haven't run this" in both answers |
| Claude as the Bolt fallback builder (Week 06, B3) | The Week 06 prompt with AC1-AC6; it chose Vite + React + TypeScript itself | A build environment with npm install and a dev server | Assumed - I only saw the resulting files and the file list, not how it ran its tools |
| The model itself | How it decides which files matter and how much of the earlier chat it keeps | Internal context window and ranking | Assumed - I can only infer this from what it mentions |
| The checker `tests/check_sis.py` | My files: it imports and runs both Python versions on T1-T11 and runs my suite against ten faulty versions | Runs local Python processes with a timeout, no network | Observed - its output prints what v1 and final return |

### 9.3 Checkpoint and dependability

**Safety checkpoint:** Before I accept any AI-generated change I read the full diff, run `python -m unittest -v` in `code/` and the T1-T12 case set on the built page, and I compare the result with the Expected column from the ACs; a change that alters any other case's decision is rejected, and nothing is committed before that.

**Reliability, security, responsibility:** The assistant answered confidently but never ran its own code ("I haven't run this"), so reliability comes from my tests and the re-run, not from its wording. Security: the page has no network, storage or login code (checker W3), and I gave the assistants only the files they needed, no keys or personal data. Responsibility stays with me: I decide what is merged, I record which prompt changed what, and I must be able to explain every line, including the overlap condition.

## 10. Reflection

The Python part was AI-assisted coding: I approved a plan, got one small function and could check every branch against the ACs and with 22 tests. The page was vibe coding: one prompt produced ten files, and I only learned what it did by clicking through T1-T12. A reliability risk was the page accepting a start equal to now (T6) while the Python version rejected it. An availability/usability risk was a decision that stayed on screen after the inputs changed. A security risk is accepting generated code with network calls, storage or a login form that I did not ask for, which is why the scope check matters. Review, tool permissions and tests stay human work because the assistant never ran its code and its critique also contained a suggestion outside the contract. I rejected the integer type checks in Python, because the contract already says ints and the final must not add behaviour. Next, without expanding the scope, I would make T9 testable on the page and add tests for the page logic.

## 11. Appendix A — AI exchanges

B1 and B2 are one chat (Plan, then Generate after I approved the plan with two changes). B4 is a new chat. B5 and B6 are one more new chat (two focused repair prompts, one issue each). B3 is my Week 06 initial prompt and the builder's answer, reused. Answers are pasted unedited.

### B1

- **Tool:** Claude
- **Model:** Claude Opus 5.5 (claude-opus-5-5)
- **Date:** 2026-11-22
- **Stage:** Plan
- **Source:** this SIS

**Prompt:**

~~~~text
I need a plan before any code. Function: can_book(start, end, now, blocked, existing) in Python, standard library only. Times are integer minutes after midnight. existing is a list of (start, end) pairs of the room's bookings. Intervals are half-open [start, end).
AC1: accept only when 0 <= start < end <= 1440 and start is strictly after now.
AC2: reject a booking longer than 120 minutes.
AC3: reject when the room is blocked.
AC4: reject any interval that overlaps an existing booking; touching endpoints are allowed.
AC5: return a clear True/False and never change existing.
AC6 is for the web page only (validation feedback, narrow layout), ignore it for the function.
Give me a short plan: the checks in order, your assumptions, and the boundary tests you would write (with inputs and expected results). Do not write the implementation yet.
~~~~

**Response:**

~~~~text
Here's the plan. No code yet.

## Assumptions (please confirm)
1. `blocked` is a bool. If it's actually a list of blocked intervals, step 4 becomes an overlap check like step 5.
2. `start`, `end` and `now` must be plain `int`. Anything else, including `bool` and `float`, returns `False` and never raises.
3. AC1 means a booking can only start after `now` (`start > now`). `now` itself is not range-checked.
4. "Longer than 120" means a length (`end - start`) of 121 or more. Exactly 120 is accepted.
5. `existing` holds valid `(s, e)` pairs with `s < e`, possibly unsorted. The function only reads it: no sort, no append, no copy needed.
6. Two half-open intervals overlap when `start < e and s < end`. Touching ends (`end == s` or `e == start`) do not overlap.
7. `existing` is only for this room, so there is no room parameter.

## Checks in order (return `False` at the first failure)
1. **Types:** `start`, `end` and `now` are all `int` and not `bool`.
2. **Range (AC1):** `0 <= start < end <= 1440`.
3. **Future (AC1):** `start > now`.
4. **Length (AC2):** `end - start <= 120`.
5. **Blocked (AC3):** `not blocked`.
6. **Overlap (AC4):** no `(s, e)` in `existing` where `start < e and s < end`.
7. Otherwise return `True`. The result is always a real `bool` (AC5).

The result is just "all checks pass", so the order doesn't change the answer. Cheap checks go first, and the loop over `existing` goes last.

## Boundary tests
Defaults unless stated: `now=480`, `blocked=False`, `existing=[]`.

| # | Case | start, end, (other) | Expected |
|---|------|--------------------|----------|
| 1 | start at lower bound | 0, 60, now=-1 | True |
| 2 | start below range | -1, 30, now=-10 | False |
| 3 | end at upper bound | 1380, 1440 | True |
| 4 | end past upper bound | 1381, 1441 | False |
| 5 | zero length | 600, 600 | False |
| 6 | reversed | 660, 600 | False |
| 7 | start == now | 480, 540 | False |
| 8 | start == now + 1 | 481, 541 | True |
| 9 | start in the past | 400, 460 | False |
| 10 | exactly 120 min | 600, 720 | True |
| 11 | 121 min | 600, 721 | False |
| 12 | blocked room, otherwise valid | 600, 660, blocked=True | False |
| 13 | touches end of existing | 660, 720, existing=[(600,660)] | True |
| 14 | touches start of existing | 540, 600, existing=[(600,660)] | True |
| 15 | overlaps by 1 min (right) | 659, 720, existing=[(600,660)] | False |
| 16 | overlaps by 1 min (left) | 540, 601, existing=[(600,660)] | False |
| 17 | inside existing | 620, 640, existing=[(600,660)] | False |
| 18 | encloses existing | 570, 690, existing=[(600,660)] | False |
| 19 | identical to existing | 600, 660, existing=[(600,660)] | False |
| 20 | fits gap exactly, unsorted list | 660, 720, existing=[(720,780),(600,660)] | True |
| 21 | wrong type | 600.0, 660 | False (no exception) |
| 22 | bool as int | True, 60, now=-1 | False |
| 23 | existing unchanged | any call; compare `existing` to a copy taken before | equal, same length and order |
| 24 | return type | check results with `is True` / `is False` | always a bool |

Tests 1 to 9 cover AC1, 10 and 11 cover AC2, 12 covers AC3, 13 to 20 cover AC4, and 21 to 24 cover AC5. AC6 is left out on purpose.

The two points to confirm before I write the code are what type `blocked` is (assumption 1) and whether a non-int input should return `False` or raise an error (assumption 2).
~~~~

### B2

- **Tool:** Claude
- **Model:** Claude Opus 5.5 (claude-opus-5-5)
- **Date:** 2026-11-22
- **Stage:** Generate (Python v1)
- **Source:** this SIS

**Prompt:**

~~~~text
Plan approved with two changes. blocked is a plain bool. Drop step 1 (the type checks): the caller always passes ints, a bool and a list of pairs, so the function does not need to handle floats, strings or bools as times. Everything else as in your plan. Now write can_book(start, end, now, blocked, existing) in Python, standard library only, in one code block, with a short docstring. Do not write the tests yet.
~~~~

**Response:**

~~~~text
Here's `can_book` with your two changes: `blocked` is treated as a plain bool and the type checks are gone. The checks run in the approved order, and the first one that fails returns `False`.

```python
def can_book(start, end, now, blocked, existing):
    """Return True if the room can be booked for [start, end), else False.

    Times are integer minutes after midnight. Intervals are half-open, so a
    booking that ends exactly when another starts is allowed.
    Rules: 0 <= start < end <= 1440, start > now, length <= 120 minutes,
    room not blocked, no overlap with any (s, e) in existing.
    existing is only read, never changed.
    """
    # AC1: valid range within the day
    if not (0 <= start < end <= 1440):
        return False
    # AC1: must start strictly after now
    if start <= now:
        return False
    # AC2: at most 120 minutes
    if end - start > 120:
        return False
    # AC3: room is blocked
    if blocked:
        return False
    # AC4: half-open overlap; touching endpoints do not count
    for s, e in existing:
        if start < e and s < end:
            return False
    # AC5: plain bool result, existing untouched
    return True
```

The `if blocked: return False` line relies on `blocked` always being a bool, as you said.
~~~~

### B3

- **Tool:** Claude, used instead of Bolt.new (fallback builder)
- **Model:** claude-opus-5-5 (Claude Opus 5.5)
- **Date:** 2026-11-22
- **Stage:** Generate (web v1)
- **Source:** week-06

**Prompt:**

~~~~text
Build a small responsive Smart Campus Room Availability Checker. Requirements: AC1: Accept a candidate interval only when 0 ≤ start < end ≤ 1440 and start is after the supplied current time.
AC2: Reject a booking longer than 120 minutes.
AC3: Reject the request when the selected room is blocked.
AC4: Reject any interval that overlaps an existing booking; touching endpoints are allowed.
AC5: Show a clear Available / Unavailable decision without changing the existing booking data.
AC6: The page remains usable at desktop and narrow/mobile width and gives understandable validation feedback. Use fictional sample data only. Keep the implementation simple and within one-page scope. Do not add authentication, backend services, analytics, or unrelated features. After building, briefly list the main files/components you created.
~~~~

**Response:**

~~~~text
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
~~~~

### B4

- **Tool:** Claude
- **Model:** Claude Opus 5.5 (claude-opus-5-5)
- **Date:** 2026-11-22
- **Stage:** Critique
- **Source:** this SIS

**Prompt:**

~~~~text
Review my function and my page against AC1-AC6 below. For every claim say which AC it concerns and give an input that shows it. Be specific; do not rewrite the whole project.

AC1: accept only when 0 <= start < end <= 1440 (integer minutes after midnight) and start is strictly after the supplied current time.
AC2: reject a booking longer than 120 minutes.
AC3: reject when the selected room is blocked.
AC4: reject any interval that overlaps an existing booking; intervals are [start, end), touching endpoints are allowed.
AC5: a clear Available / Unavailable (True / False) result, and the existing bookings are never changed.
AC6: understandable validation feedback and a usable narrow/mobile layout.
The page checks availability only, for one selected room, with fictional data; no login, backend or database.

=== code/original/booking_v1.py ===
def can_book(start, end, now, blocked, existing):
    """Return True if the room can be booked for [start, end), else False.

    Times are integer minutes after midnight. Intervals are half-open, so a
    booking that ends exactly when another starts is allowed.
    Rules: 0 <= start < end <= 1440, start > now, length <= 120 minutes,
    room not blocked, no overlap with any (s, e) in existing.
    existing is only read, never changed.
    """
    # AC1: valid range within the day
    if not (0 <= start < end <= 1440):
        return False
    # AC1: must start strictly after now
    if start <= now:
        return False
    # AC2: at most 120 minutes
    if end - start > 120:
        return False
    # AC3: room is blocked
    if blocked:
        return False
    # AC4: half-open overlap; touching endpoints do not count
    for s, e in existing:
        if start < e and s < end:
            return False
    # AC5: plain bool result, existing untouched
    return True

=== web/original/src/utils/availability.ts ===
import { AvailabilityResult, Room } from '../types';

export const MAX_DURATION = 120;
export const DAY_END = 1440;

// Decides whether [start, end) can be booked in the room.
// Intervals include the start and exclude the end.
export function checkAvailability(room: Room, start: number, end: number, now: number): AvailabilityResult {
  const reasons: string[] = [];

  if (start < 0 || end > DAY_END) {
    reasons.push('The time must be within the day (00:00–24:00).');
  }
  if (start >= end) {
    reasons.push('The end time must be after the start time.');
  }
  if (start < now) {
    reasons.push('The start time has already passed.');
  }
  if (end - start > MAX_DURATION) {
    reasons.push('A booking cannot be longer than 2 hours.');
  }
  if (room.blocked) {
    reasons.push(`This room is blocked${room.blockedReason ? `: ${room.blockedReason}` : ''}.`);
  }

  const conflicts = room.bookings.filter((b) => start < b.end && end > b.start);
  if (conflicts.length > 0) {
    reasons.push('The requested time overlaps an existing booking.');
  }

  return { available: reasons.length === 0, reasons, conflicts };
}

=== web/original/src/App.tsx ===
import { useMemo, useState } from 'react';
import RoomSelector from './components/RoomSelector';
import BookingList from './components/BookingList';
import AvailabilityForm from './components/AvailabilityForm';
import ResultPanel from './components/ResultPanel';
import { ROOMS } from './data/rooms';
import { checkAvailability } from './utils/availability';
import { currentTimeString, toMinutes } from './utils/time';
import { AvailabilityResult } from './types';

export default function App() {
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [now, setNow] = useState(currentTimeString());
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const room = useMemo(() => ROOMS.find((r) => r.id === roomId)!, [roomId]);

  function handleCheck() {
    setResult(checkAvailability(room, toMinutes(start), toMinutes(end), toMinutes(now)));
  }

  function handleRoomChange(id: string) {
    setRoomId(id);
    setResult(null);
  }

  return (
    <div className="app">
      <header>
        <h1>Smart Campus Room Availability</h1>
        <p className="muted">Check whether a room is free before you request it. Sample data only.</p>
      </header>
      <main className="layout">
        <div className="column">
          <div className="card">
            <RoomSelector rooms={ROOMS} selectedId={roomId} onChange={handleRoomChange} />
          </div>
          <AvailabilityForm
            now={now}
            start={start}
            end={end}
            onNowChange={setNow}
            onStartChange={setStart}
            onEndChange={setEnd}
            onSubmit={handleCheck}
          />
          <ResultPanel result={result} />
        </div>
        <div className="column">
          <BookingList room={room} />
        </div>
      </main>
    </div>
  );
}

=== web/original/src/components/AvailabilityForm.tsx ===
import { FormEvent } from 'react';

interface Props {
  now: string;
  start: string;
  end: string;
  onNowChange: (v: string) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onSubmit: () => void;
}

export default function AvailabilityForm(props: Props) {
  const { now, start, end, onNowChange, onStartChange, onEndChange, onSubmit } = props;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="now">Current time</label>
        <input id="now" type="time" value={now} onChange={(e) => onNowChange(e.target.value)} required />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="start">Start</label>
          <input id="start" type="time" value={start} onChange={(e) => onStartChange(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="end">End</label>
          <input id="end" type="time" value={end} onChange={(e) => onEndChange(e.target.value)} required />
        </div>
      </div>
      <button type="submit">Check availability</button>
    </form>
  );
}

=== web/original/src/data/rooms.ts ===
import { Room } from '../types';

// Fictional sample data for the prototype. Times are minutes after midnight.
export const ROOMS: Room[] = [
  {
    id: 'a-101',
    name: 'A-101 Lecture Hall',
    building: 'Main Building',
    capacity: 120,
    blocked: false,
    bookings: [
      { id: 'a1', title: 'Intro to Algorithms', start: 510, end: 600 },
      { id: 'a2', title: 'Physics Seminar', start: 780, end: 870 },
    ],
  },
  {
    id: 'b-204',
    name: 'B-204 Seminar Room',
    building: 'Library Wing',
    capacity: 30,
    blocked: false,
    bookings: [
      { id: 'b1', title: 'Study Group: Databases', start: 600, end: 660 },
      { id: 'b2', title: 'Robotics Club', start: 900, end: 960 },
    ],
  },
  {
    id: 'c-301',
    name: 'C-301 Computer Lab',
    building: 'Engineering Block',
    capacity: 40,
    blocked: true,
    blockedReason: 'Closed for maintenance',
    bookings: [{ id: 'c1', title: 'Network Lab', start: 720, end: 840 }],
  },
  {
    id: 'd-105',
    name: 'D-105 Quiet Study Room',
    building: 'Student Center',
    capacity: 8,
    blocked: false,
    bookings: [],
  },
];

=== web/original/src/utils/time.ts ===
// "HH:MM" -> minutes after midnight
export function toMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return h * 60 + m;
}

// minutes after midnight -> "HH:MM"
export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function currentTimeString(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
~~~~

**Response:**

~~~~text
**Short version:** `can_book` meets AC1–AC5. The TS version has one definite AC1 bug. The page has a stale-result problem (AC5) and a midnight gap (AC1). I can't check the AC6 layout without your CSS.

## Python `can_book` (booking_v1.py)

| AC | Verdict | Input that shows it |
|---|---|---|
| AC1 | OK | `can_book(600, 660, 600, False, [])` → False (start == now). `can_book(1380, 1440, 0, False, [])` → True. |
| AC1 (edge) | Not enforced: there's no integer check | `can_book(600.5, 660, 0, False, [])` → True. Add `isinstance(start, int)` etc. if "integer" is meant strictly. |
| AC2 | OK, 120 is inclusive | `(600, 720)` → True; `(600, 721)` → False |
| AC3 | OK | `blocked=True` → False. Note that `blocked="no"` is truthy and also rejects, so the caller should pass a real bool. |
| AC4 | OK, half-open | existing `[(540, 600)]`, request `(600, 660)` → True; existing `[(659, 700)]` → False |
| AC5 | OK | It returns a plain bool and only reads `existing` |

## TS `checkAvailability` (availability.ts)

1. **AC1 bug: start equal to now is accepted.** `if (start < now)` should be `start <= now`. Test: room D-105, now 10:00, start 10:00, end 11:00 → `available: true`, but AC1 says Unavailable. This also means the Python and TS versions disagree at this boundary, so Python tests alone don't prove the page is correct.
2. **AC1 (robustness): NaN and non-integers get through.** Every comparison with `NaN` is false, so `checkAvailability(d105, NaN, NaN, 600)` returns `available: true` with no reasons. `toMinutes('')` gives `NaN`. Right now only `required` on the inputs prevents this. Add a guard like `if (![start, end, now].every(Number.isInteger)) reasons.push('Enter valid times.')`.
3. **AC4: correct.** `start < b.end && end > b.start`. A-101 10:00–11:00 against a1 (510–600) → available, because the endpoints touch. 09:59–11:00 → conflict.
4. **AC2, AC3: correct.** A-101 10:00–12:01 → "longer than 2 hours". C-301 any time → "This room is blocked: Closed for maintenance."
5. **AC6 (minor): noisy feedback for reversed times.** Start 09:10, end 08:40 in A-101 gives "end must be after start" and also "overlaps an existing booking": 550 < 600 and 520 > 510 make a1 count as a conflict. Run the overlap check only when `start < end`.

## Page (App.tsx, AvailabilityForm.tsx, time.ts)

6. **AC5: the result goes stale.** `result` is cleared on room change but not when now, start or end change. Test: A-101, now 08:00, 10:00–11:00 → Available. Then change end to 14:00 without pressing the button, and it still says Available for times that are invalid. Fix: call `setResult(null)` in the three change handlers.
7. **AC1: you can't enter end = 1440.** `<input type="time">` stops at 23:59, so a valid 23:00–24:00 booking can't be checked. Entering 00:00 as the end gives `toMinutes` = 0 → "end must be after start". The message "within the day (00:00–24:00)" promises something the form can't do. Either treat end "00:00" as 1440 when start > 0, or make the message say 23:59.
8. **AC6: the wording is wrong in the equal case.** After fix 1, now 10:00 / start 10:00 would say "has already passed". Something like "The start must be later than the current time" fits both cases.
9. **AC6: I can't verify the layout.** You didn't include `ResultPanel`, `BookingList`, `RoomSelector` or the CSS. Things to check:
   - `.layout` is two columns and `.field-row` puts Start/End side by side. You need a media query, for example `@media (max-width: 600px)`, that stacks both.
   - At 360px wide: no horizontal scroll, and the button is at least about 44px tall.
   - `ResultPanel` should show the reasons as text, not just colour, and name the conflicting booking (you already return `conflicts`).
   - Adding `aria-live="polite"` on the result helps screen readers.
10. **Scope: fine.** The data is fictional, there's no login or backend, and `room.bookings` is only filtered, never changed (AC5).

## Suggested test table (run it on both implementations)

| now | start–end | room / existing | expected |
|---|---|---|---|
| 600 | 600–660 | empty | False (AC1) |
| 0 | 1380–1440 | empty | True (AC1) |
| 0 | 600–720 / 600–721 | empty | True / False (AC2) |
| 0 | 600–660 | blocked | False (AC3) |
| 0 | 600–660 | [(540, 600)] / [(659, 700)] | True / False (AC4) |
| 0 | NaN or 600.5 | empty | False (AC1) |

The only change you have to make is fix 1. Fixes 2, 6 and 7 are small, and the AC6 layout can't be signed off until you've tested it at a narrow width.
~~~~

### B5

- **Tool:** Claude
- **Model:** Claude Opus 5.5 (claude-opus-5-5)
- **Date:** 2026-11-22
- **Stage:** Repair (page, issue 3)
- **Source:** this SIS

**Prompt:**

~~~~text
In the current prototype, selecting room B-204 (booking 10:00–11:00), setting the current time to 09:00 and checking the reversed interval 10:40–10:20 shows two reasons: "The end time must be after the start time." and "The requested time overlaps an existing booking.", plus "Conflicts with: Study Group: Databases". AC6 asks for understandable validation feedback, and a reversed interval is not a real interval, so it cannot overlap anything; only the first reason should be shown. Make the smallest change that fixes this behavior: run the overlap check only when start < end. Preserve the other acceptance criteria (AC1–AC5 decisions must not change). Explain which file you changed and why.

=== src/utils/availability.ts ===
import { AvailabilityResult, Room } from '../types';

export const MAX_DURATION = 120;
export const DAY_END = 1440;

// Decides whether [start, end) can be booked in the room.
// Intervals include the start and exclude the end.
export function checkAvailability(room: Room, start: number, end: number, now: number): AvailabilityResult {
  const reasons: string[] = [];

  if (start < 0 || end > DAY_END) {
    reasons.push('The time must be within the day (00:00–24:00).');
  }
  if (start >= end) {
    reasons.push('The end time must be after the start time.');
  }
  if (start <= now) {
    reasons.push('The start time must be after the current time.');
  }
  if (end - start > MAX_DURATION) {
    reasons.push('A booking cannot be longer than 2 hours.');
  }
  if (room.blocked) {
    reasons.push(`This room is blocked${room.blockedReason ? `: ${room.blockedReason}` : ''}.`);
  }

  const conflicts = room.bookings.filter((b) => start < b.end && end > b.start);
  if (conflicts.length > 0) {
    reasons.push('The requested time overlaps an existing booking.');
  }

  return { available: reasons.length === 0, reasons, conflicts };
}
~~~~

**Response:**

~~~~text
The only file to change is `src/utils/availability.ts`. The overlap check now runs only when `start < end`.

```ts
import { AvailabilityResult, Room } from '../types';

export const MAX_DURATION = 120;
export const DAY_END = 1440;

// Decides whether [start, end) can be booked in the room.
// Intervals include the start and exclude the end.
export function checkAvailability(room: Room, start: number, end: number, now: number): AvailabilityResult {
  const reasons: string[] = [];

  if (start < 0 || end > DAY_END) {
    reasons.push('The time must be within the day (00:00–24:00).');
  }
  if (start >= end) {
    reasons.push('The end time must be after the start time.');
  }
  if (start <= now) {
    reasons.push('The start time must be after the current time.');
  }
  if (end - start > MAX_DURATION) {
    reasons.push('A booking cannot be longer than 2 hours.');
  }
  if (room.blocked) {
    reasons.push(`This room is blocked${room.blockedReason ? `: ${room.blockedReason}` : ''}.`);
  }

  // A reversed or empty interval is not a real interval, so it cannot overlap anything.
  const conflicts = start < end ? room.bookings.filter((b) => start < b.end && end > b.start) : [];
  if (conflicts.length > 0) {
    reasons.push('The requested time overlaps an existing booking.');
  }

  return { available: reasons.length === 0, reasons, conflicts };
}
```

**Why this file:** the validation rules live in `checkAvailability`. The overlap test `start < b.end && end > b.start` only makes sense when `start < end`. With 10:40–10:20 and a 10:00–11:00 booking, both comparisons are true, so the old code reported a conflict for an interval that doesn't exist.

**Why this way:** I put the guard on `conflicts` itself instead of just skipping the `reasons.push`. A reversed interval now gives an empty `conflicts` array. That removes both "The requested time overlaps an existing booking." and the "Conflicts with: Study Group: Databases" line, which the UI builds from `conflicts`. The UI component doesn't need to change.

**AC1–AC5 stay the same:**
- **When `start < end`:** the code behaves exactly as before, so every valid interval gets the same overlap result and the same decision.
- **When `start >= end`:** the end-time reason is still added, so `available` is still `false`. Only the extra overlap message and the conflict list are gone.
- **Other checks:** the day-range, current-time, duration and blocked-room checks are untouched. If a reversed interval also breaks one of those rules, that message still shows. This change only removes the overlap message.

For your B-204 case (now 09:00, checking 10:40–10:20), the only message is now "The end time must be after the start time." I haven't run this, so please check that case and your AC1–AC5 scenarios in the prototype once.
~~~~

### B6

- **Tool:** Claude
- **Model:** Claude Opus 5.5 (claude-opus-5-5)
- **Date:** 2026-11-22
- **Stage:** Repair (page, issue 2)
- **Source:** this SIS

**Prompt:**

~~~~text
In the current prototype there is no room whose bookings are 10:00–11:00 and 11:40–12:40, so test case T10 (current time 09:00, request 12:00–13:00, which overlaps only the SECOND booking; expected Unavailable under AC4, every existing booking must be checked) cannot be set up on the page at all. Make the smallest change that makes T10 testable: add one fictional room to the sample data with exactly those two bookings, not blocked. Do not change the existing rooms, the checking logic or the layout, and do not add any way to create or save bookings. Explain which file you changed and why.

=== src/data/rooms.ts ===
import { Room } from '../types';

// Fictional sample data for the prototype. Times are minutes after midnight.
export const ROOMS: Room[] = [
  {
    id: 'a-101',
    name: 'A-101 Lecture Hall',
    building: 'Main Building',
    capacity: 120,
    blocked: false,
    bookings: [
      { id: 'a1', title: 'Intro to Algorithms', start: 510, end: 600 },
      { id: 'a2', title: 'Physics Seminar', start: 780, end: 870 },
    ],
  },
  {
    id: 'b-204',
    name: 'B-204 Seminar Room',
    building: 'Library Wing',
    capacity: 30,
    blocked: false,
    bookings: [
      { id: 'b1', title: 'Study Group: Databases', start: 600, end: 660 },
      { id: 'b2', title: 'Robotics Club', start: 900, end: 960 },
    ],
  },
  {
    id: 'c-301',
    name: 'C-301 Computer Lab',
    building: 'Engineering Block',
    capacity: 40,
    blocked: true,
    blockedReason: 'Closed for maintenance',
    bookings: [{ id: 'c1', title: 'Network Lab', start: 720, end: 840 }],
  },
  {
    id: 'd-105',
    name: 'D-105 Quiet Study Room',
    building: 'Student Center',
    capacity: 8,
    blocked: false,
    bookings: [],
  },
];
~~~~

**Response:**

~~~~text
The only file to change is `src/data/rooms.ts`. I added one fictional room, E-210, with the two bookings T10 needs. The other rooms stay as they were.

```ts
import { Room } from '../types';

// Fictional sample data for the prototype. Times are minutes after midnight.
export const ROOMS: Room[] = [
  {
    id: 'a-101',
    name: 'A-101 Lecture Hall',
    building: 'Main Building',
    capacity: 120,
    blocked: false,
    bookings: [
      { id: 'a1', title: 'Intro to Algorithms', start: 510, end: 600 },
      { id: 'a2', title: 'Physics Seminar', start: 780, end: 870 },
    ],
  },
  {
    id: 'b-204',
    name: 'B-204 Seminar Room',
    building: 'Library Wing',
    capacity: 30,
    blocked: false,
    bookings: [
      { id: 'b1', title: 'Study Group: Databases', start: 600, end: 660 },
      { id: 'b2', title: 'Robotics Club', start: 900, end: 960 },
    ],
  },
  {
    id: 'c-301',
    name: 'C-301 Computer Lab',
    building: 'Engineering Block',
    capacity: 40,
    blocked: true,
    blockedReason: 'Closed for maintenance',
    bookings: [{ id: 'c1', title: 'Network Lab', start: 720, end: 840 }],
  },
  {
    id: 'd-105',
    name: 'D-105 Quiet Study Room',
    building: 'Student Center',
    capacity: 8,
    blocked: false,
    bookings: [],
  },
  {
    // Fictional room for test case T10: the request should overlap only the second booking.
    id: 'e-210',
    name: 'E-210 Group Study Room',
    building: 'Library Wing',
    capacity: 12,
    blocked: false,
    bookings: [
      { id: 'e1', title: 'Peer Tutoring', start: 600, end: 660 },
      { id: 'e2', title: 'Project Team Meeting', start: 700, end: 760 },
    ],
  },
];
```

**Why this file:** the rooms on the page come from the sample data. Adding a room here makes T10 possible to set up without touching the checking logic, the layout or the existing rooms. Nothing new lets anyone create or save bookings.

**How the times work out** (in minutes after midnight):
- The first booking, 10:00–11:00, is 600–660.
- The second booking, 11:40–12:40, is 700–760.
- The T10 request, 12:00–13:00, is 720–780.

So the request hits only the second booking:
- **First booking:** the overlap test `720 < 660 && 780 > 600` is false, so no conflict.
- **Second booking:** the test `720 < 760 && 780 > 700` is true, so this is a conflict.

**What T10 should show:** with the current time at 09:00, every other check passes. The request is inside the day, ends after it starts, starts after 09:00, lasts 60 minutes (the limit is 120), and the room is not blocked. The only message should be "The requested time overlaps an existing booking.", with "Conflicts with: Project Team Meeting". That gives Unavailable, as AC4 expects. If the checker had looked only at the first booking, it would wrongly show Available.

I haven't run this. I'm assuming the page lists every entry in `ROOMS`. Please check that E-210 shows up in the room list, then run T10.
~~~~

## 12. Appendix B — Test output

### 12.1 Your suite

<!-- The complete terminal output of your final suite. Path A: python -m unittest -v, run inside
     code/ — the part ending in "Ran N tests" and OK or FAILED. -->

~~~~text
$ cd code && python -m unittest -v
test_121_minutes_is_rejected (test_booking.BookingTests.test_121_minutes_is_rejected) ... ok
test_blocked_room_is_rejected (test_booking.BookingTests.test_blocked_room_is_rejected) ... ok
test_blocked_room_with_no_bookings (test_booking.BookingTests.test_blocked_room_with_no_bookings) ... ok
test_ending_after_1440_is_rejected (test_booking.BookingTests.test_ending_after_1440_is_rejected) ... ok
test_ending_at_1440_is_allowed (test_booking.BookingTests.test_ending_at_1440_is_allowed) ... ok
test_exactly_120_minutes_is_allowed (test_booking.BookingTests.test_exactly_120_minutes_is_allowed) ... ok
test_existing_is_not_changed (test_booking.BookingTests.test_existing_is_not_changed) ... ok
test_inside_and_containing_are_rejected (test_booking.BookingTests.test_inside_and_containing_are_rejected) ... ok
test_negative_start_is_rejected (test_booking.BookingTests.test_negative_start_is_rejected) ... ok
test_no_bookings_at_all (test_booking.BookingTests.test_no_bookings_at_all) ... ok
test_one_minute_after_now_is_allowed (test_booking.BookingTests.test_one_minute_after_now_is_allowed) ... ok
test_overlap_is_rejected (test_booking.BookingTests.test_overlap_is_rejected) ... ok
test_reversed_times_are_rejected (test_booking.BookingTests.test_reversed_times_are_rejected) ... ok
test_same_check_twice (test_booking.BookingTests.test_same_check_twice) ... ok
test_second_booking_is_checked (test_booking.BookingTests.test_second_booking_is_checked) ... ok
test_start_in_the_past_is_rejected (test_booking.BookingTests.test_start_in_the_past_is_rejected) ... ok
test_start_zero_is_allowed_when_now_is_before (test_booking.BookingTests.test_start_zero_is_allowed_when_now_is_before) ... ok
test_starts_now_is_rejected (test_booking.BookingTests.test_starts_now_is_rejected) ... ok
test_touching_end_is_allowed (test_booking.BookingTests.test_touching_end_is_allowed) ... ok
test_touching_start_is_allowed (test_booking.BookingTests.test_touching_start_is_allowed) ... ok
test_unsorted_bookings_are_all_checked (test_booking.BookingTests.test_unsorted_bookings_are_all_checked) ... ok
test_zero_length_is_rejected (test_booking.BookingTests.test_zero_length_is_rejected) ... ok

----------------------------------------------------------------------
Ran 22 tests in 0.001s

OK
~~~~

### 12.2 Path B only — three faults you planted

<!-- Path A: leave this table as it is. Path B: three rows — the line you broke, the AC it
     breaks, the test that failed. -->

| # | Line you broke | AC | Test that failed |
| --- | --- | --- | --- |
| 1 | | | |
| 2 | | | |
| 3 | | | |

## 13. Remaining limitations and known fails

| Check ID or limitation | Why it stays | What I would do next |
| --- | --- | --- |
| No checker FAIL or ERROR in my last run | - | - |
| T9 (1380-1441) is Not testable on the page | A `type="time"` input stops at 23:59 and the end-of-day checkbox only gives 1440, so 24:01 cannot be entered; C4 accepts Not testable for T8/T9. The Python function rejects it (False). | A plain number input in minutes next to the time inputs, if the course wants T9 on the page. |
| `code/booking.py` is the unchanged v1 | v1 passed T1-T11, F1-F10 and my 22 tests; the only critique point on it (type checks) was outside the contract, so there was nothing to fix. | Keep it; add a test only if the contract changes. |
| Bolt.new was not used | The Week 06 page (v1 and final base) was built by Claude as a fallback builder; disclosed in section 1, 4 and AI_USAGE.md. | Rebuild the page in Bolt.new with the same prompt if the instructor requires Bolt itself. |
| The page logic has no automated tests in this SIS | The page was checked by running T1-T12 in headless Chrome, not by a unit test suite. | Port the 22 Python cases to a small test file for `checkAvailability()`. |
| Layout checked only at 1280 and 375 px wide | Those are the widths of the cases (T12); other widths were not tried. | Check 320 px and a tablet width. |
