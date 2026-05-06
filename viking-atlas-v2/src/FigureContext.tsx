import { createContext, useContext, type ReactNode } from 'react';
import { FIGURE_LINKS } from './components/ImportantFigures';

interface FigureContextType {
  openFigure: (id: string) => void;
  linkifyText: (text: string) => ReactNode;
}

const FigureContext = createContext<FigureContextType | undefined>(undefined);

export function useFigure() {
  const context = useContext(FigureContext);
  if (!context) {
    throw new Error('useFigure must be used within a FigureProvider');
  }
  return context;
}

interface FigureProviderProps {
  children: ReactNode;
  onOpenFigure: (id: string) => void;
}

export function FigureProvider({ children, onOpenFigure }: FigureProviderProps) {
  // Sort aliases by length descending to match longer names first (e.g. "Erik the Red" before "Erik")
  const aliases = Object.keys(FIGURE_LINKS).sort((a, b) => b.length - a.length);
  
  // Create a regex that matches any of the aliases
  // Using \b for word boundaries to avoid partial matches (e.g. "Erik" in "Eriksson")
  // We escape special characters in aliases just in case
  const escapedAliases = aliases.map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`\\b(${escapedAliases.join('|')})\\b`, 'g');

  const linkifyText = (text: string): ReactNode => {
    if (!text) return text;

    const parts = text.split(regex);
    if (parts.length === 1) return text;

    return (
      <>
        {parts.map((part, i) => {
          // Every odd part is a match from the capturing group in our regex
          if (i % 2 === 1) {
            const figureId = FIGURE_LINKS[part];
            return (
              <button
                key={i}
                className="figure-mention-link"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenFigure(figureId);
                }}
              >
                {part}
              </button>
            );
          }
          return part;
        })}
      </>
    );
  };

  return (
    <FigureContext.Provider value={{ openFigure: onOpenFigure, linkifyText }}>
      {children}
    </FigureContext.Provider>
  );
}
