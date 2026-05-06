import type { Route } from '../types';
import { ROUTES } from '../data/vikingData';

interface MapGuideProps {
  isVisible: boolean;
  onClose: () => void;
  onSelectRoute?: (route: Route) => void;
}

const EVENT_ICONS: { type: string; label: string; color: string; path: string; description: string }[] = [
  {
    type: 'raid',
    label: 'Raid',
    color: 'var(--blood-bright)',
    path: 'M-3,-6 L-1,-2 L-5,2 L-4,3 L0,-1 L1,1 L-1,3 L0,4 L2,2 L4,6 L5,5 L3,1 L5,-1 L4,-2 L2,0 L1,-1 L3,-5 L2,-6 L0,-3 L-2,-6 Z',
    description: 'Hit-and-run attacks on monasteries, towns, and trading centres. Viking raiders targeted wealthy, poorly defended sites and used their ships to strike fast and withdraw before local armies could respond.',
  },
  {
    type: 'settlement',
    label: 'Settlement',
    color: 'var(--parchment)',
    path: 'M0,-6 L-6,0 L-4,0 L-4,5 L-2,5 L-2,1 L2,1 L2,5 L4,5 L4,0 L6,0 Z',
    description: 'Permanent Norse colonies established through migration and land-taking. Settlements ranged from farming communities in Iceland to fortified urban centres like Dublin and York.',
  },
  {
    type: 'trade',
    label: 'Trade',
    color: 'var(--gold)',
    path: 'M0,-5 L0,0 M-6,1 C-6,-1 -3,-2 0,-2 C3,-2 6,-1 6,1 L5,3 C3,4 -3,4 -5,3 Z M0,-2 L0,-5 L2,-3 Z',
    description: 'Commercial activity and long-distance exchange networks. Norse merchants traded furs, amber, and slaves for silver, silk, and spices along routes stretching from Scandinavia to Baghdad.',
  },
  {
    type: 'conquest',
    label: 'Conquest',
    color: 'var(--conquest)',
    path: 'M-5,1 L-5,-3 L-3,0 L0,-4 L3,0 L5,-3 L5,1 L5,3 L-5,3 Z M-5,3 L-5,5 L5,5 L5,3 Z',
    description: 'Military campaigns that resulted in lasting political control. Unlike raids, conquests involved seizing territory, deposing rulers, and establishing Norse authority over existing populations.',
  },
  {
    type: 'exploration',
    label: 'Exploration',
    color: 'var(--exploration)',
    path: 'M0,-7 L2,-2 L7,0 L2,2 L0,7 L-2,2 L-7,0 L-2,-2 Z M0,-4 L1,-1 L4,0 L1,1 L0,4 L-1,1 L-4,0 L-1,-1 Z',
    description: 'Voyages into unknown waters and uncharted lands. Norse explorers pushed the boundaries of the known world, reaching Iceland, Greenland, North America, and the Mediterranean.',
  },
  {
    type: 'battle',
    label: 'Battle',
    color: 'var(--blood)',
    path: 'M-5,-5 L5,5 M-4,-5 L-5,-4 M4,5 L5,4 M5,-5 L-5,5 M4,-5 L5,-4 M-4,5 L-5,4 M-1,0 A1,1,0,1,1,1,0 A1,1,0,1,1,-1,0',
    description: 'Major military engagements between armies. These include pitched battles, sieges, and decisive confrontations that shaped the political landscape of the Viking Age.',
  },
  {
    type: 'ships',
    label: 'Ships',
    color: 'var(--gold-bright)',
    path: 'M-8,2 C-8,0 -6,-2 -4,-3 L-2,-3.5 L0,-4 L2,-3.5 L4,-3 C6,-2 8,0 8,2 L7,3.5 C5,5 -5,5 -7,3.5 Z M-9,1 L-8,2 M9,1 L8,2 M-9,1 C-9.5,0 -9,-1 -8.5,-2 M9,1 C9.5,0 9,-1 8.5,-2 M0,-4 L0,-8 M0,-8 L-1,-7 L-1,-5 L0,-4 M-1,-7 L-4,-6 L-3,-5 L-1,-5',
    description: 'The longships, warships, and ship burials that defined Norse maritime culture and made the Viking Age possible.',
  },
];

