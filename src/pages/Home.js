import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/Home.css';
import logoImageUrl from '../assets/logoProvisoria.png';
import firstCardImage from '../assets/FirstCardImage.jpg';
import BuildStoreImage from '../assets/StablishmentManagment.png';
import ExploreAndSelectImage from '../assets/ReadingQrCode.png';
import RedirectToWppImage from '../assets/CaptureOrdering.png';
import AssinaturaMensal from '../assets/AssinaturaMensal.png';
import AssinaturaAnual from '../assets/AssinaturaAnual.png';
import AssinaturaGratuita from '../assets/AssinaturaGratuita.png';
import { useNavigate } from 'react-router-dom';
import ContactModal from "../components/ContactModal";

function Home() {
    const [showContactModal, setShowContactModal] = useState(false);
    const navigate = useNavigate();

    const plansSectionRef = useRef(null);
    const howItWorksRef = useRef(null);
    const plansTitleRef = useRef(null);

    const [howStepsVisible, setHowStepsVisible] = useState(false);
    const [plansVisible, setPlansVisible] = useState(false);
    const featuresRef = useRef(null);
    const businessTypesRef = useRef(null);

    const [featuresVisible, setFeaturesVisible] = useState(false);
    const [businessTypesVisible, setBusinessTypesVisible] = useState(false);
    useEffect(() => {
        const el = howItWorksRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHowStepsVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.25 }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        const el = plansTitleRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setPlansVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.4 }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    useEffect(() => {
        const el = featuresRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setFeaturesVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.2 }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, []);

    useEffect(() => {
        const el = businessTypesRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setBusinessTypesVisible(true);
                    obs.disconnect();
                }
            },
            { threshold: 0.25 }
        );

        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    const handleScrollToPlans = () => {
        plansSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScrollToHowItWorks = () => {
        howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleEnterClick = () => {
        const savedUser = localStorage.getItem('userData');
        if (savedUser) {
            navigate('/dashboard');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="app-container">
            <Helmet>
                <title>TableTrack | Cardápio digital com QR Code e pedidos via WhatsApp</title>
                <meta
                    name="description"
                    content="TableTrack é uma plataforma de cardápio digital para restaurantes, bares, cafeterias e lanchonetes. Receba pedidos pelo sistema ou WhatsApp, use QR Code por mesa e gerencie tudo em um só lugar."
                />
                <meta
                    name="robots"
                    content="index, follow"
                />
                <meta
                    property="og:title"
                    content="TableTrack | Cardápio digital com QR Code e pedidos via WhatsApp"
                />
                <meta
                    property="og:description"
                    content="Modernize o atendimento do seu estabelecimento com cardápio digital, QR Code por mesa e pedidos organizados em tempo real."
                />
                <meta property="og:type" content="website"/>
                <meta property="og:image" content={firstCardImage}/>
                <meta
                    name="twitter:card"
                    content="summary_large_image"
                />

                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        "name": "TableTrack",
                        "applicationCategory": "BusinessApplication",
                        "operatingSystem": "Web",
                        "description": "Plataforma de cardápio digital com QR Code por mesa, pedidos pelo sistema e catálogo com pedido via WhatsApp para restaurantes, bares, cafeterias e lanchonetes.",
                        "offers": [
                            {
                                "@type": "Offer",
                                "name": "Plano Gratuito"
                            },
                            {
                                "@type": "Offer",
                                "name": "Plano Mensal"
                            },
                            {
                                "@type": "Offer",
                                "name": "Plano Anual"
                            }
                        ]
                    })}
                </script>
            </Helmet>

            <header className="header">
                <div style={{marginLeft: '5px', marginTop: '10px', cursor: 'pointer'}}>
                    <img src={logoImageUrl} alt="Logo TableTrack" className="small-image"/>
                </div>

                <nav>
                    <div className="headerText" onClick={handleScrollToHowItWorks}>Como funciona</div>
                </nav>

                <nav>
                    <div className="headerText" onClick={handleScrollToPlans}>Planos</div>
                </nav>

                <nav>
                    <div className="headerTextInscrevaSe" onClick={() => navigate('/register')}>Criar conta</div>
                </nav>

                <nav>
                    <button onClick={handleEnterClick}>Entrar</button>
                </nav>
            </header>

            <section className="first-card first-card--hero">
                <div className="first-card__left">
                    <a
                        href="https://www.instagram.com/tabletrackapp/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="first-card__handle"
                    >
                        @TABLETRACKAPP
                    </a>

                    <h1 className="first-card__title">
                        Cardápio digital com <span>QR Code, pedidos online e WhatsApp</span>
                    </h1>

                    <p className="first-card__subtitle">
                        O TableTrack ajuda restaurantes, bares, cafeterias e lanchonetes a vender melhor com
                        cardápio digital, QR Code por mesa, painel de pedidos em tempo real e catálogo com pedido via
                        WhatsApp.
                    </p>

                    <div className="hero-badges">
                        <span>Cardápio digital</span>
                        <span>QR Code por mesa</span>
                        <span>Pedidos via WhatsApp</span>
                        <span>Painel em tempo real</span>
                    </div>

                    <button className="first-card__cta" onClick={() => navigate('/register')}>
                        Começar agora
                    </button>
                </div>

                <div className="first-card__right">
                    <img src={firstCardImage} alt="Cliente acessando cardápio digital em um restaurante"/>
                </div>
            </section>

            <section
                ref={howItWorksRef}
                className={`how-steps ${howStepsVisible ? "is-visible" : ""}`}
            >
                <div className="how-steps__left">
                    <div className="how-steps__title">Como funciona</div>
                    <div className="how-steps__subtitle">
                        Comece rápido e modernize o atendimento do seu negócio
                    </div>
                </div>

                <div className="how-steps__right">
                    <div className="how-steps__item">
                        <div className="how-steps__avatar">
                            <img src={BuildStoreImage} alt="Cadastro do estabelecimento e do cardápio digital"/>
                        </div>
                        <div className="how-steps__text">
                            <div className="how-steps__item-title">Cadastre seu estabelecimento</div>
                            <div className="how-steps__item-desc">
                                Configure seu negócio, adicione a logo, organize categorias e monte seu cardápio digital
                                com facilidade.
                            </div>
                        </div>
                    </div>

                    <div className="how-steps__divider"/>

                    <div className="how-steps__item">
                        <div className="how-steps__avatar">
                            <img src={ExploreAndSelectImage} alt="Cliente escaneando QR Code e escolhendo produtos"/>
                        </div>
                        <div className="how-steps__text">
                            <div className="how-steps__item-title">Clientes acessam pelo QR Code</div>
                            <div className="how-steps__item-desc">
                                Seus clientes escaneiam o QR Code da mesa, visualizam os produtos e montam o pedido pelo
                                celular.
                            </div>
                        </div>
                    </div>

                    <div className="how-steps__divider"/>

                    <div className="how-steps__item">
                        <div className="how-steps__avatar">
                            <img src={RedirectToWppImage} alt="Painel com gestão de pedidos e opção de WhatsApp"/>
                        </div>
                        <div className="how-steps__text">
                            <div className="how-steps__item-title">Receba pedidos do seu jeito</div>
                            <div className="how-steps__item-desc">
                                Escolha entre receber pedidos direto no sistema ou enviar pedidos estruturados para o
                                WhatsApp do estabelecimento.
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section
                ref={featuresRef}
                className={`features-section ${featuresVisible ? 'is-visible' : ''}`}
            >

                <div className="features-header">
                    <h2>Recursos que ajudam no atendimento</h2>
                    <p>
                        Tudo o que você precisa para oferecer um atendimento mais moderno, organizado e prático.
                    </p>
                </div>

                <div className="features-grid">
                    <div className="feature-card">
                        <h3>Cardápio digital</h3>
                        <p>Organize produtos, preços, descrições e fotos em um catálogo online fácil de atualizar.</p>
                    </div>

                    <div className="feature-card">
                        <h3>QR Code por mesa</h3>
                        <p>Crie QR Codes personalizados para identificar mesas e agilizar o fluxo de pedidos.</p>
                    </div>

                    <div className="feature-card">
                        <h3>Pedidos via sistema</h3>
                        <p>Receba pedidos diretamente no painel do estabelecimento com mais controle da operação.</p>
                    </div>

                    <div className="feature-card">
                        <h3>Pedidos via WhatsApp</h3>
                        <p>Ofereça uma opção prática para negócios que preferem receber pedidos direto no WhatsApp.</p>
                    </div>

                    <div className="feature-card">
                        <h3>Painel em tempo real</h3>
                        <p>Acompanhe os pedidos e organize o atendimento com mais clareza para a equipe.</p>
                    </div>

                    <div className="feature-card">
                        <h3>Gestão simples</h3>
                        <p>Edite estabelecimento, produtos e catálogo sem complicação e sem depender de designer.</p>
                    </div>
                </div>
            </section>

            <section
                ref={businessTypesRef}
                className={`business-types-section ${businessTypesVisible ? 'is-visible' : ''}`}
            >
                <h2>Ideal para diferentes tipos de negócio</h2>
                <div className="business-types-grid">
                    <span>Restaurantes</span>
                    <span>Lanchonetes</span>
                    <span>Bares</span>
                    <span>Cafeterias</span>
                    <span>Hamburguerias</span>
                    <span>Docerias</span>
                </div>
            </section>

            <div className="third-card-container" ref={plansSectionRef}>
                <h2 ref={plansTitleRef} className="plans-title">
                    Planos
                </h2>

                <div className={`plans-grid plans ${plansVisible ? "is-visible" : ""}`}>
                    <div className="plan-card">
                        <div className="plan-card__top">
                            <div className="plan-card__title">Grátis</div>
                            {/* <div className="plan-card__badge plan-card__badge--free">7 dias grátis</div>*/}
                        </div>

                        <div className="plan-card__icon">
                            <img src={AssinaturaGratuita} alt="Plano gratuito do TableTrack"/>
                        </div>

                        <div className="plan-card__text1">Teste grátis</div>
                        <div className="plan-card__text2">
                            Experimente o TableTrack por 7 dias e conheça o catálogo digital do seu negócio
                        </div>

                        <button className="plan-card__btn" onClick={() => navigate("/register")}>
                            Começar
                        </button>
                    </div>

                    <div className="plan-card">
                        <div className="plan-card__top">
                            <div className="plan-card__title">Mensal</div>
                        </div>

                        <div className="plan-card__icon">
                            <img src={AssinaturaMensal} alt="Plano mensal do TableTrack"/>
                        </div>

                        <div className="plan-card__text1">Assinatura mensal</div>
                        <div className="plan-card__text2">
                            Ideal para começar a usar o cardápio digital e testar no seu negócio
                        </div>

                        <button className="plan-card__btn" onClick={() => navigate("/register")}>
                            Assinar
                        </button>
                    </div>

                    <div className="plan-card">
                        <div className="plan-card__top">
                            <div className="plan-card__title">Anual</div>
                            {/*    <div className="plan-card__badge">Melhor opção</div> */}
                        </div>

                        <div className="plan-card__icon">
                            <img src={AssinaturaAnual} alt="Plano anual do TableTrack"/>
                        </div>

                        <div className="plan-card__text1">Assinatura anual</div>
                        <div className="plan-card__text2">
                            Mais economia para quem quer manter o cardápio digital ativo o ano inteiro
                        </div>

                        <button className="plan-card__btn" onClick={() => navigate("/register")}>
                            Assinar
                        </button>
                    </div>
                </div>
            </div>
            <section className="seo-text-section">
                <h2>TableTrack: cardápio digital para atendimento mais moderno</h2>
                <p>
                    O TableTrack é uma plataforma para cardápio digital com QR Code e gestão de pedidos.
                    Ideal para restaurantes, bares, cafeterias e lanchonetes que querem melhorar o atendimento,
                    organizar os pedidos e facilitar a experiência do cliente.
                </p>
                <p>
                    Com o TableTrack, seu estabelecimento pode oferecer acesso ao cardápio pelo celular,
                    gerar QR Code por mesa, receber pedidos em um painel próprio ou encaminhar pedidos estruturados pelo
                    WhatsApp.
                </p>
            </section>

            <footer>
                <p style={{marginLeft: '10px'}}>Table Track</p>
                <div style={{display: 'flex'}}>
                    <div
                        style={{fontSize: "60%", marginLeft: "10px", cursor: "pointer"}}
                        onClick={() => navigate("/terms")}
                    >
                        termos de serviço
                    </div>

                    <div
                        style={{fontSize: "60%", marginLeft: "10px", cursor: "pointer"}}
                        onClick={() => navigate("/privacy")}
                    >
                        política de privacidade
                    </div>

                    <div
                        style={{fontSize: "60%", marginLeft: "10px", cursor: "pointer"}}
                        onClick={() => setShowContactModal(true)}
                    >
                        Contate-nos
                    </div>

                    <div style={{fontSize: '60%', marginLeft: '10px', marginRight: '10px'}}>
                        Table Track 2026. All rights reserved
                    </div>
                </div>
            </footer>

            {showContactModal && <ContactModal onClose={() => setShowContactModal(false)}/>}
        </div>
    );
}

export default Home;