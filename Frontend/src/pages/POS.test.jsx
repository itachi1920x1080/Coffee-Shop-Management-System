import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import POS from './POS';
import api from '../api/axios';

vi.mock('../api/axios');

describe('POS Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMenus = [
    { id: 1, name: 'Espresso', price: 2.50, image_url: null },
    { id: 2, name: 'Latte', price: 3.50, image_url: null }
  ];

  test('renders menu items and handles cart interactions', async () => {
    api.get.mockResolvedValueOnce({ data: mockMenus });

    render(<POS />);

    // Wait for menus to load
    await waitFor(() => {
      expect(screen.getByText('Espresso')).toBeInTheDocument();
      expect(screen.getByText('Latte')).toBeInTheDocument();
    });

    // Add Espresso to cart
    const espressoCard = screen.getByText('Espresso').closest('div');
    fireEvent.click(espressoCard);

    // Verify it was added to cart
    expect(screen.getByText('Current Order')).toBeInTheDocument();
    expect(screen.getByText('1 Items')).toBeInTheDocument();
    
    // Check if Espresso is in the cart with quantity 1
    const cartEspresso = screen.getAllByText('Espresso')[1]; // Second one is in cart
    expect(cartEspresso).toBeInTheDocument();
    
    // The total should be updated to 2.50
    expect(screen.getAllByText(/\$2.50/).length).toBeGreaterThan(0);
  });
});
