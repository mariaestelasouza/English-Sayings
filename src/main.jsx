import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { countVisit } from './usage.js';
import './styles.css';


countVisit();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
