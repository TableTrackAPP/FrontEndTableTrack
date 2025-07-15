import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '../hooks/ToastContext';
import { getEstablishment } from '../services/establishmentService';
import { getProductsByEstablishmentId } from '../services/productsService';
import { getProductGroupsByEstablishmentId } from '../services/productGroupsService';
import ProductCartModal from '../components/ProductCartModal';
import CartModal from '../components/CartModal';
import './../styles/Catalog.css'
const Catalog = () => {
    const { establishmentID } = useParams(); // Recebe establishmentID da rota
    const [searchParams] = useSearchParams(); // Permite obter query params
    const tableID = searchParams.get('tableID'); // Obtém tableID dos query params, se existir

    const [establishment, setEstablishment] = useState(null);
    const [productGroups, setProductGroups] = useState([]);
    const [products, setProducts] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductCartModal, setShowProductCartModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const { showToast } = useToast();
    const [selectedGroupID, setSelectedGroupID] = useState('all');

    useEffect(() => {
        const fetchCatalogData = async () => {
            try {
                const establishmentData = await getEstablishment(establishmentID);
                setEstablishment(establishmentData);

                const productGroupsData = await getProductGroupsByEstablishmentId(establishmentID);
                const todosGroup = { GroupID: 'all', GroupName: 'Todos' };
                setProductGroups([todosGroup, ...productGroupsData]);


                const productsData = await getProductsByEstablishmentId(establishmentID);
                setProducts(
                    productsData.map((product) => ({
                        ...product,
                        Price: parseFloat(product.Price), // Converte o preço para número
                    }))
                );
            } catch (error) {
                showToast('Erro ao carregar dados do catálogo.', 'error');
            }
        };

        if (establishmentID) {
            fetchCatalogData();
        }
    }, [establishmentID, showToast]);

    const addToCart = (product) => {
        setCart([...cart, product]); // Adiciona o produto ao carrinho como um novo item
    };


    const removeFromCart = (index) => {
        setCart(cart.filter((_, i) => i !== index)); // Remove o produto com base no índice
        showToast('Produto removido do carrinho.', 'info');
    };


    return (
        <div style={{padding: '20px'}}>

            {showProductCartModal && selectedProduct && (
                <ProductCartModal
                    product={selectedProduct}
                    show={showProductCartModal}
                    onHide={() => setShowProductCartModal(false)}
                    onAddToCart={addToCart}
                />
            )}

            {showCartModal && (
                <CartModal
                    cart={cart}
                    onHide={() => setShowCartModal(false)}
                    onRemove={removeFromCart}
                    tableID={tableID}
                    establishmentID={establishmentID}
                    setCart={setCart} // Passando o setCart como prop
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
                className="catalog-cart-floating-button"
                onClick={() => setShowCartModal(true)}
            >
                🛒 Ver Carrinho
            </button>

            <div style={{padding: '20px'}}>
                <div className="catalog-group-carousel-container">
                    <button
                        className="catalog-carousel-prev-btn"
                        onClick={() => document.getElementById('groupCarousel').scrollBy({
                            left: -300,
                            behavior: 'smooth'
                        })}
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
                        onClick={() => document.getElementById('groupCarousel').scrollBy({
                            left: 300,
                            behavior: 'smooth'
                        })}
                    >
                        ➤
                    </button>
                </div>


                <section className="products-section">
                    <h2>Produtos</h2>
                    <div className="products-grid">
                        {products
                            .filter(product =>
                                selectedGroupID === 'all' || product.GroupID === selectedGroupID
                            )
                            .map(product => (
                                <div className="product-card" key={product.ProductID}>
                                    <img
                                        src={product.ImageURL || 'https://via.placeholder.com/300x140'}
                                        alt={product.ProductName}
                                        className="product-image"
                                    />
                                    <div className="product-content">
                                        <h3 className="product-title">{product.ProductName}</h3>
                                        <p className="product-description">{product.Description}</p>
                                        <p className="product-price">R$ {product.Price.toFixed(2)}</p>
                                    </div>
                                    <div className="product-actions">
                                        <button onClick={() => {
                                            setSelectedProduct(product);
                                            setShowProductCartModal(true);
                                        }}>Ver
                                        </button>
                                        <button onClick={() => addToCart(product)}>Adicionar</button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </section>

                {showProductCartModal && selectedProduct && (
                    <ProductCartModal
                        product={selectedProduct}
                        show={showProductCartModal}
                        onHide={() => setShowProductCartModal(false)}
                        onAddToCart={addToCart}
                    />
                )}

                {showCartModal && (
                    <CartModal
                        cart={cart}
                        onHide={() => setShowCartModal(false)}
                        onRemove={removeFromCart}
                        tableID={tableID}
                        establishmentID={establishmentID}
                        setCart={setCart}
                    />
                )}
            </div>
        </div>
    );
};

export default Catalog;
