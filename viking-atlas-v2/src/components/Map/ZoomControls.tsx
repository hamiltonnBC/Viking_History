import { useZoomControls } from './ZoomContext';

export function ZoomControls() {
  const controls = useZoomControls();

  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    if (!controls) return;
    if (type === 'in') controls.handleZoomIn();
    if (type === 'out') controls.handleZoomOut();
    if (type === 'reset') controls.handleZoomReset();
  };

  return (
    <div className="zoom-controls">
      <button onClick={() => handleZoom('in')} aria-label="Zoom in">+</button>
      <button onClick={() => handleZoom('out')} aria-label="Zoom out">−</button>
      <button onClick={() => handleZoom('reset')} aria-label="Reset zoom">⟲</button>
    </div>
  );
}
