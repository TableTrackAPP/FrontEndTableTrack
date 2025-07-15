// src/services/orderService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/orders';
//const API_URL = 'http://192.168.1.8:3000/api/orders';

const getAuthHeader = () => {
    const accessToken = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${accessToken}` };
};

// Cria um novo pedido
export const createOrder = async (orderData) => {
    try {
        const response = await axios.post(API_URL, orderData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar pedido:', error);
        throw error;
    }
};


// Obtém um pedido pelo ID
export const getOrderById = async (orderID) => {
    try {
        const response = await axios.get(`${API_URL}/${orderID}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao obter pedido:', error);
        throw error;
    }
};

// Atualiza um pedido pelo ID
export const updateOrder = async (orderID, orderData) => {
    try {
        const response = await axios.put(`${API_URL}/${orderID}`, orderData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        throw error;
    }
};
export const updateStatusOrder = async (orderID, orderData) => {
    try {
        const response = await axios.put(`${API_URL}/updateStatusOrder/${orderID}`, orderData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar pedido:', error);
        throw error;
    }
};

// Exclui um pedido pelo ID
export const deleteOrder = async (orderID) => {
    try {
        const response = await axios.delete(`${API_URL}/${orderID}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao excluir pedido:', error);
        throw error;
    }
};

// Lista todos os pedidos
export const getAllOrders = async () => {
    try {
        const response = await axios.get(API_URL, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao listar pedidos:', error);
        throw error;
    }
};

// Lista pedidos por ID do estabelecimento
export const getOrdersByEstablishmentId = async (establishmentID) => {
    try {
        const response = await axios.get(`${API_URL}/establishment/${establishmentID}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao listar pedidos por estabelecimento:', error);
        throw error;
    }
};
