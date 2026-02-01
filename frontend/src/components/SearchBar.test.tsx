import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/test-utils';
import SearchBar from './SearchBar';

describe('SearchBar Component', () => {
  const defaultProps = {
    searchQuery: '',
    onSearchChange: vi.fn(),
    selectedTags: [],
    onTagsChange: vi.fn(),
    availableTags: ['work', 'personal'],
    viewFilter: 'all' as const,
    onViewFilterChange: vi.fn(),
  };

  it('renders search input', () => {
    render(<SearchBar {...defaultProps} />);

    expect(screen.getByPlaceholderText(/search notes/i)).toBeInTheDocument();
  });

  it('calls onSearchChange when typing', async () => {
    const user = userEvent.setup();
    const mockOnSearchChange = vi.fn();
    render(<SearchBar {...defaultProps} onSearchChange={mockOnSearchChange} />);

    const searchInput = screen.getByPlaceholderText(/search notes/i);
    await user.type(searchInput, 'test query');

    await waitFor(() => {
      expect(mockOnSearchChange).toHaveBeenCalled();
    });
  });
});
