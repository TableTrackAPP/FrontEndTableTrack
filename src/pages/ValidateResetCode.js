import React, { useState, useEffect } from 'react';
import { validateResetCode } from '../services/authService';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/PasswordReset.css';
import logoImageUrl from '../assets/logoProvisoria.png';

const ValidateResetCode = () => {
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.state?.email) {
            setEmail(location.state.email);
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            showLoading('Validando código...');
            await validateResetCode(email, resetToken);
            hideLoading();
            showToast('Código validado com sucesso!', 'success');
            navigate(`/reset-password?email=${email}&resetToken=${resetToken}`);
        } catch (err) {
            hideLoading();
            showToast('Código inválido ou expirado.', 'error');
        }
    };

    return (
        <div className="password-container">
            <div className="password-box">
                <div className="password-logo-container">
                    <img src={logoImageUrl} alt="TableTrack Logo" className="password-logo" onClick={() => navigate('/')} />
                </div>
                <div className="password-header">
                    <h2>Validar Código</h2>
                </div>
                <form onSubmit={handleSubmit} className="password-form">
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <label>Código de Recuperação</label>
                        <input
                            type="text"
                            value={resetToken}
                            onChange={(e) => setResetToken(e.target.value)}
                            required
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="password-button">Validar Código</button>
                </form>
            </div>
        </div>
    );
};

export default ValidateResetCode;
