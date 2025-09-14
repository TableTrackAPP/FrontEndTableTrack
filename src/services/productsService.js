// src/services/productsService.js
import axios from 'axios';

//const API_URL = 'http://localhost:3000/api/products';
const API_URL = 'https://backendtabletrack.onrender.com/api/products';
const getAuthHeader = () => {
    const accessToken = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${accessToken}` };
};

export const getProducts = async () => {
    const response = await axios.get(API_URL, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const createProduct = async (productData) => {
    const response = await axios.post(API_URL, productData, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const updateProduct = async (productID, productData) => {
    const response = await axios.put(`${API_URL}/${productID}`, productData, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const deleteProduct = async (productID) => {
    const response = await axios.delete(`${API_URL}/${productID}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const getProductsByUserID = async (userID) => {
    const response = await axios.get(`${API_URL}/user/${userID}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

export const getProductsByEstablishmentId = async (establishmentID) => {
    const response = await axios.get(`${API_URL}/establishment/${establishmentID}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};
