def valid(mark_str):
    try:
        n = float(mark_str.strip())
    except ValueError:
        return None
    return n if 0 <= n <= 100 else None

def process(marks_raw):
    marks = [v for v in (valid(m) for m in marks_raw) if v is not None]
    if not marks:
        print("No valid marks provided.")
        return
    avg = sum(marks) / len(marks)
    passed = sum(1 for m in marks if m >= 50)
    pass_rate = passed / len(marks) * 100
    print(f"Valid marks: {len(marks)}")
    print(f"Average: {avg:.2f}")
    print(f"Highest: {max(marks):g}")
    print(f"Lowest: {min(marks):g}")
    print(f"Pass rate: {pass_rate:.1f}%")

if __name__ == "__main__":
    test_cases = {
        "A": "85, 23, 45, 90, 92",
        "B": "88, 47, -5, 101, abc, 73, 50, , 100",
        "C": "10, 20, 30",
        "D": "abc, , xyz",
    }
    for name, raw in test_cases.items():
        print(f"--- Case {name} ---")
        process(raw.split(","))