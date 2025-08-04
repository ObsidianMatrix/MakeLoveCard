import './App.css';
import cards from './cards.json';
import { useState } from 'react';

function App() {
  const [clickCounts, setClickCounts] = useState({});

  const handleImageClick = (cardNumber) => {
    setClickCounts((prev) => {
      const newCount = (prev[cardNumber] || 0) + 1;
      return { ...prev, [cardNumber]: newCount };
    });
  };

  const handleSave = () => {
    const data = { cards: clickCounts };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deck.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="App">
      {cards.map((card) => (
        <img
          key={card.card_number}
          src={card.image_url}
          alt={`card-${card.card_number}`}
          onClick={() => handleImageClick(card.card_number)}
        />
      ))}
      <form>
        <textarea
          readOnly
          value={JSON.stringify({ cards: clickCounts }, null, 2)}
        />
        <button type="button" onClick={handleSave}>
          保存
        </button>
      </form>
    </div>
  );
}

export default App;
