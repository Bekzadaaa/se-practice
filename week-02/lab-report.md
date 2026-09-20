# Lab report — Practice #02: The Prompt Is an Engineering Input

**Name: Sultan Bekzada**
**Group: Monday 16:00-19:00**
**Date: 20.09.2026**

> Fill in every section. **Do not delete or renumber the headings** — the grading pass reads them
> by number. If something did not happen, write "did not happen" and why; an empty section and a
> fabricated one are graded the same way.

---

## 1. The frozen experiment

| | |
| --- | --- |
| AI assistant | Claude |
| Exact model name | Claude Sonnet 5 |
| Implementation language | Python |
| Date of the runs | 20.09.2026 |

**Non-Python students only** — paste your substituted Prompt B text here, so the substitution can
be checked:

```
n/a — used Python
```

**Confirmations:**

- Each prompt was sent in a **fresh chat**: yes 
- No follow-up questions were asked before Part 7: yes 
- Every output was saved **before** any editing: yes 

---

## 2. Prompt A — minimal

**Prompt sent** (should be exactly one sentence): 

```
Write Python code to analyze student marks.

```

**Assumptions the AI made that I never gave it** — list them, one per line. A data format, a pass
threshold, a rounding rule, an input method, an invented feature all count.

1.Input format: expects a CSV file with one row per student and one column per subject instead of a simple list of numbers
2.A default pass mark of 40 and a separate configurable max_mark of 100 — neither value nor even the concept of two separate thresholds was requested
3.An entire unrequested feature set built on external libraries
4.It uses two external libraries (pandas and numpy) even though nothing in the task said external libraries are allowed — and if they're not installed, the code doesn't even run at all 
**Questions it should have asked and did not:**

1.What does "analyze" mean here — a single summary statistic for one list of markss or a full multi-subject, multi-student report?
2.How should invalid input be handled — rejected with an error, or silently coerced/ignored as this code does by converting bad values to NaN?

**Is the function named `analyze_marks` with the required signature?** no — there is no function called analyze_marks in the code at all. The closest are analyze_students() and analyze_subjects(), neither matches

**First impression before testing** (one sentence — you will compare this with section 6 later):    Impressively polished and complete-looking output for a one-line prompt, but it solves a completely differen problem than the one specified — no `analyze_marks` function exists at all and it relies on two external libraries despite none being requested.

---

## 3. Prompt B — structured context

**Prompt sent** (paste it in full, including any substitutions):

```
You are a Python developer. Implement analyze_marks(marks, pass_mark=50). Return
average, highest, lowest, and pass_rate in a dictionary. Accept marks from 0 to 100;
raise ValueError for an empty list, non-numeric values, or out-of-range values. Use
no external libraries. Return code plus a short explanation.

```

**What B fixed compared to A:**

1.Now it actually made a function called analyze_marks with the right inputs, exactly like the task asked.
2.It actually raises an error when the marks are empty, or not a number, or out of the 0-100 range, instead of just ignoring bad marks like Prompt A did.

**What B still leaves open:**

1.It didn't write any tests, so I have no proof it actually works besides just reading the code myself.
2.It doesn't round the numbers — when I ran the test, pass_rate came out as 66.66666666666666 instead of a nice 66.67. It still passed the test because the checker allows small differences, but it's not a clean number.

---

## 4. Prompt C — examples and tests

**What I appended to Prompt B:**

```
Example: analyze_marks([40, 60, 80], 50) → average 60, highest 80, lowest 40,
pass_rate 66.67. Include tests for: one mark, decimals, custom pass_mark, empty list,
text value, and marks below 0 or above 100. State any remaining assumptions before
the code.

```

**Tests the AI wrote for itself** — how many, and which situations do they cover?

| Situation | Covered by the AI's tests? |
| --- | --- |
| one mark | yes |
| decimals | yep |
| custom pass_mark | yes |
| empty list | yes |
| text value | yes |
| below 0 / above 100 | yes |

**Do the AI's own tests pass against the AI's own code?** yes, all 15 tests passed when i ran them with `python -m unittest prompt_c -v`

