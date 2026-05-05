import type { OriginHub } from '../types';
import type { TimelineEntry } from '../data/timelineEntries';
import { TIMELINE_ENTRIES } from '../data/timelineEntries';
import { Badge } from './Badge';
import clsx from 'clsx';

interface HubPanelProps {
  hub: OriginHub | null;
  onClose: () => void;
}

export function HubPanel({ hub, onClose }: HubPanelProps) {
  if (!hub) return null;

  // Get related entries sorted chronologically
  const relatedEntries: TimelineEntry[] = hub.relatedEntryIds
    .map(id => TIMELINE_ENTRIES.find(e => e.id === id))
    .filter((e): e is TimelineEntry => e !== undefined)
    .sort((a, b) => a.year - b.year);

  return (
    <div className={clsx('hub-panel', { open: !!hub })}>
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="hub-panel-content">
        <div className="hub-panel-header">
          <div className="hub-panel-icon">⚓</div>
          <h2 className="hub-panel-title">{hub.label}</h2>
          <span className="hub-panel-subtitle">Viking Homeland</span>
        </div>

        <p className="hub-panel-description">{hub.description}</p>

        <div className="hub-panel-entries-header">
          <span className="hub-panel-entries-label">Chronicle</span>
          <span className="hub-panel-entries-count">{relatedEntries.length}</span>
        </div>

        <div className="hub-panel-entries">
          {relatedEntries.map(entry => (
            <div key={entry.id} className="hub-entry">
              <div className="hub-entry-top">
                <span className="hub-entry-date">{entry.date}</span>
                <div className="hub-entry-tags">
                  {entry.tags.map(tag => (
                    <Badge key={tag} tag={tag} />
                  ))}
                </div>
              </div>
              <h4 className="hub-entry-title">{entry.title}</h4>
              <p className="hub-entry-body">{entry.body}</p>
              <footer className="hub-entry-source">
                <span>📖</span>
                <span>{entry.source}</span>
              </footer>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
