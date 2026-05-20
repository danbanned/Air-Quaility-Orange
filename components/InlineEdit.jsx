"use client";

import { useState } from "react";

export default function InlineEdit({ value, onSave, type = "text", isStaff, label }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  if (!isStaff) {
    return <>{value}</>;
  }

  const handleSave = async () => {
    await onSave(editValue);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <span className="inline-edit-container relative block">
        {type === "textarea" ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="border border-orange-300 rounded p-2 w-full bg-white"
            rows={4}
          />
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="border border-orange-300 rounded p-1"
          />
        )}
        <span className="flex gap-1 mt-1">
          <button onClick={handleSave} className="bg-green-500 text-white px-2 py-1 rounded text-xs">Save</button>
          <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-2 py-1 rounded text-xs">Cancel</button>
        </span>
      </span>
    );
  }

  return (
    <span className="inline-edit group relative inline-block">
      {value}
      <button
        onClick={() => {
          setEditValue(value);
          setIsEditing(true);
        }}
        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 bg-yellow-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center"
        title={`Edit ${label}`}
      >
        ✏️
      </button>
    </span>
  );
}
