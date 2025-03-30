import React, { useState, useRef } from 'react';
import '../styles/Home.css';
import logoImageUrl from '../assets/logoProvisoria.png';
import handImage from '../assets/handphone.webp'; // adjust the path according to your project structure
import PlansImage from '../assets/planosexemplo.png'; // adjust the path according to your project structure
import BuildStoreImage from '../assets/pickshop.png'; // adjust the path according to your project structure
import ExploreAndSelectImage from '../assets/shop.png'; // adjust the path according to your project structure
import RedirectToWppImage from '../assets/whatsapp-no-ecommerce.jpg'; // adjust the path according to your project structure
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
    const handleScrollToPlans = () => {
        plansSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleScrollToHowItWorks = () => {
        howItWorksRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <div className="app-container">
            <header className="header">

                <div style={{marginLeft: '5px', marginTop: '10px'}}>
                    <img src={logoImageUrl} alt="Logo" className="small-image"/>
                </div>
                <nav>
                    <div className="headerText" onClick={handleScrollToPlans}>Planos</div>
                </nav>
                <nav>
                    <div className="headerText" onClick={handleScrollToHowItWorks}>Como funciona</div>
                </nav>

                <nav>
                    <div className="headerTextInscrevaSe" onClick={() => navigate('/register')}>Se inscrever</div>
                </nav>
                <nav>
                    <button onClick={() => navigate('/login')}>Entrar</button>
                    {/* Redireciona para Login */}
                </nav>


            </header>


            <section className="first-card">

                <div className="firstCard-text-section">
                    <h2 style={{color: '#129666'}}>Transforme seu atendimento com <span>TableTrack</span></h2>
                    <p style={{color: '#889F7C'}}>
                        Cadastre seu cardápio digital e organize os pedidos do seu estabelecimento de forma simples e eficiente
                    </p>
                    <button onClick={() => navigate('/login')}>Comece Agora</button>
                </div>

                <div className="image-container">
                    <img src={handImage} className="contained-image"/>
                </div>
            </section>

            <div className="second-card" ref={howItWorksRef}>
                <div className="secondCard-text-title" >Fácil e rápido</div>
                <div className="secondCard-text-subtitle">Comece agora seguindo os seguintes passos</div>
                <div className="card-row" >
                    <div style={{backgroundColor: '#DCD9F8'}} className="secondCard-image-container">
                        <img src={PlansImage} className="secondCard-contained-image"/>
                        <div className="secondCard-text-section" >
                            <div className='secondCard-text-section-title' style={{color: '#333333'}}>Escolha o seu
                                plano
                            </div>
                            <div className='secondCard-text-section-description'>Barato e acessível</div>

                        </div>

                    </div>

                    <div style={{backgroundColor: '#ffffef'}} className="secondCard-image-container">
                        <img style={{borderRadius: '30px', height: '80%', marginRight: '20px'}} src={BuildStoreImage}
                             className="secondCard-contained-image"/>
                        <div className="secondCard-text-section">
                            <div className='secondCard-text-section-title' style={{color: '#333333'}}>Cadastre seu estabelecimento
                            </div>
                            <div className='secondCard-text-section-description'>Configure seu cardápio digital com produtos e preços
                            </div>

                        </div>

                    </div>
                </div>
                <div className="card-row">
                    <div style={{backgroundColor: '#e9e4e9'}} className="secondCard-image-container">
                        <img src={ExploreAndSelectImage} className="secondCard-contained-image"/>
                        <div className="secondCard-text-section">
                            <div className='secondCard-text-section-title' style={{color: '#333333'}}>Clientes fazem pedidos
                            </div>
                            <div className='secondCard-text-section-description'>Seus clientes acessam o cardápio e montam seus pedidos online
                            </div>

                        </div>

                    </div>

                    <div style={{backgroundColor: '#DCF4F4'}} className="secondCard-image-container">
                        <img src={RedirectToWppImage} className="secondCard-contained-imageFourth"/>
                        <div style={{marginLeft: '5px'}} className="secondCard-text-section">
                            <div className='secondCard-text-section-title' style={{color: '#333333'}}>Gerencie pedidos em tempo real
                            </div>
                            <div className='secondCard-text-section-description'>Acompanhe e atualize os pedidos diretamente pelo painel do estabelecimento</div>

                        </div>

                    </div>
                </div>
            </div>


            <div className='third-card-container' ref={plansSectionRef}>
                <div className='third-card-contained-square'>
                    <h2 style={{color: '#129666'}}>Planos</h2>
                </div>
                <div className='cards-container'>
                    <div className="card" style={{background: 'linear-gradient(to bottom, #00A39C, #006A42)'}}>
                        <div className="card-header">Gratuito</div>
                        <div className="card-content">
                            <p>TESTE GRÁTIS POR 7 DIAS</p>
                            <p>APROVEITE PARA CONHECER NOSSO SERVIÇO</p>
                        </div>
                        <div className="card-price">
                            <span className="price-period">GRÁTIS POR 7 DIAS</span>
                        </div>
                        <button className="buy-button" onClick={() => navigate('/login')}>ASSINAR</button>
                    </div>

                    <div className="card" style={{background: 'linear-gradient(to bottom, #8461A3, #006A42)'}}>
                        <div className="card-header">Mensal</div>
                        <div className="card-content">
                            <p>ASSINE O MENSALMENTE</p>
                            <p>E CRIE SEU CATÁLOGO DIGITAL</p>
                        </div>
                        <div className="card-price">
                            <span>R$<sup>19,99</sup></span>
                            <span className="price-period">POR 1 MES</span>
                        </div>
                        <button className="buy-button" onClick={() => navigate('/login')}>ASSINAR</button>
                    </div>

                    <div className="card" style={{background: 'linear-gradient(to bottom, #FF7694, #006A42)'}}>
                        <div className="card-header">Anual</div>
                        <div className="card-content">
                            <p>ASSINE ANUALMENTE</p>
                            <p>E CRIE SEU CATÁLOGO DIGITAL</p>
                        </div>
                        <div className="card-price">
                            <span>R$<sup>149,99</sup></span>
                            <span className="price-period">POR 1 ANO</span>
                        </div>
                        <button className="buy-button" onClick={() => navigate('/login')}>ASSINAR</button>
                    </div>
                </div>


            </div>
            <div style={{backgroundColor: '#006A42', marginTop: '-1px'}}>
                <div className='fourth-card-container'>
                    <div style={{color: 'white', fontSize: '250%', fontWeight: 'bolder', marginBottom: '10px'}}>Junte-se
                        a nós
                    </div>
                    <div style={{color: 'white', fontSize: '120%', fontWeight: 'bold', marginBottom: '10px'}}>Ofereça um atendimento rápido e moderno com um
                    </div>
                    <div style={{color: 'white', fontSize: '100%'}}>cardápio digital interativo.</div>
                </div>

            </div>


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
                        style={{ fontSize: "60%", marginLeft: "10px", cursor: "pointer"}}
                        onClick={() => navigate("/privacy")}
                    >
                        politica de privacidade
                    </div>

                    <div
                        style={{ fontSize: "60%", marginLeft: "10px", cursor: "pointer"}}
                        onClick={() => setShowContactModal(true)}
                    >
                        Contate-nos
                    </div>
                    <div style={{fontSize: '60%', marginLeft: '10px', marginRight: '10px'}}>Table Track 2025. All rights
                        reserved
                    </div>
                </div>

            </footer>

            {showContactModal && <ContactModal onClose={() => setShowContactModal(false)} />}

        </div>
    );
}

export default Home;