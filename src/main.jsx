import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/global.css';

const root = document.getElementById('root');
if (!root) {
    console.error('Elemento root não encontrado!');
} else {
    createRoot(root).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}