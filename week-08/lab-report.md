# Week 08 — Lab report

**Name:** Sultan Bekzada (24B032035)
**Group:** Software Engineering practice, Monday 16:00–19:00
**Date:** 2026-11-22

Fill in every section. **Do not delete, rename or renumber the headings.** The checker and the
grader find your answers by them. You can add rows to any table, but never remove its header.

---

## 1. Setup

| | |
| --- | --- |
| Assistant I debugged with (tool) | Claude (Anthropic) — each chat run as a separate fresh session that saw only the message I sent |
| Exact model (with its version, or `not displayed`) | claude-opus-5-5 (Claude Opus 5.5) |
| Where the skill was installed (ChatGPT / Claude web / Claude Code / prompt-only simulation) | prompt-only simulation (SKILL.md pasted as the first part of the message, declared as a simulation) |
| Where I ran the tests (Bolt terminal / my computer / Codespace) | a Linux terminal (Node 22) in a Claude cloud workspace, same as a Codespace |
| Vitest version (the `RUN  v…` line of a run) | 3.2.7 |
| Language of my booking module (`ts` or `js`) — the file I copied from `buggy/` | ts — `buggy/booking.ts` |

---

## 2. Task 1 — baseline, buggy code, failing tests

### 2.1 My Week 07 suite on my own code

The **real** output of your Week 07 suite, run in `week-08/app/` **before** you replace
anything. It should be green. If it is not, say why under the block.

```text
$ npx vitest run

 RUN  v3.2.7 /home/claude/se-practice/week-08/app

 ✓ src/booking.test.ts (19 tests) 5ms

 Test Files  1 passed (1)
      Tests  19 passed (19)
   Start at  19:41:27
   Duration  235ms (transform 45ms, setup 0ms, collect 31ms, tests 5ms, environment 0ms, prepare 49ms)
```

### 2.2 The same suite on the provided canBook

You copied the whole `canBook` function from `buggy/booking.ts` (or `.js`) over yours and changed
nothing else. This is the real output:

```text
$ npx vitest run

 RUN  v3.2.7 /home/claude/se-practice/week-08/app

 ❯ src/booking.test.ts (19 tests | 5 failed) 14ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T02 AC1: 540–570 starts exactly at the current time → Unavailable 2ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T03 AC1: 720–720 has zero duration → Unavailable 0ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T04 AC1: 750–720 is reversed → Unavailable 0ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T05 AC1: 1380–1441 ends after 24:00 → Unavailable 0ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > X1 AC1: 1380–1440 ends exactly at 24:00 → Available 0ms
   × AC1 — 0 ≤ start < end ≤ 1440 and start after now > AC1 boundary: 541–600 starts one minute after now → Available 6ms
     → expected false to be true // Object.is equality
   ✓ AC2 — at most 120 minutes > T06 AC2: 720–840 is exactly 120 minutes → Available 0ms
   ✓ AC2 — at most 120 minutes > T07 AC2: 720–841 is 121 minutes → Unavailable 0ms
   ✓ AC3 — blocked room > T13 AC3: 660–720 in a blocked room → Unavailable 0ms
   × AC4 — overlaps rejected, touching allowed > T01 AC4: 660–720 touches the end of 600–660 → Available 1ms
     → expected false to be true // Object.is equality
   × AC4 — overlaps rejected, touching allowed > T08 AC4: 570–600 touches the start of 600–660 → Available 0ms
     → expected false to be true // Object.is equality
   ✓ AC4 — overlaps rejected, touching allowed > T09 AC4: 630–690 partially overlaps 600–660 → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T10 AC4: 570–690 contains 600–660 → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T11 AC4: 615–645 lies inside 600–660 → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T12 AC4: 600–660 is identical to the booking → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T14 AC4: 630–690 with bookings = [] → Available 0ms
   × AC4 — overlaps rejected, touching allowed > X2 AC4: 660–720 touches 600–660 and 720–780 at once → Available 0ms
     → expected false to be true // Object.is equality
   ✓ AC4 — overlaps rejected, touching allowed > AC4 boundary: 659–720 shares one minute (659) with 600–660 → Unavailable 0ms
   × AC5 — checking does not change the booking data > AC5: an Available check (660–720) leaves the bookings exactly as before 1ms
     → expected false to be true // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/booking.test.ts > AC1 — 0 ≤ start < end ≤ 1440 and start after now > AC1 boundary: 541–600 starts one minute after now → Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:38:29
     36| 
     37|   test('AC1 boundary: 541–600 starts one minute after now → Available'…
     38|     expect(check(541, 600)).toBe(true);
       |                             ^
     39|   });
     40| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

 FAIL  src/booking.test.ts > AC4 — overlaps rejected, touching allowed > T01 AC4: 660–720 touches the end of 600–660 → Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:60:29
     58| describe('AC4 — overlaps rejected, touching allowed', () => {
     59|   test('T01 AC4: 660–720 touches the end of 600–660 → Available', () =…
     60|     expect(check(660, 720)).toBe(true);
       |                             ^
     61|   });
     62| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

 FAIL  src/booking.test.ts > AC4 — overlaps rejected, touching allowed > T08 AC4: 570–600 touches the start of 600–660 → Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:64:29
     62| 
     63|   test('T08 AC4: 570–600 touches the start of 600–660 → Available', ()…
     64|     expect(check(570, 600)).toBe(true);
       |                             ^
     65|   });
     66| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

 FAIL  src/booking.test.ts > AC4 — overlaps rejected, touching allowed > X2 AC4: 660–720 touches 600–660 and 720–780 at once → Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:88:90
     86| 
     87|   test('X2 AC4: 660–720 touches 600–660 and 720–780 at once → Availabl…
     88|     expect(check(660, 720, false, [{ start: 600, end: 660 }, { start: …
       |                                                                                          ^
     89|   });
     90| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

 FAIL  src/booking.test.ts > AC5 — checking does not change the booking data > AC5: an Available check (660–720) leaves the bookings exactly as before
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:100:83
     98|     const bookings = defaultBookings();
     99|     const before = JSON.stringify(bookings);
    100|     expect(canBook({ start: 660, end: 720, now: 540, blocked: false, b…
       |                                                                                   ^
    101|     expect(JSON.stringify(bookings)).toBe(before);
    102|     expect(bookings).toEqual([{ start: 600, end: 660 }]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯


 Test Files  1 failed (1)
      Tests  5 failed | 14 passed (19)
   Start at  19:41:40
   Duration  250ms (transform 37ms, setup 0ms, collect 34ms, tests 14ms, environment 0ms, prepare 60ms)
```

