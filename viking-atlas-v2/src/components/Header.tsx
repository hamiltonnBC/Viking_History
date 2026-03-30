import { ERAS } from '../data/vikingData';
import type { Era } from '../types';

interface HeaderProps {
  currentYear: number;
}

export function Header({ currentYear }: HeaderProps) {
  const era: Era | undefined = ERAS.find(e => currentYear >= e.min && currentYear <= e.max);

  return (
    <header className="header">
      <h1>The Viking Age</h1>
      <div className="year-display">{currentYear} AD</div>
      <div className="era-label">{era ? era.label : 'Unknown Era'}</div>
    </header>
  );
}
