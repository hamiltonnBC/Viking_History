export type EventType = 'origin' | 'raid' | 'settlement' | 'trade' | 'conquest' | 'exploration' | 'battle';
export type RouteType = 'raid' | 'exploration' | 'trade';

export interface Era {
  min: number;
  max: number;
  label: string;
  summary: string;
}

export interface OriginHub {
  id: string;
  label: string;
  coords: [number, number];
  description: string;
  /** IDs of TIMELINE_ENTRIES associated with this country */
  relatedEntryIds: string[];
}

export interface VikingEvent {
  id: string;
  year: number;
  coords: [number, number];
  title: string;
  date: string;
  tag: string;
  body: string;
  type: EventType;
  routes?: string[];
}

export interface Route {
  id: string;
  type: RouteType;
  /** First element is an origin hub ID, rest are [lon, lat] waypoints */
  origin: string;
  points: [number, number][];
}

export interface VikingData {
  START_YEAR: number;
  END_YEAR: number;
  ERAS: Era[];
  EVENTS: VikingEvent[];
  ROUTES: Route[];
}
