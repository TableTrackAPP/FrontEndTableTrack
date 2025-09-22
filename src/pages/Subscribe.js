import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext';
import { getFromLocalStorage } from '../utils/storageUtils';
import { getUserSubscriptions, getCustomerPortalLink, createCheckoutSession } from '../services/subscriptions';
import '../styles/Subscribe.css';
import {Box, Button, Typography} from "@mui/material";
import SideBar from "../components/SideBar";
import HomeIcon from '@mui/icons-material/Home';
import AppFooter from "../components/AppFooter";
import NotificationListener from "../components/NotificationListener";


const Subscribe = () => {
    const [subscriptions, setSubscriptions] = useState(); // 🔹 Agora começa com um array vazio
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
                console.log('user id', userData.userID);
                const userSubscriptions = await getUserSubscriptions(userData.userID);
                console.log('se tem subscriptions',userSubscriptions);
                setSubscriptions(userSubscriptions); // 🔹 Garante que seja um array
                console.log('teste', userSubscriptions.SubscriptionStatus)
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
    const hasActiveSubscription = subscriptions && subscriptions.SubscriptionStatus === 'Active';

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
        showLoading('Redirecionando para o pagamento...');
        const userData = getFromLocalStorage('userData');

        // 1. Abrir a aba imediatamente
        const newWindow = window.open('', '_blank');

        try {
            // 2. Fazer a requisição normalmente
            const checkoutUrl = await createCheckoutSession(userData.userID, subscriptionPlan);

            // 3. Redirecionar a nova aba para a URL recebida
            if (newWindow) {
                newWindow.location.href = checkoutUrl;
            } else {
                showToast('Não foi possível abrir a nova aba.', 'error');
            }
        } catch (error) {
            showToast('Erro ao iniciar o pagamento.', 'error');

            // 4. Fecha a nova aba se houve erro
            if (newWindow) {
                newWindow.close();
            }
        } finally {
            hideLoading();
        }
    };


    if (loading) {
        return (
            <div style={{ backgroundColor: '#eef0fb', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>Carregando...</p>
            </div>
        );
    }

    const traduzirPlano = (plano) => {
        if (plano === 'Monthly') return 'Mensal';
        if (plano === 'Free') return 'Gratuito';
        return plano;
    };

    const traduzirStatus = (status) => {
        if (status === 'Active') return 'Ativo';
        if (status === 'Inactive') return 'Inativo';
        return status;
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div style={{
            backgroundColor: '#eef0fb',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ flex: 1 }}>
                <div style={{ marginTop: '10px' }}></div>

                <NotificationListener />

                <Box className="dashboard-topbar" style={{marginLeft: '20px', marginRight: '20px'}}>


                <div className="home-button-container">
                    <button className="home-button" onClick={() => handleNavigation('/Dashboard')}>
                        <HomeIcon style={{marginRight: '6px'}}/>
                        <span className="home-button-text">Início</span>
                    </button>
                </div>


                <div className="topbar-row" style={{width: '100%'}}>

                    <Typography
                        className="dashboard-title"
                        style={{width: '100%', textAlign: 'center'}}
                    >
                        Gerenciamento de Assinatura
                    </Typography>
                    <div className="mobile-sidebar">
                        <SideBar/>
                    </div>
                </div>

                <div className="desktop-sidebar">
                    <SideBar/>
                </div>
            </Box>

            {hasActiveSubscription ? (
                <div className="subscribe-page">
                    <h2 className="subscribe-title">Suas Assinaturas</h2>

                    <div className="plan-card">
                        <div>
                        <p><strong>Plano:</strong> {traduzirPlano(subscriptions.SubscriptionPlan)}</p>
                            <p><strong>Status:</strong> {traduzirStatus(subscriptions.SubscriptionStatus)}</p>
                            <p>
                                <strong>Vencimento:</strong> {new Date(subscriptions.SubscriptionEndDate).toLocaleDateString()}
                            </p>

                        </div>


                    </div>
                    <button
                        onClick={handleManageSubscription}
                        className="manage-subscription-button"
                    >
                        Cancelar e gerenciar Assinatura
                    </button>

                </div>
            ) : (
                <div className="subscribe-page">
                    <h2 className="subscribe-title">Planos e preços flexíveis</h2>
                    <p className="subscribe-subtitle">
                        Escolha um plano que se encaixe com o seu negócio e comece agora mesmo.
                    </p>

                    <div className="plans">
                        <div className="plan-card">
                            <div className="plan-title">Mensal</div>
                            <div className="plan-price">R$ 24,99</div>
                            <div className="plan-period">/ mês</div>
                            <ul className="plan-features">
                                <li>Acesso completo ao sistema</li>
                                <li>Cancelamento a qualquer momento</li>
                            </ul>
                            <button onClick={() => handleSubscribe('Monthly')} className="subscribe-button">
                                ASSINAR
                            </button>
                        </div>

                        <div className="plan-card">
                            <div className="plan-title">Anual</div>
                            <div className="plan-price">R$ 249,99</div>
                            <div className="plan-period">/ ano</div>
                            <ul className="plan-features">
                                <li>Todos os benefícios do plano mensal</li>
                                <li>Economize mais de 35%</li>
                            </ul>
                            <button onClick={() => handleSubscribe('Annual')} className="subscribe-button">
                                ASSINAR
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>

            <AppFooter />

        </div>
    );

};

export default Subscribe;
