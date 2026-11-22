import { useState } from 'react';
import FilterPanel from './components/FilterPanel';
import RoomList from './components/RoomList';
import BookingList from './components/BookingList';
import AvailabilityForm from './components/AvailabilityForm';
import ResultPanel, { CheckResult } from './components/ResultPanel';
import { Equipment, ROOMS } from './rooms';
import { filterRooms } from './filter';
import { checkRoom, explainRoom, findRoom, DAY_END } from './booking';
import { currentTimeString, toMinutes } from './utils/time';

// The page: it holds only what the user typed. Room data comes from rooms.ts, the filter from
// filter.ts and every decision and reason from booking.ts.
export default function App() {
  const [attendees, setAttendees] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment[]>([]);
  const [roomId, setRoomId] = useState<string | null>(ROOMS[0].id);
  const [now, setNow] = useState(currentTimeString());
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [endOfDay, setEndOfDay] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);

  // F1, F2: an empty attendees box means no capacity requirement.
  const visible = filterRooms(ROOMS, { attendees: Number(attendees) || 0, equipment: selectedEquipment });
  // Keep the chosen room while it still matches; otherwise the first match, or none (F4).
  const selectedId = visible.some((r) => r.id === roomId) ? roomId : visible[0]?.id ?? null;
  const selected = selectedId ? findRoom(ROOMS, selectedId) : undefined;

  function check(id: string) {
    const request = { start: toMinutes(start), end: endOfDay ? DAY_END : toMinutes(end), now: toMinutes(now) };
    setResult({
      roomName: findRoom(ROOMS, id)?.name ?? id,
      available: checkRoom(ROOMS, id, request),
      ...explainRoom(ROOMS, id, request),
    });
  }

  // Any edit of the request makes the last decision outdated, so it is cleared until the next check.
  function edited<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setResult(null);
    };
  }

  // F5: choosing another room refreshes a shown result for the same times, with THAT room's data.
  function handleSelect(id: string) {
    setRoomId(id);
    if (result) check(id);
  }

  function toggleEquipment(item: Equipment) {
    setSelectedEquipment((list) => (list.includes(item) ? list.filter((x) => x !== item) : [...list, item]));
    setResult(null);
  }

  return (
    <div className="app">
      <header>
        <h1>Smart Campus Room Availability</h1>
        <p className="muted">Find a room that fits, then check a time. Fictional sample data only.</p>
      </header>
      <main className="layout">
        <div className="column">
          <FilterPanel
            attendees={attendees}
            selected={selectedEquipment}
            onAttendeesChange={edited(setAttendees)}
            onToggle={toggleEquipment}
          />
          <RoomList rooms={visible} selectedId={selectedId} onSelect={handleSelect} />
        </div>
        <div className="column">
          <AvailabilityForm
            now={now}
            start={start}
            end={end}
            endOfDay={endOfDay}
            disabled={!selectedId}
            onEndOfDayChange={edited(setEndOfDay)}
            onNowChange={edited(setNow)}
            onStartChange={edited(setStart)}
            onEndChange={edited(setEnd)}
            onSubmit={() => selectedId && check(selectedId)}
          />
          <ResultPanel result={result} />
          {selected && <BookingList room={selected} />}
        </div>
      </main>
    </div>
  );
}
