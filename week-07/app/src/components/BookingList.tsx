import { Room } from '../types';
import { formatTime } from '../utils/time';

interface Props {
  room: Room;
}

export default function BookingList({ room }: Props) {
  return (
    <section className="card">
      <h2>{room.name}</h2>
      <p className="muted">
        {room.building} · {room.capacity} seats
      </p>
      {room.blocked && <p className="badge badge-blocked">Blocked — {room.blockedReason}</p>}
      <h3>Existing bookings today</h3>
      {room.bookings.length === 0 ? (
        <p className="muted">No bookings yet.</p>
      ) : (
        <ul className="bookings">
          {room.bookings.map((b) => (
            <li key={b.id}>
              <span className="time">
                {formatTime(b.start)}–{formatTime(b.end)}
              </span>
              <span>{b.title}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
