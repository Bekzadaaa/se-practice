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
(paste here)
```

**The assistant's answer, pasted unedited:**

```text
(paste here)
```

---

## 6. Task 5 — with the skill

**Another fresh chat, with `bug-detector` enabled.** Send exactly the same input as in section 5.
Only the question changes, to the deck's skill question:

```text
(paste here)
```

**The assistant's answer, pasted unedited:**

```text
(paste here)
```

Did the environment show that the skill was invoked? yes / no / not shown

---

## 7. Comparison — judged against the actual code

Do not assume the skill did better. Judge both answers against the code and against what your
tests showed. Write a short verdict in each cell, and give a reason where they differ.

| Criterion | No skill | With skill |
| --- | --- | --- |
| Correct root cause | | |
| Reproducible test | | |
| Minimal proposed patch | | |
| Unsupported claims | | |
| Clarity of explanation | | |

**Which bugs did each answer find?** (BUG-A, BUG-B, both, neither)

-

---

## 8. Task 6 — repair and regression

Review the proposed patch yourself, then make **one minimal change per bug**, one commit each.
Rerun the test that was failing, then the full suite.

### 8.1 The BUG-A patch

The change as a diff (`git diff`, or the old and the new line), then the real run:

```text
(paste here)
```

### 8.2 The BUG-B patch and the final run

The change as a diff, then the real output of the **full** suite. Every test must pass.

```text
(paste here)
```

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
