const { createElement, useEffect, useState } = React;
const { createRoot } = ReactDOM;

function App() {
  const [images, setImages] = useState([]);

  useEffect(() => {
    fetch('cards.json')
      .then((response) => response.json())
      .then((data) => {
        const elements = [];
        for (let i = 0; i < data.length; i += 1) {
          elements.push(
            createElement('img', {
              key: i,
              src: data[i].image_url,
              alt: `card-${i}`,
            })
          );
        }
        setImages(elements);
      })
      .catch((err) => {
        console.error('Failed to load cards.json', err);
      });
  }, []);

  return createElement('div', null, images);
}

const root = createRoot(document.getElementById('root'));
root.render(createElement(App));
