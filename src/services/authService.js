// src/services/authService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // URL do back-end

export const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/users/login`, { email, password });
    return response.data;
};

export const register = async (userData) => {
    const response = await axios.post(`${API_URL}/users`, userData);
    return response.data;
};

export const forgotPassword = async (email) => {
    const response = await axios.post(`${API_URL}/users/forgot-password`, { email });
    return response.data;
};

export const validateResetCode = async (email, resetToken) => {
    const response = await axios.post(`${API_URL}/users/validate-reset-code`, { email, resetToken });
    return response.data;
};

export const resetPassword = async (email, resetToken, newPassword) => {
    const response = await axios.post(`${API_URL}/users/reset-password`, { email, resetToken, newPassword });
    return response.data;
};
