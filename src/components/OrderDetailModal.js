import React, { useState, useEffect } from 'react';
import '../styles/Modal.css';
import './../styles/Orders.css'

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
            <div className="orderdetailmodal-content">
                <button className="orderdetailmodal-close-button" onClick={onClose}>×</button>
                <h2 className="orderdetailmodal-title">Pedido #{order.OrderID}</h2>

                <div className="orderdetailmodal-section">
                    <div className="orderdetailmodal-row">
                        <label>Cliente:</label>
                        <span>{order.CustomerName}</span>
                    </div>
                    <div className="orderdetailmodal-row">
                        <label>Contato:</label>
                        <span>{order.CustomerPhone || 'Não informado'}</span>
                    </div>
                    <div className="orderdetailmodal-row">
                        <label>Mesa:</label>
                        <span>{order.TableNumber || 'N/A'}</span>
                    </div>
                    <div className="orderdetailmodal-row">
                        <label>Observação:</label>
                        <span>{order.Observation || 'Nenhuma'}</span>
                    </div>
                    <div className="orderdetailmodal-row">
                        <label>Data do Pedido:</label>
                        <span>
                {new Date(order.CreatedAt).toLocaleString('pt-BR', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                })}
            </span>
                    </div>
                    <div className="orderdetailmodal-row">
                        <label>Total:</label>
                        <span>R$ {Number(order.TotalAmount || 0).toFixed(2)}</span>
                    </div>
                </div>

                <h3 className="orderdetailmodal-subtitle">Itens do Pedido</h3>
                <ul className="orderdetailmodal-items-list">
                    {order.items?.length ? (
                        order.items.map((item) => (
                            <li key={item.OrderItemID}>
                                <span>{item.ProductName}</span> -
                                R$ {Number(item.UnitPrice || 0).toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                            </li>
                        ))
                    ) : (
                        <p>Sem itens neste pedido.</p>
                    )}
                </ul>

                <h3 className="orderdetailmodal-subtitle">Alterar Status</h3>
                <div className="orderdetailmodal-status-buttons">
                    {statusOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => handleStatusChange(option.value)}
                            className={`orderdetailmodal-status-button status-${option.value.replace(/\s+/g, '').toLowerCase()}`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>


                <h3 className="orderdetailmodal-subtitle">Histórico de Status</h3>
                <ul className="orderdetailmodal-status-history">
                    {order.statusHistory?.length ? (
                        order.statusHistory.map((history) => (
                            <li key={history.StatusHistoryID}>
                                <span>{history.StatusDescription}</span> -{' '}
                                {new Date(history.UpdatedAt).toLocaleString('pt-BR', {
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
