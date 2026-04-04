'use client';

// pages/voices.js
import React, { useState } from 'react';
import Layout from '../components/Layout/Layout';
import StoryCard from '../components/Stories/StoryCard';
import stories from '../data/stories';
import styles from '../styles/Voices.module.css';
import useRouteInfo from '../utils/useRouteInfo';

const Voices = () => {
  const { userId } = useRouteInfo();
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStories = stories.filter(story => {
    if (filter !== 'all' && story.category !== filter) return false;
    if (searchTerm && !story.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !story.author.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <div className="container">
        <div className={styles.header}>
          <h1 className="section-title">Voices of AQO</h1>
          <p className="section-subtitle">
            Real stories from community members fighting for environmental justice
          </p>
        </div>

        <div className={styles.featuredStory}>
          <div className={styles.featuredContent}>
            <h2>Featured Story: Fighting for Clean Air in Hunting Park</h2>
            <p>
              Maria Rodriguez, a block captain in Hunting Park, shares her family's 
              multi-generational fight for clean air and environmental justice. 
              Listen to her story and learn how community organizing is making a difference.
            </p>
            <button className="btn">Listen to Full Story</button>
          </div>
          <div className={styles.featuredImage}>
            <img src="/images/featured-story.jpg" alt="Featured storyteller" />
          </div>
        </div>

        <div className={styles.filters}>
          <div className={styles.searchBar}>
            <input 
              type="text" 
              placeholder="Search stories..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className={styles.categoryFilters}>
            <button 
              className={filter === 'all' ? 'active' : ''} 
              onClick={() => setFilter('all')}
            >
              All Stories
            </button>
            <button 
              className={filter === 'organizing' ? 'active' : ''} 
              onClick={() => setFilter('organizing')}
            >
              Organizing
            </button>
            <button 
              className={filter === 'victory' ? 'active' : ''} 
              onClick={() => setFilter('victory')}
            >
              Victories
            </button>
            <button 
              className={filter === 'action' ? 'active' : ''} 
              onClick={() => setFilter('action')}
            >
              In Action
            </button>
            <button 
              className={filter === 'health' ? 'active' : ''} 
              onClick={() => setFilter('health')}
            >
              Health
            </button>
          </div>
        </div>

        <div className={styles.storiesGrid}>
          {filteredStories.map(story => (
            <StoryCard key={story.id} story={story} userId={userId} />
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className={styles.noResults}>
            <p>No stories found matching your search.</p>
          </div>
        )}

        <div className={styles.submitStory}>
          <h3>Have a Story to Share?</h3>
          <p>Your voice matters. Share your experience with environmental justice in your community.</p>
          <button className="btn" onClick={() => alert('Story submission form would open')}>
            Submit Your Story
          </button>
        </div>

        {userId && (
          <div className={styles.userContext}>
            <p>Welcome back! Stories from your community are highlighted.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Voices;
