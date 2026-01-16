import { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import type { Note } from '../lib/notesApi';

interface AddEditNoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: NoteFormData) => Promise<void>;
  note?: Note | null;
}

export interface NoteFormData {
  title: string;
  content: string;
  tags: string[];
  color: string;
}

const COLORS = [
  { name: 'Indigo', value: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Purple', value: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' },
  { name: 'Blue', value: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' },
  { name: 'Cyan', value: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' },
  { name: 'Teal', value: 'linear-gradient(135deg, #14b8a6 0%, #059669 100%)' },
  { name: 'Orange', value: 'linear-gradient(135deg, #f97316 0%, #dc2626 100%)' },
  { name: 'Pink', value: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' },
  { name: 'Slate', value: 'linear-gradient(135deg, #475569 0%, #1e293b 100%)' },
];

export default function AddEditNoteModal({
  isOpen,
  onClose,
  onSave,
  note,
}: AddEditNoteModalProps) {
  const [formData, setFormData] = useState<NoteFormData>({
    title: '',
    content: '',
    tags: [],
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        tags: note.tags,
        color: note.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      });
    } else {
      setFormData({
        title: '',
        content: '',
        tags: [],
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      });
    }
  }, [note, isOpen]);

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ background: formData.color }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-black/20 backdrop-blur-sm border-b border-white/20 p-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-white drop-shadow-md">
            {note ? 'Edit Note' : 'Create New Note'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 backdrop-blur-sm rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 pt-8 space-y-4">{/* Title */}
          {/* Title */}
          <div>
            <input
              type="text"
              placeholder="Note title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent text-gray-900 placeholder-gray-600 text-lg font-semibold"
              maxLength={200}
              required
            />
            <p className="text-xs text-white/80 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Content */}
          <div>
            <textarea
              placeholder="Start typing your note..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent text-gray-900 placeholder-gray-600 resize-none"
              rows={8}
              required
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-white drop-shadow-md mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 px-3 py-2 bg-white/90 backdrop-blur-sm border border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent text-gray-900 placeholder-gray-600"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-white/30 backdrop-blur-sm text-white rounded-lg hover:bg-white/40 transition-colors"
              >
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-sm text-white flex items-center gap-1"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-600 dark:hover:text-red-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-white drop-shadow-md mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`w-12 h-12 rounded-lg border-2 transition-all ${
                    formData.color === color.value
                      ? 'border-white scale-110 shadow-lg'
                      : 'border-white/30 hover:scale-105'
                  }`}
                  style={{ background: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-white/30 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.content.trim()}
              className="flex-1 px-4 py-3 bg-white/30 backdrop-blur-sm text-white rounded-lg hover:bg-white/40 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {isSubmitting ? 'Saving...' : note ? 'Update Note' : 'Create Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
