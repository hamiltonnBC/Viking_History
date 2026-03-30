import type { VikingEvent } from '../types';
import { Badge } from './Badge';
import clsx from 'clsx';

interface InfoPanelProps {
  event: VikingEvent | null;
  onClose: () => void;
}

export function InfoPanel({ event, onClose }: InfoPanelProps) {
  return (
    <div className={clsx('info-panel', { open: !!event })}>
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-content">
        <div className="panel-header">
          <h2 className="panel-title">{event ? event.title : 'Select an event'}</h2>
          <span className="panel-date">{event ? event.date : ''}</span>
          {event && <Badge tag={event.type} label={event.tag} />}
        </div>
        <div className="panel-body">
          {event ? (
            event.body.split('<br><br>').map((p, idx) => <p key={idx}>{p}</p>)
          ) : (
            <p>Explore the map and timeline to learn about the Viking Age.</p>
          )}
        </div>
      </div>
    </div>
  );
}
