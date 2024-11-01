// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();
    const { showToast } = useToast();

    // Carrega os dados do usuário ao montar o componente
    useEffect(() => {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
            setUserData(JSON.parse(storedUserData));
        } else {
            // Se não houver dados do usuário, redireciona para o login
            showToast('Faça login para acessar o Dashboard', 'error');
            navigate('/login');
        }
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

                    {/* Botões para funcionalidades exclusivas */}
                    <div className="dashboard-sections">
                        <div>
                            <h2>Gestão da Loja</h2>
                            <button
                                onClick={() => navigate('/establishments')}
                                style={{ marginBottom: '10px' }}
                            >
                                Editar Catálogo
                            </button>
                            <button
                                onClick={() => navigate('/products')}
                                style={{ marginBottom: '10px' }}
                            >
                                Gerenciar Produtos
                            </button>
                        </div>

                        <div>
                            <h2>Pedidos</h2>
                            <button onClick={() => navigate('/orders')}>
                                Visualizar Pedidos
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h2>Conteúdo Limitado</h2>
                    <p>Você não é assinante. <button onClick={() => navigate('/subscribe')} style={{ color: 'blue', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>Assine agora</button> para obter acesso completo!</p>

                    {/* Exibir botões desabilitados com mensagem explicativa */}
                    <div className="dashboard-sections">
                        <div>
                            <h2>Gestão da Loja</h2>
                            <button
                                disabled
                                style={{ marginBottom: '10px', cursor: 'not-allowed' }}
                            >
                                Assine para Editar o Catálogo
                            </button>
                            <button
                                disabled
                                style={{ marginBottom: '10px', cursor: 'not-allowed' }}
                            >
                                Assine para Gerenciar Produtos
                            </button>
                        </div>

                        <div>
                            <h2>Pedidos</h2>
                            <button disabled style={{ cursor: 'not-allowed' }}>
                                Assine para Visualizar Pedidos
                            </button>
                        </div>
                    </div>

                    {/* Call-to-action para assinatura */}
                    <div style={{ marginTop: '20px' }}>
                        <p>Para acessar todas as funcionalidades, <button onClick={() => navigate('/subscribe')} style={{ color: 'blue', background: 'none', border: 'none', textDecoration: 'underline', cursor: 'pointer' }}>assine agora</button> e aproveite os benefícios completos.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
