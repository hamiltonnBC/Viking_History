import { useState } from 'react';
import clsx from 'clsx';
import { Badge } from './Badge';
import { useFigure } from '../FigureContext';
import type { TimelineEntry } from '../data/timelineEntries';

interface ChronicleEntryProps {
  entry: TimelineEntry;
}

export function ChronicleEntry({ entry }: ChronicleEntryProps) {
  const { linkifyText } = useFigure();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <article className="chronicle-entry">
      <div className="chronicle-entry-header">
        <div className="chronicle-entry-meta">
          <span className="chronicle-entry-date">{entry.date}</span>
          <div className="chronicle-entry-tags">
            {entry.tags.map((tag) => (
              <Badge key={tag} tag={tag} />
            ))}
          </div>
        </div>
        <button
          className={clsx('chronicle-entry-chevron', { expanded: isExpanded })}
          onClick={() => setIsExpanded(prev => !prev)}
          aria-label={isExpanded ? 'Collapse entry' : 'Expand entry'}
          aria-expanded={isExpanded}
        >
          ›
        </button>
      </div>

      <h3 className="chronicle-entry-title">{entry.title}</h3>

      {isExpanded && (
        <>
          <p className="chronicle-entry-body">{linkifyText(entry.body)}</p>
          <footer className="chronicle-entry-source">
            <span className="chronicle-source-text">Source:</span>
            <span>{entry.source}</span>
          </footer>
        </>
      )}
    </article>
  );
}
