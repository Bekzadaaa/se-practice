import unittest
from booking import can_book

# Base for every test unless it says otherwise (report section 5): now = 540, not blocked,
# one existing booking 600-660. Expected values come from AC1-AC5, not from the code.
NOW = 540


def base():
    return [(600, 660)]


class BookingTests(unittest.TestCase):
    # --- the six cases from the brief (T1-T6)
    def test_touching_end_is_allowed(self):          # T1, AC4
        result = can_book(660, 720, 540, False, [(600, 660)])
        self.assertIs(result, True)

    def test_overlap_is_rejected(self):               # T2, AC4
        self.assertIs(can_book(630, 690, NOW, False, base()), False)

    def test_blocked_room_is_rejected(self):          # T3, AC3
        self.assertIs(can_book(660, 720, NOW, True, base()), False)

    def test_blocked_room_with_no_bookings(self):     # AC3 alone, nothing else could reject it
        self.assertIs(can_book(660, 720, NOW, True, []), False)

    def test_exactly_120_minutes_is_allowed(self):    # T4, AC2
        self.assertIs(can_book(720, 840, NOW, False, base()), True)

    def test_121_minutes_is_rejected(self):           # T5, AC2
        self.assertIs(can_book(720, 841, NOW, False, base()), False)

    def test_starts_now_is_rejected(self):            # T6, AC1
        self.assertIs(can_book(540, 570, NOW, False, base()), False)

    # --- AC1: order, future, day bounds
    def test_one_minute_after_now_is_allowed(self):   # AC1 boundary
        self.assertIs(can_book(541, 571, NOW, False, base()), True)

    def test_start_in_the_past_is_rejected(self):     # AC1
        self.assertIs(can_book(500, 530, NOW, False, base()), False)

    def test_reversed_times_are_rejected(self):       # T7, AC1
        self.assertIs(can_book(720, 660, NOW, False, base()), False)

    def test_zero_length_is_rejected(self):           # AC1 start < end
        self.assertIs(can_book(700, 700, NOW, False, base()), False)

    def test_ending_at_1440_is_allowed(self):         # T8, AC1
        self.assertIs(can_book(1380, 1440, NOW, False, base()), True)

    def test_ending_after_1440_is_rejected(self):     # T9, AC1
        self.assertIs(can_book(1380, 1441, NOW, False, base()), False)

    def test_negative_start_is_rejected(self):        # AC1 0 <= start
        self.assertIs(can_book(-30, 30, -60, False, []), False)

    def test_start_zero_is_allowed_when_now_is_before(self):  # AC1 lower bound
        self.assertIs(can_book(0, 60, -1, False, []), True)

    # --- AC4: every kind of overlap, every booking
    def test_touching_start_is_allowed(self):         # AC4, ends at the booking's start
        self.assertIs(can_book(570, 600, NOW, False, base()), True)

    def test_inside_and_containing_are_rejected(self):  # AC4
        self.assertIs(can_book(615, 645, NOW, False, base()), False)
        self.assertIs(can_book(570, 690, NOW, False, base()), False)
        self.assertIs(can_book(600, 660, NOW, False, base()), False)
        self.assertIs(can_book(570, 630, NOW, False, base()), False)

    def test_second_booking_is_checked(self):         # T10, AC4
        self.assertIs(can_book(720, 780, NOW, False, [(600, 660), (700, 760)]), False)

    def test_unsorted_bookings_are_all_checked(self):  # AC4
        self.assertIs(can_book(610, 650, NOW, False, [(900, 960), (600, 660)]), False)
        self.assertIs(can_book(760, 800, NOW, False, [(800, 860), (600, 660), (700, 760)]), True)

    def test_no_bookings_at_all(self):                # AC4 with an empty list
        self.assertIs(can_book(600, 660, NOW, False, []), True)

    # --- AC5: real Boolean, inputs unchanged, same answer twice
    def test_existing_is_not_changed(self):           # AC5
        existing = [(900, 960), (600, 660), (700, 760)]
        snapshot = list(existing)
        can_book(780, 840, NOW, False, existing)
        can_book(610, 650, NOW, False, existing)
        self.assertEqual(existing, snapshot)

    def test_same_check_twice(self):                  # T11, AC5
        existing = base()
        first = can_book(660, 720, NOW, False, existing)
        second = can_book(660, 720, NOW, False, existing)
        self.assertIs(first, True)
        self.assertIs(second, True)
        self.assertEqual(existing, [(600, 660)])


if __name__ == "__main__":
    unittest.main()
