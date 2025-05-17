import React from 'react';
import Home from './pages/Home';
import './styles/global.css';

function App() {
  console.log('App sendo renderizado'); // Debug
  return (
    <div className="app-container">
      <Home />
    </div>
  );
}

export default App;