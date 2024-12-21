import React, { useState, useEffect, useCallback } from 'react';
import { getOrdersByEstablishmentId, updateStatusOrder } from '../services/orderService';
import { useToast } from '../hooks/ToastContext';
import '../styles/Modal.css';
import { getFromLocalStorage } from '../utils/storageUtils';
import { getEstablishmentByOwnerID } from '../services/establishmentService';
import OrderDetailModal from '../components/OrderDetailModal';

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [orderStatus, setOrderStatus] = useState('');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const [dateFilter, setDateFilter] = useState('Novos');
    const [customDateRange, setCustomDateRange] = useState({ startDate: '', endDate: '' });
    const { showToast } = useToast();

    const fetchOrders = useCallback(async () => {
        try {
            const storedUserData = getFromLocalStorage('userData');
            const establishment = await getEstablishmentByOwnerID(storedUserData.userID);
            const data = await getOrdersByEstablishmentId(establishment.EstablishmentID);
            setOrders(data);
            setFilteredOrders(data); // Inicialmente, mostrar todos os pedidos
        } catch (error) {
            showToast('Erro ao carregar pedidos.', 'error');
        }
    }, [showToast]);

    const applyFilters = useCallback(() => {
        let filtered = [...orders];

        // Filtro por status
        if (statusFilter !== 'Todos') {
            filtered = filtered.filter(order => order.Status === statusFilter);
        }

        // Filtro por data
        if (dateFilter === 'Novos') {
            filtered.sort((a, b) => new Date(b.CreatedAt) - new Date(a.CreatedAt));
        } else if (dateFilter === 'Antigos') {
            filtered.sort((a, b) => new Date(a.CreatedAt) - new Date(b.CreatedAt));
        } else if (dateFilter === 'Data') {
            if (customDateRange.startDate && customDateRange.endDate) {
                filtered = filtered.filter(order => {
                    const orderDate = new Date(order.CreatedAt);
                    const startDate = new Date(customDateRange.startDate);
                    const endDate = new Date(customDateRange.endDate);
                    return orderDate >= startDate && orderDate <= endDate;
                });
            }
        }

        setFilteredOrders(filtered);
    }, [orders, statusFilter, dateFilter, customDateRange]);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    useEffect(() => {
        applyFilters();
    }, [applyFilters]);

    const resetFilters = () => {
        setStatusFilter('Todos');
        setDateFilter('Novos');
        setCustomDateRange({ startDate: '', endDate: '' });
        setFilteredOrders(orders); // Reseta para os pedidos originais
    };

    const handleUpdateOrder = async (newStatus) => {
        console.log('Atualizando pedido:', {
            orderId: selectedOrder?.OrderID,
            novoStatus: newStatus,
        });

        if (!selectedOrder) return;

        try {
            await updateStatusOrder(selectedOrder.OrderID, { status: newStatus });
            showToast('Status do pedido atualizado com sucesso!', 'success');

            // Atualiza o estado global
            setOrders((prevOrders) =>
                prevOrders.map((order) =>
                    order.OrderID === selectedOrder.OrderID
                        ? { ...order, Status: newStatus }
                        : order
                )
            );

            setShowModal(false); // Fecha o modal
        } catch (error) {
            showToast('Erro ao atualizar status do pedido.', 'error');
        }
    };



    return (
        <div style={{ padding: '20px' }}>
            <h1>Pedidos</h1>

            {/* Filtros */}
            <div style={{ marginBottom: '20px' }}>
                <h3>Filtros</h3>
                {/* Filtros por status */}
                <div>
                    <button onClick={() => setStatusFilter('Todos')}>Todos</button>
                    <button onClick={() => setStatusFilter('Pending')}>Pendente</button>
                    <button onClick={() => setStatusFilter('In Progress')}>Em andamento</button>
                    <button onClick={() => setStatusFilter('Completed')}>Concluído</button>
                    <button onClick={() => setStatusFilter('Paid')}>Pago</button>
                    <button onClick={() => setStatusFilter('Cancelled')}>Cancelado</button>
                </div>

                {/* Filtros por data */}
                <div style={{ marginTop: '10px' }}>
                    <button onClick={() => setDateFilter('Novos')}>Novos</button>
                    <button onClick={() => setDateFilter('Antigos')}>Antigos</button>
                    <button onClick={() => setDateFilter('Data')}>Por Data</button>
                    {dateFilter === 'Data' && (
                        <div style={{ marginTop: '10px' }}>
                            <label>
                                Data inicial:
                                <input
                                    type="date"
                                    value={customDateRange.startDate}
                                    onChange={e =>
                                        setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))
                                    }
                                />
                            </label>
                            <label style={{ marginLeft: '10px' }}>
                                Data final:
                                <input
                                    type="date"
                                    value={customDateRange.endDate}
                                    onChange={e =>
                                        setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))
                                    }
                                />
                            </label>
                        </div>
                    )}
                </div>

                {/* Botão de resetar filtros */}
                <div style={{ marginTop: '20px' }}>
                    <button onClick={resetFilters}>Resetar Filtros</button>
                </div>
            </div>

            {/* Lista de pedidos */}
            {filteredOrders.length === 0 ? (
                <p>Nenhum pedido encontrado para os critérios selecionados.</p>
            ) : (
                <ul>
                    {filteredOrders.map(order => (
                        <li key={order.OrderID}>
                            Pedido #{order.OrderID} - {order.Status}
                            <button
                                onClick={() => {
                                    setSelectedOrder(order);
                                    setOrderStatus(order.Status);
                                    setShowModal(true);
                                }}
                                style={{ marginLeft: '10px' }}
                            >
                                Ver detalhes
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <OrderDetailModal
                order={selectedOrder}
                show={showModal}
                onClose={() => setShowModal(false)}
                orderStatus={orderStatus}
                setOrderStatus={setOrderStatus}
                onUpdateStatus={handleUpdateOrder}
            />
        </div>
    );
};

export default Orders;
