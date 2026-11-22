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
