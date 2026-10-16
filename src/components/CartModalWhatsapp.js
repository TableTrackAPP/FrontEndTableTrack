import React, { useMemo, useState, useEffect, useRef } from 'react';
import '../styles/Modal.css';
import { createOrder } from '../services/orderService';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext';

const CartModalWhatsapp = ({ cart, onHide, onRemove, establishment, setCart, formatItemPrice, totalLabel, showDeliveryAddress = true }) => {
    const submitting = useRef(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [addressState, setAddressState] = useState('');
    const [addressCity, setAddressCity] = useState('');
    const [addressNeighborhood, setAddressNeighborhood] = useState('');
    const [addressLine, setAddressLine] = useState('');
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
                    product: item,
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

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !submitting.current) onHide();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onHide]);

    const normalizePhone = (phone) => (phone || '').replace(/\D/g, '');

    const handleObservationChange = (event) => {
        const textarea = event.target;
        setObservation(textarea.value);

        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, 128), 260)}px`;
    };

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
            lines.push(`- ${it.qty}x ${it.ProductName} — ${formatItemPrice ? formatItemPrice(it.product, it.qty) : `R$ ${itemTotal.toFixed(2)}`}`);
        });

        lines.push('');
        lines.push(`*Total:* ${totalLabel ?? `R$ ${total.toFixed(2)}`}`);

        const hasAddress = [
            addressState,
            addressCity,
            addressNeighborhood,
            addressLine,
        ].some((value) => value.trim());

        if (showDeliveryAddress && hasAddress) {
            lines.push('');
            lines.push('*Endereço:*');

            if (addressLine.trim()) {
                lines.push(addressLine.trim());
            }

            if (addressNeighborhood.trim()) {
                lines.push(`Bairro: ${addressNeighborhood.trim()}`);
            }

            const cityAndState = [addressCity.trim(), addressState.trim()]
                .filter(Boolean)
                .join(' - ');

            if (cityAndState) {
                lines.push(cityAndState);
            }
        }

        if (observation.trim()) {
            lines.push('');
            lines.push(`*Observações:* ${observation.trim()}`);
        }

        return lines.join('\n');
    };

    const handleSendToWhatsApp = async () => {
        if (submitting.current) return;
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

        if (!establishment?.EstablishmentID) {
            setErrorMsg('Estabelecimento inválido. Recarregue o catálogo e tente novamente.');
            return;
        }

        submitting.current = true;
        setIsSubmitting(true);
        try {
            showLoading('Registrando pedido...');
            const message = buildWhatsAppMessage();
            const items = groupedItems.map((item) => ({
                ProductID: item.ProductID,
                quantity: item.qty,
                unitPrice: formatItemPrice && formatItemPrice(item.product) === 'preço a combinar' ? 0 : item.unitPrice,
            }));
            const address = showDeliveryAddress
                ? [addressLine, addressNeighborhood, addressCity, addressState].map(value => value.trim()).filter(Boolean).join(', ')
                : '';
            const notes = [
                'Origem: Catálogo WhatsApp. Envio da mensagem pelo cliente não confirmado.',
                address && `Endereço de entrega: ${address}`,
                observation.trim(),
                ...groupedItems.filter(item => formatItemPrice && formatItemPrice(item.product) === 'preço a combinar')
                    .map(item => `${item.qty}x ${item.ProductName}: preço a combinar (não incluído no total).`),
            ].filter(Boolean).join('\n');

            await createOrder({
                establishmentID: establishment.EstablishmentID,
                tableNumber: null,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim() || null,
                totalAmount: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
                observation: notes,
                items,
            });

            setCart([]);
            onHide();
            showToast('Pedido registrado! Envie a mensagem no WhatsApp.', 'success');
            // A mesma aba evita bloqueio de pop-up depois da requisição assíncrona.
            window.open(`https://wa.me/${wa}?text=${encodeURIComponent(message)}`, '_self', 'noopener,noreferrer');
        } catch (e) {
            setErrorMsg('Não foi possível registrar o pedido. Tente novamente.');
        } finally {
            submitting.current = false;
            setIsSubmitting(false);
            hideLoading();
        }
    };

    return (
        <div className="modal-overlay">
            <div
                className="cart-modal-box"
                role="dialog"
                aria-modal="true"
                aria-labelledby="whatsapp-cart-title"
            >
                <h2 className="cart-modal-title" id="whatsapp-cart-title">Carrinho (WhatsApp)</h2>

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
                            <span style={{ marginLeft: 'auto' }}>{formatItemPrice ? formatItemPrice(item) : `R$ ${item.Price.toFixed(2)}`}</span>
                            <button className="cart-modal-remove" disabled={isSubmitting} onClick={() => onRemove(index)} aria-label={`Remover ${item.ProductName}`}>✕</button>
                        </li>
                    ))}
                </ul>

                <h3 className="cart-modal-total">Total: {totalLabel ?? `R$ ${total.toFixed(2)}`}</h3>

                <input
                    type="text"
                    className="cart-modal-input"
                    placeholder="Nome do cliente (Obrigatório)"
                    aria-label="Nome do cliente"
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
                    aria-label="Contato do cliente"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                />

                {showDeliveryAddress && <fieldset className="cart-modal-address">
                    <legend>Endereço de entrega (opcional)</legend>

                    <div className="cart-modal-address-grid">
                        <label>
                            <span>Estado</span>
                            <input
                                type="text"
                                className="cart-modal-input"
                                placeholder="Ex.: São Paulo"
                                value={addressState}
                                onChange={(e) => setAddressState(e.target.value)}
                                autoComplete="address-level1"
                            />
                        </label>

                        <label>
                            <span>Cidade</span>
                            <input
                                type="text"
                                className="cart-modal-input"
                                placeholder="Ex.: Campinas"
                                value={addressCity}
                                onChange={(e) => setAddressCity(e.target.value)}
                                autoComplete="address-level2"
                            />
                        </label>

                        <label>
                            <span>Bairro</span>
                            <input
                                type="text"
                                className="cart-modal-input"
                                placeholder="Ex.: Centro"
                                value={addressNeighborhood}
                                onChange={(e) => setAddressNeighborhood(e.target.value)}
                                autoComplete="address-level3"
                            />
                        </label>

                        <label className="cart-modal-address-line">
                            <span>Endereço</span>
                            <input
                                type="text"
                                className="cart-modal-input"
                                placeholder="Rua, número e complemento"
                                value={addressLine}
                                onChange={(e) => setAddressLine(e.target.value)}
                                autoComplete="street-address"
                            />
                        </label>
                    </div>
                </fieldset>}

                <textarea
                    className="cart-modal-textarea"
                    placeholder="Observações do pedido..."
                    aria-label="Observações do pedido"
                    value={observation}
                    onChange={handleObservationChange}
                    rows={5}
                />

                <div className="cart-modal-buttons">
                    <button className="cart-modal-btn finalize" disabled={isSubmitting} onClick={handleSendToWhatsApp}>
                        Enviar no WhatsApp
                    </button>
                    <button className="cart-modal-btn cancel" disabled={isSubmitting} onClick={onHide}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartModalWhatsapp;
