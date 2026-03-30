import { useState } from 'react';
import './App.css';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { InfoPanel } from './components/InfoPanel';
import { MapContainer } from './components/Map/MapContainer';
import { Sidebar } from './components/Sidebar';
import { EVENTS, ROUTES, START_YEAR } from './data/vikingData';
import type { VikingEvent, EventType } from './types';

function App() {
  const [currentYear, setCurrentYear] = useState(START_YEAR);
  const [selectedEvent, setSelectedEvent] = useState<VikingEvent | null>(null);
  const [activeFilters, setActiveFilters] = useState<EventType[]>([
    'origin', 'raid', 'settlement', 'trade', 'conquest', 'exploration', 'battle'
  ]);

  if (selectedEvent && currentYear < selectedEvent.year) {
    setSelectedEvent(null);
  }

  const handleToggleFilter = (type: EventType) => {
    setActiveFilters(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  return (
    <div id="app">
      <Header currentYear={currentYear} />
      
      <main className="atlas-container">
        <Sidebar activeFilters={activeFilters} onToggleFilter={handleToggleFilter} />
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
      />
    </div>
  );
}

export default App;
