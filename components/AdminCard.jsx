'use client';

import { useEffect, useMemo, useState } from 'react';

function toFormState(item) {
  const entries = Object.entries(item || {}).map(([key, value]) => {
    if (value instanceof Date) {
      return [key, value.toISOString().slice(0, 16)];
    }

    if (typeof value === 'object' && value !== null) {
      return [key, JSON.stringify(value, null, 2)];
    }

    return [key, value ?? ''];
  });

  return Object.fromEntries(entries);
}

const hiddenKeys = new Set([
  'id',
  'createdAt',
  'updatedAt',
  'submittedBy',
  'storyRequests',
  'interests',
  '_count',
]);

export default function AdminCard({ item, type, onUpdate, onDelete, isStaff, children, editableKeys }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(() => toFormState(item));
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setEditForm(toFormState(item));
  }, [item]);

  const keysToRender = useMemo(() => {
    if (Array.isArray(editableKeys) && editableKeys.length) {
      return editableKeys;
    }

    return Object.keys(editForm).filter((key) => !hiddenKeys.has(key));
  }, [editForm, editableKeys]);

  async function handleSave() {
    await onUpdate(editForm);
    setIsEditing(false);
  }

  async function handleImageUpload(file) {
    if (!file) {
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('itemId', item.id);
    formData.append('type', type);

    const res = await fetch('/api/admin/upload-image', { method: 'POST', body: formData });
    const data = await res.json();

    if (res.ok) {
      const next = { ...editForm, imageUrl: data.imageUrl };
      setEditForm(next);
      await onUpdate(next);
      setShowImageUpload(false);
    }

    setUploading(false);
  }

  return (
    <div className="admin-card-shell">
      {isStaff ? (
        <div className="admin-card-actions">
          <button type="button" onClick={(event) => { event.stopPropagation(); setIsEditing(true); }}>Edit</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); setShowImageUpload(true); }}>Image</button>
          <button type="button" onClick={(event) => { event.stopPropagation(); onDelete(item.id); }}>Delete</button>
        </div>
      ) : null}

      {children(editForm, isEditing)}

      {isStaff && isEditing ? (
        <div className="admin-modal-backdrop" onClick={() => setIsEditing(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Edit {type}</h3>
            {keysToRender.map((key) => (
              <label key={key} className="admin-modal-field">
                <span>{key}</span>
                {String(key).toLowerCase().includes('description') || key === 'content' || key === 'summary' ? (
                  <textarea
                    rows="4"
                    value={editForm[key] ?? ''}
                    onChange={(event) => setEditForm((current) => ({ ...current, [key]: event.target.value }))}
                  />
                ) : (
                  <input
                    type={key === 'date' || key === 'publishedAt' ? 'datetime-local' : 'text'}
                    value={editForm[key] ?? ''}
                    onChange={(event) => setEditForm((current) => ({ ...current, [key]: event.target.value }))}
                  />
                )}
              </label>
            ))}
            <div className="admin-modal-actions">
              <button type="button" onClick={handleSave}>Save</button>
              <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}

      {isStaff && showImageUpload ? (
        <div className="admin-modal-backdrop" onClick={() => setShowImageUpload(false)}>
          <div className="admin-modal" onClick={(event) => event.stopPropagation()}>
            <h3>Upload Image</h3>
            <input type="file" accept="image/*" onChange={(event) => handleImageUpload(event.target.files?.[0])} />
            <div className="admin-modal-actions">
              <button type="button" onClick={() => setShowImageUpload(false)} disabled={uploading}>
                {uploading ? 'Uploading...' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
