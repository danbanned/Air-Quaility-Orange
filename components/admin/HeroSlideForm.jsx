'use client';

import styles from './Admin.module.css';

const emptySlide = {
  badge: '',
  title: '',
  summary: '',
  impact: '',
  source: '',
  imageUrl: '',
  linkUrl: '',
  linkLabel: '',
  sortOrder: 0,
  publishedAt: '',
  isActive: true,
};

export function getEmptyHeroSlide() {
  return { ...emptySlide };
}

export default function HeroSlideForm({
  form,
  onChange,
  onSubmit,
  submitting,
}) {
  return (
    <form className={styles.storyForm} onSubmit={onSubmit}>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Badge</span>
          <input name="badge" value={form.badge} onChange={onChange} required />
        </label>

        <label className={styles.field}>
          <span>Sort Order</span>
          <input name="sortOrder" type="number" value={form.sortOrder} onChange={onChange} />
        </label>

        <label className={styles.field}>
          <span>Published Date</span>
          <input name="publishedAt" type="date" value={form.publishedAt} onChange={onChange} />
        </label>

        <label className={styles.field}>
          <span>Source</span>
          <input name="source" value={form.source} onChange={onChange} />
        </label>

        <label className={styles.field}>
          <span>Image URL</span>
          <input name="imageUrl" value={form.imageUrl} onChange={onChange} />
        </label>

        <label className={styles.field}>
          <span>Link URL</span>
          <input name="linkUrl" value={form.linkUrl} onChange={onChange} />
        </label>

        <label className={styles.field}>
          <span>Link Label</span>
          <input name="linkLabel" value={form.linkLabel} onChange={onChange} />
        </label>
      </div>

      <label className={styles.field}>
        <span>Headline</span>
        <input name="title" value={form.title} onChange={onChange} required />
      </label>

      <label className={styles.field}>
        <span>Summary</span>
        <textarea name="summary" value={form.summary} onChange={onChange} rows={5} required />
      </label>

      <label className={styles.field}>
        <span>Impact</span>
        <textarea name="impact" value={form.impact} onChange={onChange} rows={4} />
      </label>

      <label className={styles.checkboxField}>
        <input
          name="isActive"
          type="checkbox"
          checked={form.isActive}
          onChange={onChange}
        />
        <span>Show this slide on the homepage</span>
      </label>

      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : 'Add Hero Slide'}
      </button>
    </form>
  );
}
