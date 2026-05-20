'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import styles from '@/components/admin/Admin.module.css';

const tabs = ['overview', 'stories', 'events', 'opportunities', 'deletions', 'activity'];

export default function AdminDashboardPage() {
  const { session, status, role } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [message, setMessage] = useState('');
  const [stats, setStats] = useState({
    pendingStories: 0,
    eventRequests: 0,
    opportunityInterests: 0,
    pendingDeletions: 0,
  });
  const [stories, setStories] = useState([]);
  const [allStories, setAllStories] = useState([]);
  const [eventRequests, setEventRequests] = useState([]);
  const [pendingDeletions, setPendingDeletions] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [activityLog, setActivityLog] = useState([]);

  const isAdmin = role === 'ADMIN';
  const isAssistant = role === 'ADMIN_ASSISTANT';

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && !isAdmin && !isAssistant) {
      router.replace('/login');
      return;
    }

    if (status === 'authenticated' && isAssistant) {
      router.replace('/admin/assistant');
      return;
    }

    if (status === 'authenticated' && isAdmin) {
      fetchDashboardData();
    }
  }, [status, isAdmin, isAssistant, router]);

  async function fetchDashboardData() {
    try {
      const [dashboardRes, opportunitiesRes, eventsRes] = await Promise.all([
        fetch('/api/admin/dashboard', { cache: 'no-store' }),
        fetch('/api/admin/opportunities', { cache: 'no-store' }),
        fetch('/api/admin/events', { cache: 'no-store' }),
      ]);

      const dashboardData = await dashboardRes.json();
      const opportunitiesData = await opportunitiesRes.json();
      const eventsData = await eventsRes.json();

      if (!dashboardRes.ok) {
        setMessage(dashboardData.error || 'Unable to load dashboard.');
        return;
      }

      setStats(dashboardData.stats || {});
      setStories(dashboardData.pendingStories || []);
      setAllStories(dashboardData.allStories || []);
      setEventRequests(dashboardData.eventRequests || []);
      setPendingDeletions(dashboardData.pendingDeletions || []);
      setActivityLog(dashboardData.activityLog || []);
      setOpportunities(Array.isArray(opportunitiesData) ? opportunitiesData : []);
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (error) {
      setMessage('Unable to load dashboard.');
    }
  }

  async function handleApproveStory(storyId) {
    await fetch(`/api/admin/stories/${storyId}/approve`, { method: 'POST' });
    fetchDashboardData();
  }

  async function handleRejectStory(storyId) {
    const adminNotes = window.prompt('Reason for rejection:');
    if (!adminNotes) {
      return;
    }

    await fetch(`/api/admin/stories/${storyId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminNotes }),
    });

    fetchDashboardData();
  }

  async function handleArchiveStory(storyId) {
    await fetch(`/api/admin/stories/${storyId}/archive`, { method: 'POST' });
    fetchDashboardData();
  }

  async function handleUnarchiveStory(storyId) {
    await fetch(`/api/admin/stories/${storyId}/unarchive`, { method: 'POST' });
    fetchDashboardData();
  }

  async function handleDeleteStory(storyId) {
    if (!window.confirm('Are you sure you want to delete this story?')) {
      return;
    }
    await fetch('/api/admin/stories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: storyId }),
    });
    fetchDashboardData();
  }

  async function handleApproveDeletion(requestId) {
    await fetch(`/api/admin/delete-requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' }),
    });
    fetchDashboardData();
  }

  async function handleDenyDeletion(requestId) {
    await fetch(`/api/admin/delete-requests/${requestId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DENIED' }),
    });
    fetchDashboardData();
  }

  if (status === 'loading') {
    return <div className={styles.centerNotice}>Loading...</div>;
  }

  return (
    <div className={`admin-dashboard ${styles.dashboardShell}`}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>AQO Admin Dashboard</h1>
          <p className={styles.dashboardSubtitle}>Full access</p>
        </div>
        <div className={styles.dashboardHeaderActions}>
          <span className={styles.userEmail}>{session?.user?.email}</span>
          <button onClick={() => signOut({ callbackUrl: '/' })} className={styles.dangerPill}>
            Sign Out
          </button>
        </div>
      </div>

      {message ? <div className={styles.inlineAlert}>{message}</div> : null}

      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? styles.activeTab : styles.inactiveTab}
            type="button"
          >
            {tab}
            {tab === 'deletions' && stats.pendingDeletions > 0 ? (
              <span className={styles.tabBadge}>{stats.pendingDeletions}</span>
            ) : null}
          </button>
        ))}
      </div>

      {activeTab === 'overview' ? (
        <div className={styles.tabContent}>
          <div className={styles.statsGrid}>
            <div className="admin-card">
              <div className={styles.statValue}>{stats.pendingStories}</div>
              <div className={styles.statLabel}>Pending Stories</div>
            </div>
            <div className="admin-card">
              <div className={styles.statValue}>{stats.eventRequests}</div>
              <div className={styles.statLabel}>Event Requests</div>
            </div>
            <div className="admin-card">
              <div className={styles.statValue}>{stats.opportunityInterests}</div>
              <div className={styles.statLabel}>Opportunity Interests</div>
            </div>
            <div className="admin-card">
              <div className={styles.statValue}>{stats.pendingDeletions}</div>
              <div className={styles.statLabel}>Pending Deletions</div>
            </div>
          </div>

          <div className="admin-card">
            <h3>Quick Actions</h3>
            <div className={styles.quickActionsGrid}>
              <Link href="/admin/dashboard#stories" className={styles.primaryAction}>Manage Stories</Link>
              <Link href="/admin/dashboard#events" className={styles.primaryAction}>Manage Events</Link>
              <Link href="/admin/dashboard#opportunities" className={styles.primaryAction}>Manage Opportunities</Link>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === 'stories' ? (
        <div className={styles.tabContent}>
          <div className={styles.sectionHeadingRow}>
            <h2>Pending Stories</h2>
          </div>
          {stories.length === 0 ? (
            <div className="admin-card">No pending stories.</div>
          ) : (
            stories.map((story) => (
              <div key={story.id} className="admin-card">
                <div className={styles.cardHeaderRow}>
                  <div>
                    <h3>{story.title}</h3>
                    <p className="text-muted">By: {story.personName} • {story.community}</p>
                  </div>
                  <div className={styles.buttonRow}>
                    <button onClick={() => handleApproveStory(story.id)} className={styles.successPill}>Approve</button>
                    <button onClick={() => handleRejectStory(story.id)} className={styles.dangerPill}>Reject</button>
                  </div>
                </div>
                <p>{story.content?.substring(0, 200)}...</p>
              </div>
            ))
          )}

          <div className={styles.sectionHeadingRow}>
            <h2>All Stories</h2>
          </div>
          {allStories.length === 0 ? (
            <div className="admin-card">No stories found.</div>
          ) : (
            allStories.map((story) => (
              <div key={story.id} className="admin-card">
                <div className={styles.cardHeaderRow}>
                  <div>
                    <h3>{story.title}</h3>
                    <p className="text-muted">By: {story.personName} • {story.community}</p>
                    <p className="text-muted">
                      Status: <span className={`${styles.statusBadge} ${styles[`status${story.status}`] || ''}`}>{story.status}</span>
                    </p>
                  </div>
                  <div className={styles.buttonRow}>
                    <Link href={`/admin/stories/${story.id}/edit`} className={styles.primaryAction}>
                      Edit
                    </Link>
                    {story.status === 'ARCHIVED' ? (
                      <button onClick={() => handleUnarchiveStory(story.id)} className={styles.secondaryPill}>
                        Unarchive
                      </button>
                    ) : (
                      <button onClick={() => handleArchiveStory(story.id)} className={styles.secondaryPill}>
                        Archive
                      </button>
                    )}
                    <button onClick={() => handleDeleteStory(story.id)} className={styles.dangerPill}>Delete</button>
                  </div>
                </div>
                <p>{story.content?.substring(0, 200)}...</p>
              </div>
            ))
          )}
        </div>
      ) : null}

      {activeTab === 'events' ? (
        <div className={styles.tabContent}>
          <h2>Pending Event Requests</h2>
          {eventRequests.length === 0 ? (
            <div className="admin-card">No pending event requests.</div>
          ) : (
            eventRequests.map((item) => (
              <div key={item.id} className="admin-card">
                <h3>{item.title}</h3>
                <p className="text-muted">{item.requesterName} • {item.requesterEmail}</p>
                <p>{item.description}</p>
              </div>
            ))
          )}

          <h2 className={styles.subSectionTitle}>Managed Events</h2>
          {events.slice(0, 10).map((item) => (
            <div key={item.id} className="admin-card">
              <h3>{item.title}</h3>
              <p className="text-muted">{item.category} • {item.status}</p>
            </div>
          ))}
        </div>
      ) : null}

      {activeTab === 'opportunities' ? (
        <div className={styles.tabContent}>
          <h2>Opportunities</h2>
          {opportunities.length === 0 ? (
            <div className="admin-card">No opportunities found.</div>
          ) : (
            opportunities.map((item) => (
              <div key={item.id} className="admin-card">
                <h3>{item.title}</h3>
                <p className="text-muted">{item.category}</p>
                <p>{item.description}</p>
              </div>
            ))
          )}
        </div>
      ) : null}

      {activeTab === 'deletions' ? (
        <div className={styles.tabContent}>
          <h2>Pending Deletion Requests</h2>
          {pendingDeletions.length === 0 ? (
            <div className="admin-card">No pending deletion requests.</div>
          ) : (
            pendingDeletions.map((req) => (
              <div key={req.id} className="admin-card">
                <div className={styles.cardHeaderRow}>
                  <div>
                    <h3>Delete {req.entityType}: {req.entityLabel || req.entityId}</h3>
                    <p className="text-muted">Requested by: {req.requestedBy?.email || 'unknown'}</p>
                    <p className="text-muted">Reason: {req.reason || 'No reason provided'}</p>
                  </div>
                  <div className={styles.buttonRow}>
                    <button onClick={() => handleApproveDeletion(req.id)} className={styles.successPill}>Approve</button>
                    <button onClick={() => handleDenyDeletion(req.id)} className={styles.dangerPill}>Deny</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : null}

      {activeTab === 'activity' ? (
        <div className={styles.tabContent}>
          <h2>Recent Activity</h2>
          {activityLog.length === 0 ? (
            <div className="admin-card">No recent activity.</div>
          ) : (
            activityLog.map((log) => (
              <div key={log.id} className="admin-card">
                <div className={styles.cardHeaderRow}>
                  <span className={styles.activityType}>{log.action}</span>
                  <span className={styles.activityTime}>{new Date(log.createdAt).toLocaleString('en-US')}</span>
                </div>
                <p>{log.details}</p>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
