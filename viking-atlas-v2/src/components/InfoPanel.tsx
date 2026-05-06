import type { VikingEvent, Route, EventType } from '../types';
import { Badge } from './Badge';
import { useFigure } from '../FigureContext';
import clsx from 'clsx';

interface InfoPanelProps {
  selectedItem: VikingEvent | Route | null;
  onClose: () => void;
  events: VikingEvent[];
  routes: Route[];
  onSelectEvent: (event: VikingEvent) => void;
  onSelectRoute: (route: Route) => void;
}

function isVikingEvent(item: VikingEvent | Route | null): item is VikingEvent {
  return item !== null && 'coords' in item;
}

function isRoute(item: VikingEvent | Route | null): item is Route {
  return item !== null && 'points' in item && 'name' in item;
}

export function InfoPanel({ selectedItem, onClose, events, routes, onSelectEvent, onSelectRoute }: InfoPanelProps) {
  const { linkifyText } = useFigure();
  
  const connectedEvents = isRoute(selectedItem)
    ? events.filter(e => e.routes?.includes(selectedItem.id))
    : [];

  // For event view: find routes this event belongs to
  const connectedRoutes = isVikingEvent(selectedItem) && selectedItem.routes?.length
    ? routes.filter(r => selectedItem.routes!.includes(r.id))
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
              <p className="panel-route-description">{linkifyText(selectedItem.description)}</p>
              {selectedItem.source && (
                <p className="panel-route-source">{selectedItem.source}</p>
              )}
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
                <p key={idx}>{linkifyText(p)}</p>
              ))}
              {selectedItem.source && (
                <p className="panel-route-source">{selectedItem.source}</p>
              )}
              {connectedRoutes.length > 0 && (
                <div className="panel-connected-routes">
                  <h3 className="panel-connected-routes-title">Connected Routes</h3>
                  <ul className="panel-connected-routes-list">
                    {connectedRoutes.map(route => (
                      <li key={route.id}>
                        <button
                          className="panel-connected-route-item"
                          onClick={() => onSelectRoute(route)}
                        >
                          <span className="panel-connected-route-name">{route.name}</span>
                          <span className="panel-connected-route-type">{route.type}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
