import { createContext, useContext } from 'react';

export interface ZoomControls {
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleZoomReset: () => void;
}

export const ZoomContext = createContext<ZoomControls | null>(null);

export function useZoomControls(): ZoomControls | null {
  return useContext(ZoomContext);
}
