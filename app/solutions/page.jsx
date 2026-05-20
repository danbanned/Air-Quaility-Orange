'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminCard from '@/components/AdminCard';
import { useAuth } from '@/components/AuthContext';
import styles from '@/styles/Solutions.module.css';

const emptySolution = {
  title: '',
  description: '',
  icon: '🌱',
  imageUrl: '',
  category: 'community',
  resources: {
    links: [],
    emails: [],
    classes: [],
    actionButtons: [],
  },
};

function parseObject(value, fallback) {
  if (value && typeof value === 'object') {
    return value;
  }

  try {
    return JSON.parse(value || '{}');
  } catch {
    return fallback;
  }
}

function normalizeSolution(item) {
  return {
    ...item,
    resources: parseObject(item.resources, {
      links: [],
      emails: [],
      classes: [],
      actionButtons: [],
    }),
  };
}

export default function SolutionsPage() {
  const { canEdit } = useAuth();
  const [solutions, setSolutions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [message, setMessage] = useState('');
  const [newSolution, setNewSolution] = useState(emptySolution);

  async function load() {
    const response = await fetch('/api/solutions', { cache: 'no-store' });
    const data = await response.json();
    setSolutions(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleUpdate(updatedSolution) {
    const payload = normalizeSolution(updatedSolution);
    const response = await fetch(`/api/admin/solutions/${updatedSolution.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const next = await response.json();
      setSolutions((current) => current.map((item) => (item.id === next.id ? next : item)));
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this solution?')) {
      return;
    }

    const response = await fetch('/api/admin/solutions', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });

    const payload = await response.json();
    if (response.ok) {
      if (payload.success) {
        setSolutions((current) => current.filter((item) => item.id !== id));
      } else {
        setMessage(payload.message || 'Delete request sent to admin.');
      }
    }
  }

  async function handleCreate(event) {
    event.preventDefault();
    const response = await fetch('/api/admin/solutions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSolution),
    });

    const payload = await response.json();
    if (!response.ok) {
      setMessage(payload.error || 'Unable to create solution.');
      return;
    }

    setSolutions((current) => [payload, ...current]);
    setNewSolution(emptySolution);
    setShowAddForm(false);
  }

  return (
    <div className="container">
      <div className={styles.header}>
        <div className={styles.pageHeadingRow}>
          <div>
            <h1 className="section-title">Solutions in Action</h1>
            <p className="section-subtitle">Database-driven solutions with inline staff editing on the public page.</p>
          </div>
          {canEdit ? (
            <button type="button" className="btn" onClick={() => setShowAddForm((current) => !current)}>
              {showAddForm ? 'Close Form' : '+ Add Solution'}
            </button>
          ) : null}
        </div>
      </div>

      {showAddForm && canEdit ? (
        <form onSubmit={handleCreate} className={styles.staffForm}>
          <h2>Create New Solution</h2>
          <div className={styles.staffFormGrid}>
            <input type="text" placeholder="Title" value={newSolution.title} onChange={(event) => setNewSolution({ ...newSolution, title: event.target.value })} required />
            <input type="text" placeholder="Icon" value={newSolution.icon} onChange={(event) => setNewSolution({ ...newSolution, icon: event.target.value })} required />
            <input type="text" placeholder="Category" value={newSolution.category} onChange={(event) => setNewSolution({ ...newSolution, category: event.target.value })} required />
            <textarea placeholder="Description" rows="4" value={newSolution.description} onChange={(event) => setNewSolution({ ...newSolution, description: event.target.value })} required />
          </div>
          <button type="submit" className="btn">Create Solution</button>
        </form>
      ) : null}

      {message ? <div className={styles.feedback}>{message}</div> : null}

      <div className={styles.solutionsGrid}>
        {solutions.map((solution) => (
          <AdminCard
            key={solution.id}
            item={solution}
            type="solution"
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            isStaff={canEdit}
          >
            {(solutionItem) => {
              const resources = normalizeSolution(solutionItem).resources || {};

              return (
                <div className={`${styles.solutionCard} ${styles[solutionItem.category] || ''}`}>
                  {solutionItem.imageUrl ? <img src={solutionItem.imageUrl} alt={solutionItem.title} className={styles.solutionImage} /> : null}
                  <div className={styles.solutionIcon}>{solutionItem.icon}</div>
                  <h3>{solutionItem.title}</h3>
                  <p className={styles.description}>{solutionItem.description}</p>
                  <div className={styles.impact}>
                    <strong>Category:</strong> {solutionItem.category}
                  </div>
                  {(resources.links || []).map((link) => (
                    <a key={link.url} href={link.url} className="btn btn-secondary" target="_blank" rel="noreferrer">
                      {link.title || 'Learn More'}
                    </a>
                  ))}
                  {(resources.actionButtons || []).map((button) => (
                    <Link key={`${button.text}-${button.url}`} href={button.url || '/get-involved'} className="btn btn-secondary">
                      {button.text}
                    </Link>
                  ))}
                </div>
              );
            }}
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
