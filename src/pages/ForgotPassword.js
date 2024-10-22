// src/pages/ForgotPassword.js
import React, { useState } from 'react';
import { forgotPassword } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../hooks/LoadingContext'; // Import useLoading from context
import { useToast } from '../hooks/ToastContext'; // Import useToast from context

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { showLoading, hideLoading } = useLoading(); // Use loading from context
    const { showToast } = useToast(); // Use toast from context
    const navigate = useNavigate(); // Use navigate for routing

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            showLoading('Enviando email de recuperação...'); // Show loading message
            const response = await forgotPassword(email);
            hideLoading(); // Hide loading after the request
            showToast('Instruções de recuperação enviadas para seu email.', 'success'); // Show success message
            navigate('/validate-reset-code', { state: { email } }); // Pass email to the next screen
        } catch (err) {
            hideLoading(); // Hide loading in case of error
            showToast('Falha ao enviar instruções de recuperação.', 'error'); // Show error message
        }
    };

    return (
        <div>
            <h2>Recuperar Senha</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Enviar Instruções de Recuperação</button>
            </form>
        </div>
    );
};

export default ForgotPassword;
