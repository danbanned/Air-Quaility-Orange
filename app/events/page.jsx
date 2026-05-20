'use client';

import { useEffect, useState } from 'react';
import AdminCard from '@/components/AdminCard';
import { useAuth } from '@/components/AuthContext';
import styles from '@/styles/Events.module.css';

const emptyRequest = {
  requesterName: '',
  requesterEmail: '',
  requesterContact: '',
  title: '',
  description: '',
  proposedDate: '',
  proposedLocation: '',
};

const emptyEvent = {
  title: '',
  description: '',
  date: '',
  time: '',
  location: '',
  address: '',
  imageUrl: '',
  category: 'community',
  organizer: '',
  spots: 0,
  registered: 0,
  ticketUrl: '',
  isExternal: false,
  isSponsored: false,
  status: 'ACTIVE',
};

function toEventPayload(item) {
  return {
    ...item,
    spots: Number(item.spots ?? 0),
    registered: Number(item.registered ?? 0),
    isExternal: item.isExternal === true || item.isExternal === 'true',
    isSponsored: item.isSponsored === true || item.isSponsored === 'true',
  };
}

export default function EventsPage() {
  const { isAuthenticated, canEdit } = useAuth();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyRequest);
  const [newEvent, setNewEvent] = useState(emptyEvent);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  async function fetchEvents() {
    const response = await fetch('/api/events', { cache: 'no-store' });
    const data = await response.json();
    setEvents(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/user/event-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error || 'Unable to submit event request.');
      return;
    }

    setForm(emptyRequest);
    setMessage('Event request submitted.');
  }

  async function handleUpdate(updatedEvent) {
    const payload = toEventPayload(updatedEvent);
    const response = await fetch(`/api/admin/events/${updatedEvent.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const next = await response.json();
      setEvents((current) => current.map((item) => (item.id === next.id ? next : item)));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this event?')) {
      return;
    }

    const response = await fetch('/api/admin/events', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    const payload = await response.json();
    if (response.ok) {
      if (payload.success) {
        setEvents((current) => current.filter((item) => item.id !== id));
      } else {
        setMessage(payload.message || 'Delete request sent to admin.');
      }
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    const response = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toEventPayload(newEvent)),
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error || 'Unable to create event.');
      return;
    }

    setEvents((current) => [payload, ...current]);
    setNewEvent(emptyEvent);
    setShowAddForm(false);
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <div className={styles.pageHeadingRow}>
          <div>
            <h1 className="section-title">Events & Fundraisers</h1>
            <p className="section-subtitle">AQO events are database-driven and editable directly from this page for staff.</p>
          </div>
          {canEdit ? (
            <button type="button" className="btn" onClick={() => setShowAddForm((current) => !current)}>
              {showAddForm ? 'Close Form' : '+ Add Event'}
            </button>
          ) : null}
        </div>
      </div>

      {showAddForm && canEdit ? (
        <form onSubmit={handleCreate} className={styles.staffForm}>
          <h2>Create New Event</h2>
          <div className={styles.staffFormGrid}>
            <input type="text" placeholder="Title" value={newEvent.title} onChange={(event) => setNewEvent({ ...newEvent, title: event.target.value })} required />
            <input type="datetime-local" value={newEvent.date} onChange={(event) => setNewEvent({ ...newEvent, date: event.target.value })} required />
            <input type="text" placeholder="Time" value={newEvent.time} onChange={(event) => setNewEvent({ ...newEvent, time: event.target.value })} required />
            <input type="text" placeholder="Location" value={newEvent.location} onChange={(event) => setNewEvent({ ...newEvent, location: event.target.value })} required />
            <input type="text" placeholder="Address" value={newEvent.address} onChange={(event) => setNewEvent({ ...newEvent, address: event.target.value })} required />
            <input type="text" placeholder="Category" value={newEvent.category} onChange={(event) => setNewEvent({ ...newEvent, category: event.target.value })} required />
            <input type="text" placeholder="Organizer" value={newEvent.organizer} onChange={(event) => setNewEvent({ ...newEvent, organizer: event.target.value })} required />
            <input type="number" placeholder="Spots" value={newEvent.spots} onChange={(event) => setNewEvent({ ...newEvent, spots: event.target.value })} required />
            <input type="text" placeholder="Ticket URL" value={newEvent.ticketUrl} onChange={(event) => setNewEvent({ ...newEvent, ticketUrl: event.target.value })} />
            <textarea placeholder="Description" value={newEvent.description} onChange={(event) => setNewEvent({ ...newEvent, description: event.target.value })} rows="4" />
          </div>
          <button type="submit" className="btn">Create Event</button>
        </form>
      ) : null}

      {message ? <div className={styles.feedback}>{message}</div> : null}

      <div className={styles.eventsList}>
        {events.map((item) => (
          <AdminCard
            key={item.id}
            item={item}
            type="event"
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isStaff={canEdit}
          >
            {(eventItem) => (
              <div className={styles.eventCard}>
                <div className={styles.eventDate}>
                  <span className={styles.month}>{new Date(eventItem.date).toLocaleString('en-US', { month: 'short' })}</span>
                  <span className={styles.day}>{new Date(eventItem.date).getDate()}</span>
                  <span className={styles.year}>{new Date(eventItem.date).getFullYear()}</span>
                </div>
                <div className={styles.eventDetails}>
                  {eventItem.imageUrl ? <img src={eventItem.imageUrl} alt={eventItem.title} className={styles.eventImage} /> : null}
                  <h3>{eventItem.title}</h3>
                  <p className={styles.eventTime}>⏰ {eventItem.time}</p>
                  <p className={styles.eventLocation}>📍 {eventItem.location}</p>
                  <p className={styles.eventAddress}>{eventItem.address}</p>
                  <p className={styles.eventDescription}>{eventItem.description}</p>
                  <p className={styles.eventOrganizer}>Organized by: {eventItem.organizer}</p>
                  <div className={styles.eventMeta}>
                    <span className={styles.spots}>{eventItem.registered}/{eventItem.spots} registered</span>
                    <span className={`${styles.category} ${styles[eventItem.category] || ''}`}>{eventItem.category}</span>
                  </div>
                  {eventItem.ticketUrl ? (
                    <a href={eventItem.ticketUrl} target="_blank" rel="noreferrer" className="btn">
                      Get Tickets
                    </a>
                  ) : null}
                </div>
              </div>
            )}
          </AdminCard>
        ))}
      </div>

      <div className={styles.hostEvent}>
        <h2>Request an Event</h2>
        {!isAuthenticated ? (
          <p>Sign in to request an event.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px' }}>
            <input name="requesterName" placeholder="Requester Name" value={form.requesterName} onChange={handleChange} required />
            <input name="requesterEmail" placeholder="Requester Email" value={form.requesterEmail} onChange={handleChange} required />
            <input name="requesterContact" placeholder="Phone" value={form.requesterContact} onChange={handleChange} required />
            <input name="title" placeholder="Event Title" value={form.title} onChange={handleChange} required />
            <textarea name="description" rows="4" placeholder="Event Description" value={form.description} onChange={handleChange} required />
            <input name="proposedDate" type="date" value={form.proposedDate} onChange={handleChange} required />
            <input name="proposedLocation" placeholder="Proposed Location" value={form.proposedLocation} onChange={handleChange} required />
            <button type="submit" className="btn">Submit Event Request</button>
          </form>
        )}
      </div>
    </div>
  );
}
