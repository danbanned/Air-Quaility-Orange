// pages/index.js
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const Home = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [currentMedia, setCurrentMedia] = useState('image'); // 'image' or 'video'
  const videoRef = useRef(null);

  const features = [
    {
      title: 'The Problem',
      description: 'Learn about air pollution and environmental racism in our communities.',
      link: '/problem',
      icon: '⚠️'
    },
    {
      title: 'The History',
      description: 'Understand redlining and disinvestment that shaped our neighborhoods.',
      link: '/history',
      icon: '📜'
    },
    {
      title: 'The Data',
      description: 'See the numbers behind environmental injustice.',
      link: '/data',
      icon: '📊'
    },
    {
      title: 'The Map',
      description: 'Explore pollution sources and community solutions.',
      link: '/map',
      icon: '🗺️'
    },
    {
      title: 'Community Voices',
      description: 'Hear stories from local leaders and organizers.',
      link: '/voices',
      icon: '🎙️'
    },
    {
      title: 'Solutions',
      description: 'Discover grassroots solutions in action.',
      link: '/solutions',
      icon: '🌱'
    },
    {
      title: 'Events',
      description: 'Join cleanups, workshops, and fundraisers.',
      link: '/events',
      icon: '📅'
    },
    {
      title: 'Get Involved',
      description: 'Take action and make a difference.',
      link: '/get-involved',
      icon: '🤝'
    }
  ];

  const toggleVideo = () => {
    if (videoPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setVideoPlaying(!videoPlaying);
  };

  const switchMedia = (type) => {
    setCurrentMedia(type);
    if (type === 'video' && videoRef.current) {
      videoRef.current.play();
      setVideoPlaying(true);
    } else if (type === 'image' && videoRef.current) {
      videoRef.current.pause();
      setVideoPlaying(false);
    }
  };

  return (
    <>
      {/* Enhanced Hero Section with Video/Image Support */}
      <div className={styles.heroSection}>
        {/* Media Background */}
        <div className={styles.heroMedia}>
          {currentMedia === 'video' ? (
            <video
              ref={videoRef}
              className={styles.heroVideo}
              poster="/images/hero-fallback.jpg"
              loop
              muted
              playsInline
            >
              <source src="/video/hero-background.mp4" type="video/mp4" />
              {/* Fallback for browsers that don't support video */}
              <img src="/images/hero-fallback.jpg" alt="Air Quality Orange Hero" className={styles.heroImage} />
            </video>
          ) : (
            <img 
              src="/images/hero-fallback.jpg" 
              alt="Air Quality Orange Hero" 
              className={styles.heroImage}
            />
          )}
          
          {/* Dark Overlay for Text Readability */}
          <div className={styles.heroOverlay}></div>
        </div>

        {/* Media Controls */}
        <div className={styles.mediaControls}>
          <button 
            className={`${styles.mediaButton} ${currentMedia === 'image' ? styles.active : ''}`}
            onClick={() => switchMedia('image')}
          >
            🖼️ Image
          </button>
          <button 
            className={`${styles.mediaButton} ${currentMedia === 'video' ? styles.active : ''}`}
            onClick={() => switchMedia('video')}
          >
            🎥 Video
          </button>
          {currentMedia === 'video' && (
            <button 
              className={styles.playButton}
              onClick={toggleVideo}
            >
              {videoPlaying ? '⏸️ Pause' : '▶️ Play'}
            </button>
          )}
        </div>

        {/* Hero Content */}
        <div className={styles.heroContent}>
          <div className="container">
            <h1 className={styles.heroTitle}>Air Quality Orange</h1>
            <p className={styles.heroTagline}>Environmental Justice for Nicetown, Hunting Park, and Eastwick</p>
            <p className={styles.heroDescription}>
              We are a community-driven organization fighting for clean air, public health, 
              and environmental justice in Philadelphia's Black and Latino neighborhoods.
            </p>
            <div className={styles.heroButtons}>
              <Link href={`/map${userId ? `?userId=${userId}` : ''}`} className="btn">
                Explore the Map
              </Link>
              <Link href={`/get-involved${userId ? `?userId=${userId}` : ''}`} className="btn btn-secondary">
                Take Action
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className={styles.scrollIndicator}>
          <span>Scroll to explore</span>
          <div className={styles.scrollArrow}>↓</div>
        </div>
      </div>

      {/* Rest of your content */}
      <div className="container">
        <div className={styles.statsSection}>
          <h2 className="section-title">The Reality We Face</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>21%</span>
              <span className={styles.statLabel}>Childhood asthma rate in Philadelphia</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>41%</span>
              <span className={styles.statLabel}>Black residents in high cancer risk zones</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>125</span>
              <span className={styles.statLabel}>Premature deaths per year from air pollution</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>F</span>
              <span className={styles.statLabel}>Air quality grade in 2025</span>
            </div>
          </div>
        </div>

        <div className={styles.featuresSection}>
          <h2 className="section-title">Explore Our Work</h2>
          <p className="section-subtitle">Learn about the issues and join the movement for environmental justice.</p>
          
          <div className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Link
                key={index}
                href={`${feature.link}${userId ? `?userId=${userId}` : ''}`}
                className={styles.featureCard}
              >
                <span className={styles.featureIcon}>{feature.icon}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.quoteSection}>
          <blockquote>
            "The environmental challenges in our communities are not accidental. 
            They are the result of redlining, industrial zoning, and racial inequality. 
            But community organizing works. Grassroots action works. Environmental justice is possible."
          </blockquote>
          <cite>- Community Voices of AQO</cite>
        </div>

        <div className={styles.ctaSection}>
          <h2>Together, We Can Make a Difference</h2>
          <p>Join us in building a healthier, more just future for all Philadelphia communities.</p>
          <div className={styles.ctaButtons}>
            <Link href={`/get-involved${userId ? `?userId=${userId}` : ''}`} className="btn">
              Get Involved
            </Link>
            <Link href={`/contact${userId ? `?userId=${userId}` : ''}`} className="btn btn-secondary">
              Contact Us
            </Link>
          </div>
        </div>

        {userId && (
          <div className={styles.userWelcome}>
            <p>Welcome back, community member {userId}! Your journey for environmental justice continues.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Home;