import apiClient from './apiClient';

export interface Note {
  _id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  color?: string;
  user: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetNotesParams {
  search?: string;
  tags?: string;
  isPinned?: boolean;
  isArchived?: boolean;
  sortBy?: 'createdAt' | 'updatedAt' | 'title';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface NotesResponse {
  notes: Note[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalNotes: number;
    hasMore: boolean;
  };
}

export interface NotesStats {
  total: number;
  pinned: number;
  archived: number;
  active: number;
  topTags: Array<{ tag: string; count: number }>;
}

export interface CreateNoteData {
  title: string;
  content: string;
  tags?: string[];
  color?: string;
  isPinned?: boolean;
}

export interface UpdateNoteData {
  title?: string;
  content?: string;
  tags?: string[];
  color?: string;
  isPinned?: boolean;
  isArchived?: boolean;
}

const notesApi = {
  // Get all notes with filters
  getNotes: async (params?: GetNotesParams): Promise<NotesResponse> => {
    const response = await apiClient.get('/notes', { params });
    return response.data.data;
  },

  // Get single note by ID
  getNoteById: async (id: string): Promise<Note> => {
    const response = await apiClient.get(`/notes/${id}`);
    return response.data.data.note;
  },

  // Create new note
  createNote: async (data: CreateNoteData): Promise<Note> => {
    const response = await apiClient.post('/notes', data);
    return response.data.data.note;
  },

  // Update note
  updateNote: async (id: string, data: UpdateNoteData): Promise<Note> => {
    const response = await apiClient.put(`/notes/${id}`, data);
    return response.data.data.note;
  },

  // Delete note
  deleteNote: async (id: string): Promise<void> => {
    await apiClient.delete(`/notes/${id}`);
  },

  // Toggle pin status
  togglePin: async (id: string): Promise<Note> => {
    const response = await apiClient.patch(`/notes/${id}/pin`);
    return response.data.data.note;
  },

  // Toggle archive status
  toggleArchive: async (id: string): Promise<Note> => {
    const response = await apiClient.patch(`/notes/${id}/archive`);
    return response.data.data.note;
  },

  // Get notes statistics
  getStats: async (): Promise<NotesStats> => {
    const response = await apiClient.get('/notes/stats');
    return response.data.data.stats;
  },

  // Delete multiple notes
  deleteMultiple: async (noteIds: string[]): Promise<void> => {
    await apiClient.delete('/notes', { data: { noteIds } });
  },
};

export default notesApi;
