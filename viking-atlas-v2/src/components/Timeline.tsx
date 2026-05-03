import { START_YEAR, END_YEAR } from '../data/vikingData';

interface TimelineProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  onOpenRunes: () => void;
}

export function Timeline({ currentYear, onYearChange, onOpenRunes }: TimelineProps) {
  const pct = ((currentYear - START_YEAR) / (END_YEAR - START_YEAR)) * 100;

  return (
    <footer className="timeline-container">
      <div className="timeline-labels"></div>
      <div className="timeline-wrapper">
        <div className="timeline-track">
          <div className="timeline-fill" style={{ width: `${pct}%` }}></div>
          <div id="event-markers"></div>
        </div>
        <input
          type="range"
          className="year-slider"
          min={START_YEAR}
          max={END_YEAR}
          value={currentYear}
          step="1"
          onChange={(e) => onYearChange(parseInt(e.target.value))}
        />
      </div>
      <div className="timeline-instructions">⟵ drag the slider to travel through time ⟶</div>
      <button className="rune-btn" onClick={onOpenRunes} title="Write your name in runes">
        Write your name in Runes!
      </button>
    </footer>
  );
}
