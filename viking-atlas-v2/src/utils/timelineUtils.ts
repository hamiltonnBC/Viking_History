import { ERAS } from '../data/vikingData';

/** Returns index of the era for `year` - Clamps to the last era if no match is found. */
export function getActiveEraIndex(year: number): number {
  const idx = ERAS.findIndex((era) => year >= era.min && year <= era.max);
  return idx === -1 ? ERAS.length - 1 : idx;
}
