// pages/history.js
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import Link from 'next/link';
import styles from '../styles/History.module.css';

const History = () => {
  const router = useRouter();
  const { userId } = router.query;

  const timelineEvents = [
    {
      year: '1930s-1960s',
      title: 'Redlining Era',
      description: 'The Home Owners\' Loan Corporation creates "residential security maps" marking Black neighborhoods as "hazardous." Hunting Park and Nicetown are redlined, leading to disinvestment and industrial zoning.',
      impact: 'Black families denied loans, property values plummet, industry moves in.'
    },
    {
      year: '1950s-1970s',
      title: 'Industrial Expansion',
      description: 'Heavy industry concentrates in redlined areas. The PES refinery expands, highways cut through communities, and industrial zoning concentrates pollution in Black and Latino neighborhoods.',
      impact: 'Air quality deteriorates, health problems increase.'
    },
    {
      year: '1980s-1990s',
      title: 'Deindustrialization',
      description: 'Factories close but pollution remains. Brownfields sit abandoned. Communities fight for cleanup but face neglect from city and state.',
      impact: 'Unemployment rises, environmental hazards persist.'
    },
    {
      year: '2000s',
      title: 'Community Organizing Begins',
      description: 'Residents organize against the PES refinery and for tree planting. Philly Thrive forms. Block captain programs expand.',
      impact: 'First victories in environmental justice movement.'
    },
    {
      year: '2019',
      title: 'PES Refinery Closure',
      description: 'After years of community organizing, the PES refinery closes. A major victory for environmental justice.',
      impact: 'Immediate reduction in local pollution.'
    },
    {
      year: '2024',
      title: 'Current Fight for Justice',
      description: 'Community continues organizing for just transition, tree planting, and climate resilience. 385 new trees planted. CoolSeal pavement installed.',
      impact: 'Progress continues, but challenges remain.'
    }
  ];

  return (
      <div className="container">
        <div className={styles.header}>
          <h1 className="section-title">The History</h1>
          <p className="section-subtitle">
            How redlining and disinvestment shaped our communities
          </p>
        </div>

        <div className={styles.introSection}>
          <p className={styles.introText}>
            The environmental challenges in Hunting Park, Nicetown, and Eastwick are not accidents. 
            They are the direct result of decades of discriminatory policies, industrial zoning, 
            and systematic disinvestment in Black and Latino communities. Understanding this history 
            is essential to fighting for environmental justice.
          </p>
        </div>

        <div className={styles.redliningSection}>
          <h2>Redlining: The Original Sin</h2>
          <div className={styles.redliningContent}>
            <div className={styles.redliningText}>
              <p>
                In the 1930s, the federal government created maps that graded neighborhoods by 
                "mortgage security." Green areas were "best" for investment. Red areas were 
                "hazardous" and marked for disinvestment.
              </p>
              <p>
                <strong>Hunting Park and Nicetown were redlined.</strong> This meant:
              </p>
              <ul>
                <li>Black families denied home loans and mortgages</li>
                <li>Property values intentionally depressed</li>
                <li>Industrial zoning concentrated in these areas</li>
                <li>Infrastructure and services neglected</li>
                <li>Pollution sources located near Black homes</li>
              </ul>
              <p>
                The effects persist today. Redlined neighborhoods are consistently hotter, more polluted, 
                and have fewer trees than non-redlined areas.
              </p>
            </div>
            <div className={styles.redliningMap}>
              <div className={styles.mapPlaceholder}>
                <span>🗺️</span>
                <p>Historical Redlining Map<br/>Philadelphia, 1937</p>
                <div className={styles.mapLegend}>
                  <span className={styles.green}>A - Best</span>
                  <span className={styles.blue}>B - Still Desirable</span>
                  <span className={styles.yellow}>C - Declining</span>
                  <span className={styles.red}>D - Hazardous</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.timelineSection}>
          <h2>Timeline of Environmental Injustice</h2>
          <div className={styles.timeline}>
            {timelineEvents.map((event, index) => (
              <div key={index} className={styles.timelineItem}>
                <div className={styles.timelineYear}>{event.year}</div>
                <div className={styles.timelineContent}>
                  <h3>{event.title}</h3>
                  <p>{event.description}</p>
                  <div className={styles.timelineImpact}>
                    <strong>Impact:</strong> {event.impact}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.legacySection}>
          <h2>The Legacy Today</h2>
          <div className={styles.legacyGrid}>
            <div className={styles.legacyCard}>
              <span className={styles.legacyIcon}>🌡️</span>
              <h3>Heat Inequality</h3>
              <p>Redlined areas are 5-12°F hotter than non-redlined neighborhoods due to lack of trees and green space.</p>
            </div>
            
            <div className={styles.legacyCard}>
              <span className={styles.legacyIcon}>🏭</span>
              <h3>Pollution Concentration</h3>
              <p>Industrial facilities are disproportionately located in formerly redlined areas.</p>
            </div>
            
            <div className={styles.legacyCard}>
              <span className={styles.legacyIcon}>🌳</span>
              <h3>Tree Canopy Gap</h3>
              <p>Formerly redlined areas have 40% less tree canopy than greenlined areas.</p>
            </div>
            
            <div className={styles.legacyCard}>
              <span className={styles.legacyIcon}>🏥</span>
              <h3>Health Disparities</h3>
              <p>Asthma rates and heat-related illnesses are significantly higher in historically redlined neighborhoods.</p>
            </div>
          </div>
        </div>

        <div className={styles.resistanceSection}>
          <h2>History of Resistance</h2>
          <p>
            Despite this history of injustice, our communities have always fought back. 
            From block clubs in the 1960s to the fight to close PES refinery, residents 
            of Hunting Park, Nicetown, and Eastwick have organized for justice.
          </p>
          
          <div className={styles.resistanceQuotes}>
            <blockquote>
              "We've been fighting for clean air for generations. Now we're winning."
              <cite>- Hunting Park Block Captain</cite>
            </blockquote>
            
            <blockquote>
              "The history is painful, but it shows us what we're capable of when we organize."
              <cite>- Nicetown Community Organizer</cite>
            </blockquote>
          </div>
        </div>

        <div className={styles.ctaSection}>
          <h2>Learn More About Our History</h2>
          <div className={styles.ctaButtons}>
            <Link href={`/voices${userId ? `?userId=${userId}` : ''}`} className="btn">
              Hear Community Voices
            </Link>
            <Link href={`/map${userId ? `?userId=${userId}` : ''}`} className="btn btn-secondary">
              See the Impact on the Map
            </Link>
          </div>
        </div>

        {userId && (
          <div className={styles.userContext}>
            <p>Understanding our history helps us fight for our future.</p>
          </div>
        )}
      </div>
  );
};

export default History;