### 2.3 One failing test per bug

Add the two regression tests from README Part 1, step 5: one named `BUG-A` and one named `BUG-B`.
Run them **on the buggy code**. Both must fail here. That is the evidence that each test can see
its bug.

```text
$ npx vitest run

 RUN  v3.2.7 /home/claude/se-practice/week-08/app

 ❯ src/booking.test.ts (21 tests | 7 failed) 14ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T02 AC1: 540–570 starts exactly at the current time → Unavailable 1ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T03 AC1: 720–720 has zero duration → Unavailable 0ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T04 AC1: 750–720 is reversed → Unavailable 0ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T05 AC1: 1380–1441 ends after 24:00 → Unavailable 0ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > X1 AC1: 1380–1440 ends exactly at 24:00 → Available 0ms
   × AC1 — 0 ≤ start < end ≤ 1440 and start after now > AC1 boundary: 541–600 starts one minute after now → Available 5ms
     → expected false to be true // Object.is equality
   ✓ AC2 — at most 120 minutes > T06 AC2: 720–840 is exactly 120 minutes → Available 0ms
   ✓ AC2 — at most 120 minutes > T07 AC2: 720–841 is 121 minutes → Unavailable 0ms
   ✓ AC3 — blocked room > T13 AC3: 660–720 in a blocked room → Unavailable 0ms
   × AC4 — overlaps rejected, touching allowed > T01 AC4: 660–720 touches the end of 600–660 → Available 1ms
     → expected false to be true // Object.is equality
   × AC4 — overlaps rejected, touching allowed > T08 AC4: 570–600 touches the start of 600–660 → Available 1ms
     → expected false to be true // Object.is equality
   ✓ AC4 — overlaps rejected, touching allowed > T09 AC4: 630–690 partially overlaps 600–660 → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T10 AC4: 570–690 contains 600–660 → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T11 AC4: 615–645 lies inside 600–660 → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T12 AC4: 600–660 is identical to the booking → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T14 AC4: 630–690 with bookings = [] → Available 0ms
   × AC4 — overlaps rejected, touching allowed > X2 AC4: 660–720 touches 600–660 and 720–780 at once → Available 0ms
     → expected false to be true // Object.is equality
   ✓ AC4 — overlaps rejected, touching allowed > AC4 boundary: 659–720 shares one minute (659) with 600–660 → Unavailable 0ms
   × AC5 — checking does not change the booking data > AC5: an Available check (660–720) leaves the bookings exactly as before 1ms
     → expected false to be true // Object.is equality
   × Week 08 regression tests > BUG-A AC4: 600–660 touches 540–600 and 660–720 on both sides → Available 0ms
     → expected false to be true // Object.is equality
   × Week 08 regression tests > BUG-B AC5: 720–780 touches nothing → Available, and the bookings are unchanged 1ms
     → expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 7 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/booking.test.ts > AC1 — 0 ≤ start < end ≤ 1440 and start after now > AC1 boundary: 541–600 starts one minute after now → Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:38:29
     36| 
     37|   test('AC1 boundary: 541–600 starts one minute after now → Available'…
     38|     expect(check(541, 600)).toBe(true);
       |                             ^
     39|   });
     40| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/7]⎯

 FAIL  src/booking.test.ts > AC4 — overlaps rejected, touching allowed > T01 AC4: 660–720 touches the end of 600–660 → Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:60:29
     58| describe('AC4 — overlaps rejected, touching allowed', () => {
     59|   test('T01 AC4: 660–720 touches the end of 600–660 → Available', () =…
     60|     expect(check(660, 720)).toBe(true);
       |                             ^
     61|   });
     62| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/7]⎯

 FAIL  src/booking.test.ts > AC4 — overlaps rejected, touching allowed > T08 AC4: 570–600 touches the start of 600–660 → Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:64:29
     62| 
     63|   test('T08 AC4: 570–600 touches the start of 600–660 → Available', ()…
     64|     expect(check(570, 600)).toBe(true);
       |                             ^
     65|   });
     66| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/7]⎯

 FAIL  src/booking.test.ts > AC4 — overlaps rejected, touching allowed > X2 AC4: 660–720 touches 600–660 and 720–780 at once → Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:88:90
     86| 
     87|   test('X2 AC4: 660–720 touches 600–660 and 720–780 at once → Availabl…
     88|     expect(check(660, 720, false, [{ start: 600, end: 660 }, { start: …
       |                                                                                          ^
     89|   });
     90| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/7]⎯

 FAIL  src/booking.test.ts > AC5 — checking does not change the booking data > AC5: an Available check (660–720) leaves the bookings exactly as before
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:100:83
     98|     const bookings = defaultBookings();
     99|     const before = JSON.stringify(bookings);
    100|     expect(canBook({ start: 660, end: 720, now: 540, blocked: false, b…
       |                                                                                   ^
    101|     expect(JSON.stringify(bookings)).toBe(before);
    102|     expect(bookings).toEqual([{ start: 600, end: 660 }]);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/7]⎯

 FAIL  src/booking.test.ts > Week 08 regression tests > BUG-A AC4: 600–660 touches 540–600 and 660–720 on both sides → Available
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ src/booking.test.ts:108:90
    106| describe('Week 08 regression tests', () => {
    107|   test('BUG-A AC4: 600–660 touches 540–600 and 660–720 on both sides →…
    108|     expect(check(600, 660, false, [{ start: 540, end: 600 }, { start: …
       |                                                                                          ^
    109|   });
    110| 

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[6/7]⎯

 FAIL  src/booking.test.ts > Week 08 regression tests > BUG-B AC5: 720–780 touches nothing → Available, and the bookings are unchanged
AssertionError: expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality

Expected: "[{"start":600,"end":660}]"
Received: "[{"start":600,"end":660},{"start":720,"end":780}]"

 ❯ src/booking.test.ts:115:38
    113|     const before = JSON.stringify(bookings);
    114|     expect(canBook({ start: 720, end: 780, now: 540, blocked: false, b…
    115|     expect(JSON.stringify(bookings)).toBe(before);
       |                                      ^
    116|   });
    117| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[7/7]⎯


 Test Files  1 failed (1)
      Tests  7 failed | 14 passed (21)
   Start at  19:42:01
   Duration  230ms (transform 54ms, setup 0ms, collect 45ms, tests 14ms, environment 0ms, prepare 46ms)
```

BUG-A fails on `.toBe(true)` (the touching request is rejected). BUG-B fails on the data comparison,
which is the right reason: `canBook` answered true and then added 720–780 to the array.

---

## 3. Defect log

One row per defect. At least **BUG-A and BUG-B**. "Suspected cause" is your hypothesis
**before** you ask any assistant: the line and why.

| Defect | Test ID | Input | Expected | Actual | Suspected cause (line and why) |
| --- | --- | --- | --- | --- | --- |
| BUG-A | T01, T08, X2, "AC1 boundary 541–600" (and the AC5 test) | T01: 660–720, now 540, not blocked, bookings [600–660] | true (Available) | false | `if (start <= b.end && end >= b.start) return false;` in the loop of `canBook`: with `<=`/`>=` the request 660–720 and the booking 600–660 give `660 <= 660` and `720 >= 600`, both true, so a request that only touches the end (or, for T08 570–600, the start) counts as an overlap. Intervals exclude the end, so the comparison must be strict. Every failing test is a touching request; T09–T12 (real overlaps) still pass. |
| BUG-B | AC5 (fails, but for the BUG-A reason), BUG-B (new) | AC5: 660–720 with bookings [600–660]; BUG-B: 720–780 with bookings [600–660] | true, and bookings still [600–660] | AC5: false (rejected before the push); BUG-B: true, but bookings become [600–660, 720–780] | `bookings.push({ start, end });` just before `return true`: the function adds the checked slot to the caller's array. My AC5 test cannot show it yet: its request 660–720 touches the booking, so BUG-A returns false before the push runs and the test fails on `.toBe(true)`, not on the comparison. That is why I need a request that touches nothing (720–780). In the page, `App.tsx` passes `room.bookings` from `ROOMS`, so every Available check would also add a booking to the sample data. |

---

## 4. Tasks 2–3 — the skill

**The checks from the deck, before you zip it.** Answer each one yes / no:

| Check | yes / no |
| --- | --- |
| The file is plain UTF-8 text, named exactly `SKILL.md` (not `SKILL.md.txt`) | yes |
| The first and the closing YAML delimiter are exactly three hyphens: `---` | yes |
| `name` is lowercase with hyphens, and `description` says WHEN to use it | yes |
| I read the whole file once: no passwords, API keys or private student data | yes |

**The contents of `skills/bug-detector.zip`.** Paste the listing (Windows: open the ZIP and copy
the paths; macOS/Linux: `unzip -l skills/bug-detector.zip`):

