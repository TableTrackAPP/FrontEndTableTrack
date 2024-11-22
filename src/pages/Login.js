import React, { useState } from 'react';
import { login } from '../services/authService';
import { useToast } from '../hooks/ToastContext'; // Import useToast from context
import { useLoading } from '../hooks/LoadingContext'; // Import useLoading from context
import { Link, useNavigate } from 'react-router-dom'; // Import Link and useNavigate from react-router-dom
import { saveToLocalStorage } from '../utils/storageUtils'; // Import saveToLocalStorage

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { showToast } = useToast(); // Use showToast from context
    const { showLoading, hideLoading } = useLoading(); // Use showLoading and hideLoading from context
    const navigate = useNavigate(); // Use navigate for routing

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
            showLoading('Fazendo login...'); // Show loading with message
            const response = await login(email, password);
            console.log('response ', response.userID);

            // Salva informações do usuário no cache usando saveToLocalStorage
            saveToLocalStorage('userData', {
                userID: response.userID,
                userName: response.userName,
                email: response.email,
                subscriptionStatus: response.subscriptionStatus,
            });

            hideLoading(); // Hide loading after response
            showToast('Login feito com sucesso', 'success'); // Show success toast

            console.log(response.subscriptionStatus);
            // Navega para o Dashboard baseado no SubscriptionStatus
            if (response.subscriptionStatus === 'Active') {
                navigate('/dashboard');
            } else {
                navigate('/subscribe');
            }
        } catch (err) {
            hideLoading(); // Hide loading even if there's an error
            showToast('Usuário incorreto, tente novamente!', 'error'); // Show error toast
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
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
                    <label>Password:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>

            <p>Não tem uma conta? <Link to="/register">Registrar</Link></p>
            <p>Esqueceu sua senha? <Link to="/forgot-password">Recuperar senha</Link></p>
        </div>
    );
};

export default Login;
