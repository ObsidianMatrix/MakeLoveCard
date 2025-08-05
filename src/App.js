import './App.css';
import cards from './cards.json';
import { useRef, useState } from 'react';

function App() {
  const [clickCounts, setClickCounts] = useState({});
  const [activeCards, setActiveCards] = useState({});
  const [name, setName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const displayCards = cards.filter((card) => card.card_kind !== 'エネルギー');
  const totalValue = Object.values(clickCounts).reduce((sum, val) => sum + val, 0);
  const stringifiedCards = Object.fromEntries(
    Object.entries(clickCounts).map(([k, v]) => [k, String(v)])
  );

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
    const data = { name, cards: stringifiedCards };
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/json') {
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        setName(data.name || '');
        const importedCounts = {};
        const importedActive = {};
        if (data.cards) {
          Object.entries(data.cards).forEach(([k, v]) => {
            const num = parseInt(v, 10);
            if (!Number.isNaN(num) && num > 0) {
              importedCounts[k] = num;
              importedActive[k] = true;
            }
          });
        }
        setClickCounts(importedCounts);
        setActiveCards(importedActive);
      } catch (err) {
        console.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
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
      <p>メインデッキ：{totalValue} / 60</p>
      <button type="button" onClick={openModal}>
        デッキを確認
      </button>
      <form>
        <input
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <textarea
          aria-label="deck-json"
          readOnly
          value={JSON.stringify({ name, cards: stringifiedCards }, null, 2)}
        />
        <input
          type="file"
          accept="application/json"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button type="button" onClick={handleSave}>
          保存
        </button>
        <button type="button" onClick={handleImportClick}>
          インポート
        </button>
      </form>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeModal}>
              ×
            </button>
            {Object.keys(stringifiedCards).map((cardNumber) => {
              const card = cards.find(
                (c) => c.card_number === cardNumber
              );
              if (!card) return null;
              return (
                <div key={cardNumber} className="modal-card">
                  <img
                    src={card.image_url}
                    alt={`card-${cardNumber}`}
                  />
                  <span className="card-count">
                    {stringifiedCards[cardNumber]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
