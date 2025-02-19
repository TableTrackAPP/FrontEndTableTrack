import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import { getFromLocalStorage } from '../utils/storageUtils';
import { getEstablishmentByOwnerID } from '../services/establishmentService';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [establishmentID, setEstablishmentID] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const fetchUserAndEstablishment = async () => {
            const storedUserData = getFromLocalStorage('userData');
            if (storedUserData) {
                setUserData(storedUserData);

                try {
                    const establishment = await getEstablishmentByOwnerID(storedUserData.userID);
                    if (establishment) {
                        setEstablishmentID(establishment.EstablishmentID);
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

    if (!userData) {
        return <div>Carregando...</div>;
    }

    const isSubscriber = userData.subscriptionStatus === 'Active';

    return (
        <div style={{ padding: '20px' }}>
            <h1>Bem-vindo, {userData.userName}!</h1>
            <p>Email: {userData.email}</p>

            {isSubscriber ? (
                <div>
                    <h2>Conteúdo Exclusivo para Assinantes</h2>
                    <p>Aqui está o conteúdo que somente assinantes podem acessar.</p>

                    <div className="dashboard-sections">
                        <div>
                            <h2>Gestão da Loja</h2>
                            <button onClick={() => navigate('/establishments')} style={{ marginBottom: '10px' }}>
                                Editar Catálogo
                            </button>
                            <button onClick={() => navigate('/products')} style={{ marginBottom: '10px' }}>
                                Gerenciar Produtos
                            </button>
                        </div>

                        <div>
                            <h2>Pedidos</h2>
                            <button onClick={() => navigate('/orders')}>
                                Visualizar Pedidos
                            </button>
                        </div>

                        <div>
                            <h2>Catálogo</h2>
                            <button
                                onClick={() => {
                                    const tableID = prompt('Digite o número ou nome da mesa (opcional):', '');
                                    const url = tableID
                                        ? `/catalog/${establishmentID}?tableID=${encodeURIComponent(tableID)}`
                                        : `/catalog/${establishmentID}`;
                                    navigate(url);
                                }}
                                style={{ marginTop: '10px' }}
                                disabled={!establishmentID}
                            >
                                Acessar Catálogo
                            </button>
                        </div>
                    </div>

                    {/* 🔹 Botão para Gerenciamento da Assinatura */}
                    <div style={{ marginTop: '20px' }}>
                        <button
                            onClick={() => navigate('/subscribe')}
                            style={{
                                backgroundColor: '#007bff',
                                color: 'white',
                                padding: '10px',
                                border: 'none',
                                cursor: 'pointer',
                                borderRadius: '5px',
                                fontSize: '16px'
                            }}
                        >
                            Gerenciar Assinatura
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <h2>Conteúdo Limitado</h2>
                    <p>
                        Você não é assinante.{' '}
                        <button
                            onClick={() => navigate('/subscribe')}
                            style={{
                                color: 'blue',
                                background: 'none',
                                border: 'none',
                                textDecoration: 'underline',
                                cursor: 'pointer',
                            }}
                        >
                            Assine agora
                        </button>{' '}
                        para obter acesso completo!
                    </p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
