import { FormEvent } from 'react';

interface Props {
  now: string;
  start: string;
  end: string;
  endOfDay: boolean;
  onEndOfDayChange: (v: boolean) => void;
  onNowChange: (v: string) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  disabled: boolean;
  onSubmit: () => void;
}

export default function AvailabilityForm(props: Props) {
  const { now, start, end, endOfDay, disabled, onEndOfDayChange, onNowChange, onStartChange, onEndChange, onSubmit } = props;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit();
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="now">Current time</label>
        <input id="now" type="time" value={now} onChange={(e) => onNowChange(e.target.value)} required />
      </div>
      <div className="field-row">
        <div className="field">
          <label htmlFor="start">Start</label>
          <input id="start" type="time" value={start} onChange={(e) => onStartChange(e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="end">End</label>
          <input
            id="end"
            type="time"
            value={endOfDay ? '' : end}
            onChange={(e) => onEndChange(e.target.value)}
            disabled={endOfDay}
            required={!endOfDay}
          />
        </div>
      </div>
      <label className="checkbox" htmlFor="endOfDay">
        <input id="endOfDay" type="checkbox" checked={endOfDay} onChange={(e) => onEndOfDayChange(e.target.checked)} />
        Ends at 24:00 (end of day)
      </label>
      <button type="submit" disabled={disabled}>
        Check availability
      </button>
    </form>
  );
}
