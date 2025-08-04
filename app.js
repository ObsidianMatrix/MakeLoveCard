const { createElement } = React;
const { createRoot } = ReactDOM;

function App() {
  return createElement('h1', null, 'Hello, React!');
}

const root = createRoot(document.getElementById('root'));
root.render(createElement(App));