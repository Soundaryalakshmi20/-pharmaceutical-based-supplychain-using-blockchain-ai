import { useState, useRef, useEffect } from 'react';

/**
 * 3D Medicine Viewer — uses CSS 3D transforms (no heavy deps).
 * Renders an interactive 3D medicine box/bottle that users can rotate
 * by dragging. Includes a 2D fallback mode for accessibility.
 */
export default function MedicineViewer3D({ medicine, mode3D = true }) {
  const [rotation, setRotation] = useState({ x: -15, y: 25 });
  const [isDragging, setIsDragging] = useState(false);
  const [prevMouse, setPrevMouse] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);

  // Auto-rotation
  useEffect(() => {
    if (!autoRotate || isDragging) return;
    let frame;
    function animate() {
      setRotation(r => ({ ...r, y: r.y + 0.3 }));
      frame = requestAnimationFrame(animate);
    }
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [autoRotate, isDragging]);

  // Drag handlers
  function onPointerDown(e) {
    setIsDragging(true);
    setAutoRotate(false);
    setPrevMouse({ x: e.clientX, y: e.clientY });
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e) {
    if (!isDragging) return;
    const dx = e.clientX - prevMouse.x;
    const dy = e.clientY - prevMouse.y;
    setRotation(r => ({
      x: Math.max(-60, Math.min(60, r.x + dy * 0.5)),
      y: r.y + dx * 0.5,
    }));
    setPrevMouse({ x: e.clientX, y: e.clientY });
  }

  function onPointerUp() {
    setIsDragging(false);
  }

  const dosageForm = medicine?.dosage_form || 'Tablet';
  const isBottle = /syrup|suspension|drops|liquid|ml/i.test(dosageForm) || /bottle|vial/i.test(dosageForm);
  const isCapsule = /capsule/i.test(dosageForm);

  if (!mode3D) {
    // 2D Fallback
    return (
      <div className="medicine-viewer-2d">
        <div className={`medicine-card-2d ${isBottle ? 'bottle' : isCapsule ? 'capsule' : 'tablet'}`}>
          <div className="medicine-label">
            <h4>{medicine?.name || 'Medicine'}</h4>
            <p>{medicine?.generic_name}</p>
            <p>{medicine?.strength}</p>
            <p>{medicine?.manufacturer}</p>
            <p>Mfg: {medicine?.manufacturer_date}</p>
            <p>Exp: {medicine?.expiry_date}</p>
            <p>Batch: {medicine?.batch_number}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="medicine-viewer-3d-container">
      <div className="viewer-controls">
        <button onClick={() => setAutoRotate(a => !a)} className="btn-sm">
          {autoRotate ? '⏸️ Pause' : '▶️ Auto-Rotate'}
        </button>
        <button onClick={() => setRotation({ x: -15, y: 25 })} className="btn-sm">🔄 Reset</button>
      </div>

      <div
        className="medicine-viewer-3d-scene"
        ref={containerRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div
          className={`medicine-3d-object ${isBottle ? 'bottle' : isCapsule ? 'capsule' : 'tablet'}`}
          style={{
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          }}
        >
          {/* Front Face */}
          <div className="face face-front">
            <div className="face-content">
              <div className="medicine-brand">{medicine?.name || 'Medicine'}</div>
              <div className="medicine-generic">{medicine?.generic_name}</div>
              <div className="medicine-strength">{medicine?.strength}</div>
              <div className="medicine-mfg">{medicine?.manufacturer}</div>
            </div>
          </div>
          {/* Back Face */}
          <div className="face face-back">
            <div className="face-content">
              <p><strong>Composition:</strong></p>
              <p>{medicine?.generic_name} {medicine?.strength}</p>
              <p><strong>Dosage:</strong> {medicine?.dosage_form}</p>
              <p><strong>Schedule:</strong> {medicine?.schedule}</p>
              <p><strong>MRP:</strong> ₹{medicine?.mrp}</p>
            </div>
          </div>
          {/* Top Face */}
          <div className="face face-top">
            <div className="face-content">
              <p>Batch: {medicine?.batch_number || 'N/A'}</p>
              <p>Mfg: {medicine?.manufacturer_date || 'N/A'}</p>
            </div>
          </div>
          {/* Bottom Face */}
          <div className="face face-bottom">
            <div className="face-content">
              <p>Exp: {medicine?.expiry_date || 'N/A'}</p>
              <p>Storage: {medicine?.storage_temp || 'Room temp'}</p>
            </div>
          </div>
          {/* Right Face */}
          <div className="face face-right">
            <div className="face-content">
              <p className="barcode-visual">||||| ||||| |||||</p>
              <p>{medicine?.barcode || 'NO-BARCODE'}</p>
            </div>
          </div>
          {/* Left Face */}
          <div className="face face-left">
            <div className="face-content">
              <p>CDSCO</p>
              <p>{medicine?.schedule || 'H'}</p>
              <p>Reg. No.</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-muted mt-2">Click and drag to rotate • Auto-rotation {autoRotate ? 'on' : 'off'}</p>
    </div>
  );
}
