import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext';
import { getFromLocalStorage } from '../utils/storageUtils';
import {
    getUserSubscriptions,
    getCustomerPortalLink,
    createCheckoutSession,
    getFreeTrialStatus,
    startFreeTrial
} from '../services/subscriptions';
import '../styles/Subscribe.css';
import { Box, Typography } from '@mui/material';
import SideBar from '../components/SideBar';
import HomeIcon from '@mui/icons-material/Home';
import AppFooter from '../components/AppFooter';
import NotificationListener from '../components/NotificationListener';

const Subscribe = () => {
    const [subscriptions, setSubscriptions] = useState(null);
    const [loading, setLoading] = useState(true);
    const [trialStatus, setTrialStatus] = useState(null);

    const navigate = useNavigate();
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        const fetchData = async () => {
            const userData = getFromLocalStorage('userData');

            if (!userData) {
                showToast('Você precisa estar logado para acessar essa página.', 'error');
                navigate('/login');
                return;
            }

            setLoading(true);

            try {
                // 1) Assinatura (última)
                try {
                    const userSubscriptions = await getUserSubscriptions(userData.userID);
                    setSubscriptions(userSubscriptions);
                } catch (err) {
                    // usuário pode não ter assinatura ainda
                    setSubscriptions(null);
                }

                // 2) Trial status (elegível / já usou / tem ativa)
                try {
                    const ts = await getFreeTrialStatus(userData.userID);
                    setTrialStatus(ts);
                } catch (err) {
                    // se der erro, só não mostra o card do trial
                    setTrialStatus(null);
                }
            } catch (err) {
                console.error('Erro geral ao carregar dados:', err);
                showToast('Erro ao carregar informações de assinatura.', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate, showToast]);

    const hasAccess = !!(trialStatus?.hasActiveSubscription || subscriptions?.SubscriptionStatus === 'Active');
    const isStripeSubscription = !!subscriptions?.StripeSubscriptionID && subscriptions?.PaymentMethod !== 'FreeTrial';

    const handleStartFreeTrial = async () => {
        try {
            showLoading('Iniciando trial grátis...');
            const userData = getFromLocalStorage('userData');

            await startFreeTrial(userData.userID);

            showToast('Trial grátis ativado por 7 dias!', 'success');

            const ts = await getFreeTrialStatus(userData.userID);
            setTrialStatus(ts);

            const userSubscriptions = await getUserSubscriptions(userData.userID);
            setSubscriptions(userSubscriptions);
        } catch (error) {
            const msg = error?.response?.data?.message || 'Não foi possível iniciar o trial.';
            showToast(msg, 'error');
        } finally {
            hideLoading();
        }
    };

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

    const handleSubscribe = async (subscriptionPlan) => {
        showLoading('Redirecionando para o pagamento...');
        const userData = getFromLocalStorage('userData');

        // Abrir a aba imediatamente (evita bloqueio de popup)
        const newWindow = window.open('', '_blank');

        try {
            const checkoutUrl = await createCheckoutSession(userData.userID, subscriptionPlan);

            if (newWindow) {
                newWindow.location.href = checkoutUrl;
            } else {
                showToast('Não foi possível abrir a nova aba.', 'error');
            }
        } catch (error) {
            showToast('Erro ao iniciar o pagamento.', 'error');

            if (newWindow) {
                newWindow.close();
            }
        } finally {
            hideLoading();
        }
    };

    if (loading) {
        return (
            <div
                style={{
                    backgroundColor: '#eef0fb',
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <p>Carregando...</p>
            </div>
        );
    }

    const traduzirPlano = (plano) => {
        if (plano === 'Monthly') return 'Mensal';
        if (plano === 'Trial') return 'Gratuito (Trial)';
        return plano;
    };

    const traduzirStatus = (status) => {
        const map = {
            Active: 'Ativo',
            Inactive: 'Inativo',
            Trialing: 'Em período de teste',
            Past_Due: 'Pagamento pendente',
            Canceled: 'Cancelado',
            Expired: 'Expirado',
            Incomplete: 'Pagamento incompleto',
            Paid: 'Pago',
            Unpaid: 'Não pago',
            Failed: 'Falhou'
        };

        return map[status] || status;
    };

    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div
            style={{
                backgroundColor: '#eef0fb',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <div style={{ flex: 1 }}>
                <div style={{ marginTop: '10px' }} />

                <NotificationListener />

                <Box className="dashboard-topbar" style={{ marginLeft: '20px', marginRight: '20px' }}>
                    <div className="home-button-container">
                        <button className="home-button" onClick={() => handleNavigation('/Dashboard')}>
                            <HomeIcon style={{ marginRight: '6px' }} />
                            <span className="home-button-text">Início</span>
                        </button>
                    </div>

                    <div className="topbar-row" style={{ width: '100%' }}>
                        <Typography className="dashboard-title" style={{ width: '100%', textAlign: 'center' }}>
                            Gerenciamento de Assinatura
                        </Typography>
                        <div className="mobile-sidebar">
                            <SideBar />
                        </div>
                    </div>

                    <div className="desktop-sidebar">
                        <SideBar />
                    </div>
                </Box>

                {hasAccess ? (
                    <div className="subscribe-page">
                        <h2 className="subscribe-title">Suas Assinaturas</h2>

                        {/* Ajustado para não conflitar com outras telas */}
                        <div className="subscribe-plan-card">
                            <div>
                                <p>
                                    <strong>Plano:</strong> {traduzirPlano(subscriptions?.SubscriptionPlan || 'Trial')}
                                </p>
                                <p>
                                    <strong>Status:</strong> {traduzirStatus(subscriptions?.SubscriptionStatus || 'Active')}
                                </p>

                                {subscriptions?.SubscriptionEndDate && (
                                    <p>
                                        <strong>Vencimento:</strong>{' '}
                                        {new Date(subscriptions.SubscriptionEndDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </div>

                        {isStripeSubscription ? (
                            <button onClick={handleManageSubscription} className="manage-subscription-button">
                                Cancelar e gerenciar Assinatura
                            </button>
                        ) : (
                            <p className="subscribe-subtitle">
                                Seu acesso é via <strong>trial grátis</strong>. Ao final do período, escolha um plano para continuar.
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="subscribe-page">
                        <h2 className="subscribe-title">Planos e preços flexíveis</h2>
                        <p className="subscribe-subtitle">
                            Escolha um plano que se encaixe com o seu negócio e comece agora mesmo.
                        </p>

                        {/* Ajustado: .plans -> .subscribe-plans */}
                        <div className="subscribe-plans">
                            <div className="subscribe-plan-card">
                                <div className="subscribe-plan-title">Mensal</div>
                                <div className="subscribe-plan-price">R$ 24,99</div>
                                <div className="subscribe-plan-period">/ mês</div>
                                <ul className="subscribe-plan-features">
                                    <li>Acesso completo ao sistema</li>
                                    <li>Cancelamento a qualquer momento</li>
                                </ul>
                                <button onClick={() => handleSubscribe('Monthly')} className="subscribe-button">
                                    ASSINAR
                                </button>
                            </div>

                            <div className="subscribe-plan-card">
                                <div className="subscribe-plan-title">Anual</div>
                                <div className="subscribe-plan-price">R$ 249,99</div>
                                <div className="subscribe-plan-period">/ ano</div>
                                <ul className="subscribe-plan-features">
                                    <li>Todos os benefícios do plano mensal</li>
                                    <li>Economize mais de 35%</li>
                                </ul>
                                <button onClick={() => handleSubscribe('Annual')} className="subscribe-button">
                                    ASSINAR
                                </button>
                            </div>

                            {trialStatus?.eligible && (
                                <div className="subscribe-plan-card">
                                    <div className="subscribe-plan-title">Gratuito</div>
                                    <div className="subscribe-plan-price">7 dias</div>
                                    <div className="subscribe-plan-period">sem cartão</div>
                                    <ul className="subscribe-plan-features">
                                        <li>Acesso completo ao sistema</li>
                                        <li>Sem cadastro de cartão</li>
                                        <li>Ativação imediata</li>
                                    </ul>
                                    <button onClick={handleStartFreeTrial} className="subscribe-button">
                                        ATIVAR TRIAL
                                    </button>
                                </div>
                            )}

                            {trialStatus && !trialStatus.eligible && trialStatus.used && (
                                <div className="subscribe-subtitle" style={{ marginTop: 12 }}>
                                    <p>Você já utilizou o trial grátis.</p>
                                    <div className="subscribe-plan-period">
                                        Aproveite os melhores preços do mercado com os outros planos
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <AppFooter />
        </div>
    );
};

export default Subscribe;
