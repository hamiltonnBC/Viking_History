import type { VikingEvent, Route, EventType } from '../types';
import { Badge } from './Badge';
import clsx from 'clsx';

interface InfoPanelProps {
  selectedItem: VikingEvent | Route | null;
  onClose: () => void;
  events: VikingEvent[];
  onSelectEvent: (event: VikingEvent) => void;
}

function isVikingEvent(item: VikingEvent | Route | null): item is VikingEvent {
  return item !== null && 'coords' in item;
}

function isRoute(item: VikingEvent | Route | null): item is Route {
  return item !== null && 'points' in item && 'name' in item;
}

export function InfoPanel({ selectedItem, onClose, events, onSelectEvent }: InfoPanelProps) {
  const connectedEvents = isRoute(selectedItem)
    ? events.filter(e => e.routes?.includes(selectedItem.id))
    : [];

  return (
    <div className={clsx('info-panel', { open: !!selectedItem })}>
      <button className="panel-close" onClick={onClose}>✕</button>
      <div className="panel-content">
        {isRoute(selectedItem) ? (
          <>
            <div className="panel-header">
              <h2 className="panel-title">{selectedItem.name}</h2>
              <Badge tag={selectedItem.type as EventType} />
            </div>
            <div className="panel-body">
              <p className="panel-route-description">{selectedItem.description}</p>
              {connectedEvents.length > 0 && (
                <div className="panel-connected-events">
                  <h3 className="panel-connected-events-title">Connected Events</h3>
                  <ul className="panel-connected-events-list">
                    {connectedEvents.map(event => (
                      <li key={event.id}>
                        <button
                          className="panel-connected-event-item"
                          onClick={() => onSelectEvent(event)}
                        >
                          <span className="panel-connected-event-title">{event.title}</span>
                          <span className="panel-connected-event-date">{event.date}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : isVikingEvent(selectedItem) ? (
          <>
            <div className="panel-header">
              <h2 className="panel-title">{selectedItem.title}</h2>
              <span className="panel-date">{selectedItem.date}</span>
              <Badge tag={selectedItem.type} label={selectedItem.tag} />
            </div>
            <div className="panel-body">
              {selectedItem.body.split('\n\n').map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
