import React from 'react';
import Home from './pages/Home';
import './styles/global.css';
import Footer from './components/Footer';

function App() {
  console.log('App sendo renderizado'); // Debug
  return (
    <div className="app-container">
      <Home />
      <Footer />
    </div>
  );
}

export default App;