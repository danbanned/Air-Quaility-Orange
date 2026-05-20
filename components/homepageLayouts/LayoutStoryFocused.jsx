'use client';

import { useState } from 'react';
import Link from 'next/link';
import EditableSection from '@/components/editable/EditableSection';
import InlineEdit from '@/components/InlineEdit';

export default function LayoutStoryFocused({ slides, homeContent, stories, isStaff }) {
  const hero = slides?.[0] || {};
  const [localContent, setLocalContent] = useState(homeContent);
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

  async function handleEditQuote(data) {
    await saveHomeContent({ ...localContent, quote: { text: data.text || quote.text, author: data.author || quote.author } });
  }

  async function handleEditCta(data) {
    await saveHomeContent({ ...localContent, cta: { ...cta, ...data } });
  }

  async function handleInlineEditQuote(field, newValue) {
    await handleEditQuote({ ...quote, [field]: newValue });
  }

  async function handleInlineEditCta(field, newValue) {
    await handleEditCta({ ...cta, [field]: newValue });
  }

  return (
    <div>
      <div style={{
        background: '#0f172a',
        color: '#e2d4b0',
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: '#FF6B35' }}>
          {hero.badge || 'Stories That Matter'}
        </span>
        <h1 style={{ fontSize: 'clamp(32px, 6vw, 56px)', fontWeight: 700, fontStyle: 'italic', margin: '16px 0' }}>
          {hero.title || 'Air Quality Orange'}
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.6)', maxWidth: '500px', margin: '0 auto' }}>
          {hero.summary || 'Real stories from real people fighting for clean air.'}
        </p>
      </div>

      <div className="container" style={{ paddingTop: '40px', paddingBottom: '40px' }}>
        <EditableSection
          sectionId="story-quote"
          title="Featured Quote"
          isStaff={isStaff}
          items={[{ id: 'quote-story', ...quote }]}
          onEdit={handleEditQuote}
          singleField
        >
          <div style={{
            maxWidth: '700px',
            margin: '0 auto 48px',
            textAlign: 'center',
            padding: '32px',
            background: '#fff4e6',
            borderRadius: '16px',
          }}>
            {quote?.text ? (
              <>
                <blockquote style={{ fontSize: '22px', lineHeight: 1.6, color: '#2c2c2c', fontStyle: 'italic', marginBottom: '16px' }}>
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
                <cite style={{ color: '#FF6B35', fontWeight: 600, fontSize: '14px', fontStyle: 'normal' }}>
                  &mdash;{' '}
                  <InlineEdit
                    value={quote.author || 'AQO'}
                    onSave={(v) => handleInlineEditQuote('author', v)}
                    isStaff={isStaff}
                    label="quote author"
                  />
                </cite>
              </>
            ) : null}
          </div>
        </EditableSection>

        <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', color: '#2c2c2c', marginBottom: '24px' }}>
          Community Voices
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginBottom: '48px',
        }}>
          {stories.length ? (
            stories.map((story) => (
              <div key={story.id} style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                borderLeft: '4px solid #FF6B35',
              }}>
                <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#2c2c2c', marginBottom: '8px' }}>{story.title}</h3>
                <p style={{ fontSize: '14px', color: '#666', lineHeight: 1.6, marginBottom: '12px' }}>
                  &ldquo;{story.content.slice(0, 200)}...&rdquo;
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#999' }}>&mdash; {story.personName || 'Anonymous'}</span>
                  <Link href="/voices" style={{ fontSize: '13px', color: '#FF6B35', fontWeight: 600, textDecoration: 'none' }}>
                    Read More &rarr;
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '48px',
              color: '#999',
            }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>No approved stories yet.</p>
              <p style={{ fontSize: '14px' }}>Signed-in users can submit their voice from this page.</p>
              <Link href="/voices" className="btn" style={{ marginTop: '16px', display: 'inline-block' }}>Share Your Story</Link>
            </div>
          )}
        </div>

        <EditableSection
          sectionId="story-cta"
          title="Call to Action"
          isStaff={isStaff}
          items={[{ id: 'cta-story', ...cta }]}
          onEdit={handleEditCta}
          singleField
        >
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            color: '#fff',
            borderRadius: '16px',
          }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '8px' }}>
              <InlineEdit
                value={cta.title || 'Your Voice Matters'}
                onSave={(v) => handleInlineEditCta('title', v)}
                isStaff={isStaff}
                label="CTA title"
              />
            </h2>
            <p style={{ fontSize: '14px', opacity: 0.8, marginBottom: '20px' }}>
              <InlineEdit
                value={cta.body || cta.description || 'Share your story and be part of the change.'}
                onSave={(v) => handleInlineEditCta('body', v)}
                type="textarea"
                isStaff={isStaff}
                label="CTA body"
              />
            </p>
            <Link href={cta.primaryHref || '/voices'} className="btn" style={{ background: '#FF6B35', color: '#fff' }}>
              {cta.primaryText || 'Add Your Story'}
            </Link>
          </div>
        </EditableSection>
      </div>
    </div>
  );
}
