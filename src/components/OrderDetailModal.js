import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';

const ConfirmationModal = ({ show, onClose, onConfirm, message }) => {
    if (!show) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <p>{message}</p>
                <div style={{ marginTop: '20px' }}>
                    <button onClick={onConfirm} style={{ marginRight: '10px' }}>
                        Confirmar
                    </button>
                    <button onClick={onClose}>Cancelar</button>
                </div>
            </div>
        </div>
    );
};

const OrderDetailModal = ({
                              order,
                              show,
                              onClose,
                              orderStatus,
                              setOrderStatus,
                              onUpdateStatus,
                          }) => {
    const [confirmationModal, setConfirmationModal] = useState(false); // Estado para o modal de confirmação
    const [selectedStatus, setSelectedStatus] = useState(orderStatus);

    useEffect(() => {
        if (orderStatus) {
            setSelectedStatus(orderStatus);
        }
    }, [orderStatus]);

    if (!show || !order) return null;

    const getStatusOptions = (currentStatus) => {
        switch (currentStatus) {
            case 'Pending':
                return [
                    { value: 'In Progress', label: 'Em andamento' },
                    { value: 'Cancelled', label: 'Cancelado' },
                ];
            case 'In Progress':
                return [
                    { value: 'Completed', label: 'Concluído' },
                    { value: 'Cancelled', label: 'Cancelado' },
                ];
            case 'Completed':
                return [{ value: 'Paid', label: 'Pago' }];
            case 'Cancelled':
                return []; // Não há opções após 'Cancelled'
            default:
                return [];
        }
    };

    const statusOptions = getStatusOptions(orderStatus);

    const handleStatusChange = (status) => {
        if (status === 'Cancelled') {
            setConfirmationModal(true); // Mostra o modal de confirmação
        } else {
            updateStatus(status);
        }
    };

    const updateStatus = (status) => {
        setOrderStatus(status); // Atualiza o estado global
        onUpdateStatus(status); // Passa o status atualizado ao backend
    };

    const confirmCancellation = () => {
        setConfirmationModal(false); // Fecha o modal de confirmação
        updateStatus('Cancelled');
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <button className="close-button" onClick={onClose}>
                    ×
                </button>
                <h2>Detalhes do Pedido #{order.OrderID}</h2>
                <p>
                    <strong>Cliente:</strong> {order.CustomerName}
                </p>
                <p>
                    <strong>Contato:</strong> {order.CustomerPhone || 'Não informado'}
                </p>
                <p>
                    <strong>Mesa:</strong> {order.TableNumber || 'N/A'}
                </p>
                <p>
                    <strong>Observação:</strong> {order.Observation || 'Nenhuma'}
                </p>
                <p>
                    <strong>Data do Pedido:</strong>{' '}
                    {new Date(order.CreatedAt).toLocaleString('pt-BR', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                    })}
                </p>
                <p>
                    <strong>Total:</strong> R$ {Number(order.TotalAmount || 0).toFixed(2)}
                </p>
                <h3>Itens do Pedido</h3>
                <ul>
                    {order.items?.length ? (
                        order.items.map((item) => (
                            <li key={item.OrderItemID}>
                                {item.ProductName} - R$ {Number(item.UnitPrice || 0).toFixed(2)} x {item.Quantity}
                            </li>
                        ))
                    ) : (
                        <p>Sem itens neste pedido.</p>
                    )}
                </ul>
                <h3>Alterar Status</h3>
                <div>
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            style={{ marginRight: '10px', marginTop: '10px' }}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <h3>Histórico de Status do Pedido</h3>
                <ul>
                    {order.statusHistory?.length ? (
                        order.statusHistory.map((statusHistory) => (
                            <li key={statusHistory.StatusHistoryID}>
                                {statusHistory.StatusDescription} -{' '}
                                {new Date(statusHistory.UpdatedAt).toLocaleString('pt-BR', {
                                    dateStyle: 'short',
                                    timeStyle: 'short',
                                })}
                            </li>
                        ))
                    ) : (
                        <p>Sem histórico de status para este pedido.</p>
                    )}
                </ul>
                <ConfirmationModal
                    show={confirmationModal}
                    onClose={() => setConfirmationModal(false)}
                    onConfirm={confirmCancellation}
                    message="Tem certeza que deseja cancelar este pedido?"
                />
            </div>
        </div>
    );
};

export default OrderDetailModal;
