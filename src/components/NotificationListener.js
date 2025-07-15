// src/components/NotificationListener.js
import React, { useEffect, useState } from 'react';
import useWebSocket from '../hooks/useWebSocket';
import { getFromLocalStorage } from '../utils/storageUtils';
import { getEstablishmentByOwnerID } from '../services/establishmentService';
import '../styles/NotificationListener.css';

const NotificationListener = () => {
    const [establishmentID, setEstablishmentID] = useState(null);
    const [messages, setMessages] = useState([]); // Suporte a múltiplas mensagens

    useEffect(() => {
        const fetchEstablishment = async () => {
            const userData = getFromLocalStorage('userData');
            if (userData?.userID) {
                try {
                    const establishment = await getEstablishmentByOwnerID(userData.userID);
                    if (establishment?.EstablishmentID) {
                        setEstablishmentID(establishment.EstablishmentID);
                    }
                } catch (err) {
                    console.error('Erro ao buscar estabelecimento:', err);
                }
            }
        };

        fetchEstablishment();
    }, []);

    useWebSocket(establishmentID, (message) => {
        setMessages(prev => [...prev, message]); // Adiciona nova notificação à fila
    });

    const handleClose = (index) => {
        setMessages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="notification-listener-container">
            {messages.map((msg, index) => (
                <div key={index} className="notification-listener-box">
                    <span>{msg}</span>
                    <button
                        className="notification-listener-close"
                        onClick={() => handleClose(index)}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationListener;
