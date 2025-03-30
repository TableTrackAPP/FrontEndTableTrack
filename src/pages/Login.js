import React, { useState } from 'react';
import { login } from '../services/authService';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext';
import { Link, useNavigate } from 'react-router-dom';
import { saveToLocalStorage } from '../utils/storageUtils';
import '../styles/Login.css';
import logoImageUrl from '../assets/logoProvisoria.png';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { email, password } = formData;
            showLoading('Fazendo login...');
            const response = await login(email, password);

            saveToLocalStorage('userData', {
                userID: response.userID,
                userName: response.userName,
                email: response.email,
                subscriptionStatus: response.subscriptionStatus,
            });

            hideLoading();
            showToast('Login feito com sucesso', 'success');

            if (response.subscriptionStatus === 'Active') {
                navigate('/dashboard');
            } else {
                navigate('/subscribe');
            }
        } catch (err) {
            hideLoading();
            showToast('Usuário incorreto, tente novamente!', 'error');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                {/* Redireciona para Home ao clicar na logo */}
                <div className="logo-container">
                    <Link to="/">
                        <img src={logoImageUrl} alt="TableTrack Logo" className="login-logo"/>
                    </Link>
                </div>

                <div className="login-header">
                    <h2>Login</h2>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                    </div>
                    <div className="input-group">
                        <label>Senha</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="login-button">Entrar</button>
                </form>

                <div className="login-links">
                    <Link to="/forgot-password">Esqueceu sua senha?</Link>
                    <Link to="/register">Criar conta</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
