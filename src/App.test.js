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

test('クリックでボタンが表示されカウントを更新できる', async () => {
  render(<App />);
  const images = screen.getAllByRole('img');
  await userEvent.click(images[0]);
  const plus = screen.getByRole('button', { name: '+' });
  const minus = screen.getByRole('button', { name: '-' });
  const textarea = screen.getByRole('textbox');

  await userEvent.click(plus);
  expect(textarea).toHaveValue(
    JSON.stringify({ cards: { [cards[0].card_number]: 1 } }, null, 2),
  );

  await userEvent.click(plus);
  expect(textarea).toHaveValue(
    JSON.stringify({ cards: { [cards[0].card_number]: 2 } }, null, 2),
  );

  await userEvent.click(minus);
  expect(textarea).toHaveValue(
    JSON.stringify({ cards: { [cards[0].card_number]: 1 } }, null, 2),
  );
});

test('一度表示されたボタンは他のカードをクリックしても残る', async () => {
  render(<App />);
  const images = screen.getAllByRole('img');
  await userEvent.click(images[0]);
  await userEvent.click(images[1]);
  const plusButtons = screen.getAllByRole('button', { name: '+' });
  const minusButtons = screen.getAllByRole('button', { name: '-' });
  expect(plusButtons).toHaveLength(2);
  expect(minusButtons).toHaveLength(2);
});
