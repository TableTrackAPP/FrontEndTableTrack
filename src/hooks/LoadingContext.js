// src/hooks/LoadingContext.js
import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const LoadingContext = createContext(null);

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    const showLoading = useCallback((message = 'carregando') => {
        setLoadingMessage(message);
        setIsLoading(true);
    }, []);

    const hideLoading = useCallback(() => {
        setIsLoading(false);
        setLoadingMessage('');
    }, []);

    const value = useMemo(
        () => ({ isLoading, loadingMessage, showLoading, hideLoading }),
        [isLoading, loadingMessage, showLoading, hideLoading]
    );

    return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>;
};

export const useLoading = () => useContext(LoadingContext);
