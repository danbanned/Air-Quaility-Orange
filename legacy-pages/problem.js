'use client';

// pages/problem.js
import React from 'react';
import Layout from '../components/Layout/Layout';
import Link from 'next/link';
import styles from '../styles/Problem.module.css';
import useRouteInfo from '../utils/useRouteInfo';

const Problem = () => {
  const { userId } = useRouteInfo();

  const problems = [
    {
      title: 'Air Pollution',
      description: 'Our communities face dangerous levels of air pollution from highways, industrial sites, and transportation hubs.',
      impacts: [
        'High asthma rates in children',
        'Increased respiratory illness',
        'Higher cancer risks',
        'Reduced life expectancy'
      ],
      sources: [
        'Roosevelt Extension roadway',
        'SEPTA Midvale natural gas plant',
        'Wayne Junction rail station',
        'Former PES refinery site'
      ],
      icon: '🏭'
    },
    {
      title: 'Urban Heat Island',
      description: 'Hunting Park and Nicetown are significantly hotter than surrounding areas due to lack of trees and dark surfaces.',
      impacts: [
        'Temperatures 8-12°F higher',
        'Heat-related illnesses',
        'Higher energy costs',
        'Reduced quality of life'
      ],
      sources: [
        'Dark asphalt and concrete',
        'Lack of tree canopy',
        'Industrial heat sources',
        'Historical redlining'
      ],
      icon: '🌡️'
    },
    {
      title: 'Environmental Racism',
      description: 'The concentration of pollution in Black and Latino neighborhoods is not accidental—it\'s the result of decades of discriminatory policies.',
      impacts: [
        '41% Black residents in high-risk zones',
        '15% White residents in high-risk zones',
        '61% higher particulate exposure for Black Americans',
        'Generations of health impacts'
      ],
      sources: [
        'Redlining',
        'Industrial zoning',
        'Infrastructure neglect',
        'Unequal environmental protection'
      ],
      icon: '⚖️'
    }
  ];

  return (
    <>
      <div className="container">
        <div className={styles.header}>
          <h1 className="section-title">The Problem</h1>
          <p className="section-subtitle">
            Understanding the environmental challenges facing our communities
          </p>
        </div>

        <div className={styles.overview}>
          <p>
            The environmental challenges in Nicetown, Hunting Park, and Eastwick are not accidents of geography. 
            They are the direct result of decades of discriminatory policies, industrial zoning, and infrastructure 
            neglect that have concentrated pollution and environmental hazards in Black and Latino communities.
          </p>
        </div>

        <div className={styles.problemsGrid}>
          {problems.map((problem, index) => (
            <div key={index} className={styles.problemCard}>
              <div className={styles.problemIcon}>{problem.icon}</div>
              <h2>{problem.title}</h2>
              <p className={styles.problemDescription}>{problem.description}</p>
              
              <div className={styles.problemDetails}>
                <div className={styles.impacts}>
                  <h3>Impacts on Our Community</h3>
                  <ul>
                    {problem.impacts.map((impact, i) => (
                      <li key={i}>{impact}</li>
                    ))}
                  </ul>
                </div>
                
                <div className={styles.sources}>
                  <h3>Sources in Our Neighborhood</h3>
                  <ul>
                    {problem.sources.map((source, i) => (
                      <li key={i}>{source}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.urgencySection}>
          <h2>Why This Matters Now</h2>
          <div className={styles.urgencyStats}>
            <div className={styles.urgencyStat}>
              <span className={styles.statNumber}>2025</span>
              <span className={styles.statLabel}>Air quality grade F</span>
            </div>
            <div className={styles.urgencyStat}>
              <span className={styles.statNumber}>21%</span>
              <span className={styles.statLabel}>Childhood asthma rate</span>
            </div>
            <div className={styles.urgencyStat}>
              <span className={styles.statNumber}>125</span>
              <span className={styles.statLabel}>Premature deaths/year</span>
            </div>
          </div>
          <p className={styles.urgencyText}>
            Every day that passes without action, our families breathe polluted air, our children miss school due to asthma, 
            and our communities bear the burden of environmental racism. But together, we can change this.
          </p>
        </div>

        <div className={styles.ctaSection}>
          <h2>Ready to Learn More?</h2>
          <div className={styles.ctaButtons}>
            <Link href={`/history${userId ? `?userId=${userId}` : ''}`} className="btn">
              Learn the History
            </Link>
            <Link href={`/data${userId ? `?userId=${userId}` : ''}`} className="btn btn-secondary">
              See the Data
            </Link>
            <Link href={`/map${userId ? `?userId=${userId}` : ''}`} className="btn btn-secondary">
              Explore the Map
            </Link>
          </div>
        </div>

        {userId && (
          <div className={styles.userContext}>
            <p>Welcome back. Understanding these problems is the first step to solving them.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Problem;
