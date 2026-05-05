import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { GeoPermissibleObjects } from 'd3';
import type { VikingEvent, Route, EventType, OriginHub } from '../../types';
import { ZoomControls } from './ZoomControls';
import { ZoomContext } from './ZoomContext';
import clsx from 'clsx';

interface MapContainerProps {
  currentYear: number;
  events: VikingEvent[];
  routes: Route[];
  originHubs: OriginHub[];
  activeFilters: EventType[];
  onEventClick: (event: VikingEvent) => void;
  onRouteClick: (route: Route) => void;
  onHubClick: (hub: OriginHub) => void;
}

export function MapContainer({ currentYear, events, routes, originHubs, activeFilters, onEventClick, onRouteClick, onHubClick }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomGroupRef = useRef<SVGGElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [geoData, setGeoData] = useState<d3.ExtendedFeatureCollection | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [zoomScale, setZoomScale] = useState(1);
  const [geoError, setGeoError] = useState(false);
  const BASE_R = 8;
  const [hoveredRoute, setHoveredRoute] = useState<Route | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load GeoJSON data
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}data/world.geojson`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setGeoData(data);
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
        setGeoError(true);
      }
    }
    loadData();
  }, []);

  // Handle Resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Setup D3 Zoom
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const zoomControls = useMemo(() => ({
    handleZoomIn: () => {
      if (svgRef.current && zoomRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy as any, 1.5);
      }
    },
    handleZoomOut: () => {
      if (svgRef.current && zoomRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy as any, 0.6);
      }
    },
    handleZoomReset: () => {
      if (svgRef.current && zoomRef.current) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        d3.select(svgRef.current).transition().call(zoomRef.current.transform as any, d3.zoomIdentity);
      }
    },
  }), []);

  useEffect(() => {
    if (!svgRef.current || !zoomGroupRef.current) return;

    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('start', () => setIsDragging(true))
      .on('zoom', (e) => {
        d3.select(zoomGroupRef.current).attr('transform', e.transform.toString());
        setZoomScale(e.transform.k);
      })
      .on('end', () => setIsDragging(false));

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    svg.call(zoom as any);
    zoomRef.current = zoom;
    svg.style('cursor', null);

    const handleWindowMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      svg.on('.zoom', null);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, []);

  // Compute projection and path generator
  const { projection, pathGenerator } = useMemo(() => {
    const proj = d3.geoMercator()
      .center([0, 58])
      .scale(500)
      .translate([dimensions.width / 2, dimensions.height / 2]);
    return {
      projection: proj,
      pathGenerator: d3.geoPath().projection(proj)
    };
  }, [dimensions]);

  // Derived state
  const activeEvents = events.filter(e => currentYear >= e.year && activeFilters.includes(e.type));
  const activeEventRouteIds = new Set(activeEvents.flatMap(e => e.routes || []));
  const activeRouteIds = new Set(
    routes
      .filter(r => activeFilters.includes(r.type as EventType) && activeEventRouteIds.has(r.id))
      .map(r => r.id)
  );

  const getEventColor = (type: EventType) => {
    if (type === 'raid') return 'var(--blood-bright)';
    if (type === 'conquest') return 'var(--conquest)';
    if (type === 'battle') return 'var(--blood)';
    if (type === 'trade') return 'var(--gold)';
    if (type === 'origin') return 'var(--gold-bright)';
    if (type === 'settlement') return 'var(--parchment)';
    if (type === 'exploration') return 'var(--exploration)';
    return 'var(--text-primary)';
  };

  const getRouteColor = (type: string) => {
    if (type === 'raid') return 'var(--blood-bright)';
    if (type === 'trade') return 'var(--gold)';
    if (type === 'exploration') return 'var(--exploration)';
    return 'var(--text-primary)';
  };

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      {geoError && (
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'var(--text-secondary)', fontFamily: 'var(--font-body)' }}>
          <p style={{ fontSize: '1.1rem' }}>⚠ Unable to load map data.</p>
          <p style={{ fontSize: '0.85rem' }}>Check your connection and refresh the page.</p>
        </div>
      )}
      <svg
        className="viking-map"
        ref={svgRef}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <defs>
          <marker id="arrow-raid" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 3 1.5 L 0 3 Z" fill="var(--blood-bright)" />
          </marker>
          <marker id="arrow-exploration" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 3 1.5 L 0 3 Z" fill="var(--exploration)" />
          </marker>
          <marker id="arrow-trade" markerWidth="3" markerHeight="3" refX="2.5" refY="1.5" orient="auto" markerUnits="strokeWidth">
            <path d="M 0 0 L 3 1.5 L 0 3 Z" fill="var(--gold)" />
          </marker>
        </defs>
        <g ref={zoomGroupRef}>
          {/* Base Landmass */}
          {geoData && (
            <g className="land-group">
              {geoData.features.map((feature: GeoPermissibleObjects, i: number) => {
                const pathData = pathGenerator(feature);
                return pathData ? <path key={i} className="land" d={pathData} /> : null;
              })}
            </g>
          )}

          {/* Country Labels */}
          {geoData && (
            <g className="country-labels">
              {geoData.features
                .filter((f: GeoPermissibleObjects) => {
                  const props = (f as GeoJSON.Feature).properties;
                  return props && ['Norway','Sweden','Denmark','United Kingdom','Ireland','Iceland','France','Greenland','Canada','Russia'].includes(props.name);
                })
                .map((feature: GeoPermissibleObjects, i: number) => {
                  const centroid = pathGenerator.centroid(feature);
                  if (isNaN(centroid[0]) || isNaN(centroid[1])) return null;
                  let [x, y] = centroid;
                  const props = (feature as GeoJSON.Feature).properties!;

                  if (props.name === 'Norway')         { const p = projection([10, 62] as [number, number]); if (p) { x = p[0]; y = p[1]; } }
                  if (props.name === 'Sweden')         { const p = projection([16, 62] as [number, number]); if (p) { x = p[0]; y = p[1]; } }
                  if (props.name === 'United Kingdom') { const p = projection([-2.5, 54] as [number, number]); if (p) { x = p[0]; y = p[1]; } }
                  if (props.name === 'France')         { const p = projection([2.5, 46.5] as [number, number]); if (p) { x = p[0]; y = p[1]; } }
                  if (props.name === 'Canada')         { const p = projection([-55, 52] as [number, number]); if (p) { x = p[0]; y = p[1]; } }
                  if (props.name === 'Russia')         { const p = projection([30, 58] as [number, number]); if (p) { x = p[0]; y = p[1]; } }
                  if (props.name === 'Greenland')      { const p = projection([-45, 65] as [number, number]); if (p) { x = p[0]; y = p[1]; } }

                  return (
                    <text key={i} x={x} y={y} className="country-label" textAnchor="middle">
                      {(props.name as string).toUpperCase()}
                    </text>
                  );
                })}
            </g>
          )}

          {/* Origin Hub Markers */}
          <g className="origin-hubs-group">
            {originHubs.map(hub => {
              const coords = projection(hub.coords);
              if (!coords) return null;
              const [x, y] = coords;
              const isActive = routes.some(r => r.origin === hub.id && activeRouteIds.has(r.id));
              return (
                <g key={hub.id} className={clsx('origin-hub', { active: isActive })} onClick={() => onHubClick(hub)} style={{ cursor: 'pointer' }}>
                  <circle cx={x} cy={y} r={14 / zoomScale} fill="transparent" />
                  <circle cx={x} cy={y} r={7 / zoomScale} className="origin-hub-ring" />
                  <circle cx={x} cy={y} r={3 / zoomScale} className="origin-hub-dot" />
                  <g className="origin-hub-label" transform={`translate(${x}, ${y}) scale(${1 / zoomScale})`}>
                    <text y={-12} textAnchor="middle" className="origin-hub-text">{hub.label}</text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* Routes */}
          <g className="routes-group">
            {routes.map(route => {
              const hub = originHubs.find(h => h.id === route.origin);
              if (!hub) return null;
              const allPoints: [number, number][] = [hub.coords, ...route.points];
              const lineData = allPoints.map(p => projection(p as [number, number]) as [number, number]).filter(Boolean);
              if (lineData.length < 2) return null;
              const pathStr = d3.line().curve(d3.curveCatmullRom.alpha(0.5))(lineData);
              const isActive = activeRouteIds.has(route.id);

              return (
                <g key={route.id}>
                  <path
                    className={clsx(`route ${route.type}`, { active: isActive })}
                    d={pathStr || undefined}
                    style={{ stroke: getRouteColor(route.type), pointerEvents: 'none' }}
                    markerEnd={isActive ? `url(#arrow-${route.type})` : undefined}
                  />
                  {isActive && (
                    <path
                      d={pathStr || undefined}
                      style={{ fill: 'none', stroke: 'transparent', strokeWidth: 20, pointerEvents: 'stroke', cursor: 'pointer' }}
                      onMouseEnter={() => setHoveredRoute(route)}
                      onMouseLeave={() => setHoveredRoute(null)}
                      onMouseMove={(e) => {
                        const rect = containerRef.current?.getBoundingClientRect();
                        if (!rect) return;
                        setTooltipPos({ x: e.clientX - rect.left + 12, y: e.clientY - rect.top + 12 });
                      }}
                      onClick={() => onRouteClick(route)}
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Hotspots */}
          <g className="hotspots-group">
            {events
              .filter(e => currentYear >= e.year && activeFilters.includes(e.type))
              .map(event => {
                const coords = projection(event.coords);
                if (!coords) return null;
                const [x, y] = coords;
                return (
                  <g key={event.id} transform={`translate(${x}, ${y})`}>
                    <g className="hotspot" onClick={() => onEventClick(event)}>
                      <circle r={BASE_R / zoomScale} fill={getEventColor(event.type)} />
                      <g className="hotspot-label" transform={`scale(${1 / zoomScale})`}>
                        <rect className="hotspot-label-bg" x={-45} y={BASE_R + 4} width={90} height={14} rx={3} />
                        <text className="hotspot-label-text" y={BASE_R + 14} textAnchor="middle">
                          {event.title.split(' — ')[0].toUpperCase()}
                        </text>
                      </g>
                    </g>
                  </g>
                );
              })}
          </g>
        </g>
      </svg>
      {hoveredRoute && (
        <div className="route-tooltip" style={{ left: tooltipPos.x, top: tooltipPos.y }}>
          {hoveredRoute.name}
        </div>
      )}
      <ZoomContext.Provider value={zoomControls}>
        <ZoomControls />
      </ZoomContext.Provider>
    </div>
  );
}
