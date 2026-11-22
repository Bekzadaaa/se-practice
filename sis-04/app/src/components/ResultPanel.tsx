import { formatTime } from '../utils/time';

export interface CheckResult {
  roomName: string;
  available: boolean;
  reasons: string[];
  conflicts: { start: number; end: number }[];
}

interface Props {
  result: CheckResult | null;
}

export default function ResultPanel({ result }: Props) {
  if (!result) {
    return (
      <section className="card result result-empty" aria-live="polite">
        <p className="muted">Choose a room and a time, then press “Check availability”.</p>
      </section>
    );
  }

  return (
    <section className={`card result ${result.available ? 'result-ok' : 'result-bad'}`} aria-live="polite">
      <p className="decision">{result.available ? 'Available' : 'Unavailable'}</p>
      <p className="muted">{result.roomName}</p>
      {result.reasons.length > 0 && (
        <ul className="reasons">
          {result.reasons.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      )}
      {result.conflicts.length > 0 && (
        <p className="muted">
          Conflicts with: {result.conflicts.map((c) => `${formatTime(c.start)}–${formatTime(c.end)}`).join(', ')}
        </p>
      )}
    </section>
  );
}
