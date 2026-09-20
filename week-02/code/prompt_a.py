#!/usr/bin/env python3
"""
Student Marks Analyzer
----------------------
Analyzes student marks from a CSV file (or built-in sample data).

Expected CSV format (one row per student, one column per subject):

    name,Math,Physics,Chemistry,English,History
    Alice,88,92,79,85,90
    Bob,45,52,38,60,55
    ...

Usage:
    python student_marks_analysis.py                    # uses sample data
    python student_marks_analysis.py marks.csv          # your own data
    python student_marks_analysis.py marks.csv --plots  # also save charts
    python student_marks_analysis.py marks.csv --pass-mark 50 --max-mark 100

Requires: pandas, numpy (and matplotlib for --plots)
"""

import argparse
import sys

import numpy as np
import pandas as pd


# --------------------------------------------------------------------------- #
# Data loading
# --------------------------------------------------------------------------- #
def make_sample_data(n_students: int = 30, seed: int = 42) -> pd.DataFrame:
    """Generate realistic sample marks so the script runs out of the box."""
    rng = np.random.default_rng(seed)
    subjects = ["Math", "Physics", "Chemistry", "English", "History"]

    # Each student has an overall "ability", plus per-subject noise
    ability = rng.normal(68, 12, n_students)
    data = {
        s: np.clip(ability + rng.normal(0, 9, n_students), 0, 100).round(0)
        for s in subjects
    }
    df = pd.DataFrame(data)
    df.insert(0, "name", [f"Student {i + 1:02d}" for i in range(n_students)])
    return df


def load_data(path: str | None) -> pd.DataFrame:
    if path is None:
        print("No file given - using generated sample data.\n")
        return make_sample_data()

    df = pd.read_csv(path)
    if "name" not in df.columns:
        df = df.rename(columns={df.columns[0]: "name"})
    return df


def clean_data(df: pd.DataFrame, max_mark: float) -> tuple[pd.DataFrame, list[str]]:
    """Coerce marks to numbers, flag bad values, and return (df, subject_list)."""
    subjects = [c for c in df.columns if c != "name"]
    if not subjects:
        sys.exit("Error: no subject columns found.")

    df = df.copy()
    for s in subjects:
        df[s] = pd.to_numeric(df[s], errors="coerce")  # text -> NaN

    missing = df[subjects].isna().sum().sum()
    if missing:
        print(f"Note: {missing} missing/non-numeric mark(s) found; they are "
              f"ignored in averages.\n")

    out_of_range = ((df[subjects] < 0) | (df[subjects] > max_mark)).sum().sum()
    if out_of_range:
        print(f"Warning: {out_of_range} mark(s) outside 0-{max_mark:g}.\n")

    return df, subjects


# --------------------------------------------------------------------------- #
# Analysis
# --------------------------------------------------------------------------- #
def assign_grade(pct: float) -> str:
    if pd.isna(pct):
        return "N/A"
    if pct >= 90: return "A+"
    if pct >= 80: return "A"
    if pct >= 70: return "B"
    if pct >= 60: return "C"
    if pct >= 50: return "D"
    return "F"


def analyze_students(df, subjects, max_mark, pass_mark) -> pd.DataFrame:
    """Per-student totals, average, percentage, grade, rank, and failed subjects."""
    res = df[["name"]].copy()
    res["total"] = df[subjects].sum(axis=1)
    res["average"] = df[subjects].mean(axis=1).round(2)
    res["percentage"] = (res["average"] / max_mark * 100).round(2)
    res["grade"] = res["percentage"].apply(assign_grade)
    res["rank"] = res["total"].rank(ascending=False, method="min").astype(int)
    res["failed_subjects"] = df[subjects].apply(
        lambda row: ", ".join(s for s in subjects if row[s] < pass_mark) or "-",
        axis=1,
    )
    return res.sort_values("rank").reset_index(drop=True)


def analyze_subjects(df, subjects, pass_mark) -> pd.DataFrame:
    """Per-subject descriptive statistics and pass rate."""
    stats = pd.DataFrame({
        "mean": df[subjects].mean(),
        "median": df[subjects].median(),
        "std_dev": df[subjects].std(),
        "min": df[subjects].min(),
        "max": df[subjects].max(),
        "pass_rate_%": (df[subjects] >= pass_mark).mean() * 100,
    }).round(2)
    return stats.sort_values("mean", ascending=False)


def find_outliers(df, subjects) -> pd.DataFrame:
    """Flag marks more than 2 standard deviations from the subject mean."""
    rows = []
    for s in subjects:
        mean, std = df[s].mean(), df[s].std()
        if not std or np.isnan(std):
            continue
        z = (df[s] - mean) / std
        for idx in z[z.abs() > 2].index:
            rows.append({
                "name": df.loc[idx, "name"],
                "subject": s,
                "mark": df.loc[idx, s],
                "z_score": round(z[idx], 2),
            })
    return pd.DataFrame(rows)


# --------------------------------------------------------------------------- #
# Reporting
# --------------------------------------------------------------------------- #
def print_section(title: str) -> None:
    print("\n" + "=" * 70)
    print(title)
    print("=" * 70)


