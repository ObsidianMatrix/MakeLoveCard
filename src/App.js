import './App.css';
import cards from './cards.json';

function App() {
  const imageUrls = [];
  for (let i = 0; i < cards.length; i += 1) {
    imageUrls.push(cards[i].image_url);
  }

  return (
    <div className="App">
      {imageUrls.map((url, index) => (
        <img key={index} src={url} alt={`card-${index}`} />
      ))}
    </div>
  );
}

export default App;
