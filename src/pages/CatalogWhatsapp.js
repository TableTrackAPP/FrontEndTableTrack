import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ProductCartModal from '../components/ProductCartModal';
import CartModalWhatsapp from '../components/CartModalWhatsapp';
import useWhatsappCatalog from '../hooks/useWhatsappCatalog';
import './../styles/Catalog.css';

const CatalogWhatsapp = () => {
    const { establishmentID } = useParams();

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductCartModal, setShowProductCartModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const {
        establishment,
        productGroups,
        products,
        cart,
        setCart,
        selectedGroupID,
        setSelectedGroupID,
        justAddedId,
        cartPing,
        addToCart,
        removeFromCart,
    } = useWhatsappCatalog(establishmentID);

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
