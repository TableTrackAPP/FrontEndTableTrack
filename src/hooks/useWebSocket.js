import { useEffect, useRef } from 'react';

const useWebSocket = (establishmentID, onMessage) => {
    const socketRef = useRef(null);
    const reconnectTimeout = useRef(null);
    const reconnectAttempts = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 10;

    useEffect(() => {
        if (!establishmentID || establishmentID === '') return;

        let isUnmounted = false;

        const connect = () => {
            if (reconnectAttempts.current >= MAX_RECONNECT_ATTEMPTS) {
                console.warn('⚠️ Máximo de tentativas de reconexão atingido.');
                return;
            }

            const socket = new WebSocket(`ws://localhost:3000/ws/notifications?id=${establishmentID}`);
            socketRef.current = socket;

            socket.onopen = () => {
                console.log('✅ WebSocket conectado');
                console.log('establishmentID:', establishmentID);
                reconnectAttempts.current = 0; // Zera as tentativas após sucesso
            };

            socket.onmessage = (event) => {
                if (onMessage) onMessage(event.data);
            };

            socket.onerror = (error) => {
                console.error('❌ WebSocket erro:', error);
            };

            socket.onclose = () => {
                console.warn('🔌 WebSocket desconectado');
                if (!isUnmounted) {
                    reconnectAttempts.current += 1;
                    console.log(`🔁 Tentando reconectar... tentativa ${reconnectAttempts.current}`);
                    reconnectTimeout.current = setTimeout(connect, 2000); // tenta reconectar após 2s
                }
            };
        };

        connect();

        return () => {
            isUnmounted = true;
            if (socketRef.current) socketRef.current.close();
            if (reconnectTimeout.current) clearTimeout(reconnectTimeout.current);
        };
    }, [establishmentID]);
};

export default useWebSocket;
