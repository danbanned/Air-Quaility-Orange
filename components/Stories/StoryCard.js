// components/Stories/StoryCard.js
import React, { useState } from 'react';
import './StoryCard.css';

const StoryCard = ({ story, userId }) => {
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(false);

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
        <img src={story.image || '/images/default-story.jpg'} alt={story.title} />
        {story.audioUrl && (
          <button className="audio-btn" onClick={playAudio}>
            {playing ? '⏸️' : '🎧'}
          </button>
        )}
      </div>
      
      <div className="story-content">
        <h3>{story.title}</h3>
        
        <div className="story-meta">
          <span className="author">{story.author}</span>
          <span className="role">{story.role}</span>
          <span className="community">{story.community}</span>
          <span className="date">{new Date(story.date).toLocaleDateString()}</span>
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