import React, { useState, useEffect, useCallback } from 'react';
import { getOrdersByEstablishmentId, updateStatusOrder } from '../services/orderService';
import { useToast } from '../hooks/ToastContext';
import '../styles/Modal.css';
import { getFromLocalStorage } from '../utils/storageUtils';
import { getEstablishmentByOwnerID } from '../services/establishmentService';
import OrderDetailModal from '../components/OrderDetailModal';
import './../styles/Orders.css'
import pendingIcon from '../assets/Pending.gif'
import inProgressIcon from '../assets/inProgress.gif'
import CanceledIcon from '../assets/Canceled.gif'
import pagoIcone from '../assets/pagoIcone.gif'
import completedIcon from '../assets/CompletedIcon.gif'
import {Box, Typography} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SideBar from "../components/SideBar";
import {useNavigate} from "react-router-dom";
import AppFooter from "../components/AppFooter";
import NotificationListener from '../components/NotificationListener';

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
    const [searchText, setSearchText] = useState('');
    const navigate = useNavigate();
    const [itemsToShow, setItemsToShow] = useState(10);
    const [showFilters, setShowFilters] = useState(true);

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

        // Filtro por texto digitado (ID ou nome do cliente)
        if (searchText.trim() !== '') {
            const lowerText = searchText.toLowerCase();
            filtered = filtered.filter(order =>
                order.OrderID.toString().includes(lowerText) ||
                (order.TableNumber && order.TableNumber.toLowerCase().includes(lowerText)) ||
                (order.CustomerName && order.CustomerName.toLowerCase().includes(lowerText))
            );
        }

        setFilteredOrders(filtered);
    }, [orders, statusFilter, dateFilter, customDateRange, searchText]);

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
        setSearchText('');
        setFilteredOrders(orders);
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
    const handleScroll = () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
            setItemsToShow(prev => prev + 10); // Carrega mais 10
        }
    };

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    const traduzirStatus = (status) => {
        switch (status) {
            case 'Pending':
                return 'Pendente';
            case 'In Progress':
                return 'Em andamento';
            case 'Completed':
                return 'Entregue';
            case 'Paid':
                return 'Pago';
            case 'Cancelled':
                return 'Cancelado';
            default:
                return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'Pending':
                return 'status-pending';
            case 'In Progress':
                return 'status-inprogress';
            case 'Completed':
                return 'status-completed';
            case 'Paid':
                return 'status-paid';
            case 'Cancelled':
                return 'status-cancelled';
            default:
                return '';
        }
    };


    const getStatusImage = (status) => {
        switch (status) {
            case 'Pending':
                return pendingIcon;
            case 'Completed':
                return completedIcon;
            case 'Cancelled':
                return CanceledIcon;
            case 'In Progress':
                return inProgressIcon;
            case 'Paid':
                return pagoIcone;
            default:
                return '/images/status/default.png'; // imagem padrão
        }
    };
    const handleNavigation = (path) => {
        navigate(path);
    };



    return (
        <div className="orders-container colorful-theme">
            <NotificationListener />

            <Box className="dashboard-topbar" style={{marginLeft: '20px', marginRight: '20px'}}>


                <div className="home-button-container">
                    <button className="order-home-button" onClick={() => handleNavigation('/Dashboard')}>
                        <HomeIcon style={{marginRight: '6px'}}/>
                        <span className="home-button-text">Início</span>
                    </button>
                </div>


                <div className="topbar-row" style={{width: '100%'}}>

                    <Typography
                        className="dashboard-title"
                        style={{width: '100%', textAlign: 'center'}}
                    >
                        Pedidos
                    </Typography>
                    <div className="mobile-sidebar">
                        <SideBar/>
                    </div>
                </div>

                <div className="desktop-sidebar">
                    <SideBar/>
                </div>
            </Box>

            {/* Filtros */}
            {showFilters ? (
                <div className="filters-section expanded">
                    <div className="filters-header">
                        <button className="filters-toggle-icon" onClick={() => setShowFilters(false)}>▲</button>
                        <span>Filtros</span>
                    </div>

                    <div className="filter-group">
                    <button className={statusFilter === 'Todos' ? 'filter-btn active' : 'filter-btn'}
                                onClick={() => setStatusFilter('Todos')}>Todos
                        </button>
                        <button className={statusFilter === 'Pending' ? 'filter-btn active' : 'filter-btn'}
                                onClick={() => setStatusFilter('Pending')}>Pendente
                        </button>
                        <button className={statusFilter === 'In Progress' ? 'filter-btn active' : 'filter-btn'}
                                onClick={() => setStatusFilter('In Progress')}>Em andamento
                        </button>
                        <button className={statusFilter === 'Completed' ? 'filter-btn active' : 'filter-btn'}
                                onClick={() => setStatusFilter('Completed')}>Entregue
                        </button>
                        <button className={statusFilter === 'Paid' ? 'filter-btn active' : 'filter-btn'}
                                onClick={() => setStatusFilter('Paid')}>Pago
                        </button>
                        <button className={statusFilter === 'Cancelled' ? 'filter-btn active' : 'filter-btn'}
                                onClick={() => setStatusFilter('Cancelled')}>Cancelado
                        </button>
                    </div>

                    {/* Filtros por data */}
                    <div className="filter-group">
                        <button className={dateFilter === 'Novos' ? 'filter-btn active' : 'filter-btn'}
                                onClick={() => setDateFilter('Novos')}>Novos
                        </button>
                        <button className={dateFilter === 'Antigos' ? 'filter-btn active' : 'filter-btn'}
                                onClick={() => setDateFilter('Antigos')}>Antigos
                        </button>
                        <button className={dateFilter === 'Data' ? 'filter-btn active' : 'filter-btn'}
                                onClick={() => setDateFilter('Data')}>Por Data
                        </button>

                        {dateFilter === 'Data' && (
                            <div className="date-range-inputs">
                                <label>
                                    Data inicial:
                                    <input
                                        type="date"
                                        value={customDateRange.startDate}
                                        onChange={e =>
                                            setCustomDateRange(prev => ({...prev, startDate: e.target.value}))
                                        }
                                    />
                                </label>
                                <label>
                                    Data final:
                                    <input
                                        type="date"
                                        value={customDateRange.endDate}
                                        onChange={e =>
                                            setCustomDateRange(prev => ({...prev, endDate: e.target.value}))
                                        }
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                    <div className="search-bar-sticky">
                        <input
                            type="text"
                            placeholder="Pesquisar"
                            value={searchText}
                            onChange={e => setSearchText(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    {/* Resetar filtros */}
                    <div className="reset-btn-container">
                        <button className="reset-btn" onClick={resetFilters}>Resetar Filtros</button>
                    </div>


                </div>
            ) : (

                <div className="filters-section ">
                    <div className="filters-header">
                        <button className="filters-toggle-icon" onClick={() => setShowFilters(true)}>▼</button>
                        <span>Filtros</span>

                    </div>
                </div>


            )}


            {/* Lista de pedidos */}
            {filteredOrders.length === 0 ? (
                <p>Nenhum pedido encontrado para os critérios selecionados.</p>
            ) : (
                <ul className="custom-list">
                    {filteredOrders.slice(0, itemsToShow).map(order => (
                        <React.Fragment key={order.OrderID}>
                            <li className="custom-list-item">
                                <div className="avatar">
                                    <img src={getStatusImage(order.Status)} alt={order.Status}/>
                                </div>
                                <div className="message-content">
                                    <h4 className="message-title">Pedido #{order.OrderID}</h4>
                                    <span className={`message-author ${getStatusClass(order.Status)}`}>
                                    {traduzirStatus(order.Status)}
                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setOrderStatus(order.Status);
                                                setShowModal(true);
                                            }}
                                            style={{marginLeft: '10px'}}
                                        >
                                    Ver detalhes
                                </button></span>
                                    <span className="message-text">
  Mesa: <span className="semi-bold">{order.TableNumber}</span> |
  Cliente: <span className="semi-bold">{order.CustomerName}</span> |
  Preço: <span className="semi-bold">{Number(order.TotalAmount || 0).toLocaleString('pt-BR', {
                                        style: 'currency',
                                        currency: 'BRL'
                                    })}</span>
</span>


                                </div>
                            </li>
                        </React.Fragment>
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
            <button className="scroll-to-top-btn" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
                ↑
            </button>

            <AppFooter />

        </div>

    );
};

export default Orders;
