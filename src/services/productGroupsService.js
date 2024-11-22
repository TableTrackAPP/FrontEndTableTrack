// src/services/productGroupsService.js
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/productGroups';

const getAuthHeader = () => {
    const accessToken = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${accessToken}` };
};

export const getProductGroups = async () => {
    const response = await axios.get(API_URL, { headers: getAuthHeader() });
    return response.data;
};

export const createProductGroup = async (groupData) => {
    const response = await axios.post(API_URL, groupData, { headers: getAuthHeader() });
    return response.data;
};

export const updateProductGroup = async (groupID, groupData) => {
    const endpoint = `${API_URL}/${groupID}`;
    console.log(`Calling endpoint: PUT ${endpoint}`); // Adicionado console.log para rastrear o endpoint
    console.log('Group data: ', groupData);
    const response = await axios.put(endpoint, groupData, { headers: getAuthHeader() });
    return response.data;
};


export const deleteProductGroup = async (groupID) => {
    const response = await axios.delete(`${API_URL}/${groupID}`, { headers: getAuthHeader() });
    return response.data;
};

export const getProductGroupsByUserID = async (userID) => {
    const response = await axios.get(`${API_URL}/byUser/${userID}`, { headers: getAuthHeader() });
    return response.data;
};

export const getProductGroupsByEstablishmentId = async (establishmentID) => {
    const response = await axios.get(`${API_URL}/byEstablishment/${establishmentID}`, { headers: getAuthHeader() });
    return response.data;
};
