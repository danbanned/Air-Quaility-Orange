'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminCard from '@/components/AdminCard';
import { useAuth } from '@/components/AuthContext';
import styles from '@/styles/GetInvolved.module.css';

const emptyInterest = {
  name: '',
  email: '',
  phone: '',
  neighborhood: '',
  message: '',
};

const emptyOpportunity = {
  title: '',
  description: '',
  icon: '🤝',
  imageUrl: '',
  category: 'community',
  actionUrl: '',
  commitments: [],
  skills: [],
};

function parseArray(value) {
  if (Array.isArray(value)) {
    return value;
  }

  try {
    const parsed = JSON.parse(value || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeOpportunity(item) {
  return {
    ...item,
    commitments: parseArray(item.commitments),
    skills: parseArray(item.skills),
  };
}

export default function GetInvolvedPage() {
  const { isAuthenticated, role, canEdit } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [form, setForm] = useState(emptyInterest);
  const [message, setMessage] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOpportunity, setNewOpportunity] = useState(emptyOpportunity);

  async function load() {
    const response = await fetch('/api/opportunities', { cache: 'no-store' });
    const data = await response.json();
    setOpportunities(Array.isArray(data) ? data : []);
    setSelectedId(data?.[0]?.id || null);
  }

  useEffect(() => {
    load();
  }, []);

  const selectedOpportunity = opportunities.find((item) => item.id === selectedId);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleInterestSubmit(event) {
    event.preventDefault();
    if (!selectedOpportunity) {
      return;
    }

    const response = await fetch(`/api/opportunities/${selectedOpportunity.id}/interest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error || 'Unable to submit interest.');
      return;
    }

    setForm(emptyInterest);
    setMessage('Interest submitted.');
  }

  async function handleUpdate(updatedOpportunity) {
    const payload = normalizeOpportunity(updatedOpportunity);
    const response = await fetch(`/api/admin/opportunities/${updatedOpportunity.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const next = await response.json();
      setOpportunities((current) => current.map((item) => (item.id === next.id ? next : item)));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this opportunity?')) {
      return;
    }

    const response = await fetch('/api/admin/opportunities', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    const payload = await response.json();
    if (response.ok) {
      if (payload.success) {
        setOpportunities((current) => current.filter((item) => item.id !== id));
      } else {
        setMessage(payload.message || 'Delete request sent to admin.');
      }
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    const response = await fetch('/api/admin/opportunities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOpportunity),
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error || 'Unable to create opportunity.');
      return;
    }

    setOpportunities((current) => [payload, ...current]);
    setSelectedId(payload.id);
    setNewOpportunity(emptyOpportunity);
    setShowAddForm(false);
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <div className={styles.pageHeadingRow}>
          <div>
            <h1 className="section-title">Get Involved</h1>
            <p className="section-subtitle">Database-backed opportunities with inline staff controls and user interest flow.</p>
          </div>
          {canEdit ? (
            <button type="button" className="btn" onClick={() => setShowAddForm((current) => !current)}>
              {showAddForm ? 'Close Form' : '+ Add Opportunity'}
            </button>
          ) : null}
        </div>
      </div>

      {showAddForm && canEdit ? (
        <form onSubmit={handleCreate} className={styles.staffForm}>
          <h2>Create New Opportunity</h2>
          <div className={styles.staffFormGrid}>
            <input type="text" placeholder="Title" value={newOpportunity.title} onChange={(event) => setNewOpportunity({ ...newOpportunity, title: event.target.value })} required />
            <input type="text" placeholder="Icon" value={newOpportunity.icon} onChange={(event) => setNewOpportunity({ ...newOpportunity, icon: event.target.value })} required />
            <input type="text" placeholder="Category" value={newOpportunity.category} onChange={(event) => setNewOpportunity({ ...newOpportunity, category: event.target.value })} required />
            <input type="text" placeholder="Action URL" value={newOpportunity.actionUrl} onChange={(event) => setNewOpportunity({ ...newOpportunity, actionUrl: event.target.value })} />
            <textarea placeholder="Description" rows="4" value={newOpportunity.description} onChange={(event) => setNewOpportunity({ ...newOpportunity, description: event.target.value })} required />
          </div>
          <button type="submit" className="btn">Create Opportunity</button>
        </form>
      ) : null}

      {message ? <div className={styles.feedback}>{message}</div> : null}

      <div className={styles.opportunitiesGrid}>
        {opportunities.map((opp) => (
          <AdminCard
            key={opp.id}
            item={opp}
            type="opportunity"
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isStaff={canEdit}
          >
            {(item) => {
              const opportunityItem = normalizeOpportunity(item);

              return (
                <button
                  type="button"
                  className={`${styles.opportunityCard} ${selectedId === opportunityItem.id ? styles.selected : ''}`}
                  onClick={() => setSelectedId(opportunityItem.id)}
                >
                  {opportunityItem.imageUrl ? <img src={opportunityItem.imageUrl} alt={opportunityItem.title} className={styles.opportunityImage} /> : null}
                  <div className={styles.opportunityIcon}>{opportunityItem.icon}</div>
                  <h3>{opportunityItem.title}</h3>
                  <p>{opportunityItem.description}</p>

                  <div className={styles.opportunityDetails}>
                    <div className={styles.commitments}>
                      <strong>Commitments</strong>
                      <ul>
                        {(opportunityItem.commitments || []).map((commitment, index) => (
                          <li key={`${opportunityItem.id}-commitment-${index}`}>{commitment.text || commitment}</li>
                        ))}
                      </ul>
                    </div>
                    <div className={styles.skills}>
                      <strong>Skills</strong>
                      <ul>
                        {(opportunityItem.skills || []).map((skill, index) => (
                          <li key={`${opportunityItem.id}-skill-${index}`}>{skill.name || skill}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              );
            }}
          </AdminCard>
        ))}
      </div>

      {selectedOpportunity ? (
        <div className={styles.signupForm}>
          <h2>Express Interest: {selectedOpportunity.title}</h2>
          {role !== 'USER' ? (
            <p>Only `USER` accounts can express interest. Admin and assistant accounts manage opportunities instead.</p>
          ) : !isAuthenticated ? (
            <p>Sign in to submit interest.</p>
          ) : (
            <form onSubmit={handleInterestSubmit}>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Name *</label>
                  <input id="name" name="name" type="text" value={form.name} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email *</label>
                  <input id="email" name="email" type="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone</label>
                  <input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="neighborhood">Neighborhood</label>
                  <input id="neighborhood" name="neighborhood" type="text" value={form.neighborhood} onChange={handleChange} />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea id="message" name="message" rows="4" value={form.message} onChange={handleChange} />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className="btn">Submit Interest</button>
                <Link href="/contact" className="btn-secondary">Contact Team</Link>
              </div>
            </form>
          )}
        </div>
      ) : null}
    </div>
  );
}
