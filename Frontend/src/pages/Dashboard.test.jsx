import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Dashboard from './Dashboard';
import api from '../api/axios';
import { BrowserRouter } from 'react-router-dom';

vi.mock('../api/axios');

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard />
      </BrowserRouter>
    );
  };

  test('displays loading spinner initially', () => {
    // Return a promise that doesn't resolve to keep it in loading state
    api.get.mockImplementationOnce(() => new Promise(() => {}));
    
    renderDashboard();
    // Assuming the spinner has an SVG or specific class. We check for the Dashboard Overview text which is hidden during loading in this specific component setup?
    // Wait, in Dashboard.jsx, if (loading) it returns ONLY the spinner. So 'Dashboard Overview' is not present.
    expect(screen.queryByText(/Dashboard Overview/i)).not.toBeInTheDocument();
  });

  test('displays error message on api failure', async () => {
    api.get.mockRejectedValueOnce(new Error('Network Error'));
    
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
    });
  });

  test('renders dashboard metrics successfully', async () => {
    const mockData = {
      today_income: 150.50,
      today_orders_count: 12,
      total_customers: 20,
      net_profit: 100.00,
      best_selling_menu: {
        menu_name: 'Iced Latte',
        total_quantity_sold: 5
      }
    };

    api.get.mockResolvedValueOnce({ data: mockData });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/Dashboard Overview/i)).toBeInTheDocument();
      // Check values
      expect(screen.getByText(/\$150.50/i)).toBeInTheDocument();
      expect(screen.getByText('12')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText(/\$100.00/i)).toBeInTheDocument();
      
      // Check best seller table
      expect(screen.getByText('Iced Latte')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  test('renders empty state when no best seller exists', async () => {
    const mockData = {
      today_income: 0,
      today_orders_count: 0,
      total_customers: 0,
      net_profit: 0,
      best_selling_menu: null
    };

    api.get.mockResolvedValueOnce({ data: mockData });

    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText(/No sales data for today yet/i)).toBeInTheDocument();
    });
  });
});
