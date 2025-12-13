import React, { useEffect, useState } from 'react';
import { useToast } from '../hooks/ToastContext';
import { useLoading } from '../hooks/LoadingContext'; // Importa o contexto de Loading
import {
    getProductsByEstablishmentId,
    createProduct,
    updateProduct,
    deleteProduct
} from '../services/productsService';
import {
    getProductGroupsByEstablishmentId,
    createProductGroup,
    updateProductGroup,
    deleteProductGroup
} from '../services/productGroupsService';
import { getFromLocalStorage } from '../utils/storageUtils';
import { getEstablishmentByOwnerID } from '../services/establishmentService';
import ProductModal from '../components/ProductModal';
import GroupModal from '../components/GroupModal';
import './../styles/Products.css'
import {Box, Typography} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import SideBar from "../components/SideBar";
import {useNavigate} from "react-router-dom";
import AppFooter from "../components/AppFooter";
import NotificationListener from "../components/NotificationListener";

const Products = () => {
    const [products, setProducts] = useState([]);
    const [productGroups, setProductGroups] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [isEditingGroup, setIsEditingGroup] = useState(false);
    const [establishmentID, setEstablishmentID] = useState(null);
    const { showToast } = useToast();
    const { showLoading, hideLoading } = useLoading(); // Hooks para mostrar/esconder loading

    useEffect(() => {
        const fetchEstablishmentAndData = async () => {
            try {
                showLoading('Carregando produtos...'); // Mostra o loading
                const userData = getFromLocalStorage('userData');
                if (!userData) throw new Error('Usuário não autenticado.');

                const ownerID = userData.userID;
                const establishment = await getEstablishmentByOwnerID(ownerID);
                if (!establishment) throw new Error('Estabelecimento não encontrado.');

                setEstablishmentID(establishment.EstablishmentID);

                // Carrega produtos e grupos relacionados ao establishmentID
                const fetchedProducts = await getProductsByEstablishmentId(establishment.EstablishmentID);
                const fetchedGroups = await getProductGroupsByEstablishmentId(establishment.EstablishmentID);
                setProducts(fetchedProducts);
                setProductGroups(fetchedGroups);
            } catch (error) {
                showToast(error.message || 'Erro ao carregar dados', 'error');
            } finally {
                hideLoading(); // Esconde o loading
            }
        };
        fetchEstablishmentAndData();
    }, []);
    const navigate = useNavigate();

    const openProductModal = (product = null) => {
        setSelectedProduct(product);
        setIsEditingProduct(!!product);
        setShowProductModal(true);
    };

    const openGroupModal = (group = null) => {
        setSelectedGroup(group);
        setIsEditingGroup(!!group);
        setShowGroupModal(true);
    };

    const handleSaveProduct = async (productData) => {
        try {
            if (!establishmentID) throw new Error('Establishment ID não encontrado.');
            showLoading('Salvando produto...');
            const productPayload = { ...productData, establishmentID };

            if (isEditingProduct) {
                await updateProduct(selectedProduct.ProductID, productPayload);
                showToast('Produto atualizado com sucesso', 'success');
            } else {
                await createProduct(productPayload);
                showToast('Produto criado com sucesso', 'success');
            }

            const updatedProducts = await getProductsByEstablishmentId(establishmentID);
            setProducts(updatedProducts);
            setShowProductModal(false);
        } catch (error) {
            showToast(error.message || 'Erro ao salvar produto', 'error');
        } finally {
            hideLoading();
        }
    };

    const handleSaveGroup = async (groupData) => {
        try {
            if (!establishmentID) throw new Error('Establishment ID não encontrado.');
            showLoading('Salvando grupo...');
            const groupPayload = { ...groupData, establishmentID };

            if (isEditingGroup) {
                await updateProductGroup(selectedGroup.GroupID, groupPayload);
                showToast('Grupo atualizado com sucesso', 'success');
            } else {
                await createProductGroup(groupPayload);
                showToast('Grupo criado com sucesso', 'success');
            }

            const updatedGroups = await getProductGroupsByEstablishmentId(establishmentID);
            setProductGroups(updatedGroups);
            setShowGroupModal(false);
        } catch (error) {
            showToast(error.message || 'Erro ao salvar grupo', 'error');
        } finally {
            hideLoading();
        }
    };

    const handleDeleteProduct = async (productID) => {
        try {
            showLoading('Excluindo produto...');
            await deleteProduct(productID);
            const updatedProducts = await getProductsByEstablishmentId(establishmentID);
            setProducts(updatedProducts);
            showToast('Produto deletado com sucesso', 'success');
        } catch (error) {
            showToast('Erro ao deletar produto', 'error');
        } finally {
            hideLoading();
        }
    };

    const handleDeleteGroup = async (groupID) => {
        try {
            showLoading('Excluindo grupo...');
            await deleteProductGroup(groupID);
            const updatedGroups = await getProductGroupsByEstablishmentId(establishmentID);
            setProductGroups(updatedGroups);
            showToast('Grupo deletado com sucesso', 'success');
        } catch (error) {
            showToast('Erro ao deletar grupo', 'error');
        } finally {
            hideLoading();
        }
    };
    const handleNavigation = (path) => {
        navigate(path);
    };

    return (
        <div style={{padding: '20px'}}>
            <NotificationListener />

            <Box className="dashboard-topbar" style={{marginLeft: '20px', marginRight: '20px'}}>


                <div className="home-button-container">
                    <button className="products-home-button" onClick={() => handleNavigation('/Dashboard')}>
                        <HomeIcon style={{marginRight: '6px'}}/>
                        <span className="home-button-text">Início</span>
                    </button>
                </div>


                <div className="topbar-row" style={{width: '100%'}}>

                    <Typography
                        className="dashboard-title"
                        style={{width: '100%', textAlign: 'center'}}
                    >
                        Gerênciamento de produtos
                    </Typography>
                    <div className="mobile-sidebar">
                        <SideBar/>
                    </div>
                </div>

                <div className="desktop-sidebar">
                    <SideBar/>
                </div>
            </Box>

            <div className="sticky-card">
                <h2 className="sticky-card-title">Ações Rápidas</h2>
                <div className="sticky-card-buttons">
                    <button className="action-btn" onClick={() => openGroupModal()}>
                        ➕ Criar Novo Grupo
                    </button>
                    <button className="action-btn" onClick={() => openProductModal()}>
                        ➕ Criar Novo Produto
                    </button>
                </div>
            </div>

            <h2>Grupos</h2>
            <div className="group-carousel-container">
                <button
                    className="carousel-prev-btn"
                    onClick={() =>
                        document.getElementById('groupCarousel').scrollBy({left: -300, behavior: 'smooth'})
                    }
                >
                    ⬅
                </button>

                <div className="group-carousel" id="groupCarousel">
                    {productGroups.map((group) => (
                        <div
                            key={group.GroupID}
                            className="custom-card group-card"
                            onClick={() => openGroupModal(group)}
                        >
                            <div className="group-card-content">
                                <h3 className="group-card-title">{group.GroupName}</h3>
                                <p className="group-card-description">Grupo de produtos</p>
                                <div className="group-card-actions">
                                    <button className="edit-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        openGroupModal(group);
                                    }}>Editar
                                    </button>
                                    <button className="delete-btn" onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteGroup(group.GroupID);
                                    }}>Excluir
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className="carousel-next-btn"
                    onClick={() =>
                        document.getElementById('groupCarousel').scrollBy({left: 300, behavior: 'smooth'})
                    }
                >
                    ➤
                </button>
            </div>


            {showProductModal && (
                <ProductModal
                    show={showProductModal}
                    onHide={() => setShowProductModal(false)}
                    product={selectedProduct}
                    onSave={handleSaveProduct}
                    productGroups={productGroups}
                />
            )}
            {showGroupModal && (
                <GroupModal
                    show={showGroupModal}
                    onHide={() => setShowGroupModal(false)}
                    group={selectedGroup}
                    onSave={handleSaveGroup}
                />
            )}


            <section className="products-section">
                <h2>Produtos</h2>
                <div className="products-grid">
                    {products.map(product => (
                        <div className="product-card" key={product.ProductID}>
                            <img
                                src={product.ImageURL || 'https://via.placeholder.com/300x140'}
                                alt={product.ProductName}
                                className="product-image"
                            />
                            <div className="product-content">
                                <h3 className="product-title">{product.ProductName}</h3>
                                <p className="product-description">{product.Description}</p>
                                <p className="product-price">R$ {product.Price}</p>
                            </div>
                            <div className="product-actions">
                                <button onClick={() => openProductModal(product)}>Editar</button>
                                <button onClick={() => handleDeleteProduct(product.ProductID)}>Excluir</button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

        </div>

    );
};

export default Products;
