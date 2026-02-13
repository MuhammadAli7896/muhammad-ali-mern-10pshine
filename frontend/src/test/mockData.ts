export const mockUser = {
  id: '123',
  name: 'Test User',
  email: 'test@example.com',
  createdAt: new Date('2024-01-01').toISOString(),
};

export const mockNote = {
  _id: 'note1',
  title: 'Test Note',
  content: 'This is a test note content',
  tags: ['work', 'important'],
  isPinned: false,
  isArchived: false,
  user: '123',
  createdAt: new Date('2024-01-01').toISOString(),
  updatedAt: new Date('2024-01-01').toISOString(),
};

export const mockNotes = [
  mockNote,
  {
    _id: 'note2',
    title: 'Another Note',
    content: 'Another note content',
    tags: ['personal'],
    isPinned: true,
    isArchived: false,
    user: '123',
    createdAt: new Date('2024-01-02').toISOString(),
    updatedAt: new Date('2024-01-02').toISOString(),
  },
  {
    _id: 'note3',
    title: 'Shopping List',
    content: 'Buy groceries',
    tags: ['shopping', 'todo'],
    isPinned: false,
    isArchived: false,
    user: '123',
    createdAt: new Date('2024-01-03').toISOString(),
    updatedAt: new Date('2024-01-03').toISOString(),
  },
];

export const mockAuthResponse = {
  success: true,
  message: 'Login successful',
  data: {
    user: mockUser,
    accessToken: 'mock-access-token',
  },
};

export const mockRefreshResponse = {
  success: true,
  message: 'Token refreshed successfully',
  data: {
    accessToken: 'new-mock-access-token',
  },
};

export const mockNotesResponse = {
  success: true,
  message: 'Notes retrieved successfully',
  data: {
    notes: mockNotes,
  },
};
