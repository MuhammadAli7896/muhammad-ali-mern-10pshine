import type { Note } from '../lib/notesApi';
import { Pin, Archive, Trash2, Edit, ArchiveRestore } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
}

export default function NoteCard({
  note,
  onEdit,
  onDelete,
  onTogglePin,
  onToggleArchive,
}: NoteCardProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className="group relative rounded-lg p-4 shadow-md hover:shadow-xl transition-all duration-200 border border-white/20 break-inside-avoid mb-4"
      style={{ background: note.color || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
      {/* Pin indicator */}
      {note.isPinned && (
        <div className="absolute top-2 right-2">
          <Pin className="w-4 h-4 text-white fill-white drop-shadow-md" />
        </div>
      )}

      {/* Content */}
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-white mb-2 pr-6 drop-shadow-md">
          {note.title}
        </h3>
        <p className="text-white/90 text-sm whitespace-pre-wrap line-clamp-6">
          {note.content}
        </p>
      </div>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {note.tags.map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs font-medium bg-white/20 backdrop-blur-sm rounded-full text-white"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/20">
        <span className="text-xs text-white/80">
          {formatDate(note.updatedAt)}
        </span>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(note)}
            className="p-1.5 hover:bg-white/20 backdrop-blur-sm rounded transition-colors"
            title="Edit note"
          >
            <Edit className="w-4 h-4 text-white" />
          </button>
          <button
            onClick={() => onTogglePin(note._id)}
            className="p-1.5 hover:bg-white/20 backdrop-blur-sm rounded transition-colors"
            title={note.isPinned ? 'Unpin note' : 'Pin note'}
          >
            <Pin
              className={`w-4 h-4 text-white ${
                note.isPinned ? 'fill-white' : ''
              }`}
            />
          </button>
          <button
            onClick={() => onToggleArchive(note._id)}
            className="p-1.5 hover:bg-white/20 backdrop-blur-sm rounded transition-colors"
            title={note.isArchived ? 'Restore note' : 'Archive note'}
          >
            {note.isArchived ? (
              <ArchiveRestore className="w-4 h-4 text-white" />
            ) : (
              <Archive className="w-4 h-4 text-white" />
            )}
          </button>
          <button
            onClick={() => onDelete(note._id)}
            className="p-1.5 hover:bg-red-500/30 backdrop-blur-sm rounded transition-colors"
            title="Delete note"
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>

      {/* Archived badge */}
      {note.isArchived && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-sm text-white text-xs rounded">
          Archived
        </div>
      )}
    </div>
  );
}
