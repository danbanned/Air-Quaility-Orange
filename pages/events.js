// pages/events.js
import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import Link from 'next/link';
import styles from '../styles/Events.module.css';

const Events = () => {
  const router = useRouter();
  const { userId } = router.query;
  const [selectedMonth, setSelectedMonth] = useState('all');

  const events = [
    {
      id: 1,
      title: 'Community Cleanup Day',
      date: '2024-04-20',
      time: '9:00 AM - 12:00 PM',
      location: 'Hunting Park',
      address: '900 W Hunting Park Ave, Philadelphia, PA 19140',
      description: 'Join neighbors to clean up parks and streets. Supplies provided.',
      organizer: 'Hunting Park Neighborhood Association',
      category: 'cleanup',
      spots: 50,
      registered: 32
    },
    {
      id: 2,
      title: 'Environmental Justice Panel',
      date: '2024-04-25',
      time: '6:00 PM - 8:00 PM',
      location: 'Nicetown CDC',
      address: '4300 Germantown Ave, Philadelphia, PA 19140',
      description: 'Panel discussion with community leaders on environmental justice victories and challenges.',
      organizer: 'Philly Thrive',
      category: 'education',
      spots: 100,
      registered: 45
    },
    {
      id: 3,
      title: 'Tree Planting Workshop',
      date: '2024-05-02',
      time: '4:00 PM - 6:00 PM',
      location: 'Furtick Farms',
      address: '200 E Wyoming Ave, Philadelphia, PA 19120',
      description: 'Learn how to plant and care for trees. Hands-on workshop.',
      organizer: 'Pennsylvania Horticultural Society',
      category: 'workshop',
      spots: 30,
      registered: 18
    },
    {
      id: 4,
      title: 'Health & Wellness Fair',
      date: '2024-05-10',
      time: '10:00 AM - 2:00 PM',
      location: 'Hunting Park Rec Center',
      address: '110 W Hunting Park Ave, Philadelphia, PA 19140',
      description: 'Free health screenings, asthma education, and community resources.',
      organizer: 'Philadelphia Department of Health',
      category: 'health',
      spots: 200,
      registered: 67
    },
    {
      id: 5,
      title: 'Youth Climate Summit',
      date: '2024-05-15',
      time: '9:00 AM - 3:00 PM',
      location: 'Nicetown Library',
      address: '3720 Broad St, Philadelphia, PA 19140',
      description: 'Youth-led climate justice workshops and planning session.',
      organizer: 'Youth Climate Justice Program',
      category: 'youth',
      spots: 50,
      registered: 23
    },
    {
      id: 6,
      title: 'Community Garden Workday',
      date: '2024-05-18',
      time: '10:00 AM - 1:00 PM',
      location: 'Furtick Farms',
      address: '200 E Wyoming Ave, Philadelphia, PA 19120',
      description: 'Help maintain community garden beds and learn about urban farming.',
      organizer: 'Furtick Farms',
      category: 'garden',
      spots: 25,
      registered: 12
    },
    {
      id: 7,
      title: 'Fundraiser for Tree Planting',
      date: '2024-05-25',
      time: '6:00 PM - 9:00 PM',
      location: 'Virtual + In Person',
      address: 'Nicetown CDC, 4300 Germantown Ave',
      description: 'Fundraising event to support tree planting in low-canopy areas.',
      organizer: 'Tree Tenders',
      category: 'fundraiser',
      spots: 150,
      registered: 45
    },
    {
      id: 8,
      title: 'Block Captain Training',
      date: '2024-06-01',
      time: '10:00 AM - 2:00 PM',
      location: 'Hunting Park Rec Center',
      address: '110 W Hunting Park Ave, Philadelphia, PA 19140',
      description: 'Training for block captains on environmental organizing.',
      organizer: 'Nicetown CDC',
      category: 'training',
      spots: 40,
      registered: 21
    }
  ];

  const categories = [
    { id: 'all', name: 'All Events' },
    { id: 'cleanup', name: 'Cleanups' },
    { id: 'education', name: 'Education' },
    { id: 'workshop', name: 'Workshops' },
    { id: 'health', name: 'Health' },
    { id: 'youth', name: 'Youth' },
    { id: 'garden', name: 'Gardening' },
    { id: 'fundraiser', name: 'Fundraisers' },
    { id: 'training', name: 'Training' }
  ];

  const months = [
    { id: 'all', name: 'All Months' },
    { id: '2024-04', name: 'April 2024' },
    { id: '2024-05', name: 'May 2024' },
    { id: '2024-06', name: 'June 2024' }
  ];

  const filteredEvents = events.filter(event => {
    if (selectedMonth !== 'all' && !event.date.startsWith(selectedMonth)) return false;
    return true;
  });

  const handleRSVP = (eventId) => {
    alert('Thanks for RSVPing! Check your email for confirmation.');
  };

  return (
      <div className="container">
        <div className={styles.header}>
          <h1 className="section-title">Events & Fundraisers</h1>
          <p className="section-subtitle">
            Join us for community events, workshops, and fundraising
          </p>
        </div>

        <div className={styles.filters}>
          <div className={styles.monthFilter}>
            <label>Filter by month:</label>
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              className={styles.select}
            >
              {months.map(month => (
                <option key={month.id} value={month.id}>{month.name}</option>
              ))}
            </select>
          </div>
          
          <div className={styles.categoryTags}>
            {categories.map(category => (
              <button 
                key={category.id}
                className={styles.categoryTag}
                onClick={() => {/* Filter by category would go here */}}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.eventsList}>
          {filteredEvents.map(event => (
            <div key={event.id} className={styles.eventCard}>
              <div className={styles.eventDate}>
                <span className={styles.month}>
                  {new Date(event.date).toLocaleString('default', { month: 'short' })}
                </span>
                <span className={styles.day}>
                  {new Date(event.date).getDate()}
                </span>
                <span className={styles.year}>
                  {new Date(event.date).getFullYear()}
                </span>
              </div>
              
              <div className={styles.eventDetails}>
                <h3>{event.title}</h3>
                <p className={styles.eventTime}>⏰ {event.time}</p>
                <p className={styles.eventLocation}>📍 {event.location}</p>
                <p className={styles.eventAddress}>{event.address}</p>
                <p className={styles.eventDescription}>{event.description}</p>
                <p className={styles.eventOrganizer}>Organized by: {event.organizer}</p>
                
                <div className={styles.eventMeta}>
                  <span className={styles.spots}>
                    {event.registered}/{event.spots} registered
                  </span>
                  <span className={`${styles.category} ${styles[event.category]}`}>
                    {event.category}
                  </span>
                </div>
              </div>
              
              <div className={styles.eventAction}>
                <button 
                  className="btn"
                  onClick={() => handleRSVP(event.id)}
                >
                  RSVP
                </button>
                <button 
                  className="btn-secondary"
                  onClick={() => {
                    navigator.clipboard.writeText(`Check out this event: ${event.title} at ${event.location}`);
                    alert('Event details copied!');
                  }}
                >
                  Share
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.calendarSection}>
          <h2>Add to Your Calendar</h2>
          <div className={styles.calendarButtons}>
            <button className="btn-secondary" onClick={() => alert('Google Calendar link would open')}>
              Google Calendar
            </button>
            <button className="btn-secondary" onClick={() => alert('iCal file would download')}>
              iCal / Outlook
            </button>
            <button className="btn-secondary" onClick={() => alert('Calendar link copied')}>
              Copy Calendar Link
            </button>
          </div>
        </div>

        <div className={styles.hostEvent}>
          <h2>Want to Host an Event?</h2>
          <p>If you're organizing an environmental justice event in our communities, let us know.</p>
          <button className="btn" onClick={() => alert('Event submission form would open')}>
            Submit Your Event
          </button>
        </div>

        <div className={styles.newsletter}>
          <h2>Stay Updated</h2>
          <p>Get event reminders and updates delivered to your inbox.</p>
          <div className={styles.newsletterForm}>
            <input type="email" placeholder="Your email address" />
            <button className="btn">Subscribe</button>
          </div>
        </div>

        {userId && (
          <div className={styles.userContext}>
            <p>Events personalized for your community preferences.</p>
          </div>
        )}
      </div>
  );
};

export default Events;