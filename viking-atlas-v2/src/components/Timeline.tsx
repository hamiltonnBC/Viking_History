import { ERAS, EVENTS, START_YEAR, END_YEAR, EVENT_YEARS } from '../data/vikingData';

interface TimelineProps {
  currentYear: number;
  onYearChange: (year: number) => void;
  onOpenRunes: () => void;
  onEraJump: (eraIndex: number) => void;
}

// Returns index of the era for `year` - Clamps to the last era if no match is found.
function getActiveEraIndex(year: number): number {
  const idx = ERAS.findIndex((era) => year >= era.min && year <= era.max);
  return idx === -1 ? ERAS.length - 1 : idx;
}

// Snaps raw slider value to the nearest event year.
function snapToNearestEvent(raw: number): number {
  return EVENT_YEARS.reduce((best, year) =>
    Math.abs(year - raw) < Math.abs(best - raw) ? year : best
  );
}

export function Timeline({ currentYear, onYearChange, onOpenRunes, onEraJump }: TimelineProps) {
  const pct = ((currentYear - START_YEAR) / (END_YEAR - START_YEAR)) * 100;
  const activeEraIndex = getActiveEraIndex(currentYear);

  const handleSliderChange = (raw: number) => {
    onYearChange(snapToNearestEvent(raw));
  };

  const handlePrev = () => {
    const idx = EVENT_YEARS.indexOf(currentYear);
    if (idx > 0) {
      onYearChange(EVENT_YEARS[idx - 1]);
    } else if (idx === -1) {
      // currentYear is between snap points — jump to the nearest earlier event
      const earlier = [...EVENT_YEARS].reverse().find(y => y < currentYear);
      if (earlier !== undefined) onYearChange(earlier);
    }
  };

  const handleNext = () => {
    const idx = EVENT_YEARS.indexOf(currentYear);
    if (idx !== -1 && idx < EVENT_YEARS.length - 1) {
      onYearChange(EVENT_YEARS[idx + 1]);
    } else if (idx === -1) {
      // currentYear is between snap points — jump to the nearest later event
      const later = EVENT_YEARS.find(y => y > currentYear);
      if (later !== undefined) onYearChange(later);
    }
  };

  return (
    <footer className="timeline-container">
      {/* Era pill buttons, above the slider — to traverse through eras */}
      <div className="era-pills">
        {ERAS.map((era, i) => (
          <button
            key={era.min}
            type="button"
            className={`era-pill${i === activeEraIndex ? ' active' : ''}`}
            onClick={() => { onYearChange(era.min); onEraJump(i); }}
            title={era.summary}
          >
            {era.label}
          </button>
        ))}
      </div>

      <div className="timeline-nav">
        <button
          type="button"
          className="timeline-era-btn"
          onClick={handlePrev}
          disabled={currentYear <= EVENT_YEARS[0]}
          aria-label="Previous event"
          title="Previous event"
        >
          ‹
        </button>

        <div className="timeline-wrapper" style={{ flex: 1 }}>
          {/* Tick marks for every event year */}
          {EVENT_YEARS.map((year) => (
            <button
              key={year}
              type="button"
              className={`year-tick${year === currentYear ? ' active' : ''}`}
              style={{ left: `${((year - START_YEAR) / (END_YEAR - START_YEAR)) * 100}%` }}
              onClick={() => onYearChange(year)}
              aria-label={`${year} AD`}
              title={`${year} AD — ${EVENTS.filter(e => e.year === year).map(e => e.title).join(', ')}`}
            />
          ))}

          <div className="timeline-track">
            <div className="timeline-fill" style={{ width: `${pct}%` }}></div>
          </div>
          <input
            type="range"
            className="year-slider"
            min={START_YEAR}
            max={END_YEAR}
            value={currentYear}
            step="1"
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
          />
        </div>

        <button
          type="button"
          className="timeline-era-btn"
          onClick={handleNext}
          disabled={currentYear >= EVENT_YEARS[EVENT_YEARS.length - 1]}
          aria-label="Next event"
          title="Next event"
        >
          ›
        </button>
      </div>

      <div className="timeline-instructions">⟵ drag the slider to travel through time ⟶</div>
      <button className="rune-btn" onClick={onOpenRunes} title="Write your name in runes">
        Write your name in Runes!
      </button>
    </footer>
  );
}

export { getActiveEraIndex };