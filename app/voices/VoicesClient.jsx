'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import StoryCard from '@/components/Stories/StoryCard';
import { useAuth } from '@/components/AuthContext';
import styles from '@/styles/Voices.module.css';

const emptyStory = {
  title: '',
  personName: '',
  community: 'Nicetown',
  content: '',
  audioUrl: '',
  imageUrl: '',
  category: 'organizing',
};

export default function VoicesClient() {
  const { isAuthenticated, canEdit, role } = useAuth();
  const [stories, setStories] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [form, setForm] = useState(emptyStory);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function loadStories() {
    setLoading(true);
    const response = await fetch('/api/stories', { cache: 'no-store' });
    const data = await response.json();
    setStories(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function loadSubmissions() {
    const response = await fetch('/api/user/submissions', { cache: 'no-store' });
    if (!response.ok) {
      return;
    }

    const data = await response.json();
    setSubmissions(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    loadStories();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions();
    }
  }, [isAuthenticated]);

  const filteredStories = useMemo(() => {
    return stories.filter((story) => {
      if (filter !== 'all' && story.category !== filter) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      const haystack = `${story.title} ${story.personName} ${story.community}`.toLowerCase();
      return haystack.includes(searchTerm.toLowerCase());
    });
  }, [filter, searchTerm, stories]);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');

    const response = await fetch('/api/user/stories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error || 'Unable to submit story.');
      return;
    }

    setForm(emptyStory);
    setMessage(
      payload.status === 'APPROVED'
        ? 'Story published.'
        : 'Story submitted. It is now pending approval.'
    );
    await loadStories();
    await loadSubmissions();
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <h1 className="section-title">Voices of AQO</h1>
        <p className="section-subtitle">
          Approved community stories are public. New submissions are moderated on the server before they appear here.
        </p>
      </div>

      <div className={styles.featuredStory}>
        <div className={styles.featuredContent}>
          <h2>Stories from residents and organizers</h2>
          <p>Logged-in users can submit stories. Admins and administrative assistants can manage approvals from the dashboard.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {canEdit ? (
              <Link href="/admin/dashboard" className="btn btn-secondary">
                Manage Stories
              </Link>
            ) : null}
            {!isAuthenticated ? (
              <Link href="/login" className="btn">
                Sign In
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Search stories..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        <div className={styles.categoryFilters}>
          {['all', 'organizing', 'victory', 'action', 'health'].map((category) => (
            <button
              key={category}
              className={filter === category ? styles.active : ''}
              type="button"
              onClick={() => setFilter(category)}
            >
              {category === 'all' ? 'All Stories' : category}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div className={styles.noResults}><p>Loading stories...</p></div> : null}

      {!loading ? (
        <div className={styles.storiesGrid}>
          {filteredStories.map((story) => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      ) : null}

      {!loading && filteredStories.length === 0 ? (
        <div className={styles.noResults}>
          <p>No stories found matching your search.</p>
        </div>
      ) : null}

      <div className={styles.submitStory}>
        <h3>Submit a Story</h3>
        {!isAuthenticated ? (
          <p>Sign in first to submit a story for review.</p>
        ) : (
          <>
            <p>Role: {role}. Admin and assistant submissions auto-approve. User submissions stay pending until reviewed.</p>
            {message ? <p>{message}</p> : null}
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
              <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
              <input name="personName" placeholder="Person Name" value={form.personName} onChange={handleChange} required />
              <select name="community" value={form.community} onChange={handleChange}>
                <option>Nicetown</option>
                <option>Hunting Park</option>
                <option>Eastwick</option>
              </select>
              <textarea name="content" rows="5" placeholder="Story content" value={form.content} onChange={handleChange} required />
              <input name="audioUrl" placeholder="Audio URL (optional)" value={form.audioUrl} onChange={handleChange} />
              <input name="imageUrl" placeholder="Image URL (optional)" value={form.imageUrl} onChange={handleChange} />
              <select name="category" value={form.category} onChange={handleChange}>
                <option value="organizing">organizing</option>
                <option value="victory">victory</option>
                <option value="health">health</option>
                <option value="action">action</option>
              </select>
              <button type="submit" className="btn">Submit Story</button>
            </form>
          </>
        )}
      </div>

      {isAuthenticated && submissions.length ? (
        <div className={styles.submitStory}>
          <h3>Your Submissions</h3>
          {submissions.map((story) => (
            <p key={story.id}>
              <strong>{story.title}</strong>: {story.status}
            </p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
