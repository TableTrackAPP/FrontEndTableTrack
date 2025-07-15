// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // URL do back-end
//const API_URL = 'http://192.168.1.8:3000/api'; // URL do back-end

// Função para login e armazenamento dos tokens
export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/users/login`, { email, password });

    // Armazenando informações do usuário e tokens no Local Storage
    localStorage.setItem('userData', JSON.stringify({
        userID: response.data.userID,
        userName: response.data.userName,
        email: response.data.email,
        subscriptionStatus: response.data.subscriptionStatus,
    }));

    // Armazenando tokens no Local Storage
    localStorage.setItem('accessToken', response.data.accessToken);
    localStorage.setItem('refreshToken', response.data.refreshToken);

    return response.data;
};

// Função para registrar um novo usuário
export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
};

// Função para recuperação de senha
export const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL}/users/forgot-password`, { email });
    return response.data;
};

// Função para validar o código de recuperação
export const validateResetCode = async (email, resetToken) => {
    const response = await axios.post(`${API_URL}/users/validate-reset-code`, { email, resetToken });
    return response.data;
};

// Função para redefinir a senha
export const resetPassword = async (email, resetToken, newPassword) => {
    const response = await axios.post(`${API_URL}/users/reset-password`, { email, resetToken, newPassword });
    return response.data;
};

// Função para acessar dados protegidos com o accessToken
export const getProtectedData = async () => {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.get(`${API_URL}/protected-endpoint`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });
    return response.data;
};

// Função para renovar o token de acesso usando o refreshToken
export const refreshAccessToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await axios.post(`${API_URL}/users/refresh-token`, { token: refreshToken });

    // Atualizando o accessToken no Local Storage
    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);

    return accessToken;
};