// src/pages/PrivacyPolicy.js

import React from "react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicy = () => {
    const navigate = useNavigate();

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "auto" }}>
            <h2>Política de Privacidade</h2>
            <p>Última atualização: 20/02/2025</p>

            <p>
                O <strong>TableTrack</strong> respeita sua privacidade e está comprometido em proteger os dados dos usuários.
                Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações.
            </p>

            <h3>1. Coleta de Informações</h3>
            <p>Coletamos informações fornecidas voluntariamente pelos usuários, como:</p>
            <ul>
                <li>Nome, e-mail e número de telefone ao criar uma conta.</li>
                <li>Dados do estabelecimento, como nome e localização.</li>
                <li>Histórico de pedidos e preferências de uso da plataforma.</li>
            </ul>

            <h3>2. Uso das Informações</h3>
            <p>Os dados coletados são utilizados para:</p>
            <ul>
                <li>Fornecer e melhorar nossos serviços.</li>
                <li>Gerenciar pedidos e assinaturas.</li>
                <li>Enviar notificações importantes e ofertas promocionais (com consentimento do usuário).</li>
            </ul>

            <h3>3. Compartilhamento de Dados</h3>
            <p>Não compartilhamos seus dados pessoais com terceiros, exceto nos seguintes casos:</p>
            <ul>
                <li>Quando necessário para processar pagamentos.</li>
                <li>Para cumprir obrigações legais ou ordens judiciais.</li>
                <li>Com fornecedores de serviços essenciais para a plataforma (exemplo: servidores e banco de dados).</li>
            </ul>

            <h3>4. Segurança</h3>
            <p>Adotamos medidas de segurança para proteger seus dados contra acessos não autorizados, mas recomendamos que os usuários também protejam suas credenciais.</p>

            <h3>5. Direitos dos Usuários</h3>
            <p>Os usuários podem solicitar a exclusão ou atualização de seus dados a qualquer momento entrando em contato conosco.</p>

            <h3>6. Alterações nesta Política</h3>
            <p>Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos os usuários sobre mudanças significativas.</p>

            <button onClick={() => navigate(-1)} style={{ marginTop: "20px", padding: "10px", cursor: "pointer" }}>
                Voltar
            </button>
        </div>
    );
};

export default PrivacyPolicy;
