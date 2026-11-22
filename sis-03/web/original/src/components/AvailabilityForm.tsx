import { FormEvent } from 'react';

interface Props {
  now: string;
  start: string;
  end: string;
  onNowChange: (v: string) => void;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
  onSubmit: () => void;
}

export default function AvailabilityForm(props: Props) {
  const { now, start, end, onNowChange, onStartChange, onEndChange, onSubmit } = props;

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
          <input id="end" type="time" value={end} onChange={(e) => onEndChange(e.target.value)} required />
        </div>
      </div>
      <button type="submit">Check availability</button>
    </form>
  );
}
