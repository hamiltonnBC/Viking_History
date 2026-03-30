import { START_YEAR, END_YEAR } from '../data/vikingData';

interface TimelineProps {
  currentYear: number;
  onYearChange: (year: number) => void;
}

export function Timeline({ currentYear, onYearChange }: TimelineProps) {
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
      <div className="credits-section" style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
        Made by <strong>Nicholas Hamilton</strong> & <strong>America Gaona Borges</strong>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '8px' }}>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nicholas</span>
            <a href="https://github.com/hamiltonnBC" target="_blank" rel="noreferrer">
              <img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub" />
            </a>
            <a href="https://www.linkedin.com/in/nicholas-trey-hamilton/" target="_blank" rel="noreferrer">
              <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn" />
            </a>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>America</span>
            <a href="https://github.com/gaonaborgesa" target="_blank" rel="noreferrer">
              <img src="https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white" alt="GitHub" />
            </a>
            <a href="https://www.linkedin.com/in/america-gaona-borges/" target="_blank" rel="noreferrer">
              <img src="https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white" alt="LinkedIn" />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}
