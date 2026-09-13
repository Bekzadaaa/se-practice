# AI Prompts Log — Week 01

## Initial prompt
Build a small program that processes a list of student marks and prints: average, highest, lowest, and pass rate.

Prompt completeness score: 73%

## Clarifying question #1
**Rocket asked:** Who will be using this tool?
Options: A teacher or instructor / Multiple teachers or staff / Students checking results / Other

**My answer:** A teacher or instructor

## Rocket's rewritten prompt (score: 91%)

"A clean, single-user web tool for teachers to input a list of student marks 
and instantly view calculated results — including average score, highest mark, 
lowest mark, and pass rate. The tool is designed for quick, frictionless use 
with no login required. Building with Next.js and TypeScript."

## What Rocket built (unprompted additions)

- Full web app (Next.js + TypeScript) — I only asked for "a small program"
- Custom "Maximum possible mark" setting (default 100)
- Configurable pass threshold slider (default 50/100 = 50%) — matches spec by luck,
  but it invented the concept of a UI slider instead of a fixed rule
- Grade bands A–F (≥80%, 65-79%, 50-64%, 35-49%, <35%) — completely unrequested,
  spec never asked for letter grades
- Extra stats: median, std deviation — not in the spec
- Grade distribution bar chart
- Sortable/filterable results table
- Bulk paste import + CSV export
- Student name field per mark (spec only needs a list of numbers)
- "No login required" — Rocket assumed multi-feature dashboard, not console script

## Test results (Part 2 — Rocket / MarkStats)

### Case A: 85, 23, 45, 90, 92
Rocket output: avg 67.00, highest 92, lowest 23, pass rate 60.0% (3/5)
Spec expects: avg 67.00, highest 92, lowest 23, pass rate 60.0%
Match: YES

### Case B: 88, 47, -5, 101, abc, 73, 50, , 100
(Note: first attempt had two input errors on my side — typed 85 instead of 88, 
and accidentally moved the pass threshold slider to 70 instead of 50. Retested 
with correct inputs below.)

Rocket output: avg 71.60, highest 100, lowest 47, pass rate 80.0% (4/5)
Spec expects: avg 71.60, highest 100, lowest 47, pass rate 80.0%
Match: YES (once inputs were corrected)
Correctly rejected -5 and 101 as invalid (highlighted, excluded from stats).
Could not test "abc" / empty text directly — Mark field is numeric-only by design,
so it silently prevents invalid text entirely rather than parsing and rejecting it.

### Case C: 10, 20, 30
Rocket output: avg 20.00, highest 30, lowest 10, pass rate 0.0%
Spec expects: avg 20.00, highest 30, lowest 10, pass rate 0.0%
Match: YES

### Case D: abc, , xyz
Rocket output: "No marks entered yet — Enter at least one mark to get started"
Spec expects: clear message, no crash
Match: PARTIAL — no crash, clear message, but test doesn't map cleanly since
the UI never accepts non-numeric text in the first place (structural mismatch,
not the same failure mode as a raw-string parser).

## Bulk paste test (Case D equivalent): abc / xyz / 50
Rocket output: "1 valid mark entered", stats computed only for 50 
(avg 50.00, pass rate 100%, grade C)
Spec expects: invalid entries ignored, no crash — satisfied
BUT: no indication given to the user that 2 of 3 pasted rows were invalid 
and silently dropped. A teacher pasting a large list would have no way to 
know some rows were ignored, or which ones.

## Defect fix

**Prompt used:**
"When I paste marks and some rows are invalid (not a number, or not between 
0-100), the import silently ignores them. Please show a message after import 
telling the user how many rows were skipped and why (e.g. "2 rows skipped: 
not valid numbers"), so nothing gets silently dropped."

**Result:** Fixed.
- Added a warning toast after import: "Imported 1 mark. 2 rows skipped: 
  2 not valid numbers."
- Categorized skip reasons: "not valid numbers" vs "out of range (0-max)"
- Bonus: also fixed an unrelated bug — out-of-range values (marks > maxMark) 
  were not being caught during paste import before; now they are.

**What this tells me:** The AI can respond precisely to a well-specified bug 
report, and even fixes adjacent issues it notices along the way. But this also 
shows how much depended on ME noticing the silent-drop problem first — Rocket 
never flagged it on its own during the original build.