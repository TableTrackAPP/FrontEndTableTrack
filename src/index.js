import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ToastProvider } from './hooks/ToastContext'; // Importa o ToastProvider
import { LoadingProvider } from './hooks/LoadingContext'; // Import LoadingProvider

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <LoadingProvider>
        <ToastProvider>
            <App />
        </ToastProvider>
            </LoadingProvider>
    </React.StrictMode>
);
