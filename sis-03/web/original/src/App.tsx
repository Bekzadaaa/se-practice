import { useMemo, useState } from 'react';
import RoomSelector from './components/RoomSelector';
import BookingList from './components/BookingList';
import AvailabilityForm from './components/AvailabilityForm';
import ResultPanel from './components/ResultPanel';
import { ROOMS } from './data/rooms';
import { checkAvailability } from './utils/availability';
import { currentTimeString, toMinutes } from './utils/time';
import { AvailabilityResult } from './types';

export default function App() {
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [now, setNow] = useState(currentTimeString());
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [result, setResult] = useState<AvailabilityResult | null>(null);

  const room = useMemo(() => ROOMS.find((r) => r.id === roomId)!, [roomId]);

  function handleCheck() {
    setResult(checkAvailability(room, toMinutes(start), toMinutes(end), toMinutes(now)));
  }

  function handleRoomChange(id: string) {
    setRoomId(id);
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
            onNowChange={setNow}
            onStartChange={setStart}
            onEndChange={setEnd}
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