```text
$ cd skills && zip -r bug-detector.zip bug-detector && unzip -l bug-detector.zip
Archive:  bug-detector.zip
  Length      Date    Time    Name
---------  ---------- -----   ----
        0  2026-11-22 19:42   bug-detector/
      570  2026-11-22 19:42   bug-detector/SKILL.md
---------                     -------
      570                     2 files
```

**Installation.** Where you uploaded it, what the upload said, and whether a new chat showed the
skill as enabled. If upload was not available, write `prompt-only simulation` and say why.
Screenshot of the result: `evidence/install.png`.

<!-- Write below this line -->

prompt-only simulation. I had no Skills upload available in the environment I worked in, so I used
the deck's fallback: a fresh Claude session (claude-opus-5-5, no tools, no files) received the text
of `SKILL.md` as its first message, introduced as "a prompt-only simulation of an Agent Skill, not
an installed skill", and the skill question with the input as its second message. Nothing was
uploaded, so there was no upload message and no "skill enabled" badge. `evidence/install.png` is a
capture of that simulation, rendered from the saved session (not a screenshot of a chat app). The
checker's K1–K7 all pass: the file is ASCII/UTF-8, named exactly `SKILL.md`, and the ZIP holds
`bug-detector/SKILL.md` identical to the committed file.

---

## 5. Task 4 — without the skill

A **fresh chat, with no skill enabled**. Paste exactly what you sent: the deck's question, then
the same input you will use in section 6 (AC1–AC6, the failing test output, the code of
`canBook`):

```text
Find the root cause of the failed room-booking test. Propose minimal patch and regression test. Do not edit code.

Acceptance criteria:
AC1 Reject start ≥ end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Preserve clear UI feedback on desktop and mobile.
Times are minutes after midnight (600 = 10:00). Intervals include the start and exclude the end.

Failing test output (Vitest 3.2.7):
 FAIL  src/booking.test.ts > AC4 — overlaps rejected, touching allowed > T01 AC4: 660–720 touches the end of 600–660 → Available
AssertionError: expected false to be true // Object.is equality

The test:
  test('T01 AC4: 660–720 touches the end of 600–660 → Available', () => {
    expect(check(660, 720)).toBe(true);
  });
  // check(start, end) calls canBook({ start, end, now: 540, blocked: false, bookings: [{ start: 600, end: 660 }] })

The code of canBook (src/booking.ts):
export function canBook({ start, end, now, blocked, bookings }: {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: { start: number; end: number }[];
}): boolean {
  if (!(0 <= start && start < end && end <= 1440)) return false;
  if (!(start > now)) return false;
  if (end - start > 120) return false;
  if (blocked) return false;
  for (const b of bookings) {
    if (start <= b.end && end >= b.start) return false;
  }
  // keep the room's list current with the slot that was just found free
  bookings.push({ start, end });
  return true;
}
```

**The assistant's answer, pasted unedited:** (a fresh Claude session, claude-opus-5-5, no tools and
no skill; the only change is that its inner code fences (three backticks) are shown as ''' so that they
do not close this block)

```text
## Root cause

The overlap check in `canBook` treats intervals as closed (`[start, end]`). The spec says they are half-open: the start is included and the end is excluded (`[start, end)`).

'''ts
if (start <= b.end && end >= b.start) return false;
'''

Here is how T01 runs: `check(660, 720)` with the existing booking `{600, 660}` and `now = 540`.

| Guard | Evaluation | Result |
|---|---|---|
| Range `0 ≤ 660 < 720 ≤ 1440` | true | passes |
| Past `660 > 540` | true | passes |
| Duration `60 ≤ 120` | true | passes |
| Blocked | false | passes |
| Overlap `660 <= 660 && 720 >= 600` | **true** | **returns `false`** |

The comparison `660 <= 660` counts the shared endpoint as an overlap. Under `[start, end)`, the existing booking ends just before minute 660, so the two slots only touch. That is allowed by AC4. For half-open intervals, two slots overlap only when `start < b.end && end > b.start`.

The same bug also rejects a slot that touches the **start** of a booking, for example 560–600 against 600–660.

## Second defect (does not cause T01 to fail)

'''ts
bookings.push({ start, end });
'''

This breaks AC5: an availability check must not change booking data. It mutates the caller's array, so every successful check silently "books" the slot. If you check the same slot twice, the first call returns Available and the second returns Unavailable. T01 doesn't show this because `check()` builds a new `bookings` array literal on every call. It would show up with a shared fixture or in the real UI, where the list is reused.

## Minimal patch (proposed, not applied)

'''diff
--- a/src/booking.ts
+++ b/src/booking.ts
@@ export function canBook(...)
   for (const b of bookings) {
-    if (start <= b.end && end >= b.start) return false;
+    // half-open intervals [start, end): touching endpoints is not an overlap
+    if (start < b.end && end > b.start) return false;
   }
-  // keep the room's list current with the slot that was just found free
-  bookings.push({ start, end });
   return true;
 }
