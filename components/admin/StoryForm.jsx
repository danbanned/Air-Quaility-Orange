'use client';

import styles from './Admin.module.css';

const emptyStory = {
  title: '',
  personName: '',
  community: '',
  content: '',
  audioUrl: '',
  imageUrl: '',
  category: '',
};

export function getEmptyStory() {
  return { ...emptyStory };
}

export default function StoryForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
  submitting,
}) {
  return (
    <form className={styles.storyForm} onSubmit={onSubmit}>
      <div className={styles.formGrid}>
        <label className={styles.field}>
          <span>Title</span>
          <input name="title" value={form.title} onChange={onChange} required />
        </label>

        <label className={styles.field}>
          <span>Person Name</span>
          <input name="personName" value={form.personName} onChange={onChange} required />
        </label>

        <label className={styles.field}>
          <span>Community</span>
          <input name="community" value={form.community} onChange={onChange} required />
        </label>

        <label className={styles.field}>
          <span>Category</span>
          <input name="category" value={form.category} onChange={onChange} required />
        </label>

        <label className={styles.field}>
          <span>Audio URL</span>
          <input name="audioUrl" value={form.audioUrl} onChange={onChange} />
        </label>

        <label className={styles.field}>
          <span>Image URL</span>
          <input name="imageUrl" value={form.imageUrl} onChange={onChange} />
        </label>
      </div>

      <label className={styles.field}>
        <span>Story Content</span>
        <textarea name="content" value={form.content} onChange={onChange} rows={8} required />
      </label>

      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
