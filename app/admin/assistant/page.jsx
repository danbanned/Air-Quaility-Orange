'use client';

import { useEffect, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../components/AuthContext';
import styles from '../../../components/admin/Admin.module.css';

export default function AssistantDashboardPage() {
  const { session, status, role } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({});
  const [deleteRequests, setDeleteRequests] = useState([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && role !== 'ADMIN_ASSISTANT') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && role === 'ADMIN_ASSISTANT') {
      fetchData();
    }
  }, [status, role, router]);

  async function fetchData() {
    const res = await fetch('/api/admin/dashboard', { cache: 'no-store' });
    const data = await res.json();
    setStats(data.stats || {});
    setDeleteRequests(data.pendingDeletions || []);
  }

  if (status === 'loading') {
    return <div className={styles.centerNotice}>Loading...</div>;
  }

  return (
    <div className={`assistant-dashboard ${styles.dashboardShell}`}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Assistant Dashboard</h1>
          <p className={styles.dashboardSubtitle}>Manage content while deletions require admin approval</p>
        </div>
        <div className={styles.dashboardHeaderActions}>
          <span className={styles.userEmail}>{session?.user?.email}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.dangerPill}>
            Sign Out
          </button>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className="admin-card">
          <div className={styles.statValue}>{stats.pendingStories || 0}</div>
          <div className={styles.statLabel}>Pending Stories</div>
        </div>
        <div className="admin-card">
          <div className={styles.statValue}>{stats.eventRequests || 0}</div>
          <div className={styles.statLabel}>Event Requests</div>
        </div>
        <div className="admin-card">
          <div className={styles.statValue}>{stats.opportunityInterests || 0}</div>
          <div className={styles.statLabel}>Interests</div>
        </div>
      </div>

      <div className="admin-card">
        <h3>Assistant Role Notes</h3>
        <p>• You can create, edit, and manage stories, events, opportunities, and solutions.</p>
        <p>• Delete actions create requests that admins must approve.</p>
        <p>• Homepage editing and event request approval are admin-only.</p>
        <p>• Submit a delete request and wait for admin review.</p>
      </div>

      <div className={styles.splitGrid}>
        <div className="admin-card">
          <h3>Quick Actions</h3>
          <div className={styles.quickActionStack}>
            <button className={styles.primaryAction} type="button" onClick={() => router.push('/voices')}>Review Stories</button>
            <button className={styles.primaryAction} type="button" onClick={() => router.push('/events')}>Review Events</button>
            <button className={styles.primaryAction} type="button" onClick={() => router.push('/get-involved')}>Review Opportunities</button>
          </div>
        </div>

        <div className="admin-card">
          <h3>Your Delete Requests</h3>
          {deleteRequests.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            deleteRequests.map((item) => (
              <p key={item.id}>{item.entityType}: {item.entityLabel || item.entityId} • {item.status}</p>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
