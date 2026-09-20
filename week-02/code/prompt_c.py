import unittest


def _is_number(value):
    """True for int/float, but not bool (True/False are ints in Python)."""
    return isinstance(value, (int, float)) and not isinstance(value, bool)


def analyze_marks(marks, pass_mark=50):
    """Analyze a collection of marks (0-100).

    Returns a dict with:
        average   - mean of the marks, rounded to 2 decimals
        highest   - largest mark
        lowest    - smallest mark
        pass_rate - percentage of marks >= pass_mark, rounded to 2 decimals

    Raises ValueError for an empty collection, non-numeric values,
    NaN, values outside 0-100, or an invalid pass_mark.
    """
    try:
        marks = list(marks)
    except TypeError:
        raise ValueError("marks must be a list or other iterable of numbers")

    if not marks:
        raise ValueError("marks must not be empty")

    for m in marks:
        if not _is_number(m):
            raise ValueError(f"non-numeric mark: {m!r}")
        # NaN fails this comparison too, so it is rejected here as well.
        if not 0 <= m <= 100:
            raise ValueError(f"mark out of range 0-100: {m!r}")

    if not _is_number(pass_mark) or not 0 <= pass_mark <= 100:
        raise ValueError(f"pass_mark must be a number from 0 to 100: {pass_mark!r}")

    passed = sum(1 for m in marks if m >= pass_mark)

    return {
        "average": round(sum(marks) / len(marks), 2),
        "highest": max(marks),
        "lowest": min(marks),
        "pass_rate": round(passed / len(marks) * 100, 2),
    }


class TestAnalyzeMarks(unittest.TestCase):
    def test_example_from_spec(self):
        self.assertEqual(
            analyze_marks([40, 60, 80], 50),
            {"average": 60, "highest": 80, "lowest": 40, "pass_rate": 66.67},
        )

    def test_single_mark_passing(self):
        self.assertEqual(
            analyze_marks([75]),
            {"average": 75, "highest": 75, "lowest": 75, "pass_rate": 100.0},
        )

    def test_single_mark_failing(self):
        self.assertEqual(
            analyze_marks([20]),
            {"average": 20, "highest": 20, "lowest": 20, "pass_rate": 0.0},
        )

    def test_decimals(self):
        result = analyze_marks([49.5, 50.5, 72.25])
        self.assertEqual(result["average"], 57.42)
        self.assertEqual(result["highest"], 72.25)
        self.assertEqual(result["lowest"], 49.5)
        self.assertEqual(result["pass_rate"], 66.67)

    def test_custom_pass_mark(self):
        marks = [40, 60, 80]
        self.assertEqual(analyze_marks(marks, 70)["pass_rate"], 33.33)
        self.assertEqual(analyze_marks(marks, 30)["pass_rate"], 100.0)

    def test_pass_mark_is_inclusive(self):
        self.assertEqual(analyze_marks([50, 49.99], 50)["pass_rate"], 50.0)

    def test_boundary_values_allowed(self):
        result = analyze_marks([0, 100])
        self.assertEqual(result["lowest"], 0)
        self.assertEqual(result["highest"], 100)

    def test_empty_list(self):
        with self.assertRaises(ValueError):
            analyze_marks([])

    def test_text_value(self):
        with self.assertRaises(ValueError):
            analyze_marks([50, "abc", 70])

    def test_numeric_string_rejected(self):
        with self.assertRaises(ValueError):
            analyze_marks([50, "60"])

    def test_bool_and_none_rejected(self):
        with self.assertRaises(ValueError):
            analyze_marks([True, 50])
        with self.assertRaises(ValueError):
            analyze_marks([None, 50])

    def test_below_zero(self):
        with self.assertRaises(ValueError):
            analyze_marks([50, -1])

    def test_above_hundred(self):
        with self.assertRaises(ValueError):
            analyze_marks([50, 100.1])

    def test_nan_rejected(self):
        with self.assertRaises(ValueError):
            analyze_marks([50, float("nan")])

    def test_invalid_pass_mark(self):
        with self.assertRaises(ValueError):
            analyze_marks([50], pass_mark=101)
        with self.assertRaises(ValueError):
            analyze_marks([50], pass_mark="fifty")


if __name__ == "__main__":
    unittest.main()