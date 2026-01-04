// src/components/NotificationListener.js
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getFromLocalStorage } from "../utils/storageUtils";
import { getEstablishmentByOwnerID } from "../services/establishmentService";
import { orderNotificationBus } from "../services/orderNotificationBus";
import "../styles/NotificationListener.css";

const MAX_MESSAGES = 5;
const STORAGE_KEY = "tt_order_notifications_v1";

function safeParse(json) {
    try {
        return JSON.parse(json);
    } catch {
        return null;
    }
}

function loadStored() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = safeParse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map((x) => String(x || "Novo pedido recebido!")).slice(-MAX_MESSAGES);
}

const NotificationListener = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [establishmentID, setEstablishmentID] = useState(null);
    const [messages, setMessages] = useState(() => loadStored());

    // Persiste sempre que mensagens mudarem
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
    }, [messages]);

    // Se entrar em /orders, limpa (como você pediu)
    useEffect(() => {
        if (location.pathname.toLowerCase() === "/orders") {
            setMessages([]);
            localStorage.removeItem(STORAGE_KEY);
        }
    }, [location.pathname]);

    useEffect(() => {
        const fetchEstablishment = async () => {
            const userData = getFromLocalStorage("userData");
            if (!userData?.userID) return;

            try {
                const establishment = await getEstablishmentByOwnerID(userData.userID);
                if (establishment?.EstablishmentID) {
                    setEstablishmentID(establishment.EstablishmentID);
                }
            } catch (err) {
                console.error("Erro ao buscar estabelecimento:", err);
            }
        };

        fetchEstablishment();
    }, []);

    useEffect(() => {
        if (!establishmentID) return;

        // Conecta WS (singleton)
        orderNotificationBus.connect(establishmentID);

        // Escuta mensagens
        const unsub = orderNotificationBus.subscribe((message) => {
            const text = String(message || "Novo pedido recebido!");

            setMessages((prev) => {
                const next = [...prev, text];
                return next.slice(-MAX_MESSAGES);
            });
        });

        return () => {
            unsub();
        };
    }, [establishmentID]);

    const handleClose = (index) => {
        setMessages((prev) => prev.filter((_, i) => i !== index));
    };

    const handleClearAll = () => {
        setMessages([]);
        localStorage.removeItem(STORAGE_KEY);
    };

    const handleGoOrders = () => {
        setMessages([]);
        localStorage.removeItem(STORAGE_KEY);
        navigate("/orders");
    };

    if (messages.length === 0) return null;

    return (
        <div className="tt-order-float">
            <div className="tt-order-float-header">
                <div className="tt-order-float-title">
                    Pedidos novos
                    <span className="tt-order-float-badge">{messages.length}</span>
                </div>

                <button
                    type="button"
                    className="tt-order-float-btn tt-order-float-btn-ghost"
                    onClick={handleGoOrders}
                >
                    Ver pedidos
                </button>

                <button
                    type="button"
                    className="tt-order-float-close"
                    onClick={handleClearAll}
                    aria-label="Fechar notificações"
                    title="Fechar"
                >
                    ✕
                </button>
            </div>

            <div className="tt-order-float-body">
                {messages.map((msg, index) => (
                    <div key={`${msg}-${index}`} className="tt-order-float-item">
                        <span className="tt-order-float-msg">{msg}</span>
                        <button
                            type="button"
                            className="tt-order-float-item-close"
                            onClick={() => handleClose(index)}
                            aria-label="Fechar notificação"
                            title="Fechar"
                        >
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationListener;