const ROUTE_CATEGORIES: { type: string; label: string; color: string; description: string }[] = [
  {
    type: 'raid',
    label: 'Raid Routes',
    color: 'var(--blood-bright)',
    description: 'Paths taken by Viking war fleets to reach their targets. These routes followed coastlines or rivers, allowing raiders to strike deep inland — from the Seine to Paris, the Loire to Nantes, across the Irish Sea to Dublin, and even through the Straits of Gibraltar into the Mediterranean.',
  },
  {
    type: 'trade',
    label: 'Trade Routes',
    color: 'var(--gold)',
    description: 'Commercial corridors used by Norse merchants. The Dnieper route ran south to Constantinople, the Volga route reached the Caspian Sea and Arab Caliphate, and protected coastal routes connected Scandinavian ports through sheltered archipelagos.',
  },
  {
    type: 'exploration',
    label: 'Exploration Routes',
    color: 'var(--exploration)',
    description: 'Voyages of discovery into uncharted territory. These routes trace the Norse expansion westward across the Atlantic — from Norway to the Faroe Islands, Iceland, Greenland, and ultimately North America.',
  },
];

export function MapGuide({ isVisible, onClose, onSelectRoute }: MapGuideProps) {
  const handleRouteClick = (route: Route) => {
    if (onSelectRoute) {
      onSelectRoute(route);
      onClose();
    }
  };

  return (
    <div className={`details-page ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="details-page-content map-guide-content">
        <button className="details-close-btn" onClick={onClose} aria-label="Close map guide">
          ✕
        </button>

        <h1>Map Guide</h1>

        <div className="map-guide-columns">
          <section className="details-section">
            <h2>Event Icons</h2>
            <p>
              Each point on the map uses a unique icon and colour to indicate what type of event it represents.
            </p>
            <div className="map-guide-grid">
              {EVENT_ICONS.map(item => (
                <div key={item.type} className="map-guide-item">
                  <svg width="32" height="32" viewBox="-10 -10 20 20" className="map-guide-icon">
                    <path d={item.path} fill={item.color} stroke="rgba(0,0,0,0.4)" strokeWidth={0.5} />
                  </svg>
                  <div className="map-guide-item-text">
                    <strong style={{ color: item.color }}>{item.label}</strong>
                    <span>{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="details-section">
            <h2>Route Colours</h2>
            <p>
              Animated lines on the map show the paths Norse fleets and traders followed. Each colour represents a different purpose.
            </p>
            <div className="map-guide-grid">
              {ROUTE_CATEGORIES.map(category => {
                const routesInCategory = ROUTES.filter(r => r.type === category.type);
                return (
                  <div key={category.type} className="map-guide-item map-guide-route-category">
                    <svg width="32" height="32" viewBox="0 0 32 6" className="map-guide-route-swatch">
                      <line x1="0" y1="3" x2="32" y2="3" stroke={category.color} strokeWidth="3" strokeDasharray="6 3" />
                    </svg>
                    <div className="map-guide-item-text">
                      <strong style={{ color: category.color }}>{category.label}</strong>
                      <span>{category.description}</span>
                      <ul className="map-guide-route-list">
                        {routesInCategory.map(route => (
                          <li key={route.id}>
                            <button
                              className="map-guide-route-link"
                              style={{ color: category.color }}
                              onClick={() => handleRouteClick(route)}
                            >
                              {route.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <button className="enter-button" onClick={onClose}>
          Back to the Atlas
        </button>
      </div>
    </div>
  );
}
