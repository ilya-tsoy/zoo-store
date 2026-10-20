import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios', () => ({ get: jest.fn() }));

beforeEach(() => {
  jest.clearAllMocks();
  window.history.replaceState({}, '', '/lizards');
});

test('renders a complete lizard catalog without requiring the products API', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A little more wild.');
  expect(screen.getAllByRole('button', { name: /^Add .* to cart$/ })).toHaveLength(6);
  expect(screen.getByRole('link', { name: 'Lizard supplies' })).toHaveAttribute('aria-current', 'page');
  expect(axios.get).not.toHaveBeenCalled();
});

test('combines search and category filters and recovers from an empty result', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('checkbox', { name: 'Habitat decor' }));
  expect(screen.getAllByRole('button', { name: /^Add .* to cart$/ })).toHaveLength(2);
  fireEvent.change(screen.getByRole('textbox', { name: 'Search products' }), { target: { value: 'cork' } });
  expect(screen.getByText('1 product')).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Cork Climbing Branch' })).toBeInTheDocument();
  fireEvent.change(screen.getByRole('textbox', { name: 'Search products' }), { target: { value: 'lamp' } });
  expect(screen.getByText(/No supplies match/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
  expect(screen.getByText('6 products')).toBeInTheDocument();
});

test('updates lizard cart quantities and totals even after filtering the catalog', () => {
  render(<App />);
  fireEvent.click(screen.getByRole('button', { name: 'Add Sandstone Hideaway to cart' }));
  expect(screen.getByText('Total: $24.50')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close cart' }));
  fireEvent.click(screen.getByRole('button', { name: 'Add one Sandstone Hideaway' }));
  expect(screen.getByText('Total: $49.00')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close cart' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search products' }), { target: { value: 'cork' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add Cork Climbing Branch to cart' }));
  expect(screen.getByText('Total: $67.00')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Close cart' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove one Cork Climbing Branch' }));
  expect(screen.getByText('Total: $49.00')).toBeInTheDocument();
});

test('accepts a trailing slash on the lizard page', () => {
  window.history.replaceState({}, '', '/lizards/');
  render(<App />);
  expect(screen.getByRole('heading', { name: 'Lizard supplies' })).toBeInTheDocument();
  expect(axios.get).not.toHaveBeenCalled();
});

test('keeps the existing products page connected to its API', async () => {
  window.history.replaceState({}, '', '/products');
  axios.get.mockResolvedValue({ data: [{ id: 1, name: 'Dog Food', description: 'Dinner for dogs', price: '10.00', animal_type: 'Dog', product_type: 'Food' }] });
  render(<App />);
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Dog Food' })).toBeInTheDocument());
  expect(axios.get).toHaveBeenCalledWith('/api/products');
  expect(screen.getByRole('heading', { name: 'New Arrivals' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Lizard supplies' })).toHaveAttribute('href', '/lizards');
});
