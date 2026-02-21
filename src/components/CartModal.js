import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';
import { createOrder } from '../services/orderService';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext';

const CartModal = ({ cart, onHide, onRemove, tableID, establishmentID, setCart }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [observation, setObservation] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();

    const total = cart.reduce((sum, item) => sum + item.Price, 0);

    // limpa o erro quando o usuário corrigir
    useEffect(() => {
        if (errorMsg && cart.length > 0 && customerName.trim()) {
            setErrorMsg('');
        }
    }, [cart.length, customerName, errorMsg]);

    const handleFinalizeOrder = async () => {
        if (cart.length === 0) {
            setErrorMsg('Seu carrinho está vazio. Adicione pelo menos 1 item antes de finalizar.');
            return;
        }

        if (!customerName.trim()) {
            setErrorMsg('Informe seu nome para finalizar o pedido.');
            return;
        }

        setErrorMsg('');

        try {
            showLoading('Finalizando pedido...');

            const orderData = {
                establishmentID,
                tableNumber: tableID || null,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim() || null,
                totalAmount: total,
                observation: observation.trim() || null,
                items: cart.map((item) => ({
                    ProductID: item.ProductID,
                    quantity: 1,
                    unitPrice: item.Price,
                })),
            };

            await createOrder(orderData);

            showToast('Pedido finalizado com sucesso!', 'success');
            setCart([]);
            onHide();
        } catch (error) {
            setErrorMsg('Erro ao finalizar pedido. Tente novamente.');
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="cart-modal-box">
                <h2 className="cart-modal-title">Carrinho</h2>

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
                    <button className="cart-modal-btn finalize" onClick={handleFinalizeOrder}>
                        Finalizar Pedido
                    </button>
                    <button className="cart-modal-btn cancel" onClick={onHide}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CartModal;