import React, { useState, useEffect } from 'react';
import '../styles/Toast.css'; // Adjusted path

const Toast = ({ message, type, duration, onClose }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
            if (onClose) onClose();
        }, duration || 3000); // Default duration 3s

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        show && (
            <div className={`toast ${type}`}>
                <p>{message}</p>
            </div>
        )
    );
};

export default Toast;