def print_report(df, subjects, students, subj_stats, max_mark, pass_mark) -> None:
    print_section("OVERVIEW")
    print(f"Students:           {len(df)}")
    print(f"Subjects:           {', '.join(subjects)}")
    print(f"Class average:      {students['percentage'].mean():.2f}%")
    print(f"Class median:       {students['percentage'].median():.2f}%")
    print(f"Highest percentage: {students['percentage'].max():.2f}%")
    print(f"Lowest percentage:  {students['percentage'].min():.2f}%")
    overall_pass = (df[subjects] >= pass_mark).all(axis=1).mean() * 100
    print(f"Passed all subjects (>= {pass_mark:g}): {overall_pass:.1f}% of students")

    print_section("TOP 5 STUDENTS")
    print(students.head(5)[["rank", "name", "total", "percentage", "grade"]]
          .to_string(index=False))

    print_section("BOTTOM 5 STUDENTS")
    print(students.tail(5)[["rank", "name", "total", "percentage", "grade"]]
          .to_string(index=False))

    print_section("GRADE DISTRIBUTION")
    order = ["A+", "A", "B", "C", "D", "F"]
    dist = students["grade"].value_counts().reindex(order, fill_value=0)
    for grade, count in dist.items():
        print(f"{grade:>3} | {'#' * count} {count}")

    print_section("SUBJECT STATISTICS (sorted by mean)")
    print(subj_stats.to_string())
    print(f"\nStrongest subject: {subj_stats['mean'].idxmax()}")
    print(f"Weakest subject:   {subj_stats['mean'].idxmin()}")
    hardest = subj_stats["pass_rate_%"].idxmin()
    print(f"Lowest pass rate:  {hardest} ({subj_stats.loc[hardest, 'pass_rate_%']:.1f}%)")

    print_section(f"STUDENTS NEEDING SUPPORT (failed at least one subject < {pass_mark:g})")
    at_risk = students[students["failed_subjects"] != "-"]
    if at_risk.empty:
        print("None - everyone passed every subject.")
    else:
        print(at_risk[["name", "percentage", "failed_subjects"]].to_string(index=False))

    print_section("OUTLIERS (|z-score| > 2)")
    outliers = find_outliers(df, subjects)
    print(outliers.to_string(index=False) if not outliers.empty
          else "No unusual marks detected.")

    if len(subjects) > 1:
        print_section("SUBJECT CORRELATIONS")
        print(df[subjects].corr().round(2).to_string())


# --------------------------------------------------------------------------- #
# Plots
# --------------------------------------------------------------------------- #
def make_plots(df, subjects, students, pass_mark, prefix="marks") -> None:
    try:
        import matplotlib
        matplotlib.use("Agg")  # no display needed
        import matplotlib.pyplot as plt
    except ImportError:
        print("\nmatplotlib not installed - skipping plots "
              "(pip install matplotlib).")
        return

    # 1. Histogram of overall percentages
    fig, ax = plt.subplots(figsize=(7, 4))
    ax.hist(students["percentage"].dropna(), bins=10, edgecolor="white")
    ax.axvline(students["percentage"].mean(), color="red", linestyle="--",
               label=f"Mean {students['percentage'].mean():.1f}%")
    ax.set(title="Distribution of Overall Percentage",
           xlabel="Percentage", ylabel="Students")
    ax.legend()
    fig.tight_layout()
    fig.savefig(f"{prefix}_distribution.png", dpi=150)
    plt.close(fig)

    # 2. Box plot by subject
    fig, ax = plt.subplots(figsize=(8, 4.5))
    ax.boxplot([df[s].dropna() for s in subjects], labels=subjects)
    ax.axhline(pass_mark, color="red", linestyle=":", label=f"Pass mark ({pass_mark:g})")
    ax.set(title="Marks by Subject", ylabel="Marks")
    ax.legend()
    fig.tight_layout()
    fig.savefig(f"{prefix}_by_subject.png", dpi=150)
    plt.close(fig)

    # 3. Correlation heatmap
    if len(subjects) > 1:
        corr = df[subjects].corr()
        fig, ax = plt.subplots(figsize=(6, 5))
        im = ax.imshow(corr, vmin=-1, vmax=1, cmap="coolwarm")
        ax.set_xticks(range(len(subjects)), subjects, rotation=45, ha="right")
        ax.set_yticks(range(len(subjects)), subjects)
        for i in range(len(subjects)):
            for j in range(len(subjects)):
                ax.text(j, i, f"{corr.iloc[i, j]:.2f}", ha="center", va="center", fontsize=8)
        fig.colorbar(im)
        ax.set_title("Subject Correlations")
        fig.tight_layout()
        fig.savefig(f"{prefix}_correlation.png", dpi=150)
        plt.close(fig)

    print(f"\nSaved charts: {prefix}_distribution.png, {prefix}_by_subject.png"
          + (f", {prefix}_correlation.png" if len(subjects) > 1 else ""))


# --------------------------------------------------------------------------- #
# Main
# --------------------------------------------------------------------------- #
def main() -> None:
    parser = argparse.ArgumentParser(description="Analyze student marks.")
    parser.add_argument("csv", nargs="?", help="CSV file with marks (optional)")
    parser.add_argument("--max-mark", type=float, default=100, help="Maximum mark per subject (default 100)")
    parser.add_argument("--pass-mark", type=float, default=40, help="Pass mark per subject (default 40)")
    parser.add_argument("--plots", action="store_true", help="Save charts as PNG files")
    parser.add_argument("--export", metavar="FILE", help="Save per-student results to a CSV file")
    args = parser.parse_args()

    df = load_data(args.csv)
    df, subjects = clean_data(df, args.max_mark)

    students = analyze_students(df, subjects, args.max_mark, args.pass_mark)
    subj_stats = analyze_subjects(df, subjects, args.pass_mark)

    print_report(df, subjects, students, subj_stats, args.max_mark, args.pass_mark)

    if args.export:
        students.to_csv(args.export, index=False)
        print(f"\nSaved student results to {args.export}")

    if args.plots:
        make_plots(df, subjects, students, args.pass_mark)


if __name__ == "__main__":
    main()