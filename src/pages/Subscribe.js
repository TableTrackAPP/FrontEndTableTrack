import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext'; // Import useToast for notifications
import { useLoading } from '../hooks/LoadingContext'; // Import useLoading for loading indicator

const Subscribe = () => {
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();
    const navigate = useNavigate();

    const handleSubscribe = async () => {
        try {
            showLoading('Ativando assinatura...');

            // Simulate subscription process
            setTimeout(() => {
                hideLoading();
                showToast('Assinatura ativada com sucesso!', 'success');
                navigate('/dashboard'); // Redirect to the dashboard after subscription
            }, 2000);
        } catch (err) {
            hideLoading();
            showToast('Erro ao ativar assinatura, tente novamente.', 'error');
        }
    };

    return (
        <div>
            <h2>Assine para Acessar</h2>
            <p>Desbloqueie recursos exclusivos se tornando um assinante.</p>
            <button onClick={handleSubscribe}>Assinar Agora</button>
        </div>
    );
};

export default Subscribe;