// src/hooks/LoadingContext.js
import { createContext, useContext, useState } from 'react';

// Cria o contexto para o loading
const LoadingContext = createContext();

// Provedor do contexto
export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    // Função para iniciar o loading
    const showLoading = (message = '') => {
        setLoadingMessage(message);
        setIsLoading(true);
    };

    // Função para esconder o loading
    const hideLoading = () => {
        setIsLoading(false);
        setLoadingMessage('carregando');
    };

    return (
        <LoadingContext.Provider value={{ isLoading, loadingMessage, showLoading, hideLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

// Hook customizado para usar o contexto do loading
export const useLoading = () => useContext(LoadingContext);