'''

- **First hunk:** fixes T01 and the AC4 touching cases. Nothing else changes.
- **Second hunk:** fixes AC5. If you want the T01 fix to stay strictly one line, put this in its own commit. Either way, I recommend removing it, because it breaks an acceptance criterion. If a later "confirm booking" step needs to add the slot, it should do that itself, outside `canBook`.
- AC1–AC3 and AC6 are unaffected. The return type stays `boolean`, so the UI's mapping to Available / Unavailable doesn't change.

## Regression tests (add to `src/booking.test.ts`)

The test helper uses `now = 540`, so the "touches the start" case begins at 560, not 540. A start of 540 would fail the AC1 past-time check instead.

'''ts
import { describe, test, expect } from 'vitest';
import { canBook } from './booking';

describe('AC4 regression — half-open interval boundaries', () => {
  // existing booking 600–660, now = 540 (same as check())
  test.each([
    [560, 600, true,  'touches start of 600–660'],
    [660, 720, true,  'touches end of 600–660'],
    [599, 601, false, 'overlaps start by 1 minute'],
    [659, 720, false, 'overlaps end by 1 minute'],
    [600, 660, false, 'identical interval'],
    [610, 650, false, 'contained inside'],
    [590, 670, false, 'encloses existing booking'],
  ])('%i–%i → %s (%s)', (start, end, expected) => {
    expect(check(start, end)).toBe(expected);
  });
});

describe('AC5 regression — check does not mutate bookings', () => {
  test('bookings array unchanged and result repeatable', () => {
    const bookings = [{ start: 600, end: 660 }];
    const snapshot = structuredClone(bookings);
    const args = { start: 660, end: 720, now: 540, blocked: false, bookings };

    expect(canBook(args)).toBe(true);
    expect(canBook(args)).toBe(true); // second check of same slot still Available
    expect(bookings).toEqual(snapshot); // no slot was added
  });
});
'''

**Expected results:**
- **Before the patch:** T01, the "touches start" case and the AC5 test fail. The AC5 test fails on its second `canBook` call, which returns false.
- **After the patch:** all of them pass. The overlap cases (599–601, 659–720, identical, contained, enclosing) pass both before and after, which shows the fix didn't loosen real overlap rejection.

No files were read or edited.
```

---

## 6. Task 5 — with the skill

**Another fresh chat, with `bug-detector` enabled.** Send exactly the same input as in section 5.
Only the question changes, to the deck's skill question:

(Before this message, the same fresh session received the text of `SKILL.md` as message 1, declared
as a prompt-only simulation — see §4 and `evidence/install.png`. Below is message 2, as sent.)

```text
Use the bug-detector skill to diagnose the failed room-booking test.

Acceptance criteria:
AC1 Reject start ≥ end and requests in the past.
AC2 Enforce the maximum allowed duration (120 minutes).
AC3 Reject a blocked room.
AC4 Reject overlaps; allow bookings that only touch at endpoints.
AC5 Return Available / Unavailable without changing booking data.
AC6 Preserve clear UI feedback on desktop and mobile.
Times are minutes after midnight (600 = 10:00). Intervals include the start and exclude the end.

Failing test output (Vitest 3.2.7):
 FAIL  src/booking.test.ts > AC4 — overlaps rejected, touching allowed > T01 AC4: 660–720 touches the end of 600–660 → Available
AssertionError: expected false to be true // Object.is equality

The test:
  test('T01 AC4: 660–720 touches the end of 600–660 → Available', () => {
    expect(check(660, 720)).toBe(true);
  });
  // check(start, end) calls canBook({ start, end, now: 540, blocked: false, bookings: [{ start: 600, end: 660 }] })

The code of canBook (src/booking.ts):
export function canBook({ start, end, now, blocked, bookings }: {
  start: number;
  end: number;
  now: number;
  blocked: boolean;
  bookings: { start: number; end: number }[];
}): boolean {
  if (!(0 <= start && start < end && end <= 1440)) return false;
  if (!(start > now)) return false;
  if (end - start > 120) return false;
  if (blocked) return false;
  for (const b of bookings) {
    if (start <= b.end && end >= b.start) return false;
  }
  // keep the room's list current with the slot that was just found free
  bookings.push({ start, end });
  return true;
}
```

**The assistant's answer, pasted unedited:** (another fresh Claude session, claude-opus-5-5, no
tools; inner code fences shown as ''')

