import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import { getFromLocalStorage } from '../utils/storageUtils';
import { getEstablishmentByOwnerID } from '../services/establishmentService';
import SideBar from '../components/SideBar';
import AppFooter from '../components/AppFooter';

import '../styles/Dashboard.css';
import NotificationListener from '../components/NotificationListener';
import EditIcon from '@mui/icons-material/Edit';
import CatalogImage from '../assets/catalog.png';
import ProductsImage from '../assets/products.png';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [establishmentID, setEstablishmentID] = useState(null);
    const [highlightedCardIndex, setHighlightedCardIndex] = useState(0);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [establishment, setEstablishment] = useState(null);

    useEffect(() => {
        const fetchUserAndEstablishment = async () => {
            const storedUserData = getFromLocalStorage('userData');
            if (storedUserData) {
                setUserData(storedUserData);
                try {
                    const establishmentData = await getEstablishmentByOwnerID(storedUserData.userID);
                    if (establishmentData) {
                        setEstablishment(establishmentData);
                        setEstablishmentID(establishmentData.EstablishmentID);
                    }
                } catch (error) {
                    showToast('Erro ao carregar informações do estabelecimento.', 'error');
                }
            } else {
                showToast('Faça login para acessar o Dashboard', 'error');
                navigate('/login');
            }
        };
        fetchUserAndEstablishment();
    }, [navigate, showToast]);

    const isSubscriber = userData?.subscriptionStatus === 'Active';

    useEffect(() => {
        if (!isSubscriber) {
            const interval = setInterval(() => {
                setHighlightedCardIndex(prev => (prev + 1) % 4);
            }, 3500);
            return () => clearInterval(interval);
        }
    }, [isSubscriber]);

    if (!userData) return <div>Carregando...</div>;


    const renderCard = (card, index) => (
        <div className={`dashboard-card ${card.cardClass}`} key={index}>
            <div className="card-content">
                <div className={`dashboard-avatar ${card.avatarClass}`}>{card.icon}</div>
                <h3 className="card-title">{card.title}</h3>
                <div className="card-buttons-centered">
                    {card.buttons.map((btn, i) => (
                        <button
                            key={i}
                            className={`btn-card ${card.buttonClass}`}
                            onClick={btn.onClick}
                            disabled={btn.disabled}
                        >
                            {btn.text}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );




    return (
        <div className="dashboard-container">
            <NotificationListener />
            <div className="dashboard-topbar">
                <div className="topbar-row">
                    <h2 className="dashboard-title">Bem-vindo, {userData.userName}!</h2>
                    <div className="mobile-sidebar">
                        <SideBar/>
                    </div>
                </div>
                <div className="dashboard-actions">
                    <button className="btn-subscribe-top" onClick={() => navigate('/subscribe')}>
                        Gerenciar Assinatura
                    </button>
                    <div className="desktop-sidebar">
                        <SideBar/>
                    </div>
                </div>
            </div>

            {isSubscriber ? (
                <div className="dashboard-panel">
                    <h2 className="dashboard-section-title">Painel do Assinante</h2>


                    <div className="entry-card" onClick={() => navigate('/establishments')}>

                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '16px',
                            marginTop: '20px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}
                    >

                        <div className="dashboard-action-card" onClick={() => navigate('/establishments')}>
                            <img
                                src={"https://i.pinimg.com/736x/a4/c0/61/a4c061994fc29ccbb0e6fd829f6951e7.jpg"}
                                alt="Gerenciar Produtos"
                                className="dashboard-action-image"
                            />
                            <div className="dashboard-action-content">
                                <h3 className="dashboard-action-title">Seu estabelecimento</h3>
                                <p className="dashboard-action-description">
                                    Edite as informações do seu estabelecimento
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-action-card" onClick={() => navigate('/products')}>
                            <img
                                src={ProductsImage}
                                alt="Gerenciar Produtos"
                                className="dashboard-action-image"
                            />
                            <div className="dashboard-action-content">
                                <h3 className="dashboard-action-title">Gerenciar Produtos</h3>
                                <p className="dashboard-action-description">
                                    Cadastre, edite e organize os produtos do seu cardápio
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-action-card" onClick={() => navigate('/orders')}>
                            <img
                                src="https://i.pinimg.com/736x/60/61/6e/60616ea80a6c86b0db76cc5625ad6636.jpg"
                                alt="Visualizar Pedidos"
                                className="dashboard-action-image"
                            />
                            <div className="dashboard-action-content">
                                <h3 className="dashboard-action-title">Visualizar Pedidos</h3>
                                <p className="dashboard-action-description">
                                    Acompanhe e atualize os pedidos recebidos no sistema
                                </p>
                            </div>
                        </div>

                        <div className="dashboard-action-card" onClick={() => {
                            const tableID = prompt('Digite o número ou nome da mesa (opcional):', '');
                            const url = tableID
                                ? `/catalog/${establishmentID}?tableID=${encodeURIComponent(tableID)}`
                                : `/catalog/${establishmentID}`;
                            navigate(url);
                        }}>
                            <img
                                src={CatalogImage}
                                alt="Acessar Catálogo"
                                className="dashboard-action-image"
                            />
                            <div className="dashboard-action-content">
                                <h3 className="dashboard-action-title">Acessar Catálogo</h3>
                                <p className="dashboard-action-description">
                                    Veja o catálogo do seu estabelecimento como o cliente vê.
                                </p>
                            </div>
                        </div>
                    </div>



                </div>
            ) : (
                <div className="dashboard-panel">
                    <div className="non-subscriber-header">
                        <h2 className="dashboard-section-title">Você ainda não é assinante.</h2>
                        <p className="dashboard-subtitle">Para aproveitar todas as funções do Table Track, assine agora
                            mesmo!</p>
                        <button className="btn-subscribe-top" onClick={() => navigate('/subscribe')}>
                            Assine agora
                        </button>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            gap: '16px',
                            marginTop: '20px',
                            flexWrap: 'wrap',
                            justifyContent: 'center',
                        }}
                    >
                        {[
                            {
                                title: 'Seu estabelecimento',
                                description: 'Edite as informações do seu estabelecimento',
                                image: 'https://i.pinimg.com/736x/a4/c0/61/a4c061994fc29ccbb0e6fd829f6951e7.jpg',
                            },
                            {
                                title: 'Gerenciar Produtos',
                                description: 'Cadastre, edite e organize os produtos do seu cardápio',
                                image: ProductsImage,
                            },
                            {
                                title: 'Visualizar Pedidos',
                                description: 'Acompanhe e atualize os pedidos recebidos no sistema',
                                image: 'https://i.pinimg.com/736x/60/61/6e/60616ea80a6c86b0db76cc5625ad6636.jpg',
                            },
                            {
                                title: 'Acessar Catálogo',
                                description: 'Veja o catálogo do seu estabelecimento como o cliente vê.',
                                image: CatalogImage,
                            }
                        ].map((card, index) => (
                            <div
                                key={index}
                                className={`dashboard-action-card disabled ${highlightedCardIndex === index ? 'highlight-card highlight-' + index : ''}`}
                            >
                                <img
                                    src={card.image}
                                    alt={card.title}
                                    className="dashboard-action-image"
                                />
                                <div className="dashboard-action-content">
                                    <h3 className="dashboard-action-title">{card.title}</h3>
                                    <p className="dashboard-action-description">{card.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>)}

            <AppFooter/>
        </div>
    );
};

export default Dashboard;
