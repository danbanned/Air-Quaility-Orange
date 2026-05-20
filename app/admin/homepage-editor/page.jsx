'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import styles from '@/components/admin/Admin.module.css';

export default function HomepageEditor() {
  const { status, role } = useAuth();
  const router = useRouter();
  const [layouts, setLayouts] = useState([]);
  const [activeLayout, setActiveLayout] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return; }
    if (status === 'authenticated' && role !== 'ADMIN') { router.replace('/login'); return; }
    if (status === 'authenticated' && role === 'ADMIN') {
      fetchData();
    }
  }, [status, role, router]);

  async function fetchData() {
    try {
      const res = await fetch('/api/homepage/active-layout');
      const data = await res.json();
      setLayouts(data.layouts || []);
      setActiveLayout(data.layoutId || 'layout-1-default');
    } catch {
      setMessage('Failed to load layouts.');
    }
  }

  async function handleSwitchLayout(layoutId) {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/homepage/active-layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layoutId }),
      });
      if (!res.ok) {
        const err = await res.json();
        setMessage(err.error || 'Failed to switch layout');
        return;
      }
      setActiveLayout(layoutId);
      setMessage(`Switched to "${layouts.find((l) => l.id === layoutId)?.name}"`);
      setTimeout(() => router.push('/'), 1000);
    } catch {
      setMessage('Failed to switch layout.');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading') {
    return <div className={styles.centerNotice}>Loading...</div>;
  }

  return (
    <div className={`admin-dashboard ${styles.dashboardShell}`}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Homepage Layout Editor</h1>
          <p className={styles.dashboardSubtitle}>Choose a layout for the public homepage</p>
        </div>
        <div className={styles.dashboardHeaderActions}>
          <button onClick={() => router.push('/admin/homepage')} className={styles.secondaryPill}>
            Edit Content
          </button>
          <button onClick={() => router.push('/admin/dashboard')} className={styles.secondaryPill}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {message ? <div className={styles.inlineAlert}>{message}</div> : null}

      <div className={styles.tabContent}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', padding: '24px 0' }}>
          {layouts.map((layout) => {
            const isActive = activeLayout === layout.id;
            return (
              <div
                key={layout.id}
                style={{
                  background: isActive ? 'rgba(255,107,53,0.1)' : '#1e293b',
                  border: `2px solid ${isActive ? '#FF6B35' : '#334155'}`,
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>{layout.icon || '📄'}</div>
                <h3 style={{ color: '#fff', fontSize: '18px', fontWeight: 600, margin: '0 0 6px' }}>{layout.name}</h3>
                <p style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.5, margin: '0 0 16px' }}>{layout.description}</p>
                {isActive ? (
                  <span style={{
                    background: '#16a34a',
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    display: 'inline-block',
                  }}>
                    Active ✓
                  </span>
                ) : (
                  <button
                    onClick={() => handleSwitchLayout(layout.id)}
                    disabled={saving}
                    type="button"
                    style={{
                      background: '#FF6B35',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {saving ? 'Switching...' : 'Activate'}
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          background: '#1e293b',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '24px',
        }}>
          <h3 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, margin: '0 0 8px' }}>💡 How It Works</h3>
          <ul style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.8, margin: 0, paddingLeft: '20px' }}>
            <li>Each layout presents the same content in a different visual style.</li>
            <li>Content (slides, stats, cards, quotes, CTAs) is shared across all layouts.</li>
            <li>Edit content on the <button onClick={() => router.push('/admin/homepage')} style={{ background: 'none', border: 'none', color: '#FF6B35', cursor: 'pointer', padding: 0, fontSize: '13px', textDecoration: 'underline' }}>Content Editor</button> page.</li>
            <li>Changes apply immediately after switching layouts.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
