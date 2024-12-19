import React, { useState } from 'react';
import '../styles/Modal.css';
import { createOrder } from '../services/orderService';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext';

const CartModal = ({ cart, onHide, onRemove, tableID, establishmentID, setCart }) => {
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState(''); // Campo opcional
    const [observation, setObservation] = useState('');
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading();

    const total = cart.reduce((sum, item) => sum + item.Price, 0);

    const handleFinalizeOrder = async () => {
        // Validações antes de prosseguir
        if (cart.length === 0) {
            showToast('O carrinho está vazio. Adicione itens antes de finalizar o pedido.', 'error');
            return;
        }

        if (!customerName.trim()) {
            showToast('O nome do cliente é obrigatório.', 'error');
            return;
        }

        try {
            showLoading('Finalizando pedido...');
            const orderData = {
                establishmentID,
                tableNumber: tableID || null, // Usa o número da mesa se estiver presente
                customerName,
                customerPhone: customerPhone || null, // Define como `null` se estiver vazio
                totalAmount: total,
                observation,
                items: cart.map((item) => ({
                    ProductID: item.ProductID,
                    quantity: 1,
                    unitPrice: item.Price,
                })),
            };

            await createOrder(orderData);
            showToast('Pedido finalizado com sucesso!', 'success');
            setCart([]); // Limpa o carrinho em caso de sucesso
            onHide();
        } catch (error) {
            showToast('Erro ao finalizar pedido.', 'error');
        } finally {
            hideLoading();
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Carrinho</h2>
                <ul>
                    {cart.map((item, index) => (
                        <li key={`${item.ProductID}-${index}`}>
                            {item.ProductName} - R$ {item.Price.toFixed(2)}
                            <button onClick={() => onRemove(index)}>Remover</button>
                        </li>
                    ))}
                </ul>
                <h3>Total: R$ {total.toFixed(2)}</h3>

                <input
                    type="text"
                    placeholder="Nome do cliente"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                />
                <input
                    type="text"
                    placeholder="Contato do cliente (opcional)"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                />
                <textarea
                    placeholder="Adicione uma observação ao pedido..."
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                />
                <button onClick={handleFinalizeOrder}>Finalizar Pedido</button>
                <button onClick={onHide}>Fechar</button>
            </div>
        </div>
    );
};

export default CartModal;
