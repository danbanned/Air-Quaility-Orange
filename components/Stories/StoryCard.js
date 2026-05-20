'use client';

// components/Stories/StoryCard.js
import React, { useMemo, useState } from 'react';
import './StoryCard.css';

const PLACEHOLDER_COLORS = [
  '#e65100', '#1565c0', '#2e7d32', '#6a1b9a', '#c2185b',
  '#00838f', '#4e342e', '#37474f', '#558b2f', '#283593',
];

function hashColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PLACEHOLDER_COLORS[Math.abs(hash) % PLACEHOLDER_COLORS.length];
}

function getInitials(title) {
  return (title || '?').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
}

const StoryCard = ({ story, userId }) => {
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);

  const imageUrl = story.image || story.imageUrl;
  const bgColor = useMemo(() => hashColor(story.id || story.title), [story.id, story.title]);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  const playAudio = () => {
    setPlaying(!playing);
    // Audio playback logic would go here
  };

  return (
    <div className={`story-card ${expanded ? 'expanded' : ''}`}>
      <div className="story-image">
        {imageUrl ? (
          <img src={imageUrl} alt={story.title} />
        ) : (
          <div className="story-image-placeholder" style={{ backgroundColor: bgColor }}>
            <span className="story-image-initials">{getInitials(story.title)}</span>
          </div>
        )}
        {story.audioUrl && (
          <button className="audio-btn" onClick={playAudio}>
            {playing ? '⏸️' : '🎧'}
          </button>
        )}
      </div>
      
      <div className="story-content">
        <h3>{story.title}</h3>
        
        <div className="story-meta">
          <span className="author">{story.author || story.personName}</span>
          {story.role ? <span className="role">{story.role}</span> : null}
          <span className="community">{story.community}</span>
          <span className="date">{new Date(story.date || story.createdAt).toLocaleDateString('en-US')}</span>
        </div>

        <p className="story-preview">
          {expanded ? story.content : `${story.content.substring(0, 150)}...`}
        </p>

        <div className="story-footer">
          <button className="read-more" onClick={toggleExpand}>
            {expanded ? 'Read Less' : 'Read More'}
          </button>
          
          <span className={`category ${story.category}`}>
            {story.category}
          </span>
        </div>
      </div>

      {userId && (
        <div className="user-context">
          <small>Shared with community member {userId}</small>
        </div>
      )}
    </div>
  );
};

export default StoryCard;
