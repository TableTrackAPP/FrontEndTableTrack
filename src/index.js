import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { HelmetProvider } from 'react-helmet-async';
import { ToastProvider } from './hooks/ToastContext';
import { LoadingProvider } from './hooks/LoadingContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <React.StrictMode>
        <HelmetProvider>
            <LoadingProvider>
                <ToastProvider>
                    <App />
                </ToastProvider>
            </LoadingProvider>
        </HelmetProvider>
    </React.StrictMode>
);