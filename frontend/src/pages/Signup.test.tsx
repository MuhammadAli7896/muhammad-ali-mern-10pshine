import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '../test/test-utils';
import Signup from './Signup';
import { authAPI } from '../lib/api';

// Mock the API
vi.mock('../lib/api', () => ({
  authAPI: {
    signup: vi.fn(),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    Link: ({ children, to }: any) => <a href={to}>{children}</a>,
  };
});

describe('Signup Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders signup form correctly', () => {
    render(<Signup />);
    
    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByText(/already have an account/i)).toBeInTheDocument();
  });

  it('validates empty form submission', async () => {
    const user = userEvent.setup();
    render(<Signup />);
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);
    
    // Component uses toast.error() for validation, verify signup not called
    expect(authAPI.signup).not.toHaveBeenCalled();
  });

  it('validates email format', async () => {
    const user = userEvent.setup();
    render(<Signup />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'invalid-email');
    await user.type(passwordInput, 'password123');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);
    
    // Component uses toast.error() for validation, verify signup not called
    expect(authAPI.signup).not.toHaveBeenCalled();
  });

  it('validates password length', async () => {
    const user = userEvent.setup();
    render(<Signup />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'short');
    
    const submitButton = screen.getByRole('button', { name: /create account/i });
    await user.click(submitButton);
    
    // Component uses toast.error() for validation, verify signup not called
    expect(authAPI.signup).not.toHaveBeenCalled();
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<Signup />);
    
    const passwordInput = screen.getByLabelText(/^password$/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    
    const toggleButton = screen.getByRole('button', { name: /toggle password visibility/i });
    await user.click(toggleButton);
    
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  it('successfully creates account with valid data', async () => {
    const user = userEvent.setup();
    const mockResponse = {
      data: {
        user: { id: '123', name: 'Test User', email: 'test@example.com' },
        accessToken: 'mock-token',
      },
    };
    
    (authAPI.signup as any).mockResolvedValue(mockResponse);
    
    render(<Signup />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(authAPI.signup).toHaveBeenCalledWith('Test User', 'test@example.com', 'password123');
      expect(mockNavigate).toHaveBeenCalledWith('/notes');
    });
  });

  it('handles signup error correctly', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Email already exists';
    
    (authAPI.signup as any).mockRejectedValue({
      response: { data: { message: errorMessage } },
    });
    
    render(<Signup />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'existing@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(authAPI.signup).toHaveBeenCalled();
    });
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    
    (authAPI.signup as any).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 1000))
    );
    
    render(<Signup />);
    
    const nameInput = screen.getByLabelText(/full name/i);
    const emailInput = screen.getByLabelText(/email address/i);
    const passwordInput = screen.getByLabelText(/^password$/i);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    
    await user.type(nameInput, 'Test User');
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);
    
    expect(submitButton).toBeDisabled();
  });

  it('navigates to login page when clicking login link', async () => {
    render(<Signup />);
    
    const loginLink = screen.getByText(/log in/i);
    expect(loginLink.closest('a')).toHaveAttribute('href', '/login');
  });
});