**Do they agree with the harness in section 6?** yes, the real test file also gave 6 out of 6 PASS, so no difference between the AI's own tests and the actual harnesss

**Assumptions C stated explicitly before the code:**
Before writin the code it said it will treat bool as not a real number even though Python normally sees True/False as 1 and 0. It also said it will reject NaN values and it will check that pass_mark is a real number between 0 and 100 too, not just the marks list
---

## 5. Prompt D — my combined prompt

**The complete prompt I wrote** (one message, sent to a fresh chat):

```
You are a Python developer. Implement analyze_marks(marks, pass_mark=50). Return
average, highest, lowest, and pass_rate in a dictionary. Accept marks from 0 to 100;
raise ValueError for an empty list, non-numeric values (including booleans and None),
or out-of-range values. Also raise ValueError if pass_mark itself is not a valid
number between 0 and 100. Use no external libraries.

One thing to be careful about: a mark that is exactly equal to pass_mark still counts
as passing, not just marks that are strictly higher.

Example: analyze_marks([40, 60, 80], 50) → average 60, highest 80, lowest 40,
pass_rate 66.67.

Include tests for: one mark, decimal marks, a custom pass_mark, a mark exactly equal
to pass_mark, an empty list, a text value, a boolean value, and marks below 0 or above 100.

Round average and pass_rate to 2 decimal places.

State any remaining assumptions before the code

```

**What I deliberately added that A, B and C did not have:**

1.I said clearly that a mark equal to pass_mark still counts as a pass, so the AI can't get confused and use ">" instead of ">=". This is the ambiguity thing I found
2.I also asked it to check pass_mark itself, not just the marks — like if someone puts pass_mark="fifty" or pass_mark=200, it should give an error too
3.I basically took the example and tests from C and mixed them with the strict rules from B, so this time nothing got left out

**The ambiguity I found in the specification, and how I resolved it inside Prompt D:**
The task sayss a mark passes when it's ">= pass_mark" but if you just skim it you could think it means only ">" and not "or equal to". Case 3 uses marks [49.5, 50] with pass_mark 50 and it wants pass_rate to be 50%, so the mark that's exactly the same as pass_mark still has to count as passing. If someone used ">" instead of ">=" by mistake, pass_rate would be 0% instead of 50% and the test would fail. So in Prompt D I just wrote it out plainly: "a mark equal to pass_mark still counts as passing" so the AI can't mess this part up
---

## 6. Test results — the evidence

Six cases × four prompts. Verdicts are **PASS**, **FAIL** or **ERROR** only.

| # | Call | Required | A | B | C | D |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `analyze_marks([40, 60, 80], 50)` | avg 60 · high 80 · low 40 · rate 66.67 | error | pass | pass | pass |
| 2 | `analyze_marks([100], 50)` | avg 100 · high 100 · low 100 · rate 100 | error | pass | pass | pass |
| 3 | `analyze_marks([49.5, 50], 50)` | avg 49.75 · high 50 · low 49.5 · rate 50 | error | pass | pass | pass |
| 4 | `analyze_marks([], 50)` | raises ValueError | error | pass | pass | pass |
| 5 | `analyze_marks([40, "60"], 50)` | raises ValueError | error | pass | pass | pass |
| 6 | `analyze_marks([-1, 50, 101], 50)` | raises ValueError |error | pass | pass | pass |
| | **Totals** | | 0/6 | 6/6 | 6/6 | 6/6 |

**For every FAIL and ERROR above, one line: what was returned or raised instead.**

| Prompt | Case | What actually happened |
| --- | --- | --- |
| A | 1-6 | The file uses numpy and pandas which aren't installed, so it crashes on import before 
Python can even check if analyze_marks exists. All six cases count as ERROR |
| | | |
| | | |

### Pasted terminal output — all four runs

> This is the part that makes the table above count. Paste the **whole** output, unedited,
> including the header lines. A table with nothing behind it is not accepted.

**Prompt A**

```
PS C:\Users\LENOVO\se-practice\week-02> py tests/test_analyze_marks.py code/prompt_a.py
ERROR: code\prompt_a.py could not be imported: ModuleNotFoundError: No module named 'numpy'
The file must define analyze_marks and must not crash on import.

```

