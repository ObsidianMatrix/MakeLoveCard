import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import cards from './cards.json';

test('renders images for all cards', () => {
  render(<App />);
  const images = screen.getAllByRole('img');
  expect(images).toHaveLength(cards.length);
  expect(images[0]).toHaveAttribute('src', cards[0].image_url);
});

test('clicking image updates form with counts', async () => {
  render(<App />);
  const images = screen.getAllByRole('img');
  await userEvent.click(images[0]);
  const textarea = screen.getByRole('textbox');
  expect(textarea).toHaveValue(
    JSON.stringify({ cards: { [cards[0].card_number]: 1 } }, null, 2),
  );
  await userEvent.click(images[0]);
  expect(textarea).toHaveValue(
    JSON.stringify({ cards: { [cards[0].card_number]: 2 } }, null, 2),
  );
});