```text
## Bug report: `canBook` (src/booking.ts)

**Reproduction (smallest deterministic input):**
'''ts
canBook({ start: 660, end: 720, now: 540, blocked: false,
          bookings: [{ start: 600, end: 660 }] })   // returns false, expected true
'''
Going through the checks: the bounds check passes, `660 > 540` passes, duration 60 ≤ 120 passes, and the room is not blocked. The request is rejected by the overlap loop.

---

### D1: Bookings that only touch are treated as overlaps (AC4). Confirmed. This is the cause of T01.

**Evidence**
Overlap check with b = 600–660 and request = 660–720:
`start <= b.end` → `660 <= 660` → **true**
`end >= b.start` → `720 >= 600` → **true**
Both are true, so the function returns `false`. This matches `expected false to be true`.

**Root cause**
'''ts
if (start <= b.end && end >= b.start) return false;
'''
This is a closed-interval test, `[a,b]`. The spec uses half-open intervals, `[start, end)`, so a shared endpoint is not an overlap. Both comparisons have to be strict. The bug fails at both edges. A booking that touches the *start* of an existing one, such as 550–600 against 600–660, is also wrongly rejected: `550 <= 660 && 600 >= 600`.

**Fix (minimal)**
'''ts
if (start < b.end && end > b.start) return false;
'''

**Regression tests (expected results after the fix)**
| Case | Input vs 600–660 | Expected |
|---|---|---|
| Touches end (T01) | 660–720 | `true` |
| Touches start | 550–600 | `true` |
| Overlaps by 1 minute at the end | 659–720 | `false` |
| Overlaps by 1 minute at the start | 550–601 | `false` |
| Exact same slot | 600–660 | `false` |
| Contained | 610–650 | `false` |
| Encloses | 590–670 | `false` |

The touches-start test uses 550, not 540, because `now = 540` and AC1 would reject 540 for a separate reason.

---

### D2: `canBook` changes the caller's bookings (AC5). Confirmed. This is a separate defect and not the cause of T01.

**Evidence**
'''ts
bookings.push({ start, end });
return true;
'''
AC5 says the function returns Available/Unavailable *without changing booking data*. Any successful check adds an entry to the caller's array. Deterministic repro, once D1 is fixed:
'''ts
const bookings = [{ start: 600, end: 660 }];
canBook({ start: 660, end: 720, now: 540, blocked: false, bookings }); // true
canBook({ start: 660, end: 720, now: 540, blocked: false, bookings }); // false. The first check "booked" the slot
bookings.length; // 2, expected 1
'''

**Root cause**
The function does two jobs, an availability query and a reservation write. The comment ("keep the room's list current…") shows the write is deliberate, but AC5 forbids it.

**Fix (minimal)**
Delete the `bookings.push(...)` line and its comment. If the app relies on this side effect to save bookings, move that write into a separate `book()` function that calls `canBook` first. I haven't checked the callers, so this part is a hypothesis.

**Regression test**
'''ts
test('AC5: canBook does not mutate bookings', () => {
  const bookings = [{ start: 600, end: 660 }];
  const snapshot = structuredClone(bookings);
  canBook({ start: 660, end: 720, now: 540, blocked: false, bookings });
  canBook({ start: 660, end: 720, now: 540, blocked: false, bookings });
  expect(bookings).toEqual(snapshot);   // currently fails: length 2
});
'''
Optionally, pass `Object.freeze(bookings)` so that any future mutation throws.

**Risk to the test suite (hypothesis)**
If the `check()` helper reuses one module-level `bookings` array instead of building a new one each call, D2 makes tests depend on their order. Each passing "Available" test leaves a booking behind that can make a later test fail. The helper should create a new array on every call.

---

### Hypotheses and open questions (not confirmed as defects)
- **AC1, request starting at `now`:** `!(start > now)` rejects `start === now`. A slot starting at the current minute is arguably not "in the past". Ask what the rule should be. If it should be allowed, use `start >= now`. Test: `now = 540, 540–600` gives the agreed result.
- **AC2:** `end - start > 120` allows exactly 120 and rejects 121, which matches the criteria. Tests worth adding: 600–720 gives `true` and 600–721 gives `false`.
- **AC1, start ≥ end:** handled correctly by `start < end`. The 0–1440 bounds are also reasonable.
- **AC3:** handled correctly.
- **AC6 (UI on desktop and mobile):** this function can't show whether it's met. It needs a separate UI or end-to-end check.

---

### Summary
| Defect | Evidence | Root cause | Fix | Test |
|---|---|---|---|---|
| D1: touching bookings rejected (AC4) | T01 fails; `660 <= 660` is true | Inclusive `<=` / `>=` in the overlap check | Use strict `start < b.end && end > b.start` | Edge table above; T01 → `true` |
| D2: input array changed (AC5) | `bookings.push` adds an entry; a second identical check returns `false` | Query and write combined in one function | Remove the `push` | Snapshot or frozen-array test |

I haven't edited any code. Fixing D1 alone makes T01 pass. D2 should be fixed in the same change so that tests don't depend on each other.
```

