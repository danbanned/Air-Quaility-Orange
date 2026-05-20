'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import styles from '@/components/admin/Admin.module.css';

const SECTION_LABELS = {
  cards: 'Cards Grid',
  cta: 'Call to Action',
  stats: 'Stats',
  quote: 'Quote',
};

const ALL_COLORS = [
  { key: '--aqo-orange', label: 'Primary Orange' },
  { key: '--aqo-orange-light', label: 'Orange Light' },
  { key: '--aqo-orange-dark', label: 'Orange Dark' },
  { key: '--aqo-brown', label: 'Brown' },
  { key: '--aqo-cream', label: 'Cream' },
  { key: '--aqo-white', label: 'White' },
  { key: '--aqo-black', label: 'Black' },
  { key: '--aqo-green', label: 'Green' },
  { key: '--aqo-red', label: 'Red' },
  { key: '--aqo-blue', label: 'Blue' },
];

export default function AdminHomepagePage() {
  const { status, role } = useAuth();
  const router = useRouter();
  const [activePanel, setActivePanel] = useState('content');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const [homeContent, setHomeContent] = useState(null);
  const [siteConfig, setSiteConfig] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') { router.replace('/login'); return; }
    if (status === 'authenticated' && role !== 'ADMIN') { router.replace('/login'); return; }
    if (status === 'authenticated' && role === 'ADMIN') {
      Promise.all([
        fetch('/api/admin/homepage-content').then((r) => r.json()),
        fetch('/api/admin/site-config').then((r) => r.json()),
      ]).then(([content, config]) => {
        setHomeContent(content);
        setSiteConfig(config);
      }).catch(() => setMessage('Failed to load data.'));
    }
  }, [status, role, router]);

  function updateHomeContent(section, value) {
    setHomeContent((prev) => ({ ...prev, [section]: value }));
  }

  function moveSection(index, direction) {
    const order = [...(homeContent?.sectionOrder || [])];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    setHomeContent((prev) => ({ ...prev, sectionOrder: order }));
  }

  function updateSiteConfig(path, value) {
    setSiteConfig((prev) => {
      const keys = path.split('.');
      const copy = { ...prev };
      if (keys.length === 1) copy[keys[0]] = value;
      else if (keys.length === 2) copy[keys[0]] = { ...copy[keys[0]], [keys[1]]: value };
      return copy;
    });
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');
    try {
      await Promise.all([
        fetch('/api/admin/homepage-content', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(homeContent),
        }),
        fetch('/api/admin/site-config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(siteConfig),
        }),
      ]);
      setMessage('Saved successfully.');
    } catch {
      setMessage('Save failed.');
    } finally {
      setSaving(false);
    }
  }

  if (status === 'loading' || !homeContent || !siteConfig) {
    return <div className={styles.centerNotice}>Loading...</div>;
  }

  const sectionOrder = homeContent.sectionOrder || [];

  return (
    <div className={`admin-dashboard ${styles.dashboardShell}`}>
      <div className={styles.dashboardHeader}>
        <div>
          <h1 className={styles.dashboardTitle}>Homepage Editor</h1>
          <p className={styles.dashboardSubtitle}>Edit content, layout, and theme</p>
        </div>
        <div className={styles.dashboardHeaderActions}>
          <button onClick={handleSave} className={styles.successPill} disabled={saving}>
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
          <button onClick={() => router.push('/admin/dashboard')} className={styles.secondaryPill}>
            Back to Dashboard
          </button>
        </div>
      </div>

      {message ? <div className={styles.inlineAlert}>{message}</div> : null}

      <div className={styles.tabBar}>
        {['content', 'layout', 'theme'].map((panel) => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={activePanel === panel ? styles.activeTab : styles.inactiveTab}
            type="button"
          >
            {panel === 'content' ? 'Content' : panel === 'layout' ? 'Layout' : 'Theme & Site'}
          </button>
        ))}
      </div>

      {activePanel === 'content' ? (
        <ContentEditor
          homeContent={homeContent}
          updateHomeContent={updateHomeContent}
          styles={styles}
          sectionOrder={sectionOrder}
        />
      ) : null}

      {activePanel === 'layout' ? (
        <LayoutEditor
          sectionOrder={sectionOrder}
          moveSection={moveSection}
          styles={styles}
        />
      ) : null}

      {activePanel === 'theme' ? (
        <ThemeEditor
          siteConfig={siteConfig}
          updateSiteConfig={updateSiteConfig}
          styles={styles}
        />
      ) : null}
    </div>
  );
}

function ContentEditor({ homeContent, updateHomeContent, styles, sectionOrder }) {
  return (
    <div className={styles.tabContent}>
      {sectionOrder.map((key) => (
        <SectionEditor
          key={key}
          sectionKey={key}
          sectionLabel={SECTION_LABELS[key] || key}
          data={homeContent[key]}
          onChange={(value) => updateHomeContent(key, value)}
          styles={styles}
        />
      ))}
    </div>
  );
}

function SectionEditor({ sectionKey, sectionLabel, data, onChange, styles }) {
  switch (sectionKey) {
    case 'cards':
      return <CardsEditor label={sectionLabel} cards={data || []} onChange={onChange} styles={styles} />;
    case 'cta':
      return <CtaEditor label={sectionLabel} cta={data || {}} onChange={onChange} styles={styles} />;
    case 'stats':
      return <StatsEditor label={sectionLabel} stats={data || []} onChange={onChange} styles={styles} />;
    case 'quote':
      return <QuoteEditor label={sectionLabel} quote={data || {}} onChange={onChange} styles={styles} />;
    default:
      return null;
  }
}

function CardsEditor({ label, cards, onChange, styles }) {
  function updateCard(index, field, value) {
    const copy = cards.map((c, i) => (i === index ? { ...c, [field]: value } : c));
    onChange(copy);
  }

  function addCard() {
    onChange([...cards, { title: '', description: '', icon: '📄', link: '' }]);
  }

  function removeCard(index) {
    onChange(cards.filter((_, i) => i !== index));
  }

  return (
    <div className="admin-card">
      <h3>{label}</h3>
      {cards.map((card, i) => (
        <div key={i} className={styles.field} style={{ marginTop: 16, padding: 12, border: '1px solid #555c7d', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>Card {i + 1}</strong>
            <button onClick={() => removeCard(i)} className={styles.dangerPill} type="button">Remove</button>
          </div>
          <div className={styles.field} style={{ marginTop: 8 }}>
            <label>Title</label>
            <input value={card.title} onChange={(e) => updateCard(i, 'title', e.target.value)} />
          </div>
          <div className={styles.field} style={{ marginTop: 8 }}>
            <label>Description</label>
            <textarea rows={2} value={card.description} onChange={(e) => updateCard(i, 'description', e.target.value)} />
          </div>
          <div className={styles.field} style={{ marginTop: 8 }}>
            <label>Icon (emoji)</label>
            <input value={card.icon} onChange={(e) => updateCard(i, 'icon', e.target.value)} />
          </div>
          <div className={styles.field} style={{ marginTop: 8 }}>
            <label>Link</label>
            <input value={card.link} onChange={(e) => updateCard(i, 'link', e.target.value)} />
          </div>
        </div>
      ))}
      <button onClick={addCard} className={styles.primaryAction} style={{ marginTop: 12 }} type="button">+ Add Card</button>
    </div>
  );
}

function CtaEditor({ label, cta, onChange, styles }) {
  return (
    <div className="admin-card">
      <h3>{label}</h3>
      {['title', 'body', 'primaryText', 'primaryHref', 'secondaryText', 'secondaryHref'].map((field) => (
        <div key={field} className={styles.field} style={{ marginTop: 8 }}>
          <label>{field}</label>
          {field === 'body' ? (
            <textarea rows={3} value={cta[field] || ''} onChange={(e) => onChange({ ...cta, [field]: e.target.value })} />
          ) : (
            <input value={cta[field] || ''} onChange={(e) => onChange({ ...cta, [field]: e.target.value })} />
          )}
        </div>
      ))}
    </div>
  );
}

function StatsEditor({ label, stats, onChange, styles }) {
  function updateStat(index, field, value) {
    const copy = stats.map((s, i) => (i === index ? { ...s, [field]: value } : s));
    onChange(copy);
  }

  function addStat() {
    onChange([...stats, { value: '', label: '' }]);
  }

  function removeStat(index) {
    onChange(stats.filter((_, i) => i !== index));
  }

  return (
    <div className="admin-card">
      <h3>{label}</h3>
      {stats.map((stat, i) => (
        <div key={i} className={styles.field} style={{ marginTop: 16, padding: 12, border: '1px solid #555c7d', borderRadius: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <strong>Stat {i + 1}</strong>
            <button onClick={() => removeStat(i)} className={styles.dangerPill} type="button">Remove</button>
          </div>
          <div className={styles.field} style={{ marginTop: 8 }}>
            <label>Value</label>
            <input value={stat.value} onChange={(e) => updateStat(i, 'value', e.target.value)} />
          </div>
          <div className={styles.field} style={{ marginTop: 8 }}>
            <label>Label</label>
            <input value={stat.label} onChange={(e) => updateStat(i, 'label', e.target.value)} />
          </div>
        </div>
      ))}
      <button onClick={addStat} className={styles.primaryAction} style={{ marginTop: 12 }} type="button">+ Add Stat</button>
    </div>
  );
}

function QuoteEditor({ label, quote, onChange, styles }) {
  return (
    <div className="admin-card">
      <h3>{label}</h3>
      <div className={styles.field} style={{ marginTop: 8 }}>
        <label>Quote Text</label>
        <textarea rows={3} value={quote.text || ''} onChange={(e) => onChange({ ...quote, text: e.target.value })} />
      </div>
      <div className={styles.field} style={{ marginTop: 8 }}>
        <label>Author</label>
        <input value={quote.author || ''} onChange={(e) => onChange({ ...quote, author: e.target.value })} />
      </div>
    </div>
  );
}

function LayoutEditor({ sectionOrder, moveSection, styles }) {
  return (
    <div className={styles.tabContent}>
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <h3>Homepage Layout Themes</h3>
        <p className="text-muted">Switch between different visual layouts for the public homepage. All layouts share the same content.</p>
        <a
          href="/admin/homepage-editor"
          className={styles.primaryAction}
          style={{ display: 'inline-block', marginTop: 12, textDecoration: 'none' }}
        >
          Open Layout Editor →
        </a>
      </div>

      <div className="admin-card">
        <h3>Section Order</h3>
        <p className="text-muted">Reorder sections within the active layout.</p>
        {sectionOrder.map((key, i) => (
          <div
            key={key}
            className={styles.field}
            style={{
              marginTop: 8, padding: '16px', border: '1px solid #555c7d', borderRadius: 12,
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <strong>{SECTION_LABELS[key] || key}</strong>
            <div className={styles.buttonRow}>
              <button
                onClick={() => moveSection(i, -1)}
                disabled={i === 0}
                className={styles.secondaryPill}
                type="button"
                style={{ opacity: i === 0 ? 0.4 : 1 }}
              >
                Up
              </button>
              <button
                onClick={() => moveSection(i, 1)}
                disabled={i === sectionOrder.length - 1}
                className={styles.secondaryPill}
                type="button"
                style={{ opacity: i === sectionOrder.length - 1 ? 0.4 : 1 }}
              >
                Down
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThemeEditor({ siteConfig, updateSiteConfig, styles }) {
  return (
    <div className={styles.tabContent}>
      <div className="admin-card">
        <h3>Site Identity</h3>
        <div className={styles.field} style={{ marginTop: 8 }}>
          <label>Site Name</label>
          <input value={siteConfig.siteName || ''} onChange={(e) => updateSiteConfig('siteName', e.target.value)} />
        </div>
        <div className={styles.field} style={{ marginTop: 8 }}>
          <label>Site Subtitle</label>
          <input value={siteConfig.siteSubtitle || ''} onChange={(e) => updateSiteConfig('siteSubtitle', e.target.value)} />
        </div>
        <div className={styles.field} style={{ marginTop: 8 }}>
          <label>Logo Icon (emoji)</label>
          <input value={siteConfig.logoIcon || ''} onChange={(e) => updateSiteConfig('logoIcon', e.target.value)} />
        </div>
      </div>

      <div className="admin-card">
        <h3>Color Theme</h3>
        <p className="text-muted">Customize the application color scheme. Changes apply site-wide after saving.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
          {ALL_COLORS.map(({ key, label }) => {
            const value = siteConfig.theme?.[key] || '';
            const previewStyle = key.includes('black') || key.includes('dark')
              ? { backgroundColor: value, border: '2px solid #555' }
              : { backgroundColor: value };
            return (
              <div key={key} className={styles.field} style={{ marginTop: 0 }}>
                <label>{label} <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', opacity: 0.6 }}>({key})</span></label>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <input
                    value={value}
                    onChange={(e) => updateSiteConfig(`theme.${key}`, e.target.value)}
                    placeholder="#hex"
                  />
                  <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, ...previewStyle }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
