// src/hooks/LoadingContext.js
import { createContext, useContext, useState } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const showLoading = (message = 'carregando') => {
        setLoadingMessage(message);
        setIsLoading(true);
    };

    const hideLoading = () => {
        setIsLoading(false);
        setLoadingMessage(''); // limpa a mensagem ao sair
    };

    return (
        <LoadingContext.Provider value={{ isLoading, loadingMessage, showLoading, hideLoading }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => useContext(LoadingContext);
