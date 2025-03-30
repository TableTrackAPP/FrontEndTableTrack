import React, { useState } from 'react';
import { forgotPassword } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { useLoading } from '../hooks/LoadingContext';
import { useToast } from '../hooks/ToastContext';
import '../styles/PasswordReset.css';
import logoImageUrl from '../assets/logoProvisoria.png';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const { showLoading, hideLoading } = useLoading();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            showLoading('Enviando email de recuperação...');
            await forgotPassword(email);
            hideLoading();
            showToast('Instruções de recuperação enviadas para seu email.', 'success');
            navigate('/validate-reset-code', { state: { email } });
        } catch (err) {
            hideLoading();
            showToast('Falha ao enviar instruções de recuperação.', 'error');
        }
    };

    return (
        <div className="password-container">
            <div className="password-box">
                <div className="password-logo-container">
                    <img src={logoImageUrl} alt="TableTrack Logo" className="password-logo" onClick={() => navigate('/')} />
                </div>
                <div className="password-header">
                    <h2>Recuperar Senha</h2>
                </div>
                <form onSubmit={handleSubmit} className="password-form">
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="password-button">Enviar Instruções</button>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
