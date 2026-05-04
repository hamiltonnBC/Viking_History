import { useRef, useEffect } from 'react';
import clsx from 'clsx';
import { ALL_FILTERS } from '../data/filterConstants';
import type { EventType } from '../types';

interface FiltersOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilters: EventType[];
  onToggleFilter: (type: EventType) => void;
  onSelectAll: () => void;
  toggleButtonRef: React.RefObject<HTMLButtonElement | null>;
}

export function FiltersOverlay({
  isOpen,
  onClose,
  activeFilters,
  onToggleFilter,
  onSelectAll,
  toggleButtonRef,
}: FiltersOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const allSelected = activeFilters.length === ALL_FILTERS.length;

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      // Ignore clicks on the toggle button — it handles open/close itself
      if (toggleButtonRef.current?.contains(e.target as Node)) return;
      if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen, onClose, toggleButtonRef]);

  return (
    <div
      ref={overlayRef}
      className={clsx('filters-overlay', { 'filters-overlay--open': isOpen })}
      aria-hidden={!isOpen}
    >
      {/* Header row: title + select-all checkbox */}
      <div className="filters-overlay-header">
        <p className="filters-overlay-title">Event Types</p>
        <button
          className={clsx('filters-select-all', { active: allSelected })}
          onClick={onSelectAll}
          aria-label={allSelected ? 'Deselect all filters' : 'Select all filters'}
          title={allSelected ? 'Deselect all' : 'Select all'}
        >
          {allSelected ? '☑' : '☐'}
        </button>
      </div>

      <div className="filters-overlay-list">
        {ALL_FILTERS.map((filter) => {
          const isActive = activeFilters.includes(filter.type);
          return (
            <button
              key={filter.type}
              className={clsx('filters-overlay-row', { active: isActive })}
              onClick={() => onToggleFilter(filter.type)}
              style={{ '--filter-color': filter.color } as React.CSSProperties}
            >
              <div className="filter-indicator" />
              <span className="filter-label">{filter.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
