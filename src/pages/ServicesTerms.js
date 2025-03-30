// src/pages/ServicesTerms.js

import React from "react";
import { useNavigate } from "react-router-dom";

const ServicesTerms = () => {
    const navigate = useNavigate();

    return (
        <div style={{padding: "20px", maxWidth: "800px", margin: "auto"}}>
            <button onClick={() => navigate(-1)} style={{marginTop: "20px", padding: "10px", cursor: "pointer"}}>
                Voltar
            </button>
            <h2>Termos de Serviço</h2>
            <p>Última atualização: 20/02/2025</p>

            <p>
                Bem-vindo ao <strong>TableTrack</strong>! Este Termo de Serviço regula o uso da plataforma
                <strong> TableTrack</strong>, que oferece um sistema de gerenciamento de pedidos e catálogos para bares,
                restaurantes, lanchonetes e cafeterias. Ao utilizar nossos serviços, você concorda com os termos e
                condições descritos abaixo.
            </p>

            <h3>1. Definições</h3>
            <ul>
                <li><strong>TableTrack</strong> – Plataforma que permite estabelecimentos criarem e gerenciarem seus
                    catálogos, além de processar pedidos dos clientes.
                </li>
                <li><strong>Usuário</strong> – Qualquer pessoa ou empresa que se cadastra e utiliza a plataforma.</li>
                <li><strong>Assinante</strong> – Usuário que possui uma assinatura ativa do serviço.</li>
                <li><strong>Cliente Final</strong> – Pessoa que acessa o catálogo de um estabelecimento para visualizar
                    produtos e realizar pedidos.
                </li>
                <li><strong>Estabelecimento</strong> – Negócio que utiliza a plataforma para gerenciar pedidos e
                    cardápios.
                </li>
            </ul>

            <h3>2. Uso da Plataforma</h3>
            <p>O TableTrack é destinado exclusivamente a estabelecimentos comerciais do setor alimentício. Usuários
                devem fornecer informações corretas ao se cadastrar.</p>

            <h3>3. Responsabilidades dos Usuários</h3>
            <p>O usuário é responsável por:</p>
            <ul>
                <li>Manter suas credenciais de acesso seguras.</li>
                <li>Utilizar a plataforma de acordo com a legislação vigente.</li>
                <li>Garantir que todas as informações inseridas na plataforma sejam precisas e atualizadas.</li>
            </ul>

            <h3>4. Assinatura e Pagamento</h3>
            <p>O acesso ao sistema requer uma assinatura ativa. Não há um plano gratuito disponível.</p>

            <h3>5. Encerramento e Cancelamento</h3>
            <p>Os usuários podem cancelar sua assinatura a qualquer momento. O acesso será encerrado ao fim do período
                contratado.</p>

            <h3>6. Disposições Finais</h3>
            <p>O TableTrack reserva-se o direito de modificar os termos de serviço, notificando os usuários com
                antecedência.</p>


        </div>
    );
};

export default ServicesTerms;