Did the environment show that the skill was invoked? not shown — a prompt-only simulation has no
"skill used" indicator. The answer did follow the skill's output shape (a `defect | evidence | root
cause | fix | test` table) and its step 4 (a separate "Hypotheses" list).

---

## 7. Comparison — judged against the actual code

Do not assume the skill did better. Judge both answers against the code and against what your
tests showed. Write a short verdict in each cell, and give a reason where they differ.

| Criterion | No skill | With skill |
| --- | --- | --- |
| Correct root cause | Correct for both bugs: the inclusive `start <= b.end && end >= b.start` (BUG-A, `660 <= 660`) and `bookings.push` (BUG-B, AC5). It also says correctly that T01 cannot show BUG-B. | Correct for both bugs (D1 = BUG-A, D2 = BUG-B), same lines. Same verdict as without the skill — no difference here. |
| Reproducible test | Weak. The AC4 tests use `test.each`, which our course rules forbid (one test per ID). Its AC5 test does assert `.toBe(true)` first, so it is reproducible, but on the buggy code it fails on the FIRST call (BUG-A), not on the data — I ran it: `first = false`. | Weaker for BUG-B. Its AC5 test calls `canBook` twice on 660–720 with no `.toBe(true)` and only compares the data. I ran it on the buggy code: it PASSES (`bookings unchanged = true`), because BUG-A rejects 660–720 before the push. It cannot see BUG-B until BUG-A is fixed. The AC4 edge table is good (550–600, 659–720, 550–601). |
| Minimal proposed patch | Two hunks: the strict comparison (one line, plus an added comment) and deleting the push and its comment; it suggests one commit per bug. Correct and minimal. | Same two changes, each as one line; but it suggests fixing D2 "in the same change", which is not one change per bug. |
| Unsupported claims | "The AC5 test fails on its second `canBook` call" — false on the given code: the first call already returns false (BUG-A). | "currently fails: length 2" for its own AC5 test — false on the given code: it passes (see above). It also lists `start === now` as a possible AC1 defect; our AC1/T02 say start must be after now, so that one is a question, not a defect (it did label it a hypothesis). |
| Clarity of explanation | Clear: a table of guards for T01, then the two defects. | Clearer structure: reproduction, D1, D2, hypotheses, summary table — exactly the skill's step 7 output. More text for the same two findings. |

**Which bugs did each answer find?** (BUG-A, BUG-B, both, neither)

- No skill: both (BUG-A from the T01 failure, BUG-B by reading the `push` line).
- With skill: both (D1 = BUG-A, D2 = BUG-B), and it kept a separate list of hypotheses.
- Neither answer's AC5 test would have detected BUG-B on the code as given; my `BUG-B` test (720–780,
  touching nothing) did, because BUG-A could not hide it.

---

## 8. Task 6 — repair and regression

Review the proposed patch yourself, then make **one minimal change per bug**, one commit each.
Rerun the test that was failing, then the full suite.

### 8.1 The BUG-A patch

The change as a diff (`git diff`, or the old and the new line), then the real run:

```text
$ git diff app/src/booking.ts
diff --git a/week-08/app/src/booking.ts b/week-08/app/src/booking.ts
index 68ae0a5..455ce74 100644
--- a/week-08/app/src/booking.ts
+++ b/week-08/app/src/booking.ts
@@ -26,7 +26,7 @@ export function canBook({ start, end, now, blocked, bookings }: {
   if (end - start > 120) return false;
   if (blocked) return false;
   for (const b of bookings) {
-    if (start <= b.end && end >= b.start) return false;
+    if (start < b.end && end > b.start) return false;
   }
   // keep the room's list current with the slot that was just found free
   bookings.push({ start, end });

$ npx vitest run -t "BUG-A"     (then)     $ npx vitest run

 RUN  v3.2.7 /home/claude/se-practice/week-08/app

 ✓ src/booking.test.ts (21 tests | 20 skipped) 2ms

 Test Files  1 passed (1)
      Tests  1 passed | 20 skipped (21)
   Start at  19:44:53
   Duration  237ms (transform 62ms, setup 0ms, collect 32ms, tests 2ms, environment 0ms, prepare 60ms)



 RUN  v3.2.7 /home/claude/se-practice/week-08/app

 ❯ src/booking.test.ts (21 tests | 2 failed) 10ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T02 AC1: 540–570 starts exactly at the current time → Unavailable 1ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T03 AC1: 720–720 has zero duration → Unavailable 0ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T04 AC1: 750–720 is reversed → Unavailable 0ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > T05 AC1: 1380–1441 ends after 24:00 → Unavailable 0ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > X1 AC1: 1380–1440 ends exactly at 24:00 → Available 0ms
   ✓ AC1 — 0 ≤ start < end ≤ 1440 and start after now > AC1 boundary: 541–600 starts one minute after now → Available 0ms
   ✓ AC2 — at most 120 minutes > T06 AC2: 720–840 is exactly 120 minutes → Available 0ms
   ✓ AC2 — at most 120 minutes > T07 AC2: 720–841 is 121 minutes → Unavailable 0ms
   ✓ AC3 — blocked room > T13 AC3: 660–720 in a blocked room → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T01 AC4: 660–720 touches the end of 600–660 → Available 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T08 AC4: 570–600 touches the start of 600–660 → Available 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T09 AC4: 630–690 partially overlaps 600–660 → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T10 AC4: 570–690 contains 600–660 → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T11 AC4: 615–645 lies inside 600–660 → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T12 AC4: 600–660 is identical to the booking → Unavailable 0ms
   ✓ AC4 — overlaps rejected, touching allowed > T14 AC4: 630–690 with bookings = [] → Available 0ms
   ✓ AC4 — overlaps rejected, touching allowed > X2 AC4: 660–720 touches 600–660 and 720–780 at once → Available 0ms
   ✓ AC4 — overlaps rejected, touching allowed > AC4 boundary: 659–720 shares one minute (659) with 600–660 → Unavailable 0ms
   × AC5 — checking does not change the booking data > AC5: an Available check (660–720) leaves the bookings exactly as before 6ms
     → expected '[{"start":600,"end":660},{"start":660…' to be '[{"start":600,"end":660}]' // Object.is equality
   ✓ Week 08 regression tests > BUG-A AC4: 600–660 touches 540–600 and 660–720 on both sides → Available 0ms
   × Week 08 regression tests > BUG-B AC5: 720–780 touches nothing → Available, and the bookings are unchanged 1ms
     → expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  src/booking.test.ts > AC5 — checking does not change the booking data > AC5: an Available check (660–720) leaves the bookings exactly as before
AssertionError: expected '[{"start":600,"end":660},{"start":660…' to be '[{"start":600,"end":660}]' // Object.is equality

Expected: "[{"start":600,"end":660}]"
Received: "[{"start":600,"end":660},{"start":660,"end":720}]"

 ❯ src/booking.test.ts:101:38
     99|     const before = JSON.stringify(bookings);
    100|     expect(canBook({ start: 660, end: 720, now: 540, blocked: false, b…
    101|     expect(JSON.stringify(bookings)).toBe(before);
       |                                      ^
    102|     expect(bookings).toEqual([{ start: 600, end: 660 }]);
    103|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  src/booking.test.ts > Week 08 regression tests > BUG-B AC5: 720–780 touches nothing → Available, and the bookings are unchanged
AssertionError: expected '[{"start":600,"end":660},{"start":720…' to be '[{"start":600,"end":660}]' // Object.is equality

Expected: "[{"start":600,"end":660}]"
Received: "[{"start":600,"end":660},{"start":720,"end":780}]"

 ❯ src/booking.test.ts:115:38
    113|     const before = JSON.stringify(bookings);
    114|     expect(canBook({ start: 720, end: 780, now: 540, blocked: false, b…
    115|     expect(JSON.stringify(bookings)).toBe(before);
       |                                      ^
    116|   });
    117| });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 19 passed (21)
   Start at  19:44:54
   Duration  219ms (transform 39ms, setup 0ms, collect 34ms, tests 10ms, environment 0ms, prepare 43ms)
```

BUG-A is fixed: the `BUG-A` test, T01, T08, X2 and the 541–600 boundary pass, and T09–T12 (real
overlaps) still pass, so real overlaps are still rejected. The two remaining failures
are BUG-B: the Week 07 AC5 test now reaches the push and fails on the data, the right reason.

### 8.2 The BUG-B patch and the final run

The change as a diff, then the real output of the **full** suite. Every test must pass.

```text
$ git diff app/src/booking.ts
diff --git a/week-08/app/src/booking.ts b/week-08/app/src/booking.ts
index 455ce74..7ca8ab0 100644
--- a/week-08/app/src/booking.ts
+++ b/week-08/app/src/booking.ts
@@ -28,7 +28,5 @@ export function canBook({ start, end, now, blocked, bookings }: {
   for (const b of bookings) {
     if (start < b.end && end > b.start) return false;
   }
-  // keep the room's list current with the slot that was just found free
-  bookings.push({ start, end });
   return true;
 }

$ npx vitest run -t "BUG-B"     (then)     $ npx vitest run

 RUN  v3.2.7 /home/claude/se-practice/week-08/app

 ✓ src/booking.test.ts (21 tests | 20 skipped) 2ms

 Test Files  1 passed (1)
      Tests  1 passed | 20 skipped (21)
   Start at  19:45:14
   Duration  206ms (transform 41ms, setup 0ms, collect 40ms, tests 2ms, environment 0ms, prepare 45ms)



 RUN  v3.2.7 /home/claude/se-practice/week-08/app

 ✓ src/booking.test.ts (21 tests) 6ms

 Test Files  1 passed (1)
      Tests  21 passed (21)
   Start at  19:45:15
   Duration  262ms (transform 55ms, setup 0ms, collect 45ms, tests 6ms, environment 0ms, prepare 60ms)
```

The diff removes one statement (`bookings.push`) and the comment that described it, which no longer
describes anything. The checker counts the body change as code lines only (B3).

---

## 9. What still fails, and what AI-assisted debugging cannot do

### 9.1 Checks I am keeping as FAIL or ERROR

Use the same IDs as `known_fails` in `submission.yml`. Write `none` if the run is clean.

| Check | Why it stays |
| --- | --- |
| | |

### 9.2 One limitation of AI-assisted debugging

<!-- Use something that actually happened in sections 5-8. 20 words or more. -->
-

---

## 10. Conclusion (80–150 words)

<!-- Answer both, in your own words, without the assistant (3-5 sentences, as the deck asks):
     (a) Did the skill help? Show it with one row of section 7.
     (b) What did your tests actually prove - and what did they not?
     Worthless: "The skill made the AI much better at debugging."
     Worth everything: "Both answers found BUG-A from the T01 failure. Only the skill answer
     separated BUG-B as a hypothesis instead of a fact, because step 4 told it to. BUG-B was only
     visible after the BUG-A patch: the AC5 test had been failing for the wrong reason." -->

<!-- Write your conclusion below this line -->
