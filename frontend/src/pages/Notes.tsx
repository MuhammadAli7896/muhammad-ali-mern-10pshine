import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { Plus, Loader2, TrendingUp } from 'lucide-react';
import notesApi from '../lib/notesApi';
import type { Note, NotesStats } from '../lib/notesApi';
import NoteCard from '../components/NoteCard';
import AddEditNoteModal from '../components/AddEditNoteModal';
import type { NoteFormData } from '../components/AddEditNoteModal';
import SearchBar from '../components/SearchBar';

export default function Notes() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [stats, setStats] = useState<NotesStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [viewFilter, setViewFilter] = useState<'all' | 'pinned' | 'archived'>('all');

  // Load notes and stats
  useEffect(() => {
    loadNotes();
    loadStats();
  }, [searchQuery, selectedTags, viewFilter]);

  const loadNotes = async () => {
    try {
      setIsLoading(true);
      const params: any = {
        sortBy: 'updatedAt',
        order: 'desc',
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      if (selectedTags.length > 0) {
        params.tags = selectedTags.join(',');
      }

      if (viewFilter === 'pinned') {
        params.isPinned = true;
        params.isArchived = false;
      } else if (viewFilter === 'archived') {
        params.isArchived = true;
      } else {
        params.isArchived = false;
      }

      const response = await notesApi.getNotes(params);
      setNotes(response.notes);
    } catch (error) {
      console.error('Error loading notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await notesApi.getStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleCreateNote = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleSaveNote = async (data: NoteFormData) => {
    try {
      if (editingNote) {
        await notesApi.updateNote(editingNote._id, data);
        toast.success('Note updated successfully');
      } else {
        await notesApi.createNote(data);
        toast.success('Note created successfully');
      }
      loadNotes();
      loadStats();
      setIsModalOpen(false);
      setEditingNote(null);
    } catch (error: any) {
      console.error('Error saving note:', error);
      toast.error(error.response?.data?.message || 'Failed to save note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      // Optimistic update - remove from UI immediately
      setNotes(prevNotes => prevNotes.filter(note => note._id !== id));
      
      await notesApi.deleteNote(id);
      toast.success('Note deleted successfully');
      loadStats(); // Only reload stats
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error(error.response?.data?.message || 'Failed to delete note');
      // Reload on error to restore correct state
      loadNotes();
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      // Optimistic update - toggle pin in UI immediately
      setNotes(prevNotes => prevNotes.map(note => 
        note._id === id ? { ...note, isPinned: !note.isPinned } : note
      ));
      
      await notesApi.togglePin(id);
      loadStats(); // Only reload stats
    } catch (error: any) {
      console.error('Error toggling pin:', error);
      toast.error(error.response?.data?.message || 'Failed to pin note');
      // Reload on error to restore correct state
      loadNotes();
    }
  };

  const handleToggleArchive = async (id: string) => {
    try {
      // Find the note to determine the action
      const note = notes.find(n => n._id === id);
      const action = note?.isArchived ? 'restored' : 'archived';
      
      // Optimistic update - remove from current view since it changes visibility
      setNotes(prevNotes => prevNotes.filter(n => n._id !== id));
      
      await notesApi.toggleArchive(id);
      toast.success(`Note ${action} successfully`);
      loadStats(); // Reload stats
      
      // If we're viewing all notes, we need to reload to show the change
      if (viewFilter === 'all') {
        loadNotes();
      }
    } catch (error: any) {
      console.error('Error toggling archive:', error);
      toast.error(error.response?.data?.message || 'Failed to archive note');
      // Reload on error to restore correct state
      loadNotes();
    }
  };

  // Get all unique tags from stats
  const availableTags = stats?.topTags?.map((tag) => tag.tag) || [];

  // Separate pinned and unpinned notes
  const pinnedNotes = notes.filter((note) => note.isPinned);
  const unpinnedNotes = notes.filter((note) => !note.isPinned);

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xl font-bold">
                N
              </div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">My Notes</h1>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handleCreateNote}
              className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:shadow-lg hover:scale-105 transition-all font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">New Note</span>
            </button>
            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {user?.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <button
              onClick={() => setViewFilter('all')}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border transition-all text-left ${
                viewFilter === 'all' 
                  ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-indigo-600" />
              </div>
            </button>
            <button
              onClick={() => setViewFilter('all')}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border transition-all text-left ${
                viewFilter === 'all' 
                  ? 'border-green-500 ring-2 ring-green-200 dark:ring-green-800' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-green-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
                </div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </button>
            <button
              onClick={() => setViewFilter('pinned')}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border transition-all text-left ${
                viewFilter === 'pinned' 
                  ? 'border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-800' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Pinned</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pinned}</p>
                </div>
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
              </div>
            </button>
            <button
              onClick={() => setViewFilter('archived')}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border transition-all text-left ${
                viewFilter === 'archived' 
                  ? 'border-gray-500 ring-2 ring-gray-200 dark:ring-gray-700' 
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Archived</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.archived}</p>
                </div>
                <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              </div>
            </button>
          </div>
        )}

        {/* Search and Filter */}
        <div className="mb-6">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedTags={selectedTags}
            onTagsChange={setSelectedTags}
            availableTags={availableTags}
            viewFilter={viewFilter}
            onViewFilterChange={setViewFilter}
          />
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          </div>
        ) : notes.length === 0 ? (
          /* Empty State */
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 min-h-96 flex flex-col items-center justify-center">
            <div className="text-center space-y-6 max-w-md">
              <div className="text-6xl mb-4">📝</div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                {searchQuery || selectedTags.length > 0 || viewFilter !== 'all'
                  ? 'No Notes Found'
                  : 'Create Your First Note'}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {searchQuery || selectedTags.length > 0 || viewFilter !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'Start capturing your thoughts, ideas, and reminders'}
              </p>
              <div className="pt-4">
                <button
                  onClick={handleCreateNote}
                  className="px-8 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-5 h-5" />
                  Create Your First Note
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Notes Grid */
          <div className="space-y-6">
            {/* Pinned Notes */}
            {pinnedNotes.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-indigo-600 rounded-full"></span>
                  Pinned Notes
                </h2>
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {pinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      onToggleArchive={handleToggleArchive}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Other Notes */}
            {unpinnedNotes.length > 0 && (
              <div>
                {pinnedNotes.length > 0 && (
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    Other Notes
                  </h2>
                )}
                <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-4">
                  {unpinnedNotes.map((note) => (
                    <NoteCard
                      key={note._id}
                      note={note}
                      onEdit={handleEditNote}
                      onDelete={handleDeleteNote}
                      onTogglePin={handleTogglePin}
                      onToggleArchive={handleToggleArchive}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add/Edit Modal */}
      <AddEditNoteModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingNote(null);
        }}
        onSave={handleSaveNote}
        note={editingNote}
      />
    </div>
  );
}
