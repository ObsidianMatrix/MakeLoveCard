/* global axios */
import './App.css';
import cards from './cards.json';
import { useRef, useState } from 'react';

function App() {
  const [clickCounts, setClickCounts] = useState({});
  const [activeCards, setActiveCards] = useState({});
  const [name, setName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printClickCounts, setPrintClickCounts] = useState({});
  const [decklogId, setDecklogId] = useState('');
  const fileInputRef = useRef(null);
  const displayCards = cards.filter((card) => card.card_kind !== 'エネルギー');
  const totalValue = Object.values(clickCounts).reduce((sum, val) => sum + val, 0);
  const stringifiedCards = Object.fromEntries(
    Object.entries(clickCounts).map(([k, v]) => [k, String(v)])
  );
  const stringifiedPrintCards = Object.fromEntries(
    Object.entries(printClickCounts).map(([k, v]) => [k, String(v)])
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

  const handlePrintClickCounts = (cardNumber, delta) => {
    setPrintClickCounts((prev) => {
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

  const openPrintModal = () => {
    setPrintClickCounts(structuredClone(clickCounts));
    setIsPrintModalOpen(true);
  };

  const closePrintModal = () => {
    setIsPrintModalOpen(false);
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
        importDeckData(data);
      } catch (err) {
        console.error('Invalid JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Shared importer: apply name and card counts to state
  const importDeckData = (raw) => {
    try {
      const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
      setName(data?.name || '');
      const importedCounts = {};
      const importedActive = {};
      if (data && data.cards && typeof data.cards === 'object') {
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
    } catch (e) {
      console.error('Failed to import deck data:', e);
    }
  };

  const buildPrintImageList = () => {
    const images = [];
    Object.entries(printClickCounts).forEach(([cardNumber, count]) => {
      const card = cards.find((c) => c.card_number === cardNumber);
      if (!card) return;
      for (let i = 0; i < count; i += 1) {
        images.push({
          cardNumber,
          url: card.image_url,
        });
      }
    });
    return images;
  };

  const handleSavePdf = () => {
    const images = buildPrintImageList();
    if (images.length === 0) return;

    const pages = [];
    for (let i = 0; i < images.length; i += 9) {
      pages.push(images.slice(i, i + 9));
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Unable to open print window');
      return;
    }

    const pageMarkup = pages
      .map(
        (page, pageIndex) => `
          <div class="print-page" aria-label="page-${pageIndex + 1}">
            ${page
              .map(
                (image, cellIndex) => `
                  <div class="print-cell" aria-label="card-${image.cardNumber}-${cellIndex}">
                    <img src="${image.url}" alt="card-${image.cardNumber}" class="print-image" />
                  </div>
                `
              )
              .join('')}
            ${Array.from({ length: 9 - page.length })
              .map(
                (_, fillerIndex) => `
                  <div class="print-cell" aria-label="filler-${pageIndex}-${fillerIndex}"></div>
                `
              )
              .join('')}
          </div>
        `
      )
      .join('');

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Card Print</title>
          <style>
            @page { margin: 10mm; }
            body { margin: 0; padding: 0; }
            .print-page {
              width: 190mm;
              height: 277mm;
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              grid-template-rows: repeat(3, 1fr);
              gap: 6mm;
              page-break-after: always;
              box-sizing: border-box;
              padding: 2mm;
              margin: 0 auto;
            }
            .print-page:last-of-type { page-break-after: auto; }
            .print-cell {
              width: 100%;
              height: 100%;
              display: flex;
              justify-content: center;
              align-items: center;
            }
            .print-image {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          ${pageMarkup}
          <script>
            window.onload = function () {
              setTimeout(function () {
                window.focus();
                window.print();
                window.close();
              }, 100);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Axios GET to fetch deck data and populate the form
  const handleAxiosImport = async () => {
    try {
      if (typeof axios === 'undefined') {
        console.error('axios is not available');
        return;
      }
      if (!decklogId) {
        console.error('decklog id is required');
        return;
      }
      const res = await axios.get(
        'https://i3289ppivh.execute-api.ap-northeast-1.amazonaws.com/scraping_deck',
        { params: { id: decklogId } }
      );
      importDeckData(res?.data);
    } catch (error) {
      console.error('GET failed:', error);
    }
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
      <button type="button" onClick={openPrintModal}>
        印刷
      </button>
      <form>
        <label htmlFor="deck-name">デッキ名</label>
        <input
          id="deck-name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
        <input type="text" aria-label="decklog-id" placeholder="decklog ID" value={decklogId} onChange={(e) => setDecklogId(e.target.value)} />
        <button type="button" onClick={handleAxiosImport}>decklogインポート</button>
      </form>
      <textarea
        aria-label="deck-json"
        readOnly
        value={JSON.stringify({ name, cards: stringifiedCards }, null, 2)}
      />

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
                  <div className="modal-controls">
                    <button onClick={() => handleChangeCount(cardNumber, 1)}>
                      +
                    </button>
                    <input
                      type="number"
                      readOnly
                      value={clickCounts[cardNumber] || 0}
                    />
                    <button onClick={() => handleChangeCount(cardNumber, -1)}>
                      -
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {isPrintModalOpen && (
        <div className="modal-overlay" onClick={closePrintModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closePrintModal}>
              ×
            </button>
            <div className="modal-actions">
              <button type="button" className="action-button" onClick={handleSavePdf}>
                保存（PDF）
              </button>
            </div>
            {Object.keys(stringifiedPrintCards).map((cardNumber) => {
              const card = cards.find((c) => c.card_number === cardNumber);
              if (!card) return null;
              return (
                <div key={cardNumber} className="modal-card">
                  <img src={card.image_url} alt={`card-${cardNumber}`} />
                  <div className="modal-controls">
                    <button onClick={() => handlePrintClickCounts(cardNumber, 1)}>
                      +
                    </button>
                    <input
                      type="number"
                      readOnly
                      value={printClickCounts[cardNumber] || 0}
                    />
                    <button onClick={() => handlePrintClickCounts(cardNumber, -1)}>
                      -
                    </button>
                  </div>
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
