import React, { useState, useRef, useEffect  } from 'react';
import '../styles/Home.css';
import logoImageUrl from '../assets/logoProvisoria.png';
import firstCardImage from '../assets/FirstCardImage.jpg'; // adjust the path according to your project structure
import PlansImage from '../assets/planosexemplo.png'; // adjust the path according to your project structure
import BuildStoreImage from '../assets/StablishmentManagment.png'; // adjust the path according to your project structure
import ExploreAndSelectImage from '../assets/ReadingQrCode.png'; // adjust the path according to your project structure
import RedirectToWppImage from '../assets/CaptureOrdering.png'; // adjust the path according to your project structure
import AssinaturaMensal from '../assets/AssinaturaMensal.png'; // adjust the path according to your project structure
import AssinaturaAnual from '../assets/AssinaturaAnual.png'; // adjust the path according to your project structure
import AssinaturaGratuita from '../assets/AssinaturaGratuita.png'; // adjust the path according to your project structure
import Login from './Login'; // adjust path if needed
import SignUp from './Register'; // adjust path if needed
import { useNavigate } from 'react-router-dom'; // Importa o hook de navegação
import ContactModal from "../components/ContactModal"; // Importa o modal de contato


function Home() {

    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showSignUpModal, setShowSignUpModal] = useState(false);
    const [loginResponse, setLoginResponse] = useState(null);
    const handleLoginSuccess = (response) => {
        setLoginResponse(response);
        setShowLoginModal(false);
        // You can also navigate to Manager or change UI based on response
    };

    const navigate = useNavigate(); // Hook para redirecionamento
    const [showContactModal, setShowContactModal] = useState(false);

    const plansSectionRef = useRef(null);
    const howItWorksRef = useRef(null);

    const [howStepsVisible, setHowStepsVisible] = useState(false);

    useEffect(() => {
        const el = howItWorksRef.current;
        if (!el) return;

        const obs = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setHowStepsVisible(true);
                    obs.disconnect(); // anima só 1 vez
                }
            },
            { threshold: 0.25 } // 25% visível já anima
        );

        obs.observe(el);

        return () => obs.disconnect();
    }, []);

    const plansTitleRef = useRef(null);
    const [plansVisible, setPlansVisible] = useState(false);

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
            { threshold: 0.6 } // 60% do título visível
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
            // Já está logado → manda para o dashboard
            navigate('/dashboard');
        } else {
            // Não está logado → manda para login
            navigate('/login');
        }
    };


    return (
        <div className="app-container">
            <header className="header">

                <div style={{marginLeft: '5px', marginTop: '10px', cursor: 'pointer'}}>
                    <img src={logoImageUrl} alt="Logo" className="small-image"/>
                </div>
                <nav>
                    <div className="headerText" onClick={handleScrollToHowItWorks}>Como funciona</div>
                </nav>
                <nav>
                    <div className="headerText" onClick={handleScrollToPlans}>Planos</div>
                </nav>


                <nav>
                    <div className="headerTextInscrevaSe" onClick={() => navigate('/register')}>Se inscrever</div>
                </nav>
                <nav>
                    <button onClick={handleEnterClick}>Entrar</button>
                    {/* Redireciona para Login */}
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
                        Transforme seu atendimento com <span>TableTrack</span>
                    </h1>

                    <p className="first-card__subtitle">
                        Cadastre seu cardápio digital e organize os pedidos do seu estabelecimento de forma simples e
                        eficiente
                    </p>

                    <button className="first-card__cta" onClick={() => navigate('/login')}>
                        Comece Agora
                    </button>
                </div>

                <div className="first-card__right">
                    <img src={firstCardImage} alt="Ambiente de cafeteria"/>
                </div>
            </section>
            <section
                ref={howItWorksRef}
                className={`how-steps ${howStepsVisible ? "is-visible" : ""}`}
            >
                <div className="how-steps__left">
                    <div className="how-steps__title">Fácil e rápido</div>
                    <div className="how-steps__subtitle">
                        Comece agora seguindo os<br/>seguintes passos
                    </div>
                </div>

                <div className="how-steps__right">
                    <div className="how-steps__item">
                        <div className="how-steps__avatar">
                            <img src={BuildStoreImage} alt="Cadastre seu estabelecimento"/>
                        </div>
                        <div className="how-steps__text">
                            <div className="how-steps__item-title">Cadastre seu estabelecimento</div>
                            <div className="how-steps__item-desc">
                                Configure seu cardápio digital com produtos e preços
                            </div>
                        </div>
                    </div>

                    <div className="how-steps__divider"/>

                    <div className="how-steps__item">
                        <div className="how-steps__avatar">
                            <img src={ExploreAndSelectImage} alt="Clientes fazem pedidos"/>
                        </div>
                        <div className="how-steps__text">
                            <div className="how-steps__item-title">Clientes fazem pedidos</div>
                            <div className="how-steps__item-desc">
                                Seus clientes acessam o cardápio e montam seus pedidos online
                            </div>
                        </div>
                    </div>

                    <div className="how-steps__divider"/>

                    <div className="how-steps__item">
                        <div className="how-steps__avatar">
                            <img src={RedirectToWppImage} alt="Gerencie pedidos em tempo real"/>
                        </div>
                        <div className="how-steps__text">
                            <div className="how-steps__item-title">Gerencie pedidos em tempo real</div>
                            <div className="how-steps__item-desc">
                                Acompanhe e atualize os pedidos diretamente pelo painel do estabelecimento
                            </div>
                        </div>
                    </div>
                </div>
            </section>


            <div className="third-card-container" ref={plansSectionRef}>
                <h2
                    ref={plansTitleRef}
                    className={`plans-title ${plansVisible ? "is-visible" : ""}`}
                >
                    Planos
                </h2>

                <div className={`plans-grid plans ${plansVisible ? "is-visible" : ""}`}>
                    {/* Card 1 - Gratuito */}
                    <div className="plan-card">
                        <div className="plan-card__top">
                            <div className="plan-card__title">Gratuito</div>
                        </div>

                        <div className="plan-card__icon">
                            <img src={AssinaturaGratuita} alt="Plano gratuito"/>
                        </div>

                        <div className="plan-card__text1">Teste 7 dias grátis</div>
                        <div className="plan-card__text2">Sem cadastro de cartão de crédito</div>

                        <button className="plan-card__btn" onClick={() => navigate("/login")}>
                            ASSINAR
                        </button>
                    </div>

                    {/* Card 2 - Mensal */}
                    <div className="plan-card">
                        <div className="plan-card__top">
                            <div className="plan-card__title">Mensal</div>
                        </div>

                        <div className="plan-card__icon">
                            <img src={AssinaturaMensal} alt="Plano mensal"/>
                        </div>

                        <div className="plan-card__text1">Assine mensalmente</div>
                        <div className="plan-card__text2">E crie seu catálogo digital</div>

                        <button className="plan-card__btn" onClick={() => navigate("/login")}>
                            Assinar
                        </button>
                    </div>

                    {/* Card 3 - Anual */}
                    <div className="plan-card">
                        <div className="plan-card__top">
                            <div className="plan-card__title">Anual</div>
                        </div>

                        <div className="plan-card__icon">
                            <img src={AssinaturaAnual} alt="Plano anual"/>
                        </div>

                        <div className="plan-card__text1">Assine anualmente</div>
                        <div className="plan-card__text2">E crie seu catálogo digital</div>

                        <button className="plan-card__btn" onClick={() => navigate("/login")}>
                            Assinar
                        </button>
                    </div>
                </div>
            </div>
            {/*
            <div style={{backgroundColor: '#006A42'}}>
                <div className='fourth-card-container'>
                    <div style={{color: 'white', fontSize: '250%', fontWeight: 'bolder', marginBottom: '10px'}}>Junte-se
                        a nós
                    </div>
                    <div style={{color: 'white', fontSize: '120%', fontWeight: 'bold', marginBottom: '10px'}}>Ofereça um
                        atendimento rápido e moderno com um
                    </div>
                    <div style={{color: 'white', fontSize: '100%'}}>cardápio digital interativo.</div>
                </div>

            </div>

*/}
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
                        politica de privacidade
                    </div>

                    <div
                        style={{fontSize: "60%", marginLeft: "10px", cursor: "pointer"}}
                        onClick={() => setShowContactModal(true)}
                    >
                        Contate-nos
                    </div>
                    <div style={{fontSize: '60%', marginLeft: '10px', marginRight: '10px'}}>Table Track 2025. All rights
                        reserved
                    </div>
                </div>

            </footer>

            {showContactModal && <ContactModal onClose={() => setShowContactModal(false)}/>}

        </div>
    );
}

export default Home;