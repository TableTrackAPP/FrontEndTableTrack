// src/pages/ResetPassword.js
import React, { useState } from 'react';
import { resetPassword } from '../services/authService';
import { useToast } from '../hooks/ToastContext'; // Hook de Toast para exibir notificações
import { useLoading } from '../hooks/LoadingContext'; // Hook de Loading para exibir o loader
import { useNavigate, useLocation } from 'react-router-dom'; // Para pegar parâmetros da URL e redirecionar
import logoImageUrl from '../assets/logoProvisoria.png';

const ResetPassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();
    const navigate = useNavigate();
    const location = useLocation();

    // Obtém os parâmetros da URL
    const queryParams = new URLSearchParams(location.search);
    const email = queryParams.get('email');
    const resetToken = queryParams.get('resetToken');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            showToast('As senhas não coincidem!', 'error');
            return;
        }

        try {
            showLoading('Redefinindo senha...');
            const response = await resetPassword(email, resetToken, newPassword);
            hideLoading();
            showToast('Senha redefinida com sucesso!', 'success');
            navigate('/login'); // Redireciona para a tela de login após redefinir a senha
        } catch (err) {
            hideLoading();
            showToast('Erro ao redefinir a senha. Tente novamente.', 'error');
        }
    };

    return (

        <div className="password-container">

            <div className="password-box">
                <h2>Redefinir Senha</h2>
            <form onSubmit={handleSubmit} className="password-form">
                <div className="input-group">
                    <label>Nova Senha:</label>
                    <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className="input-field"
                    />
                </div>
                <div>
                    <label>Confirme a Nova Senha:</label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="input-field"
                    />
                </div>
                <button type="submit" className="password-button">Redefinir Senha</button>
            </form>
            </div>
        </div>
    );
};

export default ResetPassword;
