import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { AuthProvider } from './components/AuthContext';


const root = ReactDOM.createRoot(document.getElementById('root'));
const renderApp = (darkMode) => {
root.render(
  <React.StrictMode>
    <AuthProvider>
    <div className={darkMode ? 'dark-mode' : ''}>
    <App />
    </div>
    </AuthProvider>
  </React.StrictMode>
);
};

renderApp(false);
