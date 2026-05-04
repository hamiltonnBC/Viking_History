import React from 'react';
import type { EventType } from '../types';

/** Maps each EventType to its brand color CSS variable */
const TAG_COLORS: Record<EventType, string> = {
  origin:      'var(--gold-bright)',
  raid:        'var(--blood-bright)',
  settlement:  'var(--parchment, #e8d5a3)',
  trade:       'var(--gold)',
  exploration: 'var(--exploration)',
  battle:      'var(--blood)',
  conquest:    'var(--conquest)',
};

interface BadgeProps {
  tag: EventType;
  /** Optionally override the display label */
  label?: string;
}

const TAG_LABELS: Record<EventType, string> = {
  origin:      'Origin',
  raid:        'Raid',
  settlement:  'Settlement',
  trade:       'Trade',
  exploration: 'Exploration',
  battle:      'Battle',
  conquest:    'Conquest',
};

export function Badge({ tag, label }: BadgeProps) {
  const color = TAG_COLORS[tag];
  const text  = label ?? TAG_LABELS[tag];

  return (
    <span
      className="badge"
      style={{ '--badge-color': color } as React.CSSProperties}
    >
      {text}
    </span>
  );
}
