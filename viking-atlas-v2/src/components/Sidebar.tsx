import React, { useEffect, useRef } from 'react';
import type { EventType } from '../types';
import { ChronicleEntry } from './ChronicleEntry';
import { TIMELINE_ENTRIES } from '../data/timelineEntries';
import { ERAS } from '../data/vikingData';
import clsx from 'clsx';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeFilters: EventType[];
  scrollToEra: number | null;
  onScrollToEraConsumed: () => void;
}

export function Sidebar({ isOpen, onToggle, activeFilters, scrollToEra, onScrollToEraConsumed }: SidebarProps) {
  const chronicleContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToEra === null) return;

    // Defer scroll until after the tab switch re-render
    let cancelled = false;
    const frameId = requestAnimationFrame(() => {
      if (cancelled) return;
      // Walk forward from the requested era index to find the nearest rendered header.
      for (let i = scrollToEra; i < ERAS.length; i++) {
        const el = document.getElementById(`chronicle-era-${i}`);
        if (el && chronicleContentRef.current) {
          const container = chronicleContentRef.current;
          container.scrollTo({ top: el.offsetTop - container.offsetTop, behavior: 'smooth' });
          break;
        }
      }
      onScrollToEraConsumed();
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
    };
  }, [scrollToEra, onScrollToEraConsumed]);

  /** Only show entries whose tags overlap active filters */
  const visibleEntries = TIMELINE_ENTRIES.filter((entry) =>
    entry.tags.some((tag) => activeFilters.includes(tag))
  ).sort((a, b) => a.year - b.year);

  return (
    <aside className={clsx('sidebar', { 'sidebar--closed': !isOpen })}>
      {/* Sidebar header with title; collapse button is absolutely positioned on the right edge */}
      <div className="sidebar-header">
        <span className="sidebar-title">
          Chronicle
          {visibleEntries.length > 0 && (
            <span className="sidebar-tab-count">{visibleEntries.length}</span>
          )}
        </span>
      </div>

      {/* Collapse tab - sits on the right border of the sidebar, peeks into the map area */}
      <button
        className="sidebar-collapse-btn"
        onClick={onToggle}
        aria-label="Collapse sidebar"
      >
        ‹
      </button>

      {/* ── CHRONICLE CONTENT ── */}
      <div className="sidebar-content sidebar-chronicle" ref={chronicleContentRef}>
        {visibleEntries.length === 0 ? (
          <p className="sidebar-desc chronicle-empty">
            No chronicle entries match the active filters. Enable more event types to see entries.
          </p>
        ) : (
          <div className="chronicle-list">
            {(() => {
              let lastEraIndex = -1;
              return visibleEntries.map((entry) => {
                const eraIndex = ERAS.findIndex(
                  (era) => entry.year >= era.min && entry.year <= era.max
                );
                const showHeader = eraIndex !== -1 && eraIndex !== lastEraIndex;
                if (showHeader) lastEraIndex = eraIndex;

                return (
                  <React.Fragment key={entry.id}>
                    {showHeader && (
                      <div
                        className="chronicle-era-header"
                        id={`chronicle-era-${eraIndex}`}
                      >
                        <span className="chronicle-era-label">
                          {ERAS[eraIndex].label}
                        </span>
                      </div>
                    )}
                    <ChronicleEntry entry={entry} />
                  </React.Fragment>
                );
              });
            })()}
          </div>
        )}
      </div>
    </aside>
  );
}
