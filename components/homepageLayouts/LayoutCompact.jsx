'use client';

import { useState } from 'react';
import Link from 'next/link';
import EditableSection from '@/components/editable/EditableSection';
import InlineEdit from '@/components/InlineEdit';

export default function LayoutCompact({ slides, homeContent, stories, isStaff }) {
  const hero = slides?.[0] || {};
  const [localContent, setLocalContent] = useState(homeContent);
  const stats = localContent?.stats || [];
  const cards = localContent?.cards || [];
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

  async function handleEditCards(updatedCard) {
    const newCards = cards.map((c) => (c.title === updatedCard.title ? updatedCard : c));
    await saveHomeContent({ ...localContent, cards: newCards });
  }

  async function handleAddCard(data) {
    await saveHomeContent({ ...localContent, cards: [...cards, { title: data.title || 'New Card', description: '', icon: '📄', link: '' }] });
  }

  async function handleDeleteCard(title) {
    await saveHomeContent({ ...localContent, cards: cards.filter((c) => c.title !== title) });
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

  async function handleInlineEditStat(index, field, newValue) {
    const updated = { ...stats[index], [field]: newValue };
    await handleEditStat(updated);
  }

  async function handleInlineEditCard(index, field, newValue) {
    const updated = { ...cards[index], [field]: newValue };
    await handleEditCards(updated);
  }

  async function handleInlineEditCta(field, newValue) {
    await handleEditCta({ ...cta, [field]: newValue });
  }

  return (
    <div>
      <div style={{
        background: 'linear-gradient(135deg, #FF6B35, #E54B1E)',
        color: '#fff',
        padding: '48px 24px',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '12px', letterSpacing: '2px', textTransform: 'uppercase', opacity: 0.8 }}>
          {hero.badge || 'Air Quality Orange'}
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, margin: '12px 0 8px' }}>
          {hero.title || 'Air Quality Orange'}
        </h1>
        <p style={{ fontSize: '16px', opacity: 0.9, maxWidth: '600px', margin: '0 auto' }}>
          {hero.summary || 'Environmental Justice for Nicetown, Hunting Park, and Eastwick'}
        </p>
      </div>

      <div className="container" style={{ paddingTop: '32px', paddingBottom: '32px' }}>
        <EditableSection
          sectionId="compact-stats"
          title="Statistics"
          isStaff={isStaff}
          items={stats}
          onAdd={handleAddStat}
          onEdit={handleEditStat}
          onDelete={handleDeleteStat}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '12px',
            marginBottom: '40px',
          }}>
            {stats.map((stat, i) => (
              <div key={`${stat.label}-${stat.value}`} style={{
                background: '#fff',
                padding: '16px 12px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '28px', fontWeight: 700, color: '#FF6B35' }}>
                  <InlineEdit
                    value={stat.value}
                    onSave={(v) => handleInlineEditStat(i, 'value', v)}
                    isStaff={isStaff}
                    label="stat value"
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  <InlineEdit
                    value={stat.label}
                    onSave={(v) => handleInlineEditStat(i, 'label', v)}
                    isStaff={isStaff}
                    label="stat label"
                  />
                </div>
              </div>
            ))}
          </div>
        </EditableSection>

        <EditableSection
          sectionId="compact-features"
          title="Feature Cards"
          isStaff={isStaff}
          items={cards}
          onAdd={handleAddCard}
          onEdit={handleEditCards}
          onDelete={handleDeleteCard}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '40px',
          }}>
            {cards.map((card, i) => (
              <Link key={`${card.title}-${card.link}`} href={card.link || '#'} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                background: '#fff',
                padding: '16px',
                borderRadius: '10px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'box-shadow 0.2s',
              }}>
                <span style={{ fontSize: '28px' }}>
                  <InlineEdit
                    value={card.icon || '📄'}
                    onSave={(v) => handleInlineEditCard(i, 'icon', v)}
                    isStaff={isStaff}
                    label="card icon"
                  />
                </span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                    <InlineEdit
                      value={card.title}
                      onSave={(v) => handleInlineEditCard(i, 'title', v)}
                      isStaff={isStaff}
                      label="card title"
                    />
                  </h3>
                  <p style={{ fontSize: '13px', color: '#666', margin: '4px 0 0' }}>
                    <InlineEdit
                      value={card.description}
                      onSave={(v) => handleInlineEditCard(i, 'description', v)}
                      type="textarea"
                      isStaff={isStaff}
                      label="card description"
                    />
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </EditableSection>

        <EditableSection
          sectionId="compact-cta"
          title="Call to Action"
          isStaff={isStaff}
          items={[{ id: 'cta-compact', ...cta }]}
          onEdit={handleEditCta}
          singleField
        >
          <div style={{
            background: 'linear-gradient(135deg, #FF6B35, #E54B1E)',
            color: '#fff',
            padding: '32px 24px',
            borderRadius: '12px',
            textAlign: 'center',
            marginBottom: '32px',
          }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 8px' }}>
              <InlineEdit
                value={cta.title || 'Take Action Today'}
                onSave={(v) => handleInlineEditCta('title', v)}
                isStaff={isStaff}
                label="CTA title"
              />
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 16px' }}>
              <InlineEdit
                value={cta.body || cta.description || ''}
                onSave={(v) => handleInlineEditCta('body', v)}
                type="textarea"
                isStaff={isStaff}
                label="CTA body"
              />
            </p>
            <Link href={cta.primaryHref || '/get-involved'} className="btn" style={{ background: '#fff', color: '#FF6B35' }}>
              {cta.primaryText || 'Get Involved'}
            </Link>
          </div>
        </EditableSection>

        <section>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', textAlign: 'center', color: '#2c2c2c' }}>
            Community Voices
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stories.length ? (
              stories.slice(0, 3).map((story) => (
                <div key={story.id} style={{
                  background: '#fff',
                  padding: '16px',
                  borderRadius: '10px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}>
                  <strong style={{ color: '#FF6B35', fontSize: '14px' }}>{story.title}</strong>
                  <p style={{ fontSize: '13px', color: '#666', margin: '6px 0 0' }}>{story.content.slice(0, 120)}...</p>
                </div>
              ))
            ) : (
              <p style={{ textAlign: 'center', color: '#999', fontSize: '14px' }}>No stories yet. Be the first to share your voice.</p>
            )}
          </div>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link href="/voices" className="btn btn-secondary">View All Stories</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
