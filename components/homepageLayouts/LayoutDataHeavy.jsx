'use client';

import { useState } from 'react';
import Link from 'next/link';
import EditableSection from '../../components/editable/EditableSection';
import InlineEdit from '../../components/InlineEdit';

export default function LayoutDataHeavy({ slides, homeContent, stories, isStaff }) {
  const hero = slides?.[0] || {};
  const [localContent, setLocalContent] = useState(homeContent);
  const stats = localContent?.stats || [];
  const cards = localContent?.cards || [];
  const quote = localContent?.quote || {};
  const cta = localContent?.cta || {};

  async function saveHomeContent(updated) {
    const res = await fetch('/api/admin/homepage-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      setLocalContent(updated);
    }
    return res.ok;
  }

  async function handleEditStat(updatedStat) {
    const newStats = stats.map((s) => (s.label === updatedStat.label ? updatedStat : s));
    await saveHomeContent({ ...localContent, stats: newStats });
  }

  async function handleAddStat(data) {
    await saveHomeContent({ ...localContent, stats: [...stats, { value: data.value || '0', label: data.label || 'New stat' }] });
  }

  async function handleDeleteStat(label) {
    await saveHomeContent({ ...localContent, stats: stats.filter((s) => s.label !== label) });
  }

  async function handleEditCta(data) {
    await saveHomeContent({ ...localContent, cta: { ...cta, ...data } });
  }

  async function handleEditQuote(data) {
    await saveHomeContent({ ...localContent, quote: { text: data.text || quote.text, author: data.author || quote.author } });
  }

  async function handleInlineEditStat(index, field, newValue) {
    const updated = { ...stats[index], [field]: newValue };
    await handleEditStat(updated);
  }

  async function handleInlineEditCta(field, newValue) {
    await handleEditCta({ ...cta, [field]: newValue });
  }

  async function handleInlineEditQuote(field, newValue) {
    await handleEditQuote({ ...quote, [field]: newValue });
  }

  const headerCards = [
    { label: 'Air Quality Grade', value: 'F', color: '#ef4444' },
    { label: 'Focus Communities', value: '3', color: '#FF6B35' },
    { label: 'Solution Pathways', value: '6', color: '#16a34a' },
    { label: 'Premature Deaths/Year', value: '125', color: '#6366f1' },
  ];

  return (
    <div>
      <div style={{
        background: '#0f172a',
        color: '#fff',
        padding: '48px 24px 32px',
        textAlign: 'center',
      }}>
        <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 700, margin: '0 0 8px' }}>
          {hero.title || 'Air Quality Orange'}
        </h1>
        <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: '0 auto 0', maxWidth: '500px' }}>
          {hero.summary || 'Data-driven environmental justice for Philadelphia neighborhoods.'}
        </p>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        <EditableSection
          sectionId="data-stats"
          title="Statistics"
          isStaff={isStaff}
          items={stats}
          onAdd={handleAddStat}
          onEdit={handleEditStat}
          onDelete={handleDeleteStat}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}>
            {headerCards.map((h) => (
              <div key={h.label} style={{
                background: `linear-gradient(135deg, ${h.color}22, ${h.color}11)`,
                border: `1px solid ${h.color}44`,
                borderRadius: '12px',
                padding: '24px 16px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '36px', fontWeight: 800, color: h.color }}>{h.value}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>{h.label}</div>
              </div>
            ))}
          </div>
        </EditableSection>

        {stats.length > 0 ? (
          <EditableSection
            sectionId="data-breakdown"
            title="Statistics Breakdown"
            isStaff={isStaff}
            items={stats}
            onAdd={handleAddStat}
            onEdit={handleEditStat}
            onDelete={handleDeleteStat}
          >
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700, textAlign: 'center', color: '#2c2c2c', marginBottom: '20px' }}>
                Key Metrics
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.map((stat, i) => (
                  <div key={`${stat.label}-${stat.value}`} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    background: '#fff',
                    padding: '16px 20px',
                    borderRadius: '10px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: '#FF6B35',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '16px',
                    }}>
                      {i + 1}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: '#FF6B35' }}>
                        <InlineEdit
                          value={stat.value}
                          onSave={(v) => handleInlineEditStat(i, 'value', v)}
                          isStaff={isStaff}
                          label="stat value"
                        />
                      </div>
                      <div style={{ fontSize: '13px', color: '#666' }}>
                        <InlineEdit
                          value={stat.label}
                          onSave={(v) => handleInlineEditStat(i, 'label', v)}
                          isStaff={isStaff}
                          label="stat label"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </EditableSection>
        ) : null}

        {quote?.text ? (
          <EditableSection
            sectionId="data-quote"
            title="Quote"
            isStaff={isStaff}
            items={[{ id: 'quote-data', ...quote }]}
            onEdit={handleEditQuote}
            singleField
          >
            <div style={{
              background: '#0f172a',
              color: '#e2d4b0',
              padding: '32px',
              borderRadius: '12px',
              textAlign: 'center',
              marginBottom: '40px',
            }}>
              <blockquote style={{ fontSize: '18px', lineHeight: 1.6, fontStyle: 'italic', marginBottom: '12px' }}>
                &ldquo;
                <InlineEdit
                  value={quote.text}
                  onSave={(v) => handleInlineEditQuote('text', v)}
                  type="textarea"
                  isStaff={isStaff}
                  label="quote text"
                />
                &rdquo;
              </blockquote>
              <cite style={{ fontSize: '13px', color: '#FF6B35', fontStyle: 'normal' }}>
                &mdash;{' '}
                <InlineEdit
                  value={quote.author}
                  onSave={(v) => handleInlineEditQuote('author', v)}
                  isStaff={isStaff}
                  label="quote author"
                />
              </cite>
            </div>
          </EditableSection>
        ) : null}

        <EditableSection
          sectionId="data-cta"
          title="Call to Action"
          isStaff={isStaff}
          items={[{ id: 'cta-data', ...cta }]}
          onEdit={handleEditCta}
          singleField
        >
          <div style={{
            textAlign: 'center',
            padding: '36px',
            background: 'linear-gradient(135deg, #FF6B35, #E54B1E)',
            color: '#fff',
            borderRadius: '12px',
            marginBottom: '32px',
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
              <InlineEdit
                value={cta.title || 'The Data Is Clear'}
                onSave={(v) => handleInlineEditCta('title', v)}
                isStaff={isStaff}
                label="CTA title"
              />
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px' }}>
              <InlineEdit
                value={cta.body || cta.description || 'See the numbers, understand the impact, take action.'}
                onSave={(v) => handleInlineEditCta('body', v)}
                type="textarea"
                isStaff={isStaff}
                label="CTA body"
              />
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href={cta.primaryHref || '/data'} className="btn" style={{ background: '#fff', color: '#FF6B35' }}>
                {cta.primaryText || 'Explore the Data'}
              </Link>
              <Link href={cta.secondaryHref || '/map'} className="btn btn-secondary" style={{ borderColor: '#fff', color: '#fff' }}>
                {cta.secondaryText || 'View the Map'}
              </Link>
            </div>
          </div>
        </EditableSection>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, textAlign: 'center', color: '#2c2c2c', marginBottom: '16px' }}>
            Recent Community Voices
          </h2>
          {stories.length ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {stories.slice(0, 3).map((story) => (
                <div key={story.id} style={{
                  background: '#fff',
                  borderRadius: '10px',
                  padding: '16px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <strong style={{ fontSize: '14px', color: '#2c2c2c', display: 'block', marginBottom: '6px' }}>{story.title}</strong>
                  <p style={{ fontSize: '13px', color: '#666', lineHeight: 1.5 }}>{story.content.slice(0, 120)}...</p>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>No stories yet.</p>
          )}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/voices" className="btn btn-secondary">Read All Stories</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
