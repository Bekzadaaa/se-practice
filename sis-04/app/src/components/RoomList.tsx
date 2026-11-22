import { Room } from '../rooms';

interface Props {
  rooms: Room[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

// The rooms that match the requirements. Blocked rooms stay in the list with a label (F3 is
// decided by checkRoom, never here). An empty list shows the empty state (F4).
export default function RoomList({ rooms, selectedId, onSelect }: Props) {
  if (rooms.length === 0) {
    return (
      <section className="card empty" role="status">
        <p className="decision">No rooms match</p>
        <p className="muted">No room has that many seats and all of the selected equipment. Try fewer attendees or fewer items.</p>
      </section>
    );
  }
  return (
    <section className="card" aria-label="Matching rooms">
      <h2>
        {rooms.length} matching room{rooms.length === 1 ? '' : 's'}
      </h2>
      <ul className="rooms">
        {rooms.map((room) => (
          <li key={room.id}>
            <label className={`room ${room.id === selectedId ? 'room-selected' : ''}`}>
              <input type="radio" name="room" value={room.id} checked={room.id === selectedId} onChange={() => onSelect(room.id)} />
              <span className="room-name">{room.name}</span>
              <span className="muted">
                {room.capacity} seats · {room.equipment.join(', ')}
              </span>
              {room.blocked && <span className="badge badge-blocked">Blocked</span>}
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}
