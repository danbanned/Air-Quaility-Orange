 // components/TakeAction/ActionButtons.js
import React, { useState } from 'react';
import './ActionButtons.css';

const ActionButtons = ({ userId }) => {
  const [signedUp, setSignedUp] = useState({});

  const actions = [
    {
      id: 'cleanup',
      title: 'Community Cleanup',
      description: 'Join neighbors to clean up parks and streets',
      icon: '🧹',
      date: 'Every Saturday, 9am',
      location: 'Hunting Park',
      spots: 25
    },
    {
      id: 'block-captain',
      title: 'Block Captain Program',
      description: 'Lead environmental justice efforts on your block',
      icon: '🏘️',
      commitment: 'Ongoing',
      training: 'Monthly meetings'
    },
    {
      id: 'philly-thrive',
      title: 'Volunteer with Philly Thrive',
      description: 'Support community organizing and advocacy',
      icon: '🌱',
      opportunities: 'Various roles available'
    },
    {
      id: 'donate',
      title: 'Donate to Community Gardens',
      description: 'Support Furtick Farms and other gardens',
      icon: '💰',
      goal: '$10,000',
      raised: '$6,500'
    }
  ];

  const events = [
    {
      id: 1,
      title: 'Tree Planting Day',
      date: 'April 20, 2024',
      time: '9am - 12pm',
      location: 'Diamond Street',
      spots: 50,
      registered: 32
    },
    {
      id: 2,
      title: 'Environmental Justice Panel',
      date: 'April 25, 2024',
      time: '6pm - 8pm',
      location: 'Nicetown CDC',
      spots: 100,
      registered: 45
    },
    {
      id: 3,
      title: 'Youth Climate Workshop',
      date: 'May 2, 2024',
      time: '4pm - 6pm',
      location: 'Hunting Park Rec Center',
      spots: 30,
      registered: 18
    },
    {
      id: 4,
      title: 'Health Awareness Fair',
      date: 'May 10, 2024',
      time: '10am - 2pm',
      location: 'Furtick Farms',
      spots: 200,
      registered: 67
    }
  ];

  const handleSignUp = (actionId) => {
    setSignedUp(prev => ({
      ...prev,
      [actionId]: true
    }));
    // API call would go here
    alert(`Thanks for signing up! We'll send details to your email.`);
  };

  return (
    <div className="action-buttons-container">
      <h2 className="section-title">Take Action Now</h2>
      
      <div className="actions-grid">
        {actions.map(action => (
          <div key={action.id} className="action-card">
            <div className="action-icon">{action.icon}</div>
            <h3>{action.title}</h3>
            <p>{action.description}</p>
            
            {action.date && <p className="action-detail">📅 {action.date}</p>}
            {action.location && <p className="action-detail">📍 {action.location}</p>}
            {action.spots && <p className="action-detail">👥 {action.spots} spots available</p>}
            {action.commitment && <p className="action-detail">⏰ {action.commitment}</p>}
            {action.training && <p className="action-detail">📚 {action.training}</p>}
            {action.opportunities && <p className="action-detail">🤝 {action.opportunities}</p>}
            
            {action.goal && (
              <div className="fundraising">
                <p>Goal: {action.goal}</p>
                <p>Raised: {action.raised}</p>
                <div className="progress-bar">
                  <div className="progress" style={{ width: '65%' }}></div>
                </div>
              </div>
            )}
            
            <button 
              className={`btn ${signedUp[action.id] ? 'btn-secondary' : ''}`}
              onClick={() => handleSignUp(action.id)}
              disabled={signedUp[action.id]}
            >
              {signedUp[action.id] ? '✓ Signed Up' : 'Sign Up'}
            </button>
          </div>
        ))}
      </div>

      <div className="upcoming-events">
        <h3>Upcoming Events & Fundraisers</h3>
        
        <div className="events-list">
          {events.map(event => (
            <div key={event.id} className="event-item">
              <div className="event-date">
                <span className="month">{new Date(event.date).toLocaleString('default', { month: 'short' })}</span>
                <span className="day">{new Date(event.date).getDate()}</span>
              </div>
              
              <div className="event-details">
                <h4>{event.title}</h4>
                <p>⏰ {event.time}</p>
                <p>📍 {event.location}</p>
              </div>
              
              <div className="event-signup">
                <span className="spots">{event.registered}/{event.spots} registered</span>
                <button 
                  className="btn btn-secondary"
                  onClick={() => alert(`Signed up for ${event.title}!`)}
                >
                  Join
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="contact-officials">
        <h3>Contact Local Officials</h3>
        <p>Make your voice heard. Contact these officials about environmental justice.</p>
        
        <div className="officials-grid">
          <div className="official-card">
            <h4>Councilmember</h4>
            <p>District 7</p>
            <button className="btn btn-secondary" onClick={() => window.location.href = 'mailto:councilmember@phila.gov'}>
              Email
            </button>
          </div>
          
          <div className="official-card">
            <h4>State Representative</h4>
            <p>181st District</p>
            <button className="btn btn-secondary" onClick={() => window.location.href = 'mailto:reprepresentative@palegis.us'}>
              Email
            </button>
          </div>
          
          <div className="official-card">
            <h4>City Council</h4>
            <p>At Large</p>
            <button className="btn btn-secondary" onClick={() => window.location.href = 'mailto:council@phila.gov'}>
              Email
            </button>
          </div>
        </div>
      </div>

      <div className="share-section">
        <h3>Spread the Word</h3>
        <div className="share-buttons">
          <button className="share-btn facebook" onClick={() => alert('Share on Facebook')}>
            📘 Share on Facebook
          </button>
          <button className="share-btn twitter" onClick={() => alert('Share on Twitter')}>
            🐦 Share on Twitter
          </button>
          <button className="share-btn email" onClick={() => alert('Share via Email')}>
            📧 Email to a Friend
          </button>
          <button className="share-btn copy" onClick={() => {
            navigator.clipboard.writeText('https://airqualityorange.org');
            alert('Link copied!');
          }}>
            🔗 Copy Link
          </button>
        </div>
      </div>

      {userId && (
        <div className="user-context">
          <p>Welcome back! Here are actions recommended for your area.</p>
        </div>
      )}
    </div>
  );
};

export default ActionButtons;