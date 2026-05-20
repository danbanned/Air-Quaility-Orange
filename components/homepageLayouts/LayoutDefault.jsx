'use client';

import { useState } from 'react';
import Link from 'next/link';
import HeroCarousel from '@/components/home/HeroCarousel';
import EditableSection from '@/components/editable/EditableSection';
import InlineEdit from '@/components/InlineEdit';
import styles from '@/app/page.module.css';

export default function LayoutDefault({ slides: initialSlides, homeContent, stories, isStaff }) {
  const [slides, setSlides] = useState(initialSlides);
  const cards = homeContent?.cards || [];
  const stats = homeContent?.stats || [];
  const quote = homeContent?.quote || {};
  const cta = homeContent?.cta || {};
  const sectionOrder = homeContent?.sectionOrder || ['cards', 'cta', 'stats', 'quote'];

  async function saveHomeContent(updated) {
    const res = await fetch('/api/admin/homepage-content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    return res.ok;
  }

  async function handleEditCards(updatedCard) {
    const newCards = cards.map((c) => (c.title === updatedCard.title ? updatedCard : c));
    await saveHomeContent({ ...homeContent, cards: newCards });
  }

  async function handleInlineEditCard(index, field, newValue) {
    const updated = { ...cards[index], [field]: newValue };
    await handleEditCards(updated);
  }

  async function handleInlineEditStat(index, field, newValue) {
    const updated = { ...stats[index], [field]: newValue };
    await handleEditStat(updated);
  }

  async function handleInlineEditQuote(field, newValue) {
    await handleEditQuote({ ...quote, [field]: newValue });
  }

  async function handleInlineEditCta(field, newValue) {
    await handleEditCta({ ...cta, [field]: newValue });
  }

  async function handleAddCard(data) {
    await saveHomeContent({ ...homeContent, cards: [...cards, { title: data.title || 'New Card', description: '', icon: '📄', link: '' }] });
  }

  async function handleDeleteCard(title) {
    await saveHomeContent({ ...homeContent, cards: cards.filter((c) => c.title !== title) });
  }

  async function handleEditStat(updatedStat) {
    const newStats = stats.map((s) => (s.label === updatedStat.label ? updatedStat : s));
    await saveHomeContent({ ...homeContent, stats: newStats });
  }

  async function handleAddStat(data) {
    await saveHomeContent({ ...homeContent, stats: [...stats, { value: data.value || '0', label: data.label || 'New stat' }] });
  }

  async function handleDeleteStat(label) {
    await saveHomeContent({ ...homeContent, stats: stats.filter((s) => s.label !== label) });
  }

  async function handleEditQuote(data) {
    await saveHomeContent({ ...homeContent, quote: { text: data.text || quote.text, author: data.author || quote.author } });
  }

  async function handleEditCta(data) {
    await saveHomeContent({ ...homeContent, cta: { ...cta, ...data } });
  }

  async function handleAddSlide(data) {
    const res = await fetch('/api/admin/homepage-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        badge: data.badge || 'New',
        title: data.title || 'New Slide',
        summary: data.summary || '',
        sortOrder: slides.length,
      }),
    });
    if (res.ok) {
      const slide = await res.json();
      setSlides([...slides, slide]);
    }
  }

  async function handleEditSlide(data) {
    const res = await fetch(`/api/admin/homepage-slides/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = await res.json();
      setSlides(slides.map((s) => (s.id === updated.id ? updated : s)));
    }
  }

  async function handleDeleteSlide(id) {
    if (!window.confirm('Delete this slide?')) return;
    const res = await fetch('/api/admin/homepage-slides', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setSlides(slides.filter((s) => s.id !== id));
    }
  }

  return (
    <main className={styles.page}>
      <EditableSection
        sectionId="hero"
        title="Hero Slides"
        isStaff={isStaff}
        items={slides}
        onAdd={handleAddSlide}
        onEdit={handleEditSlide}
        onDelete={handleDeleteSlide}
        addButtonText="+ Add Slide"
      >
        <section className={styles.hero}>
          <HeroCarousel slides={slides} />
        </section>
      </EditableSection>

      <section className={styles.layout}>
        {sectionOrder.map((key) => {
          switch (key) {
            case 'cards':
              return (
                <EditableSection
                  key="cards"
                  sectionId="cards"
                  title="Feature Cards"
                  isStaff={isStaff}
                  items={cards}
                  onAdd={handleAddCard}
                  onEdit={handleEditCards}
                  onDelete={handleDeleteCard}
                  addButtonText="+ Add Card"
                >
                  <div className={styles.snapshotGrid}>
                    {cards.map((card, i) => (
                      <article key={`${card.title}-${card.link}`} className={styles.card}>
                        <div className={styles.cardHeader}>
                          <div className={styles.icon}>
                            <InlineEdit
                              value={card.icon}
                              onSave={(v) => handleInlineEditCard(i, 'icon', v)}
                              isStaff={isStaff}
                              label="card icon"
                            />
                          </div>
                          <h3>
                            <InlineEdit
                              value={card.title}
                              onSave={(v) => handleInlineEditCard(i, 'title', v)}
                              isStaff={isStaff}
                              label="card title"
                            />
                          </h3>
                        </div>
                        <p>
                          <InlineEdit
                            value={card.description}
                            onSave={(v) => handleInlineEditCard(i, 'description', v)}
                            type="textarea"
                            isStaff={isStaff}
                            label="card description"
                          />
                        </p>
                        <Link href={card.link || '#'} className={styles.inlineLink}>Explore</Link>
                      </article>
                    ))}
                  </div>
                </EditableSection>
              );

            case 'cta':
              return (
                <EditableSection
                  key="cta"
                  sectionId="cta"
                  title="Call to Action"
                  isStaff={isStaff}
                  items={[{ id: 'cta-main', ...cta }]}
                  onEdit={handleEditCta}
                  singleField
                >
                  <section className={styles.ctaSection}>
                    <div className={styles.ctaCopy}>
                      <h2>
                        <InlineEdit
                          value={cta?.title || 'Where to go next'}
                          onSave={(v) => handleInlineEditCta('title', v)}
                          isStaff={isStaff}
                          label="CTA title"
                        />
                      </h2>
                      <p>
                        <InlineEdit
                          value={cta?.body || ''}
                          onSave={(v) => handleInlineEditCta('body', v)}
                          type="textarea"
                          isStaff={isStaff}
                          label="CTA body"
                        />
                      </p>
                    </div>
                    <div className={styles.ctaButtons}>
                      <Link href={cta?.primaryHref || '/voices'} className="btn">
                        {cta?.primaryText || 'Share Your Story'}
                      </Link>
                      <Link href={cta?.secondaryHref || '/get-involved'} className={`btn ${styles.ctaSecondary}`}>
                        {cta?.secondaryText || 'Get Involved'}
                      </Link>
                      {isStaff ? (
                        <Link href="/admin/homepage" className={`btn ${styles.ctaSecondary}`}>Edit Homepage</Link>
                      ) : null}
                    </div>
                  </section>
                </EditableSection>
              );

            case 'stats':
              return (
                <EditableSection
                  key="stats"
                  sectionId="stats"
                  title="Statistics"
                  isStaff={isStaff}
                  items={stats}
                  onAdd={handleAddStat}
                  onEdit={handleEditStat}
                  onDelete={handleDeleteStat}
                  addButtonText="+ Add Stat"
                >
                  <div className={styles.snapshotGrid}>
                    {stats.map((item, i) => (
                      <article key={`${item.label}-${item.value}`} className={styles.card}>
                        <div className={styles.cardHeader}>
                          <div className={styles.icon}>#</div>
                          <h3>
                            <InlineEdit
                              value={item.value}
                              onSave={(v) => handleInlineEditStat(i, 'value', v)}
                              isStaff={isStaff}
                              label="stat value"
                            />
                          </h3>
                        </div>
                        <p>
                          <InlineEdit
                            value={item.label}
                            onSave={(v) => handleInlineEditStat(i, 'label', v)}
                            isStaff={isStaff}
                            label="stat label"
                          />
                        </p>
                      </article>
                    ))}
                  </div>
                </EditableSection>
              );

            case 'quote':
              return (
                <EditableSection
                  key="quote"
                  sectionId="quote"
                  title="Quote"
                  isStaff={isStaff}
                  items={[{ id: 'quote-main', ...quote }]}
                  onEdit={handleEditQuote}
                  singleField
                >
                  <section className={styles.storiesSection}>
                    <h2>Shared Direction</h2>
                    {quote?.text ? (
                      <div className={styles.storyItem}>
                        <strong>
                          <InlineEdit
                            value={quote.author || 'AQO'}
                            onSave={(v) => handleInlineEditQuote('author', v)}
                            isStaff={isStaff}
                            label="quote author"
                          />
                        </strong>
                        <span>
                          <InlineEdit
                            value={quote.text}
                            onSave={(v) => handleInlineEditQuote('text', v)}
                            type="textarea"
                            isStaff={isStaff}
                            label="quote text"
                          />
                        </span>
                      </div>
                    ) : null}
                  </section>
                </EditableSection>
              );

            default:
              return null;
          }
        })}

        {/* Community Stories - always rendered */}
        <section className={styles.storiesSection}>
          <h2>Latest Community Voices</h2>
          <p>Approved resident stories appear here automatically after moderation.</p>
          <div className={styles.storyList}>
            {stories.length ? (
              stories.map((story) => (
                <article key={story.id} className={styles.storyItem}>
                  <strong>{story.title}</strong>
                  <span>{story.content.slice(0, 180)}...</span>
                  <Link href="/voices" className={styles.inlineLink}>Read More</Link>
                </article>
              ))
            ) : (
              <article className={styles.storyItem}>
                <strong>No approved stories yet</strong>
                <span>Signed-in users can submit the first community voice from the Voices page.</span>
              </article>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