**Prompt B**

```
PS C:\Users\LENOVO\se-practice\week-02> py tests/test_analyze_marks.py code/prompt_b.py
========================================================================
analyze_marks harness — code/prompt_b.py
tolerance for numeric comparison: 0.01
========================================================================
SIGNATURE: ok
------------------------------------------------------------------------
case 1  PASS   analyze_marks([40, 60, 80], 50)
          expect: average=60.0, highest=80, lowest=40, pass_rate=66.67
          got   : average=60.0, highest=80, lowest=40, pass_rate=66.66666666666666
------------------------------------------------------------------------
case 2  PASS   analyze_marks([100], 50)
          expect: average=100.0, highest=100, lowest=100, pass_rate=100.0
          got   : average=100.0, highest=100, lowest=100, pass_rate=100.0
------------------------------------------------------------------------
case 3  PASS   analyze_marks([49.5, 50], 50)
          expect: average=49.75, highest=50, lowest=49.5, pass_rate=50.0
          got   : average=49.75, highest=50, lowest=49.5, pass_rate=50.0
------------------------------------------------------------------------
case 4  PASS   analyze_marks([], 50)
          expect: ValueError
          got   : raised ValueError: marks must not be empty
------------------------------------------------------------------------
case 5  PASS   analyze_marks([40, '60'], 50)
          expect: ValueError
          got   : raised ValueError: non-numeric mark: '60'
------------------------------------------------------------------------
case 6  PASS   analyze_marks([-1, 50, 101], 50)
          expect: ValueError
          got   : raised ValueError: mark out of range (0-100): -1
------------------------------------------------------------------------
RESULT  6 PASS · 0 FAIL · 0 ERROR   (code/prompt_b.py)
========================================================================

```

**Prompt C**

```
PS C:\Users\LENOVO\se-practice\week-02> py tests/test_analyze_marks.py code/prompt_c.py
========================================================================
analyze_marks harness — code/prompt_c.py
tolerance for numeric comparison: 0.01
========================================================================
SIGNATURE: ok
------------------------------------------------------------------------
case 1  PASS   analyze_marks([40, 60, 80], 50)
          expect: average=60.0, highest=80, lowest=40, pass_rate=66.67
          got   : average=60.0, highest=80, lowest=40, pass_rate=66.67
------------------------------------------------------------------------
case 2  PASS   analyze_marks([100], 50)
          expect: average=100.0, highest=100, lowest=100, pass_rate=100.0
          got   : average=100.0, highest=100, lowest=100, pass_rate=100.0
------------------------------------------------------------------------
case 3  PASS   analyze_marks([49.5, 50], 50)
          expect: average=49.75, highest=50, lowest=49.5, pass_rate=50.0
          got   : average=49.75, highest=50, lowest=49.5, pass_rate=50.0
------------------------------------------------------------------------
case 4  PASS   analyze_marks([], 50)
          expect: ValueError
          got   : raised ValueError: marks must not be empty
------------------------------------------------------------------------
case 5  PASS   analyze_marks([40, '60'], 50)
          expect: ValueError
          got   : raised ValueError: non-numeric mark: '60'
------------------------------------------------------------------------
case 6  PASS   analyze_marks([-1, 50, 101], 50)
          expect: ValueError
          got   : raised ValueError: mark out of range 0-100: -1
------------------------------------------------------------------------
RESULT  6 PASS · 0 FAIL · 0 ERROR   (code/prompt_c.py)
========================================================================

```

**Prompt D**

```
PS C:\Users\LENOVO\se-practice\week-02> py tests/test_analyze_marks.py code/prompt_d.py
========================================================================
analyze_marks harness — code/prompt_d.py
tolerance for numeric comparison: 0.01
========================================================================
SIGNATURE: ok
------------------------------------------------------------------------
case 1  PASS   analyze_marks([40, 60, 80], 50)
          expect: average=60.0, highest=80, lowest=40, pass_rate=66.67
          got   : average=60.0, highest=80, lowest=40, pass_rate=66.67
------------------------------------------------------------------------
case 2  PASS   analyze_marks([100], 50)
          expect: average=100.0, highest=100, lowest=100, pass_rate=100.0
          got   : average=100.0, highest=100, lowest=100, pass_rate=100.0
------------------------------------------------------------------------
case 3  PASS   analyze_marks([49.5, 50], 50)
          expect: average=49.75, highest=50, lowest=49.5, pass_rate=50.0
          got   : average=49.75, highest=50, lowest=49.5, pass_rate=50.0
------------------------------------------------------------------------
case 4  PASS   analyze_marks([], 50)
          expect: ValueError
          got   : raised ValueError: marks must not be empty
------------------------------------------------------------------------
case 5  PASS   analyze_marks([40, '60'], 50)
          expect: ValueError
          got   : raised ValueError: mark must be a number, got '60'
------------------------------------------------------------------------
case 6  PASS   analyze_marks([-1, 50, 101], 50)
          expect: ValueError
          got   : raised ValueError: mark must be between 0 and 100, got -1
------------------------------------------------------------------------
RESULT  6 PASS · 0 FAIL · 0 ERROR   (code/prompt_d.py)
========================================================================

```

---

## 7. Scoring

0–2 per criterion, using the rubric in `README.md` Part 7.

| Criterion | A | B | C | D |
| --- | --- | --- | --- | --- |
| Correctness (cases passed) | 0 | 2 | 2 | 2 |
| Requirement coverage | 0 | 2 | 2 | 2 |
| Verifiability (tests) | 0 | 0 | 2 | 2 |
| Assumptions stated | 0 | 1 | 2 | 2 |
| Noise (2 = none) | 0 | 2 | 1 | 1 |
| **Total / 10** | 0 | 7 | 9 | 9 |

**Prompt length, in words:** A ≈ 6 · B ≈ 45 · C ≈ 90 · D ≈ 130

**Words added per point gained** — B over A, C over B, D over C. One line on what that ratio says:
Going from A to B I added like 39 more words and got 7 more points, so that was really worth it. Going from B to C I added like 45 more words but only got 2 more points, so it wasn't as good of a deal. Going from C to D I added like 40 more words and got 0 extra points on the test, but I still think it was worth doing because it made one confusing part of the rules clear
---

## 8. Conclusion — 150–200 words

Answer in this order: (1) which prompt scored best, and whether it is the one you would actually
use at work; (2) which single addition bought the most correctness, naming the exact case that
changed verdict; (3) what was pure noise; (4) the ambiguity and your resolution.

Name test cases and real returned values. "More detailed prompts work better" scores zero.

```
(150–200 words)


Prompt D got the best score (9/10, same as C), and yeah I would actually use D at work because 
it doesn't leave anything up to guessing

The biggest jump was from A to B. Prompt A got 0 out of 6 because there was no function called 
analyze_marks at all, it just made a totally different program with pandas and numpy. Prompt B 
fixed everything and got 6 out of 6 just by giving the exact function name, what it should return, 
and the validation rules

C and D didn't really add more correctness on the test, they mostly just added more tests than I 
even asked for (C wrote 15, D wrote 17), so that part felt like extra stuff I didn't really need 
for the test to pass

The confusing part I found was case 3: marks [49.5, 50] with pass_mark 50 should give pass_rate 
50%, meaning if a mark is exactly equal to pass_mark it still has to count as passing. If someone 
used ">" instead of ">=" it would give 0% instead of 50% and fail. In Prompt D I just said it 
straight up: a mark equal to pass_mark still counts as passing, so there's no room to get it wrong

```

**Word count:** 180 (without counting special characters) 

---

## 9. Two questions for the debrief

Written before class, answered in class.

1.Prompt A completely ignored what "student marks" actually means in this task and built a whole different program with a CSV file and external libraries — how do you write a prompt short enough to stay "minimal" but still avoid the AI going in a totally wrong direction?

2.C and D both wrote way more tests than the task actually needed (15 and 17 tests when only 6 cases are checked) — is writing extra tests actually a bad thing, or is it fine since more testing usually can't hurt?
