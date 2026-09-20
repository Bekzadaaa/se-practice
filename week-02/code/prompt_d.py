import unittest


def _validate_number(value, name):
    """Raise ValueError unless value is a real int/float in [0, 100]."""
    # bool is a subclass of int, so it must be excluded explicitly.
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise ValueError(f"{name} must be a number, got {value!r}")
    # Written this way so NaN (which fails every comparison) is rejected too.
    if not (0 <= value <= 100):
        raise ValueError(f"{name} must be between 0 and 100, got {value!r}")


def analyze_marks(marks, pass_mark=50):
    """
    Analyze a collection of marks.

    Returns a dict with:
        average   - mean of the marks, rounded to 2 decimal places
        highest   - the highest mark
        lowest    - the lowest mark
        pass_rate - percentage of marks >= pass_mark, rounded to 2 decimal places

    Raises ValueError for an empty list, non-numeric marks (including bool
    and None), marks outside 0-100, or an invalid pass_mark.
    """
    _validate_number(pass_mark, "pass_mark")

    if not isinstance(marks, (list, tuple)):
        raise ValueError("marks must be a list or tuple of numbers")
    if len(marks) == 0:
        raise ValueError("marks must not be empty")

    for mark in marks:
        _validate_number(mark, "mark")

    total = len(marks)
    passed = sum(1 for mark in marks if mark >= pass_mark)  # equal counts as a pass

    return {
        "average": round(sum(marks) / total, 2),
        "highest": max(marks),
        "lowest": min(marks),
        "pass_rate": round(passed * 100 / total, 2),
    }


class TestAnalyzeMarks(unittest.TestCase):

    def test_example_from_spec(self):
        result = analyze_marks([40, 60, 80], 50)
        self.assertEqual(result["average"], 60)
        self.assertEqual(result["highest"], 80)
        self.assertEqual(result["lowest"], 40)
        self.assertEqual(result["pass_rate"], 66.67)

    def test_default_pass_mark_is_50(self):
        self.assertEqual(analyze_marks([40, 60, 80]), analyze_marks([40, 60, 80], 50))

    def test_single_mark_passing(self):
        result = analyze_marks([75])
        self.assertEqual(result, {"average": 75, "highest": 75, "lowest": 75, "pass_rate": 100.0})

    def test_single_mark_failing(self):
        result = analyze_marks([30])
        self.assertEqual(result, {"average": 30, "highest": 30, "lowest": 30, "pass_rate": 0.0})

    def test_decimal_marks(self):
        result = analyze_marks([50.5, 49.5, 75.25])
        self.assertEqual(result["average"], 58.42)   # 175.25 / 3 = 58.4166...
        self.assertEqual(result["highest"], 75.25)
        self.assertEqual(result["lowest"], 49.5)
        self.assertEqual(result["pass_rate"], 66.67)  # 50.5 and 75.25 pass

    def test_custom_pass_mark(self):
        self.assertEqual(analyze_marks([40, 60, 80], 70)["pass_rate"], 33.33)
        self.assertEqual(analyze_marks([40, 60, 80], 30)["pass_rate"], 100.0)
        self.assertEqual(analyze_marks([40, 60, 80], 90)["pass_rate"], 0.0)

    def test_mark_exactly_equal_to_pass_mark_passes(self):
        self.assertEqual(analyze_marks([50], 50)["pass_rate"], 100.0)
        self.assertEqual(analyze_marks([50, 49.99], 50)["pass_rate"], 50.0)
        self.assertEqual(analyze_marks([60, 60, 40], 60)["pass_rate"], 66.67)

    def test_boundary_values_are_valid(self):
        self.assertEqual(analyze_marks([0, 100], 0)["pass_rate"], 100.0)
        self.assertEqual(analyze_marks([0, 100], 100)["pass_rate"], 50.0)

    def test_empty_list(self):
        with self.assertRaises(ValueError):
            analyze_marks([])

    def test_text_value(self):
        for bad in (["abc"], [50, "60"], [70, "eighty", 90]):
            with self.subTest(marks=bad):
                with self.assertRaises(ValueError):
                    analyze_marks(bad)

    def test_boolean_value(self):
        for bad in ([True], [50, False], [True, False, 70]):
            with self.subTest(marks=bad):
                with self.assertRaises(ValueError):
                    analyze_marks(bad)

    def test_none_value(self):
        with self.assertRaises(ValueError):
            analyze_marks([50, None])

    def test_marks_below_zero(self):
        with self.assertRaises(ValueError):
            analyze_marks([50, -1])
        with self.assertRaises(ValueError):
            analyze_marks([-0.01])

    def test_marks_above_100(self):
        with self.assertRaises(ValueError):
            analyze_marks([50, 101])
        with self.assertRaises(ValueError):
            analyze_marks([100.01])

    def test_nan_and_infinity_rejected(self):
        for bad in (float("nan"), float("inf"), float("-inf")):
            with self.subTest(value=bad):
                with self.assertRaises(ValueError):
                    analyze_marks([50, bad])

    def test_marks_not_a_list(self):
        for bad in (None, 75, "75"):
            with self.subTest(marks=bad):
                with self.assertRaises(ValueError):
                    analyze_marks(bad)

    def test_invalid_pass_mark(self):
        for bad in (-1, 101, "50", None, True, float("nan")):
            with self.subTest(pass_mark=bad):
                with self.assertRaises(ValueError):
                    analyze_marks([40, 60, 80], bad)


if __name__ == "__main__":
    unittest.main()