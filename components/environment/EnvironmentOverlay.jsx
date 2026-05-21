'use client';

export default function EnvironmentOverlay({
  aqi,
  temp,
  pollenLevel,
  weatherDescription,
  isLoading,
  error,
}) {
  return (
    <div className="aqo-environment-overlay">
      <h4>Live Environment</h4>
      {isLoading ? <p>Refreshing air and weather data...</p> : null}
      {error ? <p>{error}</p> : null}
      {!isLoading && !error ? (
        <div className="aqo-environment-grid">
          <div>
            <span>AQI</span>
            <strong>{aqi ?? '--'}</strong>
          </div>
          <div>
            <span>Temp</span>
            <strong>{typeof temp === 'number' ? `${Math.round(temp)}°C` : '--'}</strong>
          </div>
          <div>
            <span>Pollen</span>
            <strong>{pollenLevel || '--'}</strong>
          </div>
          <div>
            <span>Weather</span>
            <strong>{weatherDescription || '--'}</strong>
          </div>
        </div>
      ) : null}
    </div>
  );
}
