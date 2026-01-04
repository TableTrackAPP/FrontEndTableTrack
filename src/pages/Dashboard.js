import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import { getFromLocalStorage } from '../utils/storageUtils';
import { getEstablishmentByOwnerID } from '../services/establishmentService';
import SideBar from '../components/SideBar';
import AppFooter from '../components/AppFooter';
import { useOrderNotifications } from "../hooks/OrderNotificationsContext";

import '../styles/Dashboard.css';
import NotificationListener from '../components/NotificationListener';
import CatalogImage from '../assets/catalog.png';
import ProductsImage from '../assets/products.png';
import {useLoading} from "../hooks/LoadingContext";
import { saveToLocalStorage } from '../utils/storageUtils';
import { syncSubscriptionStatus } from '../services/subscriptions';

const Dashboard = () => {
    const [userData, setUserData] = useState(null);
    const [establishmentID, setEstablishmentID] = useState(null);
    const [highlightedCardIndex, setHighlightedCardIndex] = useState(0);
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [establishment, setEstablishment] = useState(null);
    const [showCatalogModal, setShowCatalogModal] = useState(false);
    const [tableIDInput, setTableIDInput] = useState('');
    const [qrBaseDataUrl, setQrBaseDataUrl] = useState(null);
    const [qrDataUrl, setQrDataUrl] = useState(null);
    const [isGeneratingQR, setIsGeneratingQR] = useState(false);
    const { showLoading, hideLoading } = useLoading();
    const status =
        userData?.SubscriptionStatus || userData?.subscriptionStatus;

    const isSubscriber = status === 'Active';
    const { unreadCount, clearUnread } = useOrderNotifications();

    useEffect(() => {
        const fetchUserAndEstablishment = async () => {
            const storedUserData = getFromLocalStorage('userData');
            if (!storedUserData) {
                showToast('Faça login para acessar o Dashboard', 'error');
                navigate('/login');
                return;
            }

            try {
                showLoading('Verificando assinatura...');

                const sync = await syncSubscriptionStatus(storedUserData.userID);

                const updatedUserData = {
                    ...storedUserData,
                    SubscriptionStatus: sync.subscriptionStatus,
                    subscriptionStatus: sync.subscriptionStatus,
                };

                setUserData(updatedUserData);
                saveToLocalStorage('userData', updatedUserData);

                const isSubscriberNow = sync.subscriptionStatus === 'Active';
                if (!isSubscriberNow) return;


                // 3) se não é assinante, para aqui
                if (!isSubscriberNow) return;

                // 4) se é assinante, busca establishment
                showLoading('Carregando Dashboard...');
                const establishmentData = await getEstablishmentByOwnerID(updatedUserData.userID);

                setEstablishment(establishmentData);
                setEstablishmentID(establishmentData.EstablishmentID);

            } catch (error) {
                console.error(error);

                // se 401/403, token expirou → manda login
                const code = error?.response?.status;
                if (code === 401 || code === 403) {
                    showToast('Sessão expirada. Faça login novamente.', 'warning');
                    navigate('/login');
                    return;
                }

                showToast('Erro ao verificar assinatura.', 'error');
                setUserData(storedUserData); // fallback
            } finally {
                hideLoading();
            }
        };

        fetchUserAndEstablishment();
    }, [navigate, showToast]);



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

    // Estados do modal de catálogo/mesa

    const buildCatalogUrl = () => {
        if (!establishmentID) return '';
        return tableIDInput?.trim()
            ? `/catalog/${establishmentID}?tableID=${encodeURIComponent(tableIDInput.trim())}`
            : `/catalog/${establishmentID}`;
    };

    const openCatalogModal = () => {
        setTableIDInput('');
        setQrDataUrl(null);
        setShowCatalogModal(true);
    };

    const closeCatalogModal = () => {
        setShowCatalogModal(false);
        setQrDataUrl(null);
    };

    const goToCatalog = () => {
        const url = buildCatalogUrl();
        if (!url) {
            showToast('Estabelecimento não encontrado.', 'error');
            return;
        }
        navigate(url);
    };

    // carrega imagem de um dataURL/URL e devolve elemento <img>
    const loadImage = (src) =>
        new Promise((resolve, reject) => {
            const img = new Image();
            // tenta evitar canvas "tainted" quando a logo vier de outro domínio (Firebase costuma liberar)
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });

// desenha um "badge" central com texto (número da mesa)
    const composeQRWithText = async (qrDataUrl, text) => {
        const img = await loadImage(qrDataUrl);
        const size = Math.max(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // desenha o QR base
        ctx.drawImage(img, 0, 0, size, size);

        // badge central
        const badgeSize = Math.floor(size * 0.32); // 32% do tamanho do QR
        const badgeX = Math.floor((size - badgeSize) / 2);
        const badgeY = Math.floor((size - badgeSize) / 2);

        // fundo branco com cantos levemente arredondados
        const radius = Math.floor(badgeSize * 0.12);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(badgeX + radius, badgeY);
        ctx.lineTo(badgeX + badgeSize - radius, badgeY);
        ctx.quadraticCurveTo(badgeX + badgeSize, badgeY, badgeX + badgeSize, badgeY + radius);
        ctx.lineTo(badgeX + badgeSize, badgeY + badgeSize - radius);
        ctx.quadraticCurveTo(badgeX + badgeSize, badgeY + badgeSize, badgeX + badgeSize - radius, badgeY + badgeSize);
        ctx.lineTo(badgeX + radius, badgeY + badgeSize);
        ctx.quadraticCurveTo(badgeX, badgeY + badgeSize, badgeX, badgeY + badgeSize - radius);
        ctx.lineTo(badgeX, badgeY + radius);
        ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
        ctx.closePath();
        ctx.fill();

        // texto
        ctx.fillStyle = '#111827'; // cinza-900
        // ajusta a fonte proporcionalmente
        const fontPx = Math.floor(badgeSize * 0.42);
        ctx.font = `bold ${fontPx}px system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text || '—', badgeX + badgeSize / 2, badgeY + badgeSize / 2);

        return canvas.toDataURL('image/png');
    };

// desenha um "badge" central com a logo
    const composeQRWithLogo = async (qrDataUrl, logoUrl) => {
        if (!logoUrl) throw new Error('Logo do estabelecimento não encontrada.');
        const [qrImg, logoImg] = await Promise.all([loadImage(qrDataUrl), loadImage(logoUrl)]);

        const size = Math.max(qrImg.width, qrImg.height);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // desenha o QR base
        ctx.drawImage(qrImg, 0, 0, size, size);

        // badge central (fundo branco) para dar contraste na logo
        const badgeSize = Math.floor(size * 0.30);
        const badgeX = Math.floor((size - badgeSize) / 2);
        const badgeY = Math.floor((size - badgeSize) / 2);

        ctx.fillStyle = '#ffffff';
        const radius = Math.floor(badgeSize * 0.14);
        ctx.beginPath();
        ctx.moveTo(badgeX + radius, badgeY);
        ctx.lineTo(badgeX + badgeSize - radius, badgeY);
        ctx.quadraticCurveTo(badgeX + badgeSize, badgeY, badgeX + badgeSize, badgeY + radius);
        ctx.lineTo(badgeX + badgeSize, badgeY + badgeSize - radius);
        ctx.quadraticCurveTo(badgeX + badgeSize, badgeY + badgeSize, badgeX + badgeSize - radius, badgeY + badgeSize);
        ctx.lineTo(badgeX + radius, badgeY + badgeSize);
        ctx.quadraticCurveTo(badgeX, badgeY + badgeSize, badgeX, badgeY + badgeSize - radius);
        ctx.lineTo(badgeX, badgeY + radius);
        ctx.quadraticCurveTo(badgeX, badgeY, badgeX + radius, badgeY);
        ctx.closePath();
        ctx.fill();

        // desenha a logo dentro do badge, mantendo proporção
        // deixa uma margem interna
        const inner = Math.floor(badgeSize * 0.78);
        const logoW = logoImg.width;
        const logoH = logoImg.height;
        const ratio = Math.min(inner / logoW, inner / logoH);
        const drawW = Math.floor(logoW * ratio);
        const drawH = Math.floor(logoH * ratio);
        const drawX = Math.floor((size - drawW) / 2);
        const drawY = Math.floor((size - drawH) / 2);

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(logoImg, drawX, drawY, drawW, drawH);

        return canvas.toDataURL('image/png');
    };
    const showNormalQR = () => {
        if (!qrBaseDataUrl) return;
        setQrDataUrl(qrBaseDataUrl);
    };

    const showNumberQR = async () => {
        try {
            if (!qrBaseDataUrl) return;
            const text = (tableIDInput || '').trim();
            if (!text) {
                showToast('Informe o número/nome da mesa para gerar com número.', 'warning');
                return;
            }
            const composed = await composeQRWithText(qrBaseDataUrl, text);
            setQrDataUrl(composed);
        } catch (e) {
            console.error(e);
            showToast('Falha ao compor QR com número.', 'error');
        }
    };
// troca storage.googleapis.com -> firebasestorage API, e garante alt=media
    const normalizeLogoUrl = (url) => {
        try {
            const u = new URL(url);

            // 1) caso: já é firebasestorage e faltou alt=media
            if (u.hostname.includes('firebasestorage.googleapis.com')) {
                if (!u.searchParams.has('alt')) u.searchParams.set('alt', 'media');
                return u.toString();
            }

            // 2) caso: veio como storage.googleapis.com/<bucket>/<path>
            if (u.hostname === 'storage.googleapis.com') {
                const bucket = u.pathname.split('/')[1]; // tabletrack-8813f.appspot.com
                const objectPath = u.pathname.split('/').slice(2).join('/'); // 1758...png
                // monta a rota do Firebase Storage API
                const api = new URL(
                    `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}`
                );
                api.searchParams.set('alt', 'media');
                // se você tiver o token salvo junto da URL original, reanexe:
                const token = u.searchParams.get('token');
                if (token) api.searchParams.set('token', token);
                return api.toString();
            }
        } catch (_) {}
        return url; // se não deu pra normalizar, volta a original
    };

    const showLogoQR = async () => {
        try {
            if (!qrBaseDataUrl) return;
            let logoUrl = establishment?.ImageURL;
            if (!logoUrl) {
                const userData = getFromLocalStorage('userData');
                if (!userData) throw new Error('Usuário não autenticado.');

                const ownerID = userData.userID;
                const data = await getEstablishmentByOwnerID(ownerID);

                if (!data || !data.ImageURL) {
                    showToast('Cadastre uma logo do estabelecimento para usar “Com logo”.', 'warning');
                    return;
                }


                logoUrl = data.ImageURL;
                console.log(logoUrl);
            }
            const composed = await composeQRWithLogo(qrBaseDataUrl, normalizeLogoUrl(logoUrl));
            setQrDataUrl(composed);
        } catch (e) {
            console.error(e);
            showToast('Falha ao compor QR com logo (verifique CORS da imagem).', 'error');
        }
    };


    const generateQRCode = async () => {
        try {
            setIsGeneratingQR(true);
            const url = buildCatalogUrl();
            if (!url) {
                showToast('Estabelecimento não encontrado.', 'error');
                return;
            }

            const mod = await import('qrcode');
            const toDataURL = mod?.toDataURL || mod?.default?.toDataURL;
            if (typeof toDataURL !== 'function') {
                showToast('Biblioteca de QR Code não carregou corretamente.', 'error');
                return;
            }

            const fullUrl = `${window.location.origin}${url}`;
            const base = await toDataURL(fullUrl, {
                errorCorrectionLevel: 'M',
                margin: 2,
                scale: 6, // boa resolução pra imprimir
            });

            setQrBaseDataUrl(base); // <- guarda o QR puro
            setQrDataUrl(base);     // <- exibe o normal inicialmente
            showToast('QR Code gerado!', 'success');
        } catch (e) {
            console.error(e);
            showToast('Falha ao gerar o QR Code.', 'error');
        } finally {
            setIsGeneratingQR(false);
        }
    };



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

                        <div
                            className="dashboard-action-card"
                            onClick={() => {
                                clearUnread();       // limpa notificações ao entrar
                                navigate('/orders');
                            }}
                        >
                            {/* Badge de novos pedidos */}
                            {unreadCount > 0 && (
                                <div className="dashboard-order-badge">
                                    {unreadCount} NOVO(S) PEDIDO(S){unreadCount > 1 ? 's' : ''}
                                </div>
                            )}

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


                        <div className="dashboard-action-card" onClick={openCatalogModal}>


                            <img
                                src={CatalogImage}
                                alt="Acessar Catálogo"
                                className="dashboard-action-image"
                            />
                            <div className="dashboard-action-content">
                                <h3 className="dashboard-action-title">Acessar Catálogo / QR Code
                                </h3>
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
            {showCatalogModal && (
                <div className="tt-modal-backdrop">
                    <div className="tt-modal">
                        <h3 style={{ marginTop: 0 }}>Acessar Catálogo / QR por Mesa</h3>

                        <label className="tt-label">Número da mesa</label>
                        <input
                            className="tt-input"
                            value={tableIDInput}
                            onChange={(e) => setTableIDInput(e.target.value)}
                            placeholder="Coloque o número da mesa"
                        />

                        <div className="tt-actions">
                            <button className="btn-card" onClick={goToCatalog}>
                                Ir para catálogo
                            </button>
                            <button className="btn-card" onClick={generateQRCode} disabled={isGeneratingQR}>
                                {isGeneratingQR ? 'Gerando...' : 'Gerar QR Code'}
                            </button>
                            <button className="btn-card btn-ghost" onClick={closeCatalogModal}>
                                Fechar
                            </button>
                        </div>

                        {qrDataUrl && (
                            <div className="tt-qr-wrapper">
                                <img src={qrDataUrl} alt="QR Code da mesa" className="tt-qr-image" />
                                <a className="tt-download" href={qrDataUrl} download={`qrcode-${tableIDInput || 'catalogo'}.png`}>
                                    Baixar QR Code
                                </a>
                                <p className="tt-url-hint">
                                    URL: <code>{window.location.origin + buildCatalogUrl()}</code>
                                </p>
                            </div>
                        )}

                        {qrBaseDataUrl && (
                            <div className="tt-variant-actions">
                                <button className="tt-btn tt-btn-light" onClick={showNormalQR}>Normal</button>
                                <button className="tt-btn tt-btn-number" onClick={showNumberQR}>Com número</button>
                                <button className="tt-btn tt-btn-logo" onClick={showLogoQR}>Com logo</button>
                            </div>
                        )}

                    </div>
                </div>
            )}

            <AppFooter/>
        </div>
    );
};

export default Dashboard;