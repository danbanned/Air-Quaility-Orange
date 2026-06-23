'use client';

export default function TourControls({
  onStartTour,
  onStopTour,
  onStartStreetTrail,
  isTourPlaying,
  onFreeRoam,
  onRecenter,
  perspective,
  onPerspectiveToggle,
}) {
  const isSolutions = perspective === 'solutions';

  return (
    <div className="aqo-tour-controls">
      {/* Perspective toggle — headline control, visually distinct from tour buttons */}
      <button
        type="button"
        className={`aqo-tour-button aqo-perspective-toggle${isSolutions ? ' aqo-perspective-toggle-active' : ''}`}
        onClick={onPerspectiveToggle}
      >
        {isSolutions ? '← Full Reality' : 'Path Forward →'}
      </button>
      {isSolutions && (
        <p className="aqo-perspective-caption">
          Real changes already underway in Nicetown &amp; Hunting Park.
        </p>
      )}

      <div className="aqo-tour-divider" />

      {!isTourPlaying ? (
        <>
          <button type="button" className="aqo-tour-button aqo-tour-button-primary" onClick={onStartTour}>
            Start Cinematic Tour
          </button>
          <button type="button" className="aqo-tour-button" onClick={onStartStreetTrail}>
            Street Trail Tour
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
          <span className="aqo-tour-status">Tour playing</span>
        </>
      )}

      <button type="button" className="aqo-tour-button aqo-tour-button-icon" onClick={onRecenter} title="Recenter on Nicetown">
        Recenter
      </button>

      <div className="aqo-tour-hint">Right-click and drag to look around. Use the wheel or trackpad to move in and out.</div>
    </div>
  );
}
