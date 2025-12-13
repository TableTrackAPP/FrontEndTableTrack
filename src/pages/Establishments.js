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
import './../styles/Establishments.css'
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    TextField,
    Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import HomeIcon from "@mui/icons-material/Home";
import SideBar from "../components/SideBar";
import AppFooter from "../components/AppFooter";
import '../styles/NotificationListener.css';
import NotificationListener from "../components/NotificationListener";
import {useLoading} from "../hooks/LoadingContext";

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
    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        const fetchEstablishment = async () => {
            try {
                showLoading('Carregando estabelecimento...'); // Mostra o loading

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
            }finally {
                hideLoading(); // Esconde o loading
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
    const handleNavigation = (path) => {
        navigate(path);
    };
    return (
        <div style={{padding: '20px'}}>
            <NotificationListener />

            <Box className="dashboard-topbar" style={{marginLeft: '20px', marginRight: '20px'}}>


                <div className="home-button-container">
                    <button className="establishment-home-button" onClick={() => handleNavigation('/Dashboard')}>
                        <HomeIcon style={{marginRight: '6px'}}/>
                        <span className="home-button-text">Início</span>
                    </button>
                </div>


                <div className="topbar-row" style={{width: '100%'}}>

                    <Typography
                        className="dashboard-title"
                        style={{width: '100%', textAlign: 'center'}}
                    >
                        Estabelecimento
                    </Typography>
                    <div className="mobile-sidebar">
                        <SideBar/>
                    </div>
                </div>

                <div className="desktop-sidebar">
                    <SideBar/>
                </div>
            </Box>

            <div className="establishment-container">
                <div className="establishment-card">
                    {/* Lado esquerdo */}
                    <div className="establishment-left">
                        <img
                            src={establishment.ImageURL || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'}
                            alt="Logo"
                            className="avatar"
                        />
                        <h3>{establishment.EstablishmentName || 'Estabelecimento'}</h3>
                        <p>{establishment.Address || 'Sem endereço'}</p>
                        <span className="edit-icon">✎</span>
                    </div>

                    {/* Lado direito */}
                    <div className="establishment-right">
                        <h3>{isNewEstablishment ? 'Cadastrar Estabelecimento' : 'Editar Estabelecimento'}</h3>
                        <form onSubmit={handleSubmit} className="establishment-form">
                            <div className="form-group">
                                <label>Nome do Estabelecimento</label>
                                <input
                                    type="text"
                                    name="EstablishmentName"
                                    value={establishment.EstablishmentName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Endereço</label>
                                <input
                                    type="text"
                                    name="Address"
                                    value={establishment.Address}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <label>Descrição</label>
                                <textarea
                                    name="Description"
                                    value={establishment.Description}
                                    onChange={handleChange}
                                    rows="4"
                                ></textarea>
                            </div>

                            <div className="form-group">
                                <label className="upload-button">
                                    Atualizar imagem (logo)
                                    <input type="file" hidden onChange={handleImageChange}/>
                                </label>
                            </div>

                            <button type="submit" className="submit-button">
                                {isNewEstablishment ? 'Criar Estabelecimento' : 'Salvar Alterações'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <AppFooter />

        </div>


    );
};

export default Establishment;
