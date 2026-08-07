import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import Login from './Login';
import api from '../api/axios';

// Mock the axios api module
vi.mock('../api/axios');

// Mock the react-router-dom useNavigate hook
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLogin = () => {
    return render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );
  };

  test('renders login form correctly', () => {
    renderLogin();

    // Check if title is present
    expect(screen.getByText(/Coffee Shop System/i)).toBeInTheDocument();
    
    // Check if inputs are present
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    
    // Check if submit button is present
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  test('handles typing in input fields', () => {
    renderLogin();

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(usernameInput.value).toBe('testuser');
    expect(passwordInput.value).toBe('password123');
  });

  test('submits form successfully and redirects', async () => {
    // Setup mock response for successful login
    api.post.mockResolvedValueOnce({
      data: { access_token: 'fake-jwt-token' }
    });

    renderLogin();

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'admin' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'secret' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    // Verify loading state
    expect(screen.getByRole('button')).toBeDisabled();

    // Wait for the async actions to complete
    await waitFor(() => {
      // Verify API was called with correct data
      expect(api.post).toHaveBeenCalledTimes(1);
      expect(api.post).toHaveBeenCalledWith(
        '/auth/login',
        expect.any(URLSearchParams),
        expect.objectContaining({
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        })
      );
      
      // Verify token was saved
      expect(localStorage.getItem('access_token')).toBe('fake-jwt-token');
      
      // Verify redirect occurred
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });
  });

  test('displays error message on failed login', async () => {
    // Setup mock response for failed login
    api.post.mockRejectedValueOnce({
      response: {
        data: { detail: 'Incorrect username or password' }
      }
    });

    renderLogin();

    // Fill and submit
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'wronguser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    // Wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Incorrect username or password')).toBeInTheDocument();
    });
    
    // Verify token was not saved
    expect(localStorage.getItem('access_token')).toBeNull();
    // Verify no redirect
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
