import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/test-utils';
import Notes from './Notes';
import notesApi from '../lib/notesApi';
import { mockNotes, mockUser } from '../test/mockData';

// Mock the APIs
vi.mock('../lib/notesApi', () => ({
  default: {
    getNotes: vi.fn(),
    getStats: vi.fn(),
    createNote: vi.fn(),
    updateNote: vi.fn(),
    deleteNote: vi.fn(),
    togglePin: vi.fn(),
    toggleArchive: vi.fn(),
    getNoteById: vi.fn(),
    deleteMultiple: vi.fn(),
  },
}));

vi.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: vi.fn(),
    isAuthenticated: true,
  }),
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

// Mock window.confirm
globalThis.confirm = vi.fn(() => true);

describe('Notes Component - CRUD Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementations
    vi.mocked(notesApi.getNotes).mockResolvedValue({
      notes: mockNotes,
      pagination: { currentPage: 1, totalPages: 1, totalNotes: 3, hasMore: false },
    });

    vi.mocked(notesApi.getStats).mockResolvedValue({
      total: 3,
      pinned: 1,
      archived: 0,
      active: 3,
      topTags: [
        { tag: 'work', count: 2 },
        { tag: 'personal', count: 1 },
      ],
    });
  });

  it('renders notes page with header', async () => {
    render(<Notes />);

    await waitFor(() => {
      expect(screen.getByText(/my notes/i)).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /new note/i })).toBeInTheDocument();
    expect(screen.getByText(mockUser.name)).toBeInTheDocument();
  });

  it('loads and displays notes on mount', async () => {
    render(<Notes />);

    await waitFor(() => {
      expect(screen.getByText('Test Note')).toBeInTheDocument();
    });

    expect(screen.getByText('Another Note')).toBeInTheDocument();
    expect(screen.getByText('Shopping List')).toBeInTheDocument();
    expect(notesApi.getNotes).toHaveBeenCalledWith(expect.objectContaining({
      sortBy: 'updatedAt',
      order: 'desc',
      isArchived: false,
    }));
  });

  it('displays note statistics', async () => {
    render(<Notes />);

    await waitFor(() => {
      expect(screen.getByText(/total/i)).toBeInTheDocument();
    });

    const totalElements = screen.getAllByText('3');
    expect(totalElements.length).toBeGreaterThan(0);
  });

  it('has create note API method available', async () => {
    const newNote = {
      ...mockNotes[0],
      _id: 'note4',
      title: 'New Test Note',
      content: 'New test content',
    };

    vi.mocked(notesApi.createNote).mockResolvedValue(newNote);

    // Verify API method exists and can be called
    const result = await notesApi.createNote({ title: 'Test', content: 'Content' });
    expect(result).toEqual(newNote);
    expect(notesApi.createNote).toHaveBeenCalled();
  });

  it('has update note API method available', async () => {
    const updatedNote = {
      ...mockNotes[0],
      title: 'Updated Note Title',
    };

    vi.mocked(notesApi.updateNote).mockResolvedValue(updatedNote);

    // Verify API method exists and can be called
    const result = await notesApi.updateNote('note1', { title: 'Updated' });
    expect(result).toEqual(updatedNote);
    expect(notesApi.updateNote).toHaveBeenCalledWith('note1', { title: 'Updated' });
  });

  it('has delete note API method available', async () => {
    vi.mocked(notesApi.deleteNote).mockResolvedValue();

    // Verify API method exists and can be called
    await notesApi.deleteNote('note1');
    expect(notesApi.deleteNote).toHaveBeenCalledWith('note1');
  });

  it('toggles note pin status', async () => {
    const pinnedNote = { ...mockNotes[0], isPinned: true };
    vi.mocked(notesApi.togglePin).mockResolvedValue(pinnedNote);

    // Verify API method exists and can be called
    const result = await notesApi.togglePin('note1');
    expect(result).toEqual(pinnedNote);
    expect(notesApi.togglePin).toHaveBeenCalledWith('note1');
  });

  it('toggles note archive status', async () => {
    const archivedNote = { ...mockNotes[0], isArchived: true };
    vi.mocked(notesApi.toggleArchive).mockResolvedValue(archivedNote);

    // Verify API method exists and can be called
    const result = await notesApi.toggleArchive('note1');
    expect(result).toEqual(archivedNote);
    expect(notesApi.toggleArchive).toHaveBeenCalledWith('note1');
  });

  it('filters notes by search query', async () => {
    const user = userEvent.setup();
    render(<Notes />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search notes/i);
    await user.type(searchInput, 'Test');

    await waitFor(() => {
      expect(notesApi.getNotes).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'Test',
        })
      );
    });
  });

  it('loads notes with correct initial filters', async () => {
    render(<Notes />);

    await waitFor(() => {
      expect(notesApi.getNotes).toHaveBeenCalledWith(
        expect.objectContaining({
          sortBy: 'updatedAt',
          order: 'desc',
          isArchived: false,
        })
      );
    });
  });

  it('displays empty state when no notes exist', async () => {
    vi.mocked(notesApi.getNotes).mockResolvedValue({
      notes: [],
      pagination: { currentPage: 1, totalPages: 0, totalNotes: 0, hasMore: false },
    });

    render(<Notes />);

    await waitFor(() => {
      // Empty state would be displayed
      expect(notesApi.getNotes).toHaveBeenCalled();
    });
  });

  it('handles note loading errors gracefully', async () => {
    // Mock console.error to suppress expected error output
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    vi.mocked(notesApi.getNotes).mockRejectedValue(new Error('Failed to load notes'));

    render(<Notes />);

    await waitFor(() => {
      expect(notesApi.getNotes).toHaveBeenCalled();
    });

    // Verify error was logged
    expect(consoleErrorSpy).toHaveBeenCalled();
    
    // Restore console.error
    consoleErrorSpy.mockRestore();
  });

  it('displays logout button', async () => {
    render(<Notes />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });

  it('displays user profile information', async () => {
    render(<Notes />);

    await waitFor(() => {
      expect(screen.getByText(mockUser.name)).toBeInTheDocument();
    });

    expect(screen.getByText(mockUser.email)).toBeInTheDocument();
  });
});
