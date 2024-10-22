// src/pages/ValidateResetCode.js
import React, { useState, useEffect } from 'react';
import { validateResetCode } from '../services/authService';
import { useToast } from '../hooks/ToastContext'; // Hook de Toast para exibir notificações
import { useLoading } from '../hooks/LoadingContext'; // Hook de Loading para exibir o loader
import { useNavigate, useLocation } from 'react-router-dom'; // useLocation para acessar o estado

const ValidateResetCode = () => {
    const [email, setEmail] = useState('');
    const [resetToken, setResetToken] = useState('');
    const { showToast } = useToast(); // Toast para notificações
    const { showLoading, hideLoading } = useLoading(); // Loading
    const navigate = useNavigate();
    const location = useLocation(); // useLocation to access passed state

    useEffect(() => {
        if (location.state && location.state.email) {
            setEmail(location.state.email); // Set email from passed state
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            showLoading('Validando código...');
            const response = await validateResetCode(email, resetToken);
            hideLoading();
            showToast('Código validado com sucesso!', 'success');
            navigate(`/reset-password?email=${email}&resetToken=${resetToken}`); // Redireciona para redefinir a senha
        } catch (err) {
            hideLoading();
            showToast('Código inválido ou expirado. Tente novamente.', 'error');
        }
    };

    return (
        <div>
            <h2>Validar Código de Recuperação</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={email !== ''} // Desabilita o campo se o email já foi passado
                    />
                </div>
                <div>
                    <label>Código de Recuperação:</label>
                    <input
                        type="text"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Validar Código</button>
            </form>
        </div>
    );
};

export default ValidateResetCode;
