import React, { useState } from 'react';
import {login, register} from '../services/authService';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/Register.css';
import logoImageUrl from '../assets/logoProvisoria.png';
import {saveToLocalStorage} from "../utils/storageUtils";

const Register = () => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

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

        if (formData.password !== formData.confirmPassword) {
            showToast('As senhas não coincidem!', 'error');
            return;
        }

        try {
            const userData = {
                userName: formData.userName,
                email: formData.email,
                passwordHash: formData.password,
            };
            showLoading('Registrando usuário...');
            console.log('Fazendo cadastro');
            await register(userData);

            console.log('usuário cadastrado com sucesso');

            console.log('Fazendo login:', userData.email, ', ', userData.passwordHash);

            const response = await login(userData.email, userData.passwordHash);

            console.log('Autenticacação feira com sucesso, salvando local storage:', response.email, ', ', userData.passwordHash);
            console.log(response.userID);
            console.log(response.userName);
            console.log(response.email);
            console.log(response.subscriptionStatus);

            saveToLocalStorage('userData', {
                userID: response.userID,
                userName: response.userName,
                email: response.email,
                subscriptionStatus: response.subscriptionStatus,
            });

            console.log('Storage salvo com sucesso');

            hideLoading();
            showToast('Registro realizado com sucesso!', 'success');
            navigate('/dashboard');
        } catch (err) {
            hideLoading();
            if (err.response?.data?.error.includes('duplicate')) {
                showToast('Esse e-mail já está cadastrado', 'error');
            } else {
                showToast('Falha no registro, tente novamente.', 'error');
            }
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <div className="logo-container">
                    <img src={logoImageUrl} alt="TableTrack Logo" className="register-logo" onClick={() => navigate('/')} />
                </div>
                <div className="register-header">
                    <h2>Crie sua conta</h2>
                </div>
                <form onSubmit={handleSubmit} className="register-form">
                    <div className="input-group">
                        <label>Nome de usuário</label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                    </div>
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
                    <div className="input-group">
                        <label>Confirme sua senha</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="input-field"
                        />
                    </div>
                    <button type="submit" className="register-button">Registrar</button>
                </form>
                <div className="register-links">
                    <p>Já tem uma conta? <Link to="/login">Faça login</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;
