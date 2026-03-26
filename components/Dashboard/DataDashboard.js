// components/Dashboard/DataDashboard.js
import React from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import './DataDashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const DataDashboard = ({ userId }) => {
  // Asthma data
  const asthmaData = {
    labels: ['Philadelphia', 'Nicetown', 'Hunting Park', 'Eastwick'],
    datasets: [
      {
        label: 'Childhood Asthma Rate (%)',
        data: [21, 28, 32, 24],
        backgroundColor: 'rgba(255, 107, 53, 0.8)',
        borderColor: 'rgba(255, 107, 53, 1)',
        borderWidth: 1
      }
    ]
  };

  // Cancer risk disparity data
  const cancerRiskData = {
    labels: ['Black Residents', 'White Residents'],
    datasets: [
      {
        label: 'Percentage in High-Risk Zones',
        data: [41, 15],
        backgroundColor: [
          'rgba(255, 107, 53, 0.8)',
          'rgba(139, 69, 19, 0.8)'
        ],
        borderColor: [
          'rgba(255, 107, 53, 1)',
          'rgba(139, 69, 19, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  // Air quality trend data
  const airQualityData = {
    labels: ['2019', '2020', '2021', '2022', '2023', '2024'],
    datasets: [
      {
        label: 'PM2.5 Levels (μg/m³)',
        data: [12.5, 11.8, 12.2, 13.1, 14.5, 15.2],
        borderColor: 'rgba(255, 107, 53, 1)',
        backgroundColor: 'rgba(255, 107, 53, 0.1)',
        tension: 0.4
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Health Impact Data'
      }
    }
  };

  return (
    <div className="dashboard">
      <h2 className="dashboard-title">Environmental Health Data Dashboard</h2>
      
      <div className="data-highlights">
        <div className="highlight-card">
          <h3>Air Quality Grade</h3>
          <div className="grade">F</div>
          <p>Philadelphia - 2025</p>
        </div>
        
        <div className="highlight-card">
          <h3>Premature Deaths</h3>
          <div className="stat-number">125</div>
          <p>per year from air pollution</p>
        </div>
        
        <div className="highlight-card">
          <h3>Particulate Exposure</h3>
          <div className="stat-number">61%</div>
          <p>higher for Black Americans</p>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Childhood Asthma Rates</h3>
          <Bar data={asthmaData} options={options} />
          <p className="chart-note">21% citywide average, with higher rates in our communities</p>
        </div>

        <div className="chart-card">
          <h3>Cancer Risk Disparity</h3>
          <Doughnut data={cancerRiskData} />
          <p className="chart-note">Black residents face significantly higher cancer risks</p>
        </div>

        <div className="chart-card full-width">
          <h3>Air Quality Trend - Hunting Park</h3>
          <Line data={airQualityData} options={options} />
          <p className="chart-note">PM2.5 levels have been increasing since 2021</p>
        </div>
      </div>

      <div className="data-explanation">
        <h3>What This Data Means for Our Community</h3>
        <div className="explanation-grid">
          <div className="explanation-item">
            <h4>Asthma Crisis</h4>
            <p>In the 19140 zip code, which includes Hunting Park, asthma hospitalization rates are among the highest in Philadelphia. Our children miss school, parents miss work, and families struggle with healthcare costs.</p>
          </div>
          
          <div className="explanation-item">
            <h4>Environmental Racism</h4>
            <p>Historical redlining and industrial zoning have concentrated pollution in Black and Latino neighborhoods. The data shows this is not accidental - it's the result of decades of discriminatory policies.</p>
          </div>
          
          <div className="explanation-item">
            <h4>Hope Through Action</h4>
            <p>Despite these challenges, community organizing works. Tree planting initiatives have increased canopy coverage by 15% in some areas, and the closure of the PES refinery shows what we can achieve together.</p>
          </div>
        </div>
      </div>

      {userId && (
        <div className="user-personalization">
          <p>Welcome back! Based on your profile in {userId}, we've highlighted data relevant to your community.</p>
        </div>
      )}
    </div>
  );
};

export default DataDashboard;