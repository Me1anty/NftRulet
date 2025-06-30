import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/strict.css'

// Telegram WebApp script injection (if not already loaded)
const loadTelegramScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Telegram?.WebApp) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-web-app.js';
    script.onload = () => {
      if (window.Telegram?.WebApp) {
        resolve();
      } else {
        reject(new Error('Failed to load Telegram WebApp'));
      }
    };
    script.onerror = () => reject(new Error('Failed to load Telegram WebApp script'));
    document.head.appendChild(script);
  });
};

// Initialize app
const initApp = async () => {
  try {
    // Load Telegram script if in Telegram environment
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      await loadTelegramScript();
    }
  } catch (error) {
    console.warn('Telegram WebApp script not loaded:', error);
    // Continue with development mode
  }

  // Force dark theme for strict design
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.style.backgroundColor = '#000000';

  // Render React app
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
};

initApp();