// components/Map/MapComponent.js
import React, { useMemo, useState } from 'react';
import {
  COMMUNITY_SOLUTIONS,
  HEAT_ISLAND_ZONES,
  NICETOWN_COORDINATES,
  POLLUTION_SOURCES
} from '../../utils/mapUtils';
import './MapComponent.css';

const MapComponent = ({ userId, showPollution = true, showSolutions = true, showHeat = true }) => {
  const [selectedLocation, setSelectedLocation] = useState(POLLUTION_SOURCES[0]);
  const [mapType, setMapType] = useState('roadmap');
  const markerDotClass = (type) => {
    switch (type) {
      case 'garden':
      case 'greenspace':
      case 'infrastructure':
        return 'green';
      case 'industrial':
      case 'transportation':
        return 'red';
      default:
        return 'orange';
    }
  };

  const getHeatColor = (intensity) => {
    return intensity === 'high' ? '#FF0000' : '#FFA500';
  };

  const mapSrc = useMemo(() => {
    const base = 'https://www.openstreetmap.org/export/embed.html';
    const bbox = '-75.176,40.010,-75.130,40.035'.split(','); // west,south,east,north
    const layer = mapType === 'satellite' ? 'cyclosm' : mapType === 'hybrid' ? 'transportmap' : 'mapnik';
    return `${base}?bbox=${bbox[0]}%2C${bbox[1]}%2C${bbox[2]}%2C${bbox[3]}&layer=${layer}&marker=${NICETOWN_COORDINATES.lat}%2C${NICETOWN_COORDINATES.lng}`;
  }, [mapType]);

  const groupedLocations = [
    showPollution ? { title: 'Pollution Sources', data: POLLUTION_SOURCES } : null,
    showSolutions ? { title: 'Community Solutions', data: COMMUNITY_SOLUTIONS } : null,
    showHeat ? { title: 'Heat Island Zones', data: HEAT_ISLAND_ZONES } : null
  ].filter(Boolean);

  return (
    <div className="map-container">
      <div className="map-controls">
        <div className="map-type-selector">
          <button 
            className={mapType === 'roadmap' ? 'active' : ''} 
            onClick={() => setMapType('roadmap')}
          >
            Road
          </button>
          <button 
            className={mapType === 'satellite' ? 'active' : ''} 
            onClick={() => setMapType('satellite')}
          >
            Satellite
          </button>
          <button 
            className={mapType === 'hybrid' ? 'active' : ''} 
            onClick={() => setMapType('hybrid')}
          >
            Hybrid
          </button>
        </div>
        
        <div className="map-legend">
          <h4>Map Legend</h4>
          <div className="legend-item">
            <span className="dot red"></span> Pollution Sources
          </div>
          <div className="legend-item">
            <span className="dot green"></span> Community Solutions
          </div>
          <div className="legend-item">
            <span className="dot orange"></span> Heat Zones
          </div>
        </div>
      </div>

      <div className="map-viewport">
        <iframe
          title="Neighborhood map"
          src={mapSrc}
          width="100%"
          height="420"
          loading="lazy"
        />
      </div>

      <div className="location-sections">
        {groupedLocations.map((group) => (
          <div key={group.title} className="location-list">
            <h4>{group.title}</h4>
            {group.data.map((item) => (
              <button
                key={`${group.title}-${item.id}`}
                type="button"
                className="location-button"
                onClick={() => setSelectedLocation(item)}
              >
                {item.type && <span className={`dot ${markerDotClass(item.type)}`} />}
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {selectedLocation && (
        <div className="info-window">
          <h4>{selectedLocation.name}</h4>
          {selectedLocation.description && <p>{selectedLocation.description}</p>}
          {selectedLocation.type && <span className={`badge ${selectedLocation.type}`}>{selectedLocation.type}</span>}
          {selectedLocation.intensity && (
            <p className="heat-chip" style={{ color: getHeatColor(selectedLocation.intensity) }}>
              Heat intensity: {selectedLocation.intensity}
            </p>
          )}
          {selectedLocation.coordinates && (
            <p>
              Coordinates: {selectedLocation.coordinates.lat}, {selectedLocation.coordinates.lng}
            </p>
          )}
        </div>
      )}

      <div className="map-footer">
        <p>📍 Nicetown Park Coordinates: 40.01999, -75.15540</p>
        {userId && <p className="user-context">Viewing as User: {userId}</p>}
      </div>
    </div>
  );
};

export default MapComponent;
