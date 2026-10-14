import ProductCover from '../components/ProductCover';
import { productCoverUrl } from '../utils/productImages';
import { descriptionText } from '../utils/productDescription';
import ProductDescription from '../components/ProductDescription';
import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import ProductCartModal from '../components/ProductCartModal';
import CartModalWhatsapp from '../components/CartModalWhatsapp';
import useWhatsappCatalog from '../hooks/useWhatsappCatalog';
import '../styles/Catalog.css';
import '../styles/VintageCatalog.css';

const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
});

const normalizeSearchText = (value) => (
    value
        ?.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR') || ''
);

const getScrollBehavior = () => (
    window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
);

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m16.5 16.5 4 4" />
    </svg>
);

const BagIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 8h14l-1 13H6L5 8Z" />
        <path d="M9 9V6a3 3 0 0 1 6 0v3" />
    </svg>
);

const ArrowIcon = () => (
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 12h14M14 7l5 5-5 5" />
    </svg>
);

const VintageCatalog = () => {
    const { establishmentSlug } = useParams();
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
        catalogError,
        addToCart,
        removeFromCart,
    } = useWhatsappCatalog(establishmentSlug, 'slug');

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductCartModal, setShowProductCartModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const selectedGroup = productGroups.find((group) => group.GroupID === selectedGroupID);
    const normalizedSearch = normalizeSearchText(searchTerm.trim());

    const filteredProducts = useMemo(() => {
        return products.filter((product) => {
            const matchesGroup = selectedGroupID === 'all' || product.GroupID === selectedGroupID;
            const searchableContent = normalizeSearchText(
                `${product.ProductName || ''} ${descriptionText(product.Description)}`,
            );
            const matchesSearch = !normalizedSearch || searchableContent.includes(normalizedSearch);

            return matchesGroup && matchesSearch;
        });
    }, [normalizedSearch, products, selectedGroupID]);

    const productImageByGroup = useMemo(() => {
        return products.reduce((imagesByGroup, product) => {
            if (productCoverUrl(product) && !imagesByGroup[product.GroupID]) {
                imagesByGroup[product.GroupID] = productCoverUrl(product);
            }
            return imagesByGroup;
        }, {});
    }, [products]);

    const heroImages = useMemo(
        () => products.filter((product) => productCoverUrl(product)).slice(0, 3),
        [products],
    );

    const cartTotal = useMemo(
        () => cart.reduce((total, product) => total + product.Price, 0),
        [cart],
    );

    const openProductDetails = (product) => {
        setSelectedProduct(product);
        setShowProductCartModal(true);
    };

    const scrollToProducts = () => {
        document.getElementById('vintage-products')?.scrollIntoView({
            behavior: getScrollBehavior(),
            block: 'start',
        });
    };

    const selectGroup = (groupID) => {
        setSelectedGroupID(groupID);
        requestAnimationFrame(scrollToProducts);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedGroupID('all');
    };

    const catalogName = establishment?.EstablishmentName || 'Catálogo';
    const pageDescription = establishment?.Description || 'Uma seleção especial preparada para você.';
    const allProductsImage = productCoverUrl(products.find((product) => productCoverUrl(product)));

    return (
        <main className="vintage-catalog">
            <Helmet>
                <title>{catalogName} | Catálogo</title>
                <meta name="description" content={descriptionText(pageDescription)} />
            </Helmet>

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

            <header className="vintage-topbar">
                <button className="vintage-brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: getScrollBehavior() })}>
                    {catalogName}
                </button>

                <label className="vintage-search">
                    <span className="vintage-sr-only">Buscar produtos</span>
                    <SearchIcon />
                    <input
                        type="search"
                        value={searchTerm}
                        onChange={(event) => setSearchTerm(event.target.value)}
                        placeholder="Buscar no catálogo..."
                    />
                </label>

                <button
                    className={`vintage-cart-button ${cartPing ? 'is-pinging' : ''}`}
                    type="button"
                    onClick={() => setShowCartModal(true)}
                    aria-label={`Abrir carrinho com ${cart.length} ${cart.length === 1 ? 'item' : 'itens'}`}
                >
                    <BagIcon />
                    <span className="vintage-cart-copy">
                        <strong>{cart.length ? currencyFormatter.format(cartTotal) : 'Carrinho'}</strong>
                        <small>{cart.length} {cart.length === 1 ? 'item' : 'itens'}</small>
                    </span>
                    <span className="vintage-cart-count" aria-hidden="true">{cart.length}</span>
                </button>
            </header>

            <section className="vintage-hero" aria-labelledby="vintage-hero-title">
                <div className="vintage-hero-copy">
                    <span className="vintage-eyebrow">Curadoria de {catalogName}</span>
                    <h1 id="vintage-hero-title">Bem vindo ao {catalogName}</h1>
                    <ProductDescription value={pageDescription} />
                    {establishment?.Address && (
                        <span className="vintage-address">{establishment.Address}</span>
                    )}
                    <button type="button" className="vintage-primary-button" onClick={scrollToProducts}>
                        Ver catálogo
                        <ArrowIcon />
                    </button>
                </div>

                <div className={`vintage-hero-gallery ${heroImages.length ? '' : 'is-empty'}`} aria-label="Destaques do catálogo">
                    {heroImages.length > 0 ? (
                        heroImages.map((product, index) => (
                            <img
                                key={product.ProductID}
                                className={`vintage-hero-image vintage-hero-image-${index + 1}`}
                                src={productCoverUrl(product)}
                                alt={product.ProductName}
                            />
                        ))
                    ) : (
                        <div className="vintage-hero-css-art" aria-hidden="true">
                            <span />
                            <span />
                            <span />
                        </div>
                    )}

                    {establishment?.ImageURL && (
                        <div className="vintage-establishment-seal">
                            <img src={establishment.ImageURL} alt={`Marca de ${catalogName}`} />
                        </div>
                    )}
                </div>
            </section>

            <section className="vintage-collections" aria-labelledby="vintage-collections-title">
                <div className="vintage-section-heading">
                    <span>Explore por categoria</span>
                    <h2 id="vintage-collections-title">Coleções da casa</h2>
                </div>

                <div className="vintage-collection-list">
                    {productGroups.map((group) => {
                        const groupImage = group.GroupID === 'all'
                            ? allProductsImage
                            : productImageByGroup[group.GroupID];

                        return (
                            <button
                                key={group.GroupID}
                                type="button"
                                className={`vintage-collection-card ${selectedGroupID === group.GroupID ? 'is-active' : ''} ${groupImage ? 'has-image' : ''}`}
                                onClick={() => selectGroup(group.GroupID)}
                                aria-pressed={selectedGroupID === group.GroupID}
                            >
                                {groupImage && <img src={groupImage} alt="" aria-hidden="true" />}
                                <span>{group.GroupName}</span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section className="vintage-products-section" id="vintage-products" aria-labelledby="vintage-products-title">
                <div className="vintage-products-heading">
                    <div>
                        <span className="vintage-products-kicker">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'peça encontrada' : 'peças encontradas'}
                        </span>
                        <h2 id="vintage-products-title">
                            {selectedGroupID === 'all' ? 'Toda a seleção' : selectedGroup?.GroupName}
                        </h2>
                    </div>

                    {searchTerm && (
                        <span className="vintage-search-summary">
                            Resultados para “{searchTerm}”
                        </span>
                    )}
                </div>

                {catalogError ? (
                    <div className="vintage-state-card" role="alert">
                        <span>Algo saiu do lugar</span>
                        <h3>Não conseguimos abrir esta seleção.</h3>
                        <p>{catalogError} Tente atualizar a página em alguns instantes.</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="vintage-product-grid">
                        {filteredProducts.map((product) => (
                            <article
                                className={`vintage-product-card ${justAddedId === product.ProductID ? 'was-added' : ''}`}
                                key={product.ProductID}
                            >
                                <button
                                    className="vintage-product-visual"
                                    type="button"
                                    onClick={() => openProductDetails(product)}
                                    aria-label={`Ver detalhes de ${product.ProductName}`}
                                >
                                    {productCoverUrl(product) ? (
                                        <ProductCover product={product} alt={product.ProductName} />
                                    ) : (
                                        <span className="vintage-image-placeholder">
                                            <span aria-hidden="true">TT</span>
                                            Imagem não disponível
                                        </span>
                                    )}
                                    <span className={`vintage-added-badge ${justAddedId === product.ProductID ? 'is-visible' : ''}`}>
                                        Adicionado
                                    </span>
                                </button>

                                <div className="vintage-product-info">
                                    <div className="vintage-product-main">
                                        <h3>{product.ProductName}</h3>
                                        <strong>{currencyFormatter.format(product.Price)}</strong>
                                    </div>
                                    {product.Description && <ProductDescription value={product.Description} />}
                                </div>

                                <div className="vintage-product-actions">
                                    <button type="button" className="vintage-details-button" onClick={() => openProductDetails(product)}>
                                        Ver detalhes
                                    </button>
                                    <button type="button" className="vintage-add-button" onClick={() => addToCart(product)}>
                                        Adicionar
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="vintage-state-card">
                        <span>Nenhum resultado</span>
                        <h3>Não encontramos peças com esses filtros.</h3>
                        <p>Experimente outra busca ou volte para a seleção completa.</p>
                        <button type="button" onClick={clearFilters}>Ver todos os produtos</button>
                    </div>
                )}
            </section>

            <footer className="vintage-footer">
                <strong>{catalogName}</strong>
                <span>Escolha seus itens e envie o pedido diretamente pelo WhatsApp.</span>
            </footer>

            <button
                type="button"
                className={`vintage-mobile-cart ${cartPing ? 'is-pinging' : ''}`}
                onClick={() => setShowCartModal(true)}
                aria-label={`Abrir carrinho com ${cart.length} ${cart.length === 1 ? 'item' : 'itens'}`}
            >
                <BagIcon />
                <span>Ver carrinho</span>
                <strong>{currencyFormatter.format(cartTotal)}</strong>
                <small>{cart.length}</small>
            </button>
        </main>
    );
};

export default VintageCatalog;
