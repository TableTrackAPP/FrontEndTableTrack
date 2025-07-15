// src/App.js
import React from 'react';
import AppRoutes from './routes/Routes';
import { useLoading } from './hooks/LoadingContext';
import Loading from './components/Loading';

// Importa o ThemeProvider e CssBaseline do Material UI
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './utils/theme'; // Importa o seu tema personalizado

function App() {
    const { isLoading, loadingMessage } = useLoading();

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Normaliza o CSS do Material UI */}
            <div className="App">
                {isLoading && <Loading message={loadingMessage} />}
                <AppRoutes />
            </div>
        </ThemeProvider>
    );
}

export default App;
