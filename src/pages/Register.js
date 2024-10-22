// src/pages/Register.js
import React, { useState } from 'react';
import { register } from '../services/authService';
import { useToast } from '../hooks/ToastContext'; // Import useToast from context
import { useLoading } from '../hooks/LoadingContext'; // Import useLoading from context
import { useNavigate, Link } from 'react-router-dom'; // Use useNavigate instead of useHistory

const Register = () => {
    const [formData, setFormData] = useState({
        userName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const { showToast } = useToast(); // Use showToast from context
    const { showLoading, hideLoading } = useLoading(); // Use showLoading and hideLoading from context
    const navigate = useNavigate(); // Use useNavigate for navigation

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            showToast('As senhas não coincidem!', 'error'); // Show error toast for password mismatch
            return;
        }

        try {
            const userData = {
                userName: formData.userName,
                email: formData.email,
                passwordHash: formData.password,  // Ajuste para bater com o backend
            };
            showLoading('Registrando usuário...'); // Show loading
            const response = await register(userData);
            hideLoading(); // Hide loading after response
            showToast('Registro realizado com sucesso! Faça o login.', 'success'); // Show success toast
            console.log(response);
            navigate('/login'); // Navega para a página de login após o registro
        } catch (err) {
            hideLoading(); // Hide loading on error
            // Verifica se a mensagem de erro contém a palavra 'duplicate'
            if (err.response && err.response.data && err.response.data.error.includes('duplicate')) {
                showToast('Esse e-mail já está cadastrado', 'error'); // Show duplicate email error
            } else {
                showToast('Falha no registro, tente novamente.', 'error'); // Show generic error toast
            }
        }
    };

    return (
        <div>
            <h2>Registrar</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome de usuário:</label>
                    <input
                        type="text"
                        name="userName"
                        value={formData.userName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Senha:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Confirme sua senha:</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Registrar</button>
            </form>
            <p>Já tem uma conta? <Link to="/login">Faça login</Link></p> {/* Add a link to the login page */}
        </div>
    );
};

export default Register;
