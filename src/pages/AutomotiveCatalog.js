import React, { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
    ArrowForwardRounded,
    CheckRounded,
    HomeRounded,
    SearchRounded,
    ShoppingCartOutlined,
} from '@mui/icons-material';
import { useParams } from 'react-router-dom';
import ProductCartModal from '../components/ProductCartModal';
import CartModalWhatsapp from '../components/CartModalWhatsapp';
import useWhatsappCatalog from '../hooks/useWhatsappCatalog';
import '../styles/Catalog.css';
import '../styles/AutomotiveCatalog.css';

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

const AutomotiveCatalog = () => {
    const { establishmentID } = useParams();
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
    } = useWhatsappCatalog(establishmentID);

    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showProductCartModal, setShowProductCartModal] = useState(false);
    const [showCartModal, setShowCartModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const catalogName = establishment?.EstablishmentName || 'Catálogo automotivo';
    const pageDescription = establishment?.Description
        || 'Encontre produtos selecionados e envie seu pedido diretamente pelo WhatsApp.';
    const selectedGroup = productGroups.find((group) => group.GroupID === selectedGroupID);
    const normalizedSearch = normalizeSearchText(searchTerm.trim());

    const filteredProducts = useMemo(() => products.filter((product) => {
        const matchesGroup = selectedGroupID === 'all' || product.GroupID === selectedGroupID;
        const searchableContent = normalizeSearchText(
            `${product.ProductName || ''} ${product.Description || ''}`,
        );

        return matchesGroup && (!normalizedSearch || searchableContent.includes(normalizedSearch));
    }), [normalizedSearch, products, selectedGroupID]);

    const productImageByGroup = useMemo(() => products.reduce((imagesByGroup, product) => {
        if (product.ImageURL && !imagesByGroup[product.GroupID]) {
            imagesByGroup[product.GroupID] = product.ImageURL;
        }

        return imagesByGroup;
    }, {}), [products]);

    const cartTotal = useMemo(
        () => cart.reduce((total, product) => total + product.Price, 0),
        [cart],
    );

    const cartCounts = useMemo(() => cart.reduce((counts, product) => {
        counts[product.ProductID] = (counts[product.ProductID] || 0) + 1;
        return counts;
    }, {}), [cart]);

    const brandInitials = catalogName
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

    const scrollToProducts = () => {
        document.getElementById('automotive-products')?.scrollIntoView({
            behavior: getScrollBehavior(),
            block: 'start',
        });
    };

    const selectGroup = (groupID, shouldScroll = true) => {
        setSelectedGroupID(groupID);
        if (shouldScroll) requestAnimationFrame(scrollToProducts);
    };

    const openProductDetails = (product) => {
        setSelectedProduct(product);
        setShowProductCartModal(true);
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedGroupID('all');
    };

    return (
        <main className="automotive-catalog">
            <Helmet>
                <title>{catalogName} | Catálogo automotivo</title>
                <meta name="description" content={pageDescription} />
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

            <header className="automotive-header">
                <div className="automotive-header-main">
                    <button
                        type="button"
                        className="automotive-brand"
                        onClick={() => window.scrollTo({ top: 0, behavior: getScrollBehavior() })}
                        aria-label={`Voltar ao início de ${catalogName}`}
                    >
                        {establishment?.ImageURL ? (
                            <img src={establishment.ImageURL} alt="" aria-hidden="true" />
                        ) : (
                            <span className="automotive-brand-mark" aria-hidden="true">{brandInitials}</span>
                        )}
                        <span>{catalogName}</span>
                    </button>

                    <label className="automotive-search">
                        <span className="automotive-sr-only">Buscar produtos</span>
                        <SearchRounded aria-hidden="true" />
                        <input
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Buscar produtos..."
                            autoComplete="off"
                        />
                        {searchTerm && (
                            <button type="button" onClick={() => setSearchTerm('')} aria-label="Limpar busca">
                                Limpar
                            </button>
                        )}
                    </label>

                    <button
                        type="button"
                        className={`automotive-cart-button ${cartPing ? 'is-pinging' : ''}`}
                        onClick={() => setShowCartModal(true)}
                        aria-label={`Abrir carrinho com ${cart.length} ${cart.length === 1 ? 'item' : 'itens'}`}
                    >
                        <ShoppingCartOutlined aria-hidden="true" />
                        <span>
                            <strong>{cart.length ? currencyFormatter.format(cartTotal) : 'Pedido'}</strong>
                            <small>{cart.length} {cart.length === 1 ? 'item' : 'itens'}</small>
                        </span>
                        <b aria-hidden="true">{cart.length}</b>
                    </button>
                </div>

                <nav className="automotive-category-nav" aria-label="Categorias do catálogo">
                    {productGroups.map((group) => (
                        <button
                            key={group.GroupID}
                            type="button"
                            className={selectedGroupID === group.GroupID ? 'is-active' : ''}
                            onClick={() => selectGroup(group.GroupID)}
                            aria-current={selectedGroupID === group.GroupID ? 'page' : undefined}
                        >
                            {group.GroupID === 'all' && <HomeRounded aria-hidden="true" />}
                            {group.GroupName}
                        </button>
                    ))}
                </nav>
            </header>

            <section className="automotive-hero" aria-labelledby="automotive-hero-title">
                <div className="automotive-hero-copy">
                    <span className="automotive-eyebrow">Catálogo de {catalogName}</span>
                    <h1 id="automotive-hero-title">
                        Encontre o que seu <em>veículo precisa</em>
                    </h1>
                    <p>{pageDescription}</p>
                    <div className="automotive-hero-actions">
                        <button type="button" className="automotive-primary-button" onClick={scrollToProducts}>
                            Ver produtos
                            <ArrowForwardRounded aria-hidden="true" />
                        </button>
                        {establishment?.Address && (
                            <span className="automotive-address">{establishment.Address}</span>
                        )}
                    </div>
                </div>

                <div className="automotive-hero-visual" aria-hidden="true">
                    <div className="automotive-visual-grid" />
                    <div className="automotive-light-beam" />
                    <div className="automotive-machine">
                        <span className="automotive-machine-shell" />
                        <span className="automotive-machine-line" />
                        <span className="automotive-machine-wheel automotive-machine-wheel-left" />
                        <span className="automotive-machine-wheel automotive-machine-wheel-right" />
                    </div>
                    <div className="automotive-performance-badge">
                        <span>CATÁLOGO</span>
                        <strong>{brandInitials}</strong>
                        <small>SELEÇÃO PROFISSIONAL</small>
                    </div>
                </div>
            </section>

            <section className="automotive-categories" aria-labelledby="automotive-categories-title">
                <div className="automotive-section-heading">
                    <div>
                        <span>Encontre com rapidez</span>
                        <h2 id="automotive-categories-title">Explore por categoria</h2>
                    </div>
                    <p>Selecione um grupo para filtrar os produtos disponíveis no catálogo.</p>
                </div>

                <div className="automotive-category-cards">
                    {productGroups.map((group) => {
                        const groupImage = group.GroupID === 'all'
                            ? null
                            : productImageByGroup[group.GroupID];

                        return (
                            <button
                                key={group.GroupID}
                                type="button"
                                className={`automotive-category-card ${selectedGroupID === group.GroupID ? 'is-active' : ''} ${groupImage ? 'has-image' : ''}`}
                                onClick={() => selectGroup(group.GroupID)}
                                aria-pressed={selectedGroupID === group.GroupID}
                            >
                                {groupImage ? (
                                    <img src={groupImage} alt="" aria-hidden="true" loading="lazy" decoding="async" />
                                ) : (
                                    <span className="automotive-category-pattern" aria-hidden="true" />
                                )}
                                <span className="automotive-category-overlay" aria-hidden="true" />
                                <span className="automotive-category-name">{group.GroupName}</span>
                                <ArrowForwardRounded aria-hidden="true" />
                            </button>
                        );
                    })}
                </div>
            </section>

            <section
                className="automotive-products-section"
                id="automotive-products"
                aria-labelledby="automotive-products-title"
            >
                <div className="automotive-products-heading">
                    <div>
                        <span className="automotive-results-count">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
                        </span>
                        <h2 id="automotive-products-title">
                            {selectedGroupID === 'all' ? 'Todos os produtos' : selectedGroup?.GroupName}
                        </h2>
                    </div>

                    {(searchTerm || selectedGroupID !== 'all') && (
                        <button type="button" className="automotive-clear-filters" onClick={clearFilters}>
                            Limpar filtros
                        </button>
                    )}
                </div>

                {searchTerm && !catalogError && (
                    <p className="automotive-search-summary">
                        Resultados para <strong>“{searchTerm}”</strong>
                    </p>
                )}

                {catalogError ? (
                    <div className="automotive-state-card" role="alert">
                        <span>Catálogo indisponível</span>
                        <h3>Não foi possível carregar os produtos.</h3>
                        <p>{catalogError} Atualize a página ou tente novamente em alguns instantes.</p>
                    </div>
                ) : filteredProducts.length > 0 ? (
                    <div className="automotive-product-grid">
                        {filteredProducts.map((product) => {
                            const quantityInCart = cartCounts[product.ProductID] || 0;

                            return (
                                <article
                                    className={`automotive-product-card ${justAddedId === product.ProductID ? 'was-added' : ''}`}
                                    key={product.ProductID}
                                >
                                    <button
                                        type="button"
                                        className="automotive-product-visual"
                                        onClick={() => openProductDetails(product)}
                                        aria-label={`Ver detalhes de ${product.ProductName}`}
                                    >
                                        {product.ImageURL ? (
                                            <img
                                                src={product.ImageURL}
                                                alt={product.ProductName}
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        ) : (
                                            <span className="automotive-image-placeholder">
                                                <span aria-hidden="true">{brandInitials}</span>
                                                Imagem não disponível
                                            </span>
                                        )}
                                        <span className={`automotive-added-badge ${justAddedId === product.ProductID ? 'is-visible' : ''}`}>
                                            <CheckRounded aria-hidden="true" /> Adicionado
                                        </span>
                                        {quantityInCart > 0 && (
                                            <span className="automotive-product-quantity">
                                                {quantityInCart} no pedido
                                            </span>
                                        )}
                                    </button>

                                    <div className="automotive-product-info">
                                        <h3>{product.ProductName}</h3>
                                        {product.Description && <p>{product.Description}</p>}
                                        <strong>{currencyFormatter.format(product.Price)}</strong>
                                    </div>

                                    <div className="automotive-product-actions">
                                        <button type="button" className="automotive-details-button" onClick={() => openProductDetails(product)}>
                                            Ver detalhes
                                        </button>
                                        <button type="button" className="automotive-add-button" onClick={() => addToCart(product)}>
                                            Adicionar
                                        </button>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                ) : (
                    <div className="automotive-state-card">
                        <span>Nenhum resultado</span>
                        <h3>Não encontramos produtos com esses filtros.</h3>
                        <p>Experimente outra busca ou veja novamente todo o catálogo.</p>
                        <button type="button" onClick={clearFilters}>Ver todos os produtos</button>
                    </div>
                )}
            </section>

            <footer className="automotive-footer">
                <div>
                    <strong>{catalogName}</strong>
                    <span>Produtos reais, pedido direto e atendimento pelo WhatsApp.</span>
                </div>
                <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: getScrollBehavior() })}>
                    Voltar ao início
                </button>
            </footer>

            <button
                type="button"
                className={`automotive-mobile-cart ${cartPing ? 'is-pinging' : ''}`}
                onClick={() => setShowCartModal(true)}
                aria-label={`Abrir carrinho com ${cart.length} ${cart.length === 1 ? 'item' : 'itens'}`}
            >
                <ShoppingCartOutlined aria-hidden="true" />
                <span>Ver pedido</span>
                <strong>{currencyFormatter.format(cartTotal)}</strong>
                <small>{cart.length}</small>
            </button>
        </main>
    );
};

export default AutomotiveCatalog;
