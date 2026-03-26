// pages/data.js
import React from 'react';
import { useRouter } from 'next/router';
import DataDashboard from '../components/Dashboard/DataDashboard';
import styles from '../styles/Data.module.css';

const Data = () => {
  const router = useRouter();
  const { userId } = router.query;

  return (
      <div className="container">
        <div className={styles.header}>
          <h1 className="section-title">The Data</h1>
          <p className="section-subtitle">
            Understanding environmental injustice through numbers
          </p>
        </div>

        <DataDashboard userId={userId} />

        <div className={styles.explanationSection}>
          <h2>How to Read This Data</h2>
          <p>
            These numbers represent real people—our neighbors, our families, our children. 
            Behind every statistic is a story of struggle, resilience, and hope.
          </p>
          
          <div className={styles.explanationGrid}>
            <div className={styles.explanationCard}>
              <h3>Asthma Rates</h3>
              <p>
                When we say childhood asthma rates are 21% in Philadelphia, that means 
                one in five children struggles to breathe. In Hunting Park, it's even higher. 
                These are kids who miss school, parents who miss work, and families facing 
                medical bills and stress.
              </p>
            </div>
            
            <div className={styles.explanationCard}>
              <h3>Cancer Risk</h3>
              <p>
                The disparity in cancer risk—41% of Black residents vs 15% of White residents 
                in high-risk zones—shows how environmental racism operates. This isn't about 
                personal choices. It's about where pollution is located.
              </p>
            </div>
            
            <div className={styles.explanationCard}>
              <h3>Air Quality Grade</h3>
              <p>
                An "F" grade means our air fails to meet basic health standards. But this 
                isn't just a letter. It's the reason why outdoor activities are limited on 
                hot days. It's why families buy air purifiers they can't afford.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.dataSources}>
          <h3>Data Sources</h3>
          <ul>
            <li>Philadelphia Department of Public Health - Asthma Surveillance Data</li>
            <li>EPA Environmental Justice Screening Tool - Cancer Risk Data</li>
            <li>American Lung Association - State of the Air Report</li>
            <li>NASA - Urban Heat Island Data</li>
            <li>Philadelphia Parks & Recreation - Tree Canopy Assessment</li>
          </ul>
          <p className={styles.dataNote}>
            All data is current as of 2024. We update our information annually.
          </p>
        </div>

        {userId && (
          <div className={styles.userContext}>
            <p>Data personalized for your community profile.</p>
          </div>
        )}
      </div>
  );
};

export default Data;