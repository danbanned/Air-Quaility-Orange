// pages/solutions.js
import React from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import Link from 'next/link';
import styles from '../styles/Solutions.module.css';

const Solutions = () => {
  const router = useRouter();
  const { userId } = router.query;

  const solutions = [
    {
      title: 'Tree Planting Initiative',
      organization: 'Hunting Park Tree Tenders',
      description: 'Community-led tree planting to increase canopy coverage and reduce heat island effects.',
      impact: '385 new trees planted in 2024',
      volunteerNeeded: true,
      icon: '🌳',
      category: 'greening'
    },
    {
      title: 'Furtick Farms',
      organization: 'Furtick Farms',
      description: 'Urban farm providing fresh food and education in Nicetown.',
      impact: 'Serving 200+ families weekly',
      volunteerNeeded: true,
      icon: '🥕',
      category: 'food'
    },
    {
      title: 'CoolSeal Pavement Project',
      organization: 'Philadelphia Streets Dept',
      description: 'Reflective pavement coating to reduce surface temperatures.',
      impact: '2 miles of roads treated',
      volunteerNeeded: false,
      icon: '🛣️',
      category: 'infrastructure'
    },
    {
      title: 'Block Captain Program',
      organization: 'Nicetown CDC',
      description: 'Residents leading environmental action on their blocks.',
      impact: '25 active block captains',
      volunteerNeeded: true,
      icon: '🏘️',
      category: 'organizing'
    },
    {
      title: 'GSI Stormwater Projects',
      organization: 'Philadelphia Water Dept',
      description: 'Green infrastructure to manage stormwater and add green space.',
      impact: '12 projects completed',
      volunteerNeeded: false,
      icon: '💧',
      category: 'infrastructure'
    },
    {
      title: 'Youth Climate Justice Program',
      organization: 'Philly Thrive',
      description: 'Training the next generation of environmental justice leaders.',
      impact: '50 youth trained in 2024',
      volunteerNeeded: true,
      icon: '👥',
      category: 'education'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Solutions' },
    { id: 'greening', name: 'Tree Planting & Greening' },
    { id: 'food', name: 'Food Justice' },
    { id: 'infrastructure', name: 'Green Infrastructure' },
    { id: 'organizing', name: 'Community Organizing' },
    { id: 'education', name: 'Education & Youth' }
  ];

  return (
    <>
      <div className="container">
        <div className={styles.header}>
          <h1 className="section-title">Solutions in Action</h1>
          <p className="section-subtitle">
            Grassroots solutions making a difference in our communities
          </p>
        </div>

        <div className={styles.introSection}>
          <p>
            While the challenges are significant, our communities are fighting back with 
            creative, community-led solutions. From tree planting to urban farming, these 
            initiatives show that environmental justice is possible when we organize.
          </p>
        </div>

        <div className={styles.successStory}>
          <h2>Success Story: The Fight to Close PES Refinery</h2>
          <div className={styles.storyContent}>
            <p>
              After years of organizing by Philly Thrive and community members, the PES 
              refinery closed in 2019. This victory shows what's possible when communities 
              come together to demand environmental justice. Today, we're fighting for a 
              just transition that includes green jobs and a healthy future.
            </p>
            <div className={styles.storyStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>2019</span>
                <span>Refinery Closed</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>1000+</span>
                <span>Community Organizers</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>10+</span>
                <span>Years of Fighting</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.solutionsGrid}>
          {solutions.map((solution, index) => (
            <div key={index} className={`${styles.solutionCard} ${styles[solution.category]}`}>
              <div className={styles.solutionIcon}>{solution.icon}</div>
              <h3>{solution.title}</h3>
              <p className={styles.organization}>{solution.organization}</p>
              <p className={styles.description}>{solution.description}</p>
              <div className={styles.impact}>
                <strong>Impact:</strong> {solution.impact}
              </div>
              {solution.volunteerNeeded && (
                <button className="btn btn-secondary" onClick={() => alert(`Signed up for ${solution.title}`)}>
                  Volunteer
                </button>
              )}
            </div>
          ))}
        </div>

        <div className={styles.getInvolvedSection}>
          <h2>Want to Help?</h2>
          <p>These solutions need your support. Volunteer, donate, or spread the word.</p>
          <div className={styles.ctaButtons}>
            <Link href={`/get-involved${userId ? `?userId=${userId}` : ''}`} className="btn">
              Get Involved
            </Link>
            <Link href={`/events${userId ? `?userId=${userId}` : ''}`} className="btn btn-secondary">
              Find Events
            </Link>
          </div>
        </div>

        <div className={styles.resourceSection}>
          <h2>Solution Resources</h2>
          <div className={styles.resourceGrid}>
            <div className={styles.resourceCard}>
              <h3>Tool Library</h3>
              <p>Borrow tools for tree planting and garden maintenance.</p>
              <button className="btn-secondary">Learn More</button>
            </div>
            <div className={styles.resourceCard}>
              <h3>Community Grants</h3>
              <p>Funding available for block-led environmental projects.</p>
              <button className="btn-secondary">Apply</button>
            </div>
            <div className={styles.resourceCard}>
              <h3>Training Programs</h3>
              <p>Learn about tree care, composting, and environmental justice.</p>
              <button className="btn-secondary">Sign Up</button>
            </div>
          </div>
        </div>

        {userId && (
          <div className={styles.userContext}>
            <p>Welcome back! Here are solutions near your community.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Solutions;
