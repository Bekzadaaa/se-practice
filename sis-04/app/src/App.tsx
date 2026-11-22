import { useMemo, useState } from 'react';
import RoomSelector from './components/RoomSelector';
import BookingList from './components/BookingList';
import AvailabilityForm from './components/AvailabilityForm';
import ResultPanel from './components/ResultPanel';
import { ROOMS } from './data/rooms';
import { checkAvailability, DAY_END } from './utils/availability';
import { canBook } from './booking';
import { currentTimeString, toMinutes } from './utils/time';
import { AvailabilityResult } from './types';

export default function App() {
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [now, setNow] = useState(currentTimeString());
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [endOfDay, setEndOfDay] = useState(false);
  const [blocked, setBlocked] = useState(ROOMS[0].blocked);
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const room = useMemo(() => ROOMS.find((r) => r.id === roomId)!, [roomId]);

  function handleCheck() {
    // The sample data is never modified: the blocked flag is applied to a copy of the room.
    const roomToCheck = { ...room, blocked };
    const s = toMinutes(start);
    const e = endOfDay ? DAY_END : toMinutes(end);
    const n = toMinutes(now);
    // The decision comes from canBook (src/booking.ts); checkAvailability only explains it.
    const available = canBook({ start: s, end: e, now: n, blocked, bookings: room.bookings });
    setResult({ available, ...checkAvailability(roomToCheck, s, e, n) });
  }

  // Any edit makes the last decision outdated, so it is cleared until the user checks again.
  function edited<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setResult(null);
    };
  }

  function handleRoomChange(id: string) {
    setRoomId(id);
    setBlocked(ROOMS.find((r) => r.id === id)!.blocked);
    setResult(null);
  }

  return (
    <div className="app">
      <header>
        <h1>Smart Campus Room Availability</h1>
        <p className="muted">Check whether a room is free before you request it. Sample data only.</p>
      </header>
      <main className="layout">
        <div className="column">
          <div className="card">
            <RoomSelector rooms={ROOMS} selectedId={roomId} onChange={handleRoomChange} />
          </div>
          <AvailabilityForm
            now={now}
            start={start}
            end={end}
            blocked={blocked}
            endOfDay={endOfDay}
            onEndOfDayChange={edited(setEndOfDay)}
            onBlockedChange={edited(setBlocked)}
            onNowChange={edited(setNow)}
            onStartChange={edited(setStart)}
            onEndChange={edited(setEnd)}
            onSubmit={handleCheck}
          />
          <ResultPanel result={result} />
        </div>
        <div className="column">
          <BookingList room={room} />
        </div>
      </main>
    </div>
  );
}
