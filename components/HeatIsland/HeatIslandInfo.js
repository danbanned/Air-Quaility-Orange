// components/HeatIsland/HeatIslandInfo.js
import React from 'react';
import './HeatIslandInfo.css';

const HeatIslandInfo = ({ userId }) => {
  const heatFactors = [
    {
      title: 'Dark Asphalt',
      description: 'Dark pavements absorb up to 95% of sunlight, re-radiating heat and raising temperatures by 5-10°F.',
      icon: '🌑'
    },
    {
      title: 'Lack of Tree Canopy',
      description: 'Hunting Park has only 15% tree canopy compared to 30% in wealthier neighborhoods. Trees provide shade and cooling.',
      icon: '🌳'
    },
    {
      title: 'Historical Redlining',
      description: 'Redlined areas are consistently 5-12°F hotter than non-redlined neighborhoods due to disinvestment.',
      icon: '📜'
    },
    {
      title: 'Industrial Density',
      description: 'Concentrated industry creates heat-absorbing surfaces and waste heat from operations.',
      icon: '🏭'
    }
  ];

  const solutions = [
    {
      title: 'CoolSeal Pavement',
      description: 'Reflective pavement coating that can reduce surface temperatures by 10-15°F.',
      progress: 'Installed on 2 miles of roads in Hunting Park',
      icon: '🛣️'
    },
    {
      title: 'Tree Planting',
      description: '385 new trees planted in 2024, targeting low-canopy areas.',
      progress: '385/500 goal achieved',
      icon: '🌱'
    },
    {
      title: 'Stormwater Improvements',
      description: 'Green infrastructure projects that add vegetation and reduce heat.',
      progress: '12 GSI projects completed',
      icon: '💧'
    }
  ];

  return (
    <div className="heat-island-info">
      <h2 className="section-title">Urban Heat Island Effect in Hunting Park</h2>
      
      <div className="heat-overview">
        <div className="heat-stats">
          <div className="stat-card">
            <span className="stat-value">8-12°F</span>
            <span className="stat-label">Hotter than surrounding areas</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">15%</span>
            <span className="stat-label">Tree canopy coverage</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">65%</span>
            <span className="stat-label">Impervious surface</span>
          </div>
        </div>
        
        <div className="heat-description">
          <p>
            The Urban Heat Island effect makes Hunting Park significantly hotter than 
            surrounding areas. This is not a natural phenomenon—it's the result of 
            decades of disinvestment, redlining, and industrial zoning.
          </p>
        </div>
      </div>

      <div className="factors-section">
        <h3>What Causes Extreme Heat in Our Community?</h3>
        <div className="factors-grid">
          {heatFactors.map((factor, index) => (
            <div key={index} className="factor-card">
              <div className="factor-icon">{factor.icon}</div>
              <h4>{factor.title}</h4>
              <p>{factor.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="solutions-section">
        <h3>Community Solutions in Action</h3>
        <div className="solutions-grid">
          {solutions.map((solution, index) => (
            <div key={index} className="solution-card">
              <div className="solution-icon">{solution.icon}</div>
              <h4>{solution.title}</h4>
              <p>{solution.description}</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: solution.progress.includes('2 miles') ? '40%' : solution.progress.includes('385') ? '77%' : '60%' }}></div>
              </div>
              <span className="progress-text">{solution.progress}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="impact-story">
        <h3>Real Impact: The 2025 SEPTA Bus Depot Fire</h3>
        <div className="impact-content">
          <p>
            In 2025, a fire at the SEPTA bus depot released toxic smoke into our 
            community. Combined with extreme heat, this created dangerous conditions 
            for residents, especially children and seniors with respiratory issues.
          </p>
          <p>
            This event showed why addressing heat islands is an environmental justice 
            issue—our community faces compounded threats from heat, pollution, and 
            industrial accidents.
          </p>
        </div>
      </div>

      <div className="heat-comparison">
        <h3>Visual Comparison</h3>
        <div className="comparison-images">
          <div className="comparison-item">
            <div className="image-placeholder satellite-view">
              <span>🛰️</span>
            </div>
            <p>Hunting Park - Satellite View<br/>Dark surfaces show heat absorption</p>
          </div>
          <div className="comparison-item">
            <div className="image-placeholder thermal-view">
              <span>🌡️</span>
            </div>
            <p>Thermal Image<br/>Red areas show extreme heat</p>
          </div>
          <div className="comparison-item">
            <div className="image-placeholder canopy-view">
              <span>🌳</span>
            </div>
            <p>Tree Canopy Map<br/>Green shows areas with trees</p>
          </div>
        </div>
      </div>

      {userId && (
        <div className="user-action">
          <p>Welcome back! Based on your location, here's how heat affects your area specifically.</p>
          <button className="btn">Get Personalized Heat Report</button>
        </div>
      )}
    </div>
  );
};

export default HeatIslandInfo;