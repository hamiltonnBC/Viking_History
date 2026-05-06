import { ERAS } from '../data/vikingData';
import type { Era } from '../types';

interface HeaderProps {
  currentYear: number;
  onOpenHome: () => void;
  onOpenDetails: () => void;
  onOpenMapGuide: () => void;
  onOpenLearnMore: () => void;
  onOpenClass: () => void;
}

export function Header({ currentYear, onOpenHome, onOpenDetails, onOpenMapGuide, onOpenLearnMore, onOpenClass }: HeaderProps) {
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
        </button>
        <button className="home-toggle-btn" onClick={onOpenMapGuide} title="Show Map Guide">
          <span className="home-toggle-label">Map Guide</span>
        </button>
        <button className="home-toggle-btn" onClick={onOpenLearnMore} title="Learn More">
          <span className="home-toggle-label">Learn More</span>
        </button>
        <button className="home-toggle-btn" onClick={onOpenClass} title="Show Class">
          <span className="home-toggle-label">Class</span>
        </button>
        <button className="home-toggle-btn" onClick={onOpenDetails} title="Show Details">
          <span className="home-toggle-label">Details</span>
        </button>
      </div>
    </header>
  );
}
