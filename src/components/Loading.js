// src/components/Loading.js
import React, { useState, useEffect } from 'react';
import loadingGif from '../assets/loading.gif';
import '../styles/Loading.css';

const Loading = ({ message }) => {
    const [gifFailed, setGifFailed] = useState(false);
    const [dots, setDots] = useState('');

    // Animação dos pontinhos (... → .. → . → ...)
    useEffect(() => {
        let i = 0;
        const interval = setInterval(() => {
            const dotCount = i % 4; // 0,1,2,3
            setDots('.'.repeat(dotCount));
            i++;
        }, 500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="loading-overlay">
            <div className="loading-container">

                {/* TENTA carregar o GIF */}
                {!gifFailed && (
                    <img
                        src={loadingGif}
                        alt="Loading..."
                        className="loading-image"
                        onError={() => setGifFailed(true)} // 🚨 fallback automático
                    />
                )}

                {/* FALLBACK QUANDO GIF FALHA */}
                {gifFailed && (
                    <p className="loading-text">
                        {message || 'carregando'}
                        {dots}
                    </p>
                )}

                {/* Mensagem abaixo (opcional) */}
                {!gifFailed && message && <p>{message}</p>}
            </div>
        </div>
    );
};

export default Loading;
