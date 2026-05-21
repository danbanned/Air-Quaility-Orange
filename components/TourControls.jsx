'use client';

export default function TourControls({
  onStartTour,
  onStopTour,
  isTourPlaying,
  onFreeRoam,
  onRecenter,
}) {
  return (
    <div className="aqo-tour-controls">
      {!isTourPlaying ? (
        <>
          <button type="button" className="aqo-tour-button aqo-tour-button-primary" onClick={onStartTour}>
            Start Cinematic Tour
          </button>
          <button type="button" className="aqo-tour-button" onClick={onFreeRoam}>
            Free Roam
          </button>
        </>
      ) : (
        <>
          <button type="button" className="aqo-tour-button aqo-tour-button-stop" onClick={onStopTour}>
            Stop Tour
          </button>
          <span className="aqo-tour-status">Cinematic tour playing</span>
        </>
      )}

      <button type="button" className="aqo-tour-button aqo-tour-button-icon" onClick={onRecenter} title="Recenter on Nicetown">
        Recenter
      </button>

      <div className="aqo-tour-hint">Right-click and drag to look around. Use the wheel or trackpad to move in and out.</div>
    </div>
  );
}
