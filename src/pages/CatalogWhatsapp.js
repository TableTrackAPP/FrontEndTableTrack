import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import { getEstablishment } from '../services/establishmentService';
import { getProductsByEstablishmentId } from '../services/productsService';
import { getProductGroupsByEstablishmentId } from '../services/productGroupsService';
import ProductCartModal from '../components/ProductCartModal';
import CartModalWhatsapp from '../components/CartModalWhatsapp';
import './../styles/Catalog.css';
import { useLoading } from "../hooks/LoadingContext";

const CatalogWhatsapp = () => {
    const { establishmentID } = useParams();

    const [establishment, setEstablishment] = useState(null);
    const [productGroups, setProductGroups] = useState([]);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductCartModal, setShowProductCartModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);

    const { showToast } = useToast();
    const [selectedGroupID, setSelectedGroupID] = useState('all');
    const [justAddedId, setJustAddedId] = useState(null);
    const [cartPing, setCartPing] = useState(false);

    const { showLoading, hideLoading } = useLoading();

    useEffect(() => {
        const fetchCatalogData = async () => {
            try {
                showLoading('Carregando produtos...');

                const establishmentData = await getEstablishment(establishmentID);
                setEstablishment(establishmentData);

                const productGroupsData = await getProductGroupsByEstablishmentId(establishmentID);
                const todosGroup = { GroupID: 'all', GroupName: 'Todos' };
                setProductGroups([todosGroup, ...productGroupsData]);

                const productsData = await getProductsByEstablishmentId(establishmentID);
                setProducts(
                    productsData.map((product) => ({
                        ...product,
                        Price: parseFloat(product.Price),
                    }))
                );
            } catch (error) {
                showToast('Erro ao carregar dados do catálogo.', 'error');
            } finally {
                hideLoading();
            }
        };

        if (establishmentID) fetchCatalogData();
    }, [establishmentID, showToast, showLoading, hideLoading]);

    const addToCart = (product) => {
        setCart(prev => [...prev, product]);
        setJustAddedId(product.ProductID);
        setTimeout(() => setJustAddedId(null), 900);
        setCartPing(true);
        setTimeout(() => setCartPing(false), 700);
    };

    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index));
        showToast('Produto removido do carrinho.', 'info');
    };

    return (
        <div style={{ padding: '20px' }}>

            {showProductCartModal && selectedProduct && (
                <ProductCartModal
                    product={selectedProduct}
                    show={showProductCartModal}
                    onHide={() => setShowProductCartModal(false)}
                    onAddToCart={addToCart}
                />
            )}

            {showCartModal && (
                <CartModalWhatsapp
                    cart={cart}
                    onHide={() => setShowCartModal(false)}
                    onRemove={removeFromCart}
                    establishment={establishment}
                    setCart={setCart}
                />
            )}

            <div className="catalog-establishment-container">
                <div className="catalog-establishment-card">
                    <div className="catalog-establishment-left">
                        <img
                            src={establishment?.ImageURL || 'https://developers.elementor.com/docs/assets/img/elementor-placeholder-image.png'}
                            alt="Logo"
                            className="catalog-avatar"
                        />
                        <h3>{establishment?.EstablishmentName || 'Estabelecimento'}</h3>
                        <p>{establishment?.Address || 'Sem endereço'}</p>
                    </div>

                    <div className="catalog-establishment-right">
                        <p>{establishment?.Description || 'Sem descrição disponível.'}</p>
                    </div>
                </div>
            </div>

            <button
                className={`catalog-cart-floating-button ${cartPing ? 'catalog-cart-ping' : ''}`}
                onClick={() => setShowCartModal(true)}
            >
                 WhatsApp (Carrinho)
            </button>

            <div style={{ padding: '20px' }}>
                <div className="catalog-group-carousel-container">
                    <button
                        className="catalog-carousel-prev-btn"
                        onClick={() => document.getElementById('groupCarousel').scrollBy({ left: -300, behavior: 'smooth' })}
                    >
                        ⬅
                    </button>

                    <div className="catalog-group-carousel" id="groupCarousel">
                        {productGroups.map((group) => (
                            <div
                                key={group.GroupID}
                                className={`catalog-group-card ${selectedGroupID === group.GroupID ? 'active' : ''}`}
                                onClick={() => setSelectedGroupID(group.GroupID)}
                            >
                                <div className="catalog-group-card-content">
                                    <h3 className="catalog-group-card-title">{group.GroupName}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        className="catalog-carousel-next-btn"
                        onClick={() => document.getElementById('groupCarousel').scrollBy({ left: 300, behavior: 'smooth' })}
                    >
                        ➤
                    </button>
                </div>

                <section className="products-section">
                    <h2>Produtos</h2>

                    <div className="products-grid">
                        {products
                            .filter(product => selectedGroupID === 'all' || product.GroupID === selectedGroupID)
                            .map(product => (
                                <div className="catalog-product-card" key={product.ProductID}>
                                    <img
                                        src={product.ImageURL || 'https://via.placeholder.com/300x140'}
                                        alt={product.ProductName}
                                        className="catalog-product-image"
                                    />

                                    <div className={`catalog-added-badge ${justAddedId === product.ProductID ? 'show' : ''}`}>
                                        ✓ Adicionado
                                    </div>

                                    <div className="catalog-product-content">
                                        <h3 className="catalog-product-title">{product.ProductName}</h3>
                                        <p className="catalog-product-description">{product.Description}</p>
                                        <p className="catalog-product-price">R$ {product.Price.toFixed(2)}</p>
                                    </div>

                                    <div className="catalog-product-actions">
                                        <button onClick={() => { setSelectedProduct(product); setShowProductCartModal(true); }}>
                                            Ver
                                        </button>
                                        <button onClick={() => addToCart(product)}>Adicionar</button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default CatalogWhatsapp;