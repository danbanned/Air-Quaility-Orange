'use client';

import { useState } from 'react';

const FIELD_TYPES = {
  title: 'text',
  subtitle: 'text',
  badge: 'text',
  name: 'text',
  label: 'text',
  value: 'text',
  icon: 'text',
  link: 'text',
  linkUrl: 'text',
  linkLabel: 'text',
  imageUrl: 'text',
  sortOrder: 'number',
  buttonText: 'text',
  buttonLink: 'text',
  description: 'textarea',
  content: 'textarea',
  summary: 'textarea',
  body: 'textarea',
  text: 'textarea',
  impact: 'textarea',
  source: 'text',
  author: 'text',
  personName: 'text',
  community: 'text',
};

function guessFieldType(key) {
  return FIELD_TYPES[key] || 'text';
}

export default function EditableSection({
  sectionId,
  title,
  children,
  isStaff,
  items = [],
  onAdd,
  onEdit,
  onDelete,
  singleField = false,
  addButtonText = '+ Add Item',
}) {
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  if (!isStaff) {
    return <>{children}</>;
  }

  function openAddModal() {
    setEditingItem(null);
    setFormData({});
    setShowModal(true);
  }

  function openEditModal(item) {
    setEditingItem(item);
    setFormData({ ...item });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingItem) {
        await onEdit({ ...editingItem, ...formData });
      } else {
        await onAdd(formData);
      }
      closeModal();
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  }

  function getFieldKeys() {
    if (editingItem) {
      return Object.keys(editingItem).filter(
        (k) => k !== 'id' && k !== 'createdAt' && k !== 'updatedAt' && k !== 'isActive'
      );
    }
    if (singleField && items.length === 1) {
      return Object.keys(items[0] || {}).filter(
        (k) => k !== 'id' && k !== 'createdAt' && k !== 'updatedAt' && k !== 'isActive'
      );
    }
    return [];
  }

  const canAdd = onAdd && !singleField;
  const canDelete = onDelete && !singleField;

  return (
    <div className="editable-section-wrapper relative group/section">
      {/* Admin toolbar */}
      <div
        style={{
          position: 'absolute',
          top: '-40px',
          right: '0',
          display: 'flex',
          gap: '8px',
          opacity: 0,
          transition: 'opacity 0.2s',
          zIndex: 20,
        }}
        className="admin-toolbar"
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0')}
      >
        {singleField && items.length === 1 ? (
          <button
            onClick={() => openEditModal(items[0])}
            type="button"
            style={{
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Edit {title}
          </button>
        ) : null}
        {canAdd ? (
          <button
            onClick={openAddModal}
            type="button"
            style={{
              background: '#16a34a',
              color: '#fff',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {addButtonText}
          </button>
        ) : null}
      </div>

      {children}

      {/* Edit/Add Modal */}
      {showModal ? (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={closeModal}
        >
          <div
            style={{
              background: '#1e293b',
              padding: '24px',
              borderRadius: '12px',
              width: '90%',
              maxWidth: '480px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ color: '#fff', marginBottom: '16px', fontSize: '18px' }}>
              {editingItem ? 'Edit' : 'Add'} {title}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {singleField ? (
                getFieldKeys().map((key) => (
                  <FieldInput
                    key={key}
                    fieldKey={key}
                    value={formData[key] || ''}
                    onChange={(val) => setFormData({ ...formData, [key]: val })}
                  />
                ))
              ) : (
                <FieldInput
                  fieldKey="title"
                  value={formData.title || ''}
                  onChange={(val) => setFormData({ ...formData, title: val })}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={handleSave}
                disabled={saving}
                type="button"
                style={{
                  background: '#16a34a',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={closeModal}
                type="button"
                style={{
                  background: '#475569',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Staff item list */}
      {isStaff && items.length > 0 && !singleField ? (
        <div
          style={{
            marginTop: '16px',
            paddingTop: '12px',
            borderTop: '1px solid rgba(255,255,255,0.1)',
          }}
          className="admin-item-list"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {items.map((item) => (
              <div
                key={item.id || Math.random()}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.05)',
                  padding: '6px 12px',
                  borderRadius: '6px',
                }}
              >
                <span style={{ color: '#cbd5e1', fontSize: '13px' }}>
                  {item.title || item.label || item.name || item.text?.slice(0, 60) || '(untitled)'}
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => openEditModal(item)}
                    type="button"
                    style={{
                      background: 'none',
                      border: '1px solid #facc15',
                      color: '#facc15',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                  {canDelete ? (
                    <button
                      onClick={() => onDelete(item.id)}
                      type="button"
                      style={{
                        background: 'none',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function FieldInput({ fieldKey, value, onChange }) {
  const type = guessFieldType(fieldKey);

  return (
    <div>
      <label
        style={{
          display: 'block',
          fontSize: '12px',
          color: '#94a3b8',
          marginBottom: '4px',
          textTransform: 'capitalize',
        }}
      >
        {fieldKey.replace(/([A-Z])/g, ' $1').trim()}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{
            width: '100%',
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #475569',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '14px',
            resize: 'vertical',
          }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            background: '#0f172a',
            color: '#fff',
            border: '1px solid #475569',
            borderRadius: '6px',
            padding: '8px',
            fontSize: '14px',
          }}
        />
      )}
    </div>
  );
}
