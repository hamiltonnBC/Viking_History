import { ERAS } from '../data/vikingData';
import type { Era } from '../types';

interface HeaderProps {
  currentYear: number;
  onOpenHome: () => void;
}

export function Header({ currentYear, onOpenHome }: HeaderProps) {
  const era: Era | undefined = ERAS.find(e => currentYear >= e.min && currentYear <= e.max);

  return (
    <header className="header">
      <div className="header-left">
        <h1>The Viking Age</h1>
        <div className="era-label">{era ? era.label : 'Unknown Era'}</div>
      </div>
      <div className="year-display">{currentYear} AD</div>
      <div className="header-right">
        <button className="home-toggle-btn" onClick={onOpenHome} title="Show About">
          <span className="home-toggle-label">About</span>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>
    </header>
  );
}
