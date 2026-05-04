import { useState, useEffect, useRef } from 'react';
import clsx from 'clsx';
import './App.css';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { InfoPanel } from './components/InfoPanel';
import { MapContainer } from './components/Map/MapContainer';
import { Sidebar } from './components/Sidebar';
import { FiltersOverlay } from './components/FiltersOverlay';
import { HomeSplash } from './components/HomeSplash';
import { RuneTranslator } from './components/RuneTranslator';
import { EVENTS, ROUTES, START_YEAR } from './data/vikingData';
import type { VikingEvent, Route, EventType } from './types';

function App() {
  const [isHomeVisible, setIsHomeVisible] = useState(true);
  const [isRuneVisible, setIsRuneVisible] = useState(false);
  const [currentYear, setCurrentYear] = useState(START_YEAR);
  const [selectedItem, setSelectedItem] = useState<VikingEvent | Route | null>(null);
  const [activeFilters, setActiveFilters] = useState<EventType[]>([
    'origin', 'raid', 'settlement', 'trade', 'conquest', 'exploration', 'battle'
  ]);
  const [scrollToEra, setScrollToEra] = useState<number | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filtersToggleRef = useRef<HTMLButtonElement>(null);

useEffect(() => {
  if (selectedItem && 'coords' in selectedItem && currentYear < selectedItem.year) {
    setSelectedItem(null);
  }
}, [currentYear, selectedItem]);

  useEffect(() => {
    if (scrollToEra !== null && !isSidebarOpen) {
      setIsSidebarOpen(true);
    }
  }, [scrollToEra, isSidebarOpen]);

  const handleToggleFilter = (type: EventType) => {
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const handleSelectAll = () => {
    const allTypes: EventType[] = ['origin', 'raid', 'settlement', 'trade', 'conquest', 'exploration', 'battle'];
    setActiveFilters(prev =>
      prev.length === allTypes.length ? [] : allTypes
    );
  };

  const handleEraJump = (eraIndex: number) => {
    setScrollToEra(eraIndex);
  };

  const handleScrollToEraConsumed = () => {
    setScrollToEra(null);
  };

  return (
    <div id="app">
      <HomeSplash isVisible={isHomeVisible} onEnter={() => setIsHomeVisible(false)} />
      <RuneTranslator isVisible={isRuneVisible} onClose={() => setIsRuneVisible(false)} />
      <Header currentYear={currentYear} onOpenHome={() => setIsHomeVisible(true)} />
      
      <main className="atlas-container">
        <Sidebar
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(prev => !prev)}
          activeFilters={activeFilters}
          scrollToEra={scrollToEra}
          onScrollToEraConsumed={handleScrollToEraConsumed}
        />
        <div className="map-holder">
          <MapContainer 
            currentYear={currentYear} 
            events={EVENTS} 
            routes={ROUTES} 
            activeFilters={activeFilters}
            onEventClick={event => setSelectedItem(event)}
            onRouteClick={route => setSelectedItem(route)}
          />
          {/* Reopen tab — visible on the left edge of the map when sidebar is closed */}
          {!isSidebarOpen && (
            <button
              className="sidebar-reopen-tab"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open sidebar"
            >
              ›
            </button>
          )}
          <button
            ref={filtersToggleRef}
            className={clsx('filters-toggle-btn', { 'has-inactive': activeFilters.length < 7 })}
            onClick={() => setIsFiltersOpen(prev => !prev)}
            aria-label="Toggle filters"
            aria-expanded={isFiltersOpen}
          >
            Filters
            {activeFilters.length < 7 && (
              <span className="filters-toggle-badge">{activeFilters.length}/7</span>
            )}
          </button>
          <FiltersOverlay
            isOpen={isFiltersOpen}
            onClose={() => setIsFiltersOpen(false)}
            activeFilters={activeFilters}
            onToggleFilter={handleToggleFilter}
            onSelectAll={handleSelectAll}
            toggleButtonRef={filtersToggleRef}
          />
          <InfoPanel 
            selectedItem={selectedItem}
            events={EVENTS}
            onSelectEvent={event => setSelectedItem(event)}
            onClose={() => setSelectedItem(null)} 
          />
        </div>
      </main>

      <Timeline 
        currentYear={currentYear} 
        onYearChange={setCurrentYear} 
        onOpenRunes={() => setIsRuneVisible(true)}
        onEraJump={handleEraJump}
      />
    </div>
  );
}

export default App;
