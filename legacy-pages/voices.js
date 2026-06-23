'use client';

// pages/voices.js
import React, { useEffect, useState } from 'react';
import StoryCard from '../components/Stories/StoryCard';
import styles from '../styles/Voices.module.css';

const emptyForm = {
  title: '',
  personName: '',
  community: 'Nicetown',
  content: '',
  audioUrl: '',
  imageUrl: '',
  category: 'organizing',
  streetName: '',
  lat: null,
  lng: null,
};

const Voices = () => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streets, setStreets] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/stories')
      .then((r) => r.json())
      .then((data) => setStories(Array.isArray(data) ? data : []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false));

    fetch('/api/streets')
      .then((r) => r.json())
      .then((data) => setStreets(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filteredStories = stories.filter((story) => {
    if (filter !== 'all' && story.category !== filter) return false;
    if (searchTerm) {
      const hay = `${story.title} ${story.personName} ${story.community}`.toLowerCase();
      if (!hay.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  });

  function handleChange(e) {
    const { name, value } = e.target;
    if (name === 'streetName') {
      const street = streets.find((s) => s.name === value);
      setForm((f) => ({
        ...f,
        streetName: value,
        lat: street?.center?.lat ?? null,
        lng: street?.center?.lng ?? null,
      }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      const res = await fetch('/api/user/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || 'Submission failed. Please try again.');
      } else {
        setMessage(
          data.status === 'APPROVED'
            ? 'Story published!'
            : 'Story submitted — it will appear after approval.'
        );
        setForm(emptyForm);
        setShowForm(false);
        const updated = await fetch('/api/stories').then((r) => r.json());
        setStories(Array.isArray(updated) ? updated : []);
      }
    } catch {
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
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
            Maria Rodriguez, a block captain in Hunting Park, shares her family&apos;s
            multi-generational fight for clean air and environmental justice.
          </p>
          <button className="btn" onClick={() => setShowForm((v) => !v)}>
            {showForm ? 'Cancel' : 'Share Your Story'}
          </button>
        </div>
      </div>

      {message && (
        <p style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '6px', color: '#166534', marginBottom: '16px' }}>
          {message}
        </p>
      )}

      {showForm && (
        <div className={styles.submitStory}>
          <h3>Submit Your Story</h3>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
            <input
              name="title"
              placeholder="Title *"
              value={form.title}
              onChange={handleChange}
              required
            />
            <input
              name="personName"
              placeholder="Your Name *"
              value={form.personName}
              onChange={handleChange}
              required
            />
            <select name="community" value={form.community} onChange={handleChange}>
              <option value="Nicetown">Nicetown</option>
              <option value="Hunting Park">Hunting Park</option>
              <option value="Eastwick">Eastwick</option>
            </select>
            <textarea
              name="content"
              rows="5"
              placeholder="Tell your story *"
              value={form.content}
              onChange={handleChange}
              required
            />
            <select name="category" value={form.category} onChange={handleChange}>
              <option value="organizing">Organizing</option>
              <option value="victory">Victory</option>
              <option value="health">Health</option>
              <option value="action">In Action</option>
            </select>
            <select name="streetName" value={form.streetName} onChange={handleChange}>
              <option value="">Where did this happen? (optional)</option>
              {streets.map((s) => (
                <option key={s.name} value={s.name}>{s.name}</option>
              ))}
            </select>
            {form.streetName && form.lat && (
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                Location: {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
              </p>
            )}
            <input
              name="audioUrl"
              placeholder="Audio URL (optional)"
              value={form.audioUrl}
              onChange={handleChange}
            />
            <input
              name="imageUrl"
              placeholder="Image URL (optional)"
              value={form.imageUrl}
              onChange={handleChange}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Submit Story'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

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
          {['all', 'organizing', 'victory', 'action', 'health'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={filter === cat ? styles.active : ''}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'All Stories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className={styles.noResults}><p>Loading stories…</p></div>}

      {!loading && (
        <div className={styles.storiesGrid}>
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      )}

      {!loading && filteredStories.length === 0 && (
        <div className={styles.noResults}>
          <p>No stories found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Voices;
