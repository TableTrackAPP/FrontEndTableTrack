// src/services/establishmentService.js
import axios from 'axios';

//const API_URL = 'http://localhost:3000/api/establishments';
const API_URL = 'https://backendtabletrack.onrender.com/api/establishments';

// Função auxiliar para obter o token de autenticação
const getAuthHeader = () => {
    const accessToken = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${accessToken}` };
};


// Função para obter um estabelecimento pelo ID
export const getEstablishment = async (establishmentID) => {
    try {
        const response = await axios.get(`${API_URL}/${establishmentID}`);
        return response.data;
    } catch (error) {
        console.error('Erro ao obter o estabelecimento:', error);
        throw error;
    }
};

// Função para obter um estabelecimento pelo ID
export const getEstablishmentByOwnerID = async (OwnerID) => {
    try {
        const response = await axios.get(`${API_URL}/ByOwnerID/${OwnerID}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao obter o estabelecimento:', error);
        throw error;
    }
};

// Função para criar um novo estabelecimento
export const createEstablishment = async (establishmentData) => {
    try {
        const response = await axios.post(API_URL, establishmentData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar estabelecimento:', error);
        throw error;
    }
};

// Função para atualizar um estabelecimento existente
export const updateEstablishment = async (establishmentID, establishmentData) => {
    try {
        const response = await axios.put(`${API_URL}/${establishmentID}`, establishmentData, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao atualizar estabelecimento:', error);
        throw error;
    }
};

// Função para deletar um estabelecimento pelo ID
export const deleteEstablishment = async (establishmentID) => {
    try {
        const response = await axios.delete(`${API_URL}/${establishmentID}`, {
            headers: getAuthHeader(),
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao deletar estabelecimento:', error);
        throw error;
    }
};