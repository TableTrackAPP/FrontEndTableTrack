// src/services/firebaseService.js
import axios from 'axios';

//const IMAGE_UPLOAD_URL = 'http://localhost:3000/api/upload';
const IMAGE_UPLOAD_URL = 'https://backendtabletrack.onrender.com/api/upload';

// Função para obter o token de autenticação
const getAuthHeader = () => {
    const accessToken = localStorage.getItem('accessToken');
    return { Authorization: `Bearer ${accessToken}` };
};

// Upload não remove arquivos: a associação é alterada apenas ao salvar.
export const uploadImage = async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    try {
        const response = await axios.post(IMAGE_UPLOAD_URL, formData, {
            headers: {
                ...getAuthHeader(),
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        throw error;
    }
};