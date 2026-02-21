import React, { useMemo, useState, useEffect } from 'react';
import '../styles/Modal.css';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext';

const CartModalWhatsapp = ({ cart, onHide, onRemove, establishment, setCart }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [observation, setObservation] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();

    const total = useMemo(() => cart.reduce((sum, item) => sum + item.Price, 0), [cart]);

    const groupedItems = useMemo(() => {
        const map = new Map();
        for (const item of cart) {
            const key = item.ProductID;
            if (!map.has(key)) {
                map.set(key, {
                    ProductID: item.ProductID,
                    ProductName: item.ProductName,
                    unitPrice: item.Price,
                    qty: 1,
                });
            } else {
                map.get(key).qty += 1;
            }
        }
        return Array.from(map.values());
    }, [cart]);

    // limpa o erro quando o usuário corrigir
    useEffect(() => {
        if (errorMsg && cart.length > 0 && customerName.trim()) {
            setErrorMsg('');
        }
    }, [cart.length, customerName, errorMsg]);

    const normalizePhone = (phone) => (phone || '').replace(/\D/g, '');

    const buildWhatsAppMessage = () => {
        const estName = establishment?.EstablishmentName || 'Estabelecimento';
        const lines = [];

        lines.push(`Olá! Gostaria de fazer um pedido no *${estName}*`);
        lines.push('');
        lines.push(`*Cliente:* ${customerName.trim()}`);

        if (customerPhone.trim()) {
            lines.push(`*Contato:* ${customerPhone.trim()}`);
        }

        lines.push('');
        lines.push('*Itens:*');

        groupedItems.forEach((it) => {
            const itemTotal = it.unitPrice * it.qty;
            lines.push(`- ${it.qty}x ${it.ProductName} — R$ ${itemTotal.toFixed(2)}`);
        });

        lines.push('');
        lines.push(`*Total:* R$ ${total.toFixed(2)}`);

        if (observation.trim()) {
            lines.push('');
            lines.push(`*Observações:* ${observation.trim()}`);
        }

        return lines.join('\n');
    };

    const handleSendToWhatsApp = async () => {
        // validações com mensagem no próprio modal
        if (cart.length === 0) {
            setErrorMsg('Seu carrinho está vazio. Adicione pelo menos 1 item antes de enviar.');
            return;
        }

        if (!customerName.trim()) {
            setErrorMsg('Informe seu nome para enviar o pedido.');
            return;
        }

        setErrorMsg('');

        const wa = normalizePhone(establishment?.WhatsAppNumber);
        if (!wa) {
            // esse é mais “configuração do sistema”, pode manter toast
            showToast('WhatsApp do estabelecimento não configurado.', 'error');
            return;
        }

        try {
            showLoading('Abrindo WhatsApp...');

            const message = buildWhatsAppMessage();
            const url = `https://wa.me/${wa}?text=${encodeURIComponent(message)}`;

            window.open(url, '_blank', 'noopener,noreferrer');

            showToast('Pedido pronto! Envie a mensagem no WhatsApp.', 'success');
            setCart([]);
            onHide();
        } catch (e) {
            setErrorMsg('Falha ao abrir o WhatsApp. Tente novamente.');
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="cart-modal-box">
                <h2 className="cart-modal-title">Carrinho (WhatsApp)</h2>

                {/* ALERTA NO MODAL */}
                {errorMsg && (
                    <div className="cart-modal-alert cart-modal-alert-error" role="alert">
                        {errorMsg}
                    </div>
                )}

                <ul className="cart-modal-list">
                    {cart.map((item, index) => (
                        <li key={`${item.ProductID}-${index}`} className="cart-modal-item">
                            <span>{item.ProductName}</span>
                            <span style={{ marginLeft: 'auto' }}>R$ {item.Price.toFixed(2)}</span>
                            <button className="cart-modal-remove" onClick={() => onRemove(index)}>✕</button>
                        </li>
                    ))}
                </ul>

                <h3 className="cart-modal-total">Total: R$ {total.toFixed(2)}</h3>

                <input
                    type="text"
                    className="cart-modal-input"
                    placeholder="Nome do cliente (Obrigatório)"
                    value={customerName}
                    onChange={(e) => {
                        setCustomerName(e.target.value);
                        if (errorMsg) setErrorMsg('');
                    }}
                    required
                />

                <input
                    type="text"
                    className="cart-modal-input"
                    placeholder="Contato do cliente (opcional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                />

                <textarea
                    className="cart-modal-textarea"
                    placeholder="Observações do pedido..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                />

                <div className="cart-modal-buttons">
                    <button className="cart-modal-btn finalize" onClick={handleSendToWhatsApp}>
                        Enviar no WhatsApp
                    </button>
                    <button className="cart-modal-btn cancel" onClick={onHide}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartModalWhatsapp;