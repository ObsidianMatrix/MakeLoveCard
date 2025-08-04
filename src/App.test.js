import { render, screen } from '@testing-library/react';
import App from './App';
import cards from './cards.json';

test('renders images for all cards', () => {
  render(<App />);
  const images = screen.getAllByRole('img');
  expect(images).toHaveLength(cards.length);
  expect(images[0]).toHaveAttribute('src', cards[0].image_url);
});
