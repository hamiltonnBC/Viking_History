export function ZoomControls() {
  const handleZoom = (type: 'in' | 'out' | 'reset') => {
    const controls = (window as any).__vikingMapZoomControls;
    if (controls) {
      if (type === 'in') controls.handleZoomIn();
      if (type === 'out') controls.handleZoomOut();
      if (type === 'reset') controls.handleZoomReset();
    }
  };

  return (
    <div className="zoom-controls">
      <button onClick={() => handleZoom('in')}>+</button>
      <button onClick={() => handleZoom('out')}>−</button>
      <button onClick={() => handleZoom('reset')}>⟲</button>
    </div>
  );
}
