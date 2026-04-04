'use client';

// pages/get-involved.js
import React, { useState } from 'react';
import Link from 'next/link';
import Layout from '../components/Layout/Layout';
import styles from '../styles/GetInvolved.module.css';
import useRouteInfo from '../utils/useRouteInfo';

const opportunities = [
  {
    id: 'volunteer',
    title: 'Volunteer',
    description: 'Join community cleanups, tree planting, and neighborhood events.',
    icon: '🤝',
    commitments: ['One-time events', 'Recurring roles', 'Weekend options'],
    skills: ['No experience needed', 'Training provided', 'All ages welcome']
  },
  {
    id: 'block-captain',
    title: 'Become a Block Captain',
    description: 'Organize neighbors, report hazards, and lead local environmental action.',
    icon: '🏘️',
    commitments: ['Ongoing role', 'Monthly check-ins', 'Flexible schedule'],
    skills: ['Communication', 'Leadership', 'Community organizing']
  },
  {
    id: 'donate',
    title: 'Donate',
    description: 'Support local programs, tree planting, and youth climate leadership.',
    icon: '💰',
    commitments: ['One-time or monthly', 'Tax deductible', 'Direct local impact'],
    skills: ['Financial support', 'In-kind donations', 'Fundraising outreach']
  },
  {
    id: 'advocate',
    title: 'Advocate',
    description: 'Speak up at hearings and work with partners to push for policy change.',
    icon: '📢',
    commitments: ['As available', 'Virtual or in person', 'Campaign-based'],
    skills: ['Public speaking', 'Policy awareness', 'Coalition support']
  },
  {
    id: 'youth',
    title: 'Youth Programs',
    description: 'For ages 14-24 interested in climate justice and civic leadership.',
    icon: '👥',
    commitments: ['After school', 'Summer programs', 'Workshops'],
    skills: ['Leadership growth', 'Peer organizing', 'Environmental education']
  },
  {
    id: 'partner',
    title: 'Partner With Us',
    description: 'Schools, businesses, and organizations can co-host projects and events.',
    icon: '🌐',
    commitments: ['Joint programs', 'Sponsorships', 'Resource sharing'],
    skills: ['Program design', 'Operations support', 'Community investment']
  }
];

export default function GetInvolved() {
  const { userId } = useRouteInfo();
  const [selectedInterest, setSelectedInterest] = useState(opportunities[0].id);

  const selectedOpportunity = opportunities.find((item) => item.id === selectedInterest);

  const handleInterestSubmit = (event) => {
    event.preventDefault();
    alert("Thanks for your interest. We'll reach out soon.");
  };

  return (
      <div className="container">
        <div className={styles.header}>
          <h1 className="section-title">Get Involved</h1>
          <p className="section-subtitle">
            Join the movement for environmental justice in Philadelphia.
          </p>
        </div>

        <div className={styles.heroMessage}>
          <h2>Together, We Can Make a Difference</h2>
          <p>
            Whether you can give one hour a month or lead a neighborhood project, your support helps
            build healthier communities.
          </p>
        </div>

        <div className={styles.opportunitiesGrid}>
          {opportunities.map((opp) => (
            <button
              key={opp.id}
              type="button"
              className={`${styles.opportunityCard} ${
                selectedInterest === opp.id ? styles.selected : ''
              }`}
              onClick={() => setSelectedInterest(opp.id)}
            >
              <div className={styles.opportunityIcon}>{opp.icon}</div>
              <h3>{opp.title}</h3>
              <p>{opp.description}</p>

              <div className={styles.opportunityDetails}>
                <div className={styles.commitments}>
                  <strong>Time Commitment</strong>
                  <ul>
                    {opp.commitments.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className={styles.skills}>
                  <strong>Skills Needed</strong>
                  <ul>
                    {opp.skills.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          ))}
        </div>

        {selectedOpportunity && (
          <div className={styles.signupForm}>
            <h2>Express Interest: {selectedOpportunity.title}</h2>
            <form onSubmit={handleInterestSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name *</label>
                  <input id="name" type="text" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <input id="email" type="email" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" type="tel" />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="neighborhood">Neighborhood</label>
                  <input id="neighborhood" type="text" placeholder="Nicetown, Hunting Park, etc." />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Tell us about your interests</label>
                <textarea
                  id="message"
                  rows="4"
                  placeholder="What type of projects are you most interested in?"
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className="btn">
                  Submit Interest
                </button>
                <Link href={`/contact${userId ? `?userId=${userId}` : ''}`} className="btn-secondary">
                  Contact Team
                </Link>
              </div>
            </form>
          </div>
        )}
      </div>
  );
}
