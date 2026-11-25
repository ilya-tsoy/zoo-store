import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import Minesweeper from './Minesweeper';
import './index.css';

const path = window.location.pathname.replace(/\/$/, '');
const showGame = path === '' || path === '/minesweeper';

document.title = showGame ? 'Minesweeper' : 'Zoo Store';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {showGame ? <Minesweeper /> : <App />}
  </React.StrictMode>
);
