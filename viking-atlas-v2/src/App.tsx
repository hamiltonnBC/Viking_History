import { useState, useEffect } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { InfoPanel } from './components/InfoPanel';
import { MapContainer } from './components/Map/MapContainer';
import { Sidebar } from './components/Sidebar';
import { HomeSplash } from './components/HomeSplash';
import { RuneTranslator } from './components/RuneTranslator';
import { EVENTS, ROUTES, START_YEAR } from './data/vikingData';
import type { VikingEvent, EventType } from './types';

function App() {
  const [isHomeVisible, setIsHomeVisible] = useState(true);
  const [isRuneVisible, setIsRuneVisible] = useState(false);
  const [currentYear, setCurrentYear] = useState(START_YEAR);
  const [selectedEvent, setSelectedEvent] = useState<VikingEvent | null>(null);
  const [activeFilters, setActiveFilters] = useState<EventType[]>([
    'origin', 'raid', 'settlement', 'trade', 'conquest', 'exploration', 'battle'
  ]);
  const [scrollToEra, setScrollToEra] = useState<number | null>(null);

useEffect(() => {
  if (selectedEvent && currentYear < selectedEvent.year) {
    setSelectedEvent(null);
  }
}, [currentYear, selectedEvent]);

  const handleToggleFilter = (type: EventType) => {
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
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
          activeFilters={activeFilters}
          onToggleFilter={handleToggleFilter}
          scrollToEra={scrollToEra}
          onScrollToEraConsumed={handleScrollToEraConsumed}
        />
        <MapContainer 
          currentYear={currentYear} 
          events={EVENTS} 
          routes={ROUTES} 
          activeFilters={activeFilters}
          onEventClick={setSelectedEvent} 
        />
        <InfoPanel 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
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
