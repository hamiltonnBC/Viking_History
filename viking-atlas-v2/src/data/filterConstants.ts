import type { EventType } from '../types';

export interface FilterDescriptor {
  type: EventType;
  label: string;
  color: string;
  description: string;
}

export const ALL_FILTERS: FilterDescriptor[] = [
  {
    type: 'origin',
    label: 'Ships',
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
    color: 'var(--parchment)',
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
    color: 'var(--exploration)',
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
    color: 'var(--conquest)',
    description: 'Witness the permanent territorial takeovers executed by Norse warlords who eventually abandoned raiding in favor of ruling entire newly formed kingdoms.',
  },
];
