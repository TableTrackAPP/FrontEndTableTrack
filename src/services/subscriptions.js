import axios from 'axios';

const API_URL = 'http://localhost:3000/api/subscriptions';
//const API_URL = 'https://backendtabletrack.onrender.com/api/subscriptions';
const getAuthHeader = () => {
    const accessToken = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${accessToken}` };
};

// Obtém as assinaturas do usuário pelo userID
export const getUserSubscriptions = async (userID) => {
    const response = await axios.get(`${API_URL}/user/${userID}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

// Obtém o link para o portal de gerenciamento de assinatura
export const getCustomerPortalLink = async (userID) => {
    const response = await axios.get(`${API_URL}/portal/${userID}`,{
        headers: getAuthHeader(),
    });
    return response.data.portalUrl;
};

// Cria uma sessão de checkout para assinar um plano
export const createCheckoutSession = async (userID, subscriptionPlan) => {
    const response = await axios.post(`${API_URL}/checkout`, { userID, subscriptionPlan }, {
        headers: getAuthHeader(),
    });
    return response.data.checkoutUrl;
};
// Verifica status do trial (se é elegível, se já usou, se tem assinatura ativa)
export const getFreeTrialStatus = async (userID) => {
    const response = await axios.get(`${API_URL}/trial/status/${userID}`, {
        headers: getAuthHeader(),
    });
    return response.data;
};

// Inicia o trial grátis de 7 dias
export const startFreeTrial = async (userID) => {
    const response = await axios.post(`${API_URL}/trial/start`, { userID }, {
        headers: getAuthHeader(),
    });
    return response.data; // { message, subscription }
};
