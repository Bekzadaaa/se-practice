import { Equipment, EQUIPMENT } from '../rooms';

interface Props {
  attendees: string;
  selected: Equipment[];
  onAttendeesChange: (v: string) => void;
  onToggle: (item: Equipment) => void;
}

// The user's requirements (F1, F2). Only inputs — the filtering itself is filterRooms().
export default function FilterPanel({ attendees, selected, onAttendeesChange, onToggle }: Props) {
  return (
    <section className="card form" aria-label="Room requirements">
      <h2>What do you need?</h2>
      <div className="field">
        <label htmlFor="attendees">Attendees</label>
        <input
          id="attendees"
          type="number"
          min={0}
          step={1}
          inputMode="numeric"
          value={attendees}
          onChange={(e) => onAttendeesChange(e.target.value)}
        />
      </div>
      <fieldset className="equipment">
        <legend>Equipment (the room must have all)</legend>
        {EQUIPMENT.map((item) => (
          <label key={item} className="checkbox chip">
            <input type="checkbox" checked={selected.includes(item)} onChange={() => onToggle(item)} />
            {item}
          </label>
        ))}
      </fieldset>
    </section>
  );
}
