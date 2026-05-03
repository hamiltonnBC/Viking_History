import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import type { VikingEvent, Route, EventType } from '../../types';
import { ZoomControls } from './ZoomControls';
import clsx from 'clsx';

interface MapContainerProps {
  currentYear: number;
  events: VikingEvent[];
  routes: Route[];
  activeFilters: EventType[];
  onEventClick: (event: VikingEvent) => void;
}

export function MapContainer({ currentYear, events, routes, activeFilters, onEventClick }: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomGroupRef = useRef<SVGGElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [geoData, setGeoData] = useState<d3.ExtendedFeatureCollection | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  // Track the D3 zoom scale so we can shrink markers as the user zooms in
  // (zoom-invariant markers: r_svg = BASE_R / k  →  r_screen ≈ BASE_R always)
  const [zoomScale, setZoomScale] = useState(1);
  const BASE_R = 8; // target on-screen radius in pixels

  // Load GeoJSON data
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data/world.geojson');
        const data = await response.json();
        setGeoData(data);
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
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
  useEffect(() => {
    if (!svgRef.current || !zoomGroupRef.current) return;

    const svg = d3.select(svgRef.current);
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 8])
      .on('start', () => {
        // When user begins a drag — use D3 zoom's 'start' to set grabbing cursor instead of relying on React mousedown that might cause lag 
        setIsDragging(true);
      })
      .on('zoom', (e) => {
        d3.select(zoomGroupRef.current).attr('transform', e.transform.toString());
        setZoomScale(e.transform.k);
      })
      .on('end', () => {
        setIsDragging(false);
      });

    svg.call(zoom as any);

    // Remove D3 zoom cursor sets on the SVG element so React inline style (set via isDragging state) is the only followed.
    svg.style('cursor', null);

    // Provide methods to standard buttons
    const handleZoomIn = () => svg.transition().call(zoom.scaleBy as any, 1.5);
    const handleZoomOut = () => svg.transition().call(zoom.scaleBy as any, 0.6);
    const handleZoomReset = () => svg.transition().call(zoom.transform as any, d3.zoomIdentity);
    
    (window as any).__vikingMapZoomControls = { handleZoomIn, handleZoomOut, handleZoomReset };

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
      .center([0, 58]) // Centered around North Atlantic
      .scale(500)
      .translate([dimensions.width / 2, dimensions.height / 2]);
    
    return {
      projection: proj,
      pathGenerator: d3.geoPath().projection(proj)
    };
  }, [dimensions]);

  // Derived state based on current year and filters
  const activeEvents = events.filter(e => currentYear >= e.year && activeFilters.includes(e.type));
  // A route is active if any active event uses it
  const activeRouteIds = new Set(
    activeEvents.flatMap(e => e.routes || [])
  );

  const getEventColor = (type: EventType) => {
    if (['raid', 'battle', 'conquest'].includes(type)) return 'var(--blood-bright)';
    if (type === 'trade') return 'var(--gold)';
    if (type === 'origin') return 'var(--gold-bright)';
    return 'var(--parchment)';
  };

  const getRouteColor = (type: string) => {
    if (type === 'raid') return 'var(--blood-bright)';
    if (type === 'trade') return 'var(--gold)';
    return 'var(--sea-light)';
  };

  return (
    <div className="map-holder" ref={containerRef}>
      {/* cursor is set via inline style so it always wins over D3 zoom's own
          inline cursor style. isDragging is driven by D3's zoom start/end
          events rather than React mousedown/mouseup to avoid race conditions. */}
      <svg
        className="viking-map"
        ref={svgRef}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <g ref={zoomGroupRef}>
          {/* Base Landmass */}
          {geoData && (
            <g className="land-group">
              {geoData.features.map((feature: any, i: number) => {
                const pathData = pathGenerator(feature);
                return pathData ? (
                  <path key={i} className="land" d={pathData} />
                ) : null;
              })}
            </g>
          )}

          {/* Country Labels */}
          {geoData && (
            <g className="country-labels">
              {geoData.features
                .filter((f: any) =>
                  [
                    'Norway', 'Sweden', 'Denmark', 'United Kingdom', 'Ireland',
                    'Iceland', 'France', 'Greenland', 'Canada', 'Russia'
                  ].includes(f.properties.name)
                )
                .map((feature: any, i: number) => {
                  const centroid = pathGenerator.centroid(feature);
                  if (isNaN(centroid[0]) || isNaN(centroid[1])) return null;
                  
                  let [x, y] = centroid;
                  
                  // Adjust huge countries to be closer to Viking action areas
                  if (feature.properties.name === 'Canada') {
                     const proj = projection([-55, 52] as [number, number]);
                     if (proj) { x = proj[0]; y = proj[1]; }
                  }
                  if (feature.properties.name === 'Russia') {
                     const proj = projection([30, 58] as [number, number]);
                     if (proj) { x = proj[0]; y = proj[1]; }
                  }
                  if (feature.properties.name === 'Greenland') {
                     const proj = projection([-45, 65] as [number, number]);
                     if (proj) { x = proj[0]; y = proj[1]; }
                  }

                  return (
                    <text
                      key={i}
                      x={x}
                      y={y}
                      className="country-label"
                      textAnchor="middle"
                    >
                      {feature.properties.name.toUpperCase()}
                    </text>
                  );
                })}
            </g>
          )}

          {/* Routes */}
          <g className="routes-group">
            {routes.map(route => {
              const lineData: [number, number][] = route.points.map(p => projection(p as [number, number]) as [number, number]).filter(Boolean);
              if (lineData.length < 2) return null;
              
              const pathStr = d3.line()(lineData);
              const isActive = activeRouteIds.has(route.id);
              
              return (
                <path
                  key={route.id}
                  className={clsx(`route ${route.type}`, { active: isActive })}
                  d={pathStr || undefined}
                  style={{ stroke: getRouteColor(route.type) }}
                />
              );
            })}
          </g>

          {/* Hotspots — only rendered once currentYear reaches the event's year.
              Outer <g> handles positioning via SVG transform attribute.
              Inner <g> handles CSS hover scale — keep these separate to avoid
              SVG-attribute vs CSS-property transform conflicts. */}
          <g className="hotspots-group">
            {events
              .filter(e => currentYear >= e.year && activeFilters.includes(e.type))
              .map(event => {
                const coords = projection(event.coords);
                if (!coords) return null;
                const [x, y] = coords;

                return (
                  <g key={event.id} transform={`translate(${x}, ${y})`}>
                    <g
                      className="hotspot"
                      onClick={() => onEventClick(event)}
                    >
                      {/* Circle shrinks in SVG coords as zoom increases → constant screen size */}
                      <circle r={BASE_R / zoomScale} fill={getEventColor(event.type)} />

                      {/* Inverse-scale the label group: scale(1/k) cancels the zoom group's
                          scale(k), so text + bg rect always appear at natural screen size */}
                      <g
                        className="hotspot-label"
                        transform={`scale(${1 / zoomScale})`}
                      >
                        <rect
                          className="hotspot-label-bg"
                          x={-45}
                          y={BASE_R + 4}
                          width={90}
                          height={14}
                          rx={3}
                        />
                        <text
                          className="hotspot-label-text"
                          y={BASE_R + 14}
                          textAnchor="middle"
                        >
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
      <ZoomControls />
    </div>
  );
}
