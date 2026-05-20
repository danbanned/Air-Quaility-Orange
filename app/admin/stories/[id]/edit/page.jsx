'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import StoryForm, { getEmptyStory } from '@/components/admin/StoryForm';
import styles from '@/components/admin/Admin.module.css';

export default function EditStoryPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState(getEmptyStory());
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadStory() {
      const response = await fetch(`/api/admin/stories?id=${params.id}`, { cache: 'no-store' });

      if (!response.ok) {
        setMessage({ type: 'error', text: 'Unable to load this story.' });
        setLoading(false);
        return;
      }

      const story = await response.json();
      setForm({
        title: story.title || '',
        personName: story.personName || '',
        community: story.community || '',
        content: story.content || '',
        audioUrl: story.audioUrl || '',
        imageUrl: story.imageUrl || '',
        category: story.category || '',
      });
      setLoading(false);
    }

    if (status === 'authenticated' && session?.user?.isAdmin && params.id) {
      loadStory();
    }
  }, [params.id, session, status]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const response = await fetch('/api/admin/stories', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: params.id, ...form }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage({ type: 'error', text: payload.error || 'Unable to update story.' });
      return;
    }

    router.push('/admin/dashboard');
    router.refresh();
  }

  if (status === 'loading' || loading) {
    return (
      <div className={styles.pageWrap}>
        <div className={styles.notice}>Loading story editor...</div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrap}>
      <section className={styles.hero}>
        <span className={styles.eyebrow}>Story Editor</span>
        <div className={styles.heroActions}>
          <div>
            <h1>Edit a published story.</h1>
            <p>
              Update the content that appears on the public Voices page. Save
              actions remain admin-only on the backend.
            </p>
          </div>
          <Link className={styles.linkButton} href="/admin/dashboard">
            Back to dashboard
          </Link>
        </div>
      </section>

      {message ? (
        <div className={`${styles.message} ${message.type === 'success' ? styles.success : styles.error}`}>
          {message.text}
        </div>
      ) : null}

      <section className={styles.panel}>
        <StoryForm
          form={form}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitLabel="Save Changes"
          submitting={saving}
        />
      </section>
    </div>
  );
}
