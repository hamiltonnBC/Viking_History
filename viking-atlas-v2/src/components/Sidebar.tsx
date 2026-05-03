import React, { useState, useEffect, useRef } from 'react';
import type { EventType } from '../types';
import { ChronicleEntry } from './ChronicleEntry';
import { TIMELINE_ENTRIES } from '../data/timelineEntries';
import { ERAS } from '../data/vikingData';
import clsx from 'clsx';

const ALL_FILTERS: { type: EventType; label: string; color: string; description: string }[] = [
  {
    type: 'origin',
    label: 'Origins',
    color: 'var(--gold-bright)',
    description: 'Explore the Norse world before the era of raids, encompassing their masterful shipbuilding, intricate burial customs, and the vibrant culture that launched an entire age.',
  },
  {
    type: 'raid',
    label: 'Raids',
    color: 'var(--blood-bright)',
    description: 'Swift, devastating strikes on monasteries, towns, and coastlines that defined the Viking Age in European memory.',
  },
  {
    type: 'settlement',
    label: 'Settlements',
    color: 'var(--parchment, #e8d5a3)',
    description: 'Discover where fierce raiders transitioned into dedicated farmers, founders, and kings, stretching out from the Danelaw to Dublin and all the way to the icy edges of Greenland.',
  },
  {
    type: 'trade',
    label: 'Trade Routes',
    color: 'var(--gold)',
    description: 'Norse merchants connected the Baltic to Byzantium, exchanging furs, amber, silver, and slaves across continents.',
  },
  {
    type: 'exploration',
    label: 'Exploration',
    color: 'var(--text-primary)',
    description: 'Driven by curiosity and necessity, Vikings reached Iceland, Greenland, and North America centuries before Columbus.',
  },
  {
    type: 'battle',
    label: 'Battles',
    color: 'var(--blood)',
    description: 'From river sieges to open sea warfare, Viking battles shaped the political map of medieval Europe.',
  },
  {
    type: 'conquest',
    label: 'Conquests',
    color: 'var(--blood-bright)',
    description: 'Witness the permanent territorial takeovers executed by Norse warlords who eventually abandoned raiding in favor of ruling entire newly formed kingdoms.',
  },
];

type Tab = 'filters' | 'chronicle';

interface SidebarProps {
  activeFilters: EventType[];
  onToggleFilter: (type: EventType) => void;
  // When timeline has requested to scroll to specific era, 
  // sidebar consumes this value and calls onScrollToEraConsumed to reset it.
  scrollToEra: number | null;
  onScrollToEraConsumed: () => void;
}

export function Sidebar({ activeFilters, onToggleFilter, scrollToEra, onScrollToEraConsumed }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<Tab>('filters');
  const chronicleContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToEra === null) return;

    // 1. Switch to chronicle tab so the content is mounted and visible
    setActiveTab('chronicle');

    // 2. Defer scroll until after the tab switch re-render
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

  /** For the Chronicle tab, only show entries whose tags overlap active filters */
  const visibleEntries = TIMELINE_ENTRIES.filter((entry) =>
    entry.tags.some((tag) => activeFilters.includes(tag))
  ).sort((a, b) => a.year - b.year);

  return (
    <aside className="sidebar">
      {/* Tab navigation */}
      <div className="sidebar-tabs">
        <button
          id="sidebar-tab-filters"
          className={clsx('sidebar-tab', { active: activeTab === 'filters' })}
          onClick={() => setActiveTab('filters')}
        >
          Filters
        </button>
        <button
          id="sidebar-tab-chronicle"
          className={clsx('sidebar-tab', { active: activeTab === 'chronicle' })}
          onClick={() => setActiveTab('chronicle')}
        >
          Chronicle
          {visibleEntries.length > 0 && (
            <span className="sidebar-tab-count">{visibleEntries.length}</span>
          )}
        </button>
      </div>

      {/* ── FILTERS TAB ── */}
      {activeTab === 'filters' && (
        <div className="sidebar-content">
          <p className="sidebar-desc">
            Select the types of Viking events you want to display on the map.
          </p>
          <div className="filter-list">
            {ALL_FILTERS.map((filter) => {
              const isActive = activeFilters.includes(filter.type);
              return (
                <button
                  key={filter.type}
                  className={clsx('filter-btn', { active: isActive })}
                  onClick={() => onToggleFilter(filter.type)}
                  style={{ '--filter-color': filter.color } as React.CSSProperties}
                >
                  <div className="filter-indicator" />
                  <div className="filter-btn-text">
                    <span className="filter-label">{filter.label}</span>
                    <span className="filter-desc">{filter.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── CHRONICLE TAB ── */}
      {activeTab === 'chronicle' && (
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
      )}
    </aside>
  );
}
