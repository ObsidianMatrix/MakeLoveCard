import './App.css';
import cards from './cards.json';
import { useState } from 'react';

function App() {
  const [clickCounts, setClickCounts] = useState({});
  const [activeCards, setActiveCards] = useState({});
  const displayCards = cards.filter((card) => card.card_kind !== 'エネルギー');

  const handleImageClick = (cardNumber) => {
    setActiveCards((prev) => ({ ...prev, [cardNumber]: true }));
  };

  const handleChangeCount = (cardNumber, delta) => {
    setClickCounts((prev) => {
      const current = prev[cardNumber] || 0;
      let newCount = current + delta;
      if (newCount < 0) newCount = 0;
      if (newCount > 4) newCount = 4;
      const updated = { ...prev };
      if (newCount === 0) {
        delete updated[cardNumber];
      } else {
        updated[cardNumber] = newCount;
      }
      return updated;
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
      <div className="cards-container">
        {displayCards.map((card, index) => (
          <div key={`${card.card_number}-${index}`}>
            <img
              src={card.image_url}
              alt={`card-${card.card_number}`}
              onClick={() => handleImageClick(card.card_number)}
            />
            {activeCards[card.card_number] && (
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
      </div>
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
