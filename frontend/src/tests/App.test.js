import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import { ThemeProvider } from '../contexts/ThemeContext';
import { AccessibilityProvider } from '../contexts/AccessibilityContext';
import { AIProvider } from '../contexts/AIContext';
import App from '../App';

// Mock providers wrapper
const AllProviders = ({ children }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AccessibilityProvider>
        <AIProvider>
          {children}
        </AIProvider>
      </AccessibilityProvider>
    </ThemeProvider>
  </BrowserRouter>
);

// Mock API calls
jest.mock('../services/api', () => ({
  fetchRegions: jest.fn(() => Promise.resolve({
    data: [
      { id: 1, name: 'North India', description: 'Northern region of India' },
      { id: 2, name: 'South India', description: 'Southern region of India' }
    ]
  })),
  fetchStates: jest.fn(() => Promise.resolve({
    data: [
      { id: 1, name: 'Delhi', region: 'North India' },
      { id: 2, name: 'Kerala', region: 'South India' }
    ]
  })),
  fetchItineraries: jest.fn(() => Promise.resolve({
    data: [
      { id: 1, title: 'Golden Triangle', duration: '7 days', price: 25000 },
      { id: 2, title: 'Kerala Backwaters', duration: '5 days', price: 18000 }
    ]
  }))
}));

describe('Yatra360 Application', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Application Initialization', () => {
    test('renders main navigation', async () => {
      render(<App />, { wrapper: AllProviders });
      
      expect(screen.getByText('Yatra360')).toBeInTheDocument();
      expect(screen.getByText('Explore')).toBeInTheDocument();
      expect(screen.getByText('Plan')).toBeInTheDocument();
      expect(screen.getByText('Connect')).toBeInTheDocument();
    });

    test('loads with default theme', () => {
      render(<App />, { wrapper: AllProviders });
      
      const root = document.documentElement;
      expect(root.getAttribute('data-theme')).toBe('light');
    });

    test('initializes accessibility settings', () => {
      render(<App />, { wrapper: AllProviders });
      
      // Check for accessibility features
      expect(document.querySelector('.accessibility-controls')).toBeInTheDocument();
    });
  });

  describe('Theme System', () => {
    test('toggles between light and dark themes', async () => {
      render(<App />, { wrapper: AllProviders });
      
      const themeToggle = screen.getByLabelText(/toggle theme/i);
      fireEvent.click(themeToggle);
      
      await waitFor(() => {
        expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
      });
    });

    test('persists theme preference', () => {
      localStorage.setItem('theme', 'dark');
      render(<App />, { wrapper: AllProviders });
      
      expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    });
  });

  describe('Accessibility Features', () => {
    test('supports keyboard navigation', () => {
      render(<App />, { wrapper: AllProviders });
      
      const firstNavLink = screen.getByText('Explore');
      firstNavLink.focus();
      
      expect(document.activeElement).toBe(firstNavLink);
    });

    test('provides proper ARIA labels', () => {
      render(<App />, { wrapper: AllProviders });
      
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    test('supports high contrast mode', () => {
      render(<App />, { wrapper: AllProviders });
      
      const highContrastToggle = screen.getByLabelText(/high contrast/i);
      fireEvent.click(highContrastToggle);
      
      expect(document.body).toHaveClass('high-contrast');
    });
  });

  describe('AI Chatbot Integration', () => {
    test('initializes chatbot', () => {
      render(<App />, { wrapper: AllProviders });
      
      expect(screen.getByLabelText(/ai assistant/i)).toBeInTheDocument();
    });

    test('opens chat interface', () => {
      render(<App />, { wrapper: AllProviders });
      
      const chatToggle = screen.getByLabelText(/ai assistant/i);
      fireEvent.click(chatToggle);
      
      expect(screen.getByText(/how can i help you/i)).toBeInTheDocument();
    });
  });

  describe('PWA Features', () => {
    test('registers service worker', () => {
      // Mock service worker registration
      Object.defineProperty(navigator, 'serviceWorker', {
        value: {
          register: jest.fn(() => Promise.resolve({}))
        },
        writable: true
      });

      render(<App />, { wrapper: AllProviders });
      
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
    });

    test('shows install prompt for PWA', () => {
      // Mock beforeinstallprompt event
      const mockPromptEvent = {
        preventDefault: jest.fn(),
        prompt: jest.fn(() => Promise.resolve({ outcome: 'accepted' }))
      };

      render(<App />, { wrapper: AllProviders });
      
      window.dispatchEvent(new CustomEvent('beforeinstallprompt', { detail: mockPromptEvent }));
      
      expect(screen.getByText(/install app/i)).toBeInTheDocument();
    });
  });

  describe('Performance Monitoring', () => {
    test('tracks page load performance', () => {
      // Mock performance API
      Object.defineProperty(window, 'performance', {
        value: {
          mark: jest.fn(),
          measure: jest.fn(),
          getEntriesByType: jest.fn(() => [
            { duration: 1500, name: 'navigation' }
          ])
        }
      });

      render(<App />, { wrapper: AllProviders });
      
      expect(window.performance.mark).toHaveBeenCalledWith('app-start');
    });
  });

  describe('Cultural Heritage Features', () => {
    test('loads cultural data for regions', async () => {
      render(<App />, { wrapper: AllProviders });
      
      // Navigate to explore page
      fireEvent.click(screen.getByText('Explore'));
      
      await waitFor(() => {
        expect(screen.getByText(/cultural heritage/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('displays error boundary for component errors', () => {
      const ThrowError = () => {
        throw new Error('Test error');
      };

      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      render(
        <AllProviders>
          <ThrowError />
        </AllProviders>
      );
      
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      
      spy.mockRestore();
    });

    test('handles API errors gracefully', async () => {
      const mockApi = require('../services/api');
      mockApi.fetchRegions.mockRejectedValueOnce(new Error('API Error'));

      render(<App />, { wrapper: AllProviders });
      
      fireEvent.click(screen.getByText('Explore'));
      
      await waitFor(() => {
        expect(screen.getByText(/unable to load data/i)).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('adapts to mobile viewport', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      render(<App />, { wrapper: AllProviders });
      
      // Check for mobile navigation
      expect(screen.getByLabelText(/menu toggle/i)).toBeInTheDocument();
    });

    test('shows desktop navigation on larger screens', () => {
      // Mock desktop viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1200,
      });

      render(<App />, { wrapper: AllProviders });
      
      // Check for desktop navigation
      expect(screen.getByRole('navigation')).toHaveClass('desktop-nav');
    });
  });

  describe('User Authentication', () => {
    test('shows login form when not authenticated', () => {
      render(<App />, { wrapper: AllProviders });
      
      fireEvent.click(screen.getByText('Login'));
      
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    });

    test('redirects to dashboard after successful login', async () => {
      render(<App />, { wrapper: AllProviders });
      
      fireEvent.click(screen.getByText('Login'));
      
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /login/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality', () => {
    test('performs search when query is entered', async () => {
      render(<App />, { wrapper: AllProviders });
      
      const searchInput = screen.getByPlaceholderText(/search destinations/i);
      fireEvent.change(searchInput, { target: { value: 'Kerala' } });
      fireEvent.submit(searchInput.closest('form'));
      
      await waitFor(() => {
        expect(screen.getByText(/search results for "kerala"/i)).toBeInTheDocument();
      });
    });
  });
});

// Integration tests for specific components
describe('Component Integration', () => {
  test('Budget Planner calculates correctly', async () => {
    render(<App />, { wrapper: AllProviders });
    
    fireEvent.click(screen.getByText('Plan'));
    fireEvent.click(screen.getByText('Budget Planner'));
    
    const accommodationInput = screen.getByLabelText(/accommodation/i);
    const transportInput = screen.getByLabelText(/transport/i);
    
    fireEvent.change(accommodationInput, { target: { value: '5000' } });
    fireEvent.change(transportInput, { target: { value: '3000' } });
    
    await waitFor(() => {
      expect(screen.getByText(/total: ₹8,000/i)).toBeInTheDocument();
    });
  });

  test('Itinerary Builder creates new itinerary', async () => {
    render(<App />, { wrapper: AllProviders });
    
    fireEvent.click(screen.getByText('Plan'));
    fireEvent.click(screen.getByText('Create Itinerary'));
    
    const titleInput = screen.getByLabelText(/itinerary title/i);
    fireEvent.change(titleInput, { target: { value: 'My Trip to Goa' } });
    
    const saveButton = screen.getByRole('button', { name: /save itinerary/i });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/itinerary saved successfully/i)).toBeInTheDocument();
    });
  });
});

// Performance tests
describe('Performance Tests', () => {
  test('loads initial page within performance budget', async () => {
    const startTime = performance.now();
    
    render(<App />, { wrapper: AllProviders });
    
    await waitFor(() => {
      expect(screen.getByText('Yatra360')).toBeInTheDocument();
    });
    
    const endTime = performance.now();
    const loadTime = endTime - startTime;
    
    // Should load within 2 seconds
    expect(loadTime).toBeLessThan(2000);
  });

  test('lazy loads components efficiently', async () => {
    render(<App />, { wrapper: AllProviders });
    
    // Initial load should not include admin components
    expect(screen.queryByText(/admin dashboard/i)).not.toBeInTheDocument();
    
    // Only loads when navigated to
    fireEvent.click(screen.getByText('Admin'));
    
    await waitFor(() => {
      expect(screen.getByText(/admin dashboard/i)).toBeInTheDocument();
    });
  });
});
