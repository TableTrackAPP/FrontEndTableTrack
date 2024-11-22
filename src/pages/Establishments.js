import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import {
    createEstablishment,
    updateEstablishment,
    getEstablishmentByOwnerID
} from '../services/establishmentService';
import { uploadImage } from '../services/firebaseService';
import { getFromLocalStorage } from '../utils/storageUtils'; // Importa as funções utilitárias

const Establishment = () => {
    const [establishment, setEstablishment] = useState({
        EstablishmentName: '',
        Address: '',
        ImageURL: '',
        Description: ''
    });
    const [isNewEstablishment, setIsNewEstablishment] = useState(true);
    const [imageFile, setImageFile] = useState(null); // Estado para armazenar o arquivo de imagem
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchEstablishment = async () => {
            try {
                const userData = getFromLocalStorage('userData');
                if (!userData) throw new Error('Usuário não autenticado.');

                const ownerID = userData.userID;
                const data = await getEstablishmentByOwnerID(ownerID);
                if (data && data.EstablishmentName) {
                    setEstablishment(data);
                    setIsNewEstablishment(false);
                } else {
                    setIsNewEstablishment(true);
                }
            } catch (error) {
                console.log('Erro ao carregar o estabelecimento:', error);
                showToast('Erro ao carregar os dados do estabelecimento', 'error');
            }
        };
        fetchEstablishment();
    }, [showToast]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEstablishment((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleImageChange = (e) => {
        setImageFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let imageUrl = establishment.ImageURL;

            // Upload da imagem para o Firebase se o arquivo for selecionado
            if (imageFile) {
                const uploadData = await uploadImage(imageFile, establishment.ImageURL); // Passa a URL antiga para o upload
                imageUrl = uploadData.url;
            }

            const userData = getFromLocalStorage('userData');
            if (!userData) throw new Error('Usuário não autenticado.');

            const establishmentData = {
                ...establishment,
                ImageURL: imageUrl,
                OwnerID: userData.userID,
            };

            if (isNewEstablishment) {
                await createEstablishment(establishmentData);
                showToast('Estabelecimento criado com sucesso!', 'success');
            } else {
                await updateEstablishment(establishment.EstablishmentID, establishmentData);
                showToast('Estabelecimento atualizado com sucesso!', 'success');
            }

            navigate('/dashboard');
        } catch (error) {
            console.log('Erro ao salvar estabelecimento:', error);
            showToast('Erro ao salvar os dados do estabelecimento', 'error');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>{isNewEstablishment ? 'Cadastrar Estabelecimento' : 'Editar Estabelecimento'}</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Nome do Estabelecimento:</label>
                    <input
                        type="text"
                        name="EstablishmentName"
                        value={establishment.EstablishmentName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Endereço:</label>
                    <input
                        type="text"
                        name="Address"
                        value={establishment.Address}
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label>Descrição:</label>
                    <textarea
                        name="Description"
                        value={establishment.Description}
                        onChange={handleChange}
                        rows="4"
                    />
                </div>

                {/* Exibir imagem atual, se existir */}
                {establishment.ImageURL && (
                    <div>
                        <label>Imagem Atual:</label>
                        <img
                            src={establishment.ImageURL}
                            alt="Imagem do Estabelecimento"
                            style={{ width: '150px', height: '150px', objectFit: 'cover', margin: '10px 0' }}
                        />
                    </div>
                )}

                <div>
                    <label>Atualizar Imagem (Logo):</label>
                    <input
                        type="file"
                        onChange={handleImageChange}
                    />
                </div>

                <button type="submit">{isNewEstablishment ? 'Criar Estabelecimento' : 'Salvar Alterações'}</button>
            </form>
        </div>
    );
};

export default Establishment;
