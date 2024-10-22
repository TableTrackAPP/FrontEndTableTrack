// src/components/Loading.js
import React from 'react';
import '../styles/Loading.css'; // Importa o CSS para estilização do loading

const Loading = ({ message }) => {
    return (
        <div className="loading-overlay">
            <div className="loading-container">
                <img src="../assets/loading.gif" alt="Loading..." className="loading-image" />
                {message && <p>{message}</p>}
            </div>
        </div>
    );
};

export default Loading;
