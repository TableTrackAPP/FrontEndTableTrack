// src/components/AppFooter.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ContactModal from './ContactModal'; // ajuste o caminho conforme necessário

const AppFooter = () => {
    const [showContactModal, setShowContactModal] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            <footer style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: '#f4f4f4', fontSize: '14px', alignItems: 'center' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>Table Track</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '60%', cursor: 'pointer' }} onClick={() => navigate("/terms")}>
                        Termos de serviço
                    </span>
                    <span style={{ fontSize: '60%', cursor: 'pointer' }} onClick={() => navigate("/privacy")}>
                        Política de privacidade
                    </span>
                    <span style={{ fontSize: '60%', cursor: 'pointer' }} onClick={() => setShowContactModal(true)}>
                        Contate-nos
                    </span>
                    <span style={{ fontSize: '60%' }}>
                        Table Track 2025. All rights reserved
                    </span>
                </div>
            </footer>

            {showContactModal && (
                <ContactModal onClose={() => setShowContactModal(false)} />
            )}
        </>
    );
};

export default AppFooter;
