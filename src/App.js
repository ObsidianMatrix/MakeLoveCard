import './App.css';
import cards from './cards.json';
import { useState } from 'react';

function App() {
  const [clickCounts, setClickCounts] = useState({});
  const [activeCard, setActiveCard] = useState(null);

  const handleImageClick = (cardNumber) => {
    setActiveCard(cardNumber);
  };

  const handleChangeCount = (cardNumber, delta) => {
    setClickCounts((prev) => {
      const newCount = (prev[cardNumber] || 0) + delta;
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
      {cards.map((card, index) => (
        <div key={`${card.card_number}-${index}`}>
          <img
            src={card.image_url}
            alt={`card-${card.card_number}`}
            onClick={() => handleImageClick(card.card_number)}
          />
          {activeCard === card.card_number && (
            <div>
              <button onClick={() => handleChangeCount(card.card_number, 1)}>+</button>
              <input
                type="number"
                readOnly
                value={clickCounts[card.card_number] || 0}
              />
              <button onClick={() => handleChangeCount(card.card_number, -1)}>-</button>
            </div>
          )}
        </div>
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
