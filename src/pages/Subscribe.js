import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext';
import { getFromLocalStorage } from '../utils/storageUtils';
import { getUserSubscriptions, getCustomerPortalLink, createCheckoutSession } from '../services/subscriptions';

const Subscribe = () => {
    const [subscriptions, setSubscriptions] = useState([]); // 🔹 Agora começa com um array vazio
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        const fetchSubscriptions = async () => {
            const userData = getFromLocalStorage('userData');
            if (!userData) {
                showToast('Você precisa estar logado para acessar essa página.', 'error');
                navigate('/login');
                return;
            }

            try {
                const userSubscriptions = await getUserSubscriptions(userData.userID);
                setSubscriptions(Array.isArray(userSubscriptions) ? userSubscriptions : []); // 🔹 Garante que seja um array
            } catch (error) {
                console.error('Erro ao buscar assinaturas:', error);
                setSubscriptions([]); // 🔹 Evita que subscriptions seja undefined/null
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, [navigate, showToast]);

    // Verifica se o usuário tem uma assinatura ativa
    const hasActiveSubscription = subscriptions.length > 0 && subscriptions.some(sub => sub.subscriptionStatus === 'Active');

    // Abre o portal do Stripe em uma nova aba
    const handleManageSubscription = async () => {
        try {
            showLoading('Abrindo portal de gerenciamento...');
            const userData = getFromLocalStorage('userData');
            const portalUrl = await getCustomerPortalLink(userData.userID);
            window.open(portalUrl, '_blank');
        } catch (error) {
            showToast('Erro ao acessar o portal de gerenciamento.', 'error');
        } finally {
            hideLoading();
        }
    };

    // Inicia o checkout para assinar um plano e abre em nova aba
    const handleSubscribe = async (subscriptionPlan) => {
        try {
            showLoading('Redirecionando para o pagamento...');
            const userData = getFromLocalStorage('userData');
            const checkoutUrl = await createCheckoutSession(userData.userID, subscriptionPlan);
            window.open(checkoutUrl, '_blank');
        } catch (error) {
            showToast('Erro ao iniciar o pagamento.', 'error');
        } finally {
            hideLoading();
        }
    };

    return (
        <div>
            <h2>Gerenciamento de Assinatura</h2>

            {loading ? (
                <p>Carregando...</p>
            ) : hasActiveSubscription ? (
                <div>
                    <h3>Suas Assinaturas</h3>
                    {subscriptions.map((sub) => (
                        <div key={sub.subscriptionID} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
                            <p><strong>Plano:</strong> {sub.subscriptionPlan}</p>
                            <p><strong>Status:</strong> {sub.subscriptionStatus}</p>
                            <p><strong>Vencimento:</strong> {new Date(sub.subscriptionEndDate).toLocaleDateString()}</p>
                        </div>
                    ))}
                    <button onClick={handleManageSubscription} style={{ backgroundColor: 'blue', color: 'white', padding: '10px', marginTop: '10px' }}>
                        Gerenciar Assinatura
                    </button>
                </div>
            ) : (
                <div>
                    <p>Você não tem uma assinatura ativa. Escolha um plano abaixo:</p>

                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div style={{ border: '1px solid #ccc', padding: '15px' }}>
                            <h3>Plano Mensal</h3>
                            <p>R$ XX,XX por mês</p>
                            <button onClick={() => handleSubscribe('Monthly')} style={{ backgroundColor: 'green', color: 'white', padding: '10px' }}>
                                Assinar Mensal
                            </button>
                        </div>

                        <div style={{ border: '1px solid #ccc', padding: '15px' }}>
                            <h3>Plano Anual</h3>
                            <p>R$ XX,XX por ano</p>
                            <button onClick={() => handleSubscribe('Annual')} style={{ backgroundColor: 'orange', color: 'white', padding: '10px' }}>
                                Assinar Anual
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscribe;
