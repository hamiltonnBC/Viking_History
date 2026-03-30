export type EventType = 'origin' | 'raid' | 'settlement' | 'trade' | 'conquest' | 'exploration' | 'battle';
export type RouteType = 'raid' | 'exploration' | 'trade';

export interface Era {
  min: number;
  max: number;
  label: string;
  summary: string;
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
  points: [number, number][];
}

export interface VikingData {
  START_YEAR: number;
  END_YEAR: number;
  ERAS: Era[];
  EVENTS: VikingEvent[];
  ROUTES: Route[];
}
