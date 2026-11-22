import { Room } from '../types';

interface Props {
  rooms: Room[];
  selectedId: string;
  onChange: (id: string) => void;
}

export default function RoomSelector({ rooms, selectedId, onChange }: Props) {
  return (
    <div className="field">
      <label htmlFor="room">Room</label>
      <select id="room" value={selectedId} onChange={(e) => onChange(e.target.value)}>
        {rooms.map((room) => (
          <option key={room.id} value={room.id}>
            {room.name}
            {room.blocked ? ' (blocked)' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
