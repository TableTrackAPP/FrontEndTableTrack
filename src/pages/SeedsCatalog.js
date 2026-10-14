import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useParams } from 'react-router-dom';
import { ArrowForwardRounded, SearchRounded, ShoppingBagOutlined, SpaOutlined } from '@mui/icons-material';
import ProductCartModal from '../components/ProductCartModal';
import CartModalWhatsapp from '../components/CartModalWhatsapp';
import useWhatsappCatalog from '../hooks/useWhatsappCatalog';
import '../styles/SeedsCatalog.css';
import { formatSeedsPrice, formatSeedsCartPrice, formatSeedsOrderTotal } from '../utils/seedsPricing';

const normalize = (text) => (text || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
const scrollBehavior = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';

function ProductImage({ product }) {
    const [status, setStatus] = useState('loading');
    return (
        <span className={`seeds-image ${status}`}>
            {product.ImageURL && status !== 'error' ? (
                <img src={product.ImageURL} alt={product.ProductName} loading="lazy" decoding="async"
                    onLoad={() => setStatus('ready')} onError={() => setStatus('error')} />
            ) : (
                <span className="seeds-image-fallback"><SpaOutlined aria-hidden="true" /><span>Imagem não disponível</span></span>
            )}
        </span>
    );
}

// Applies keyboard containment to the existing dialogs without changing other themes.
function SeedsDialog({ children }) {
    const container = useRef(null);
    useEffect(() => {
        const previousFocus = document.activeElement;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const focusable = () => [...container.current.querySelectorAll('button, input, textarea, [tabindex="0"]')].filter((el) => !el.disabled);
        focusable()[0]?.focus();
        const trap = (event) => {
            if (event.key !== 'Tab') return;
            const elements = focusable();
            const first = elements[0];
            const last = elements[elements.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
        };
        const node = container.current;
        node.addEventListener('keydown', trap);
        return () => {
            node.removeEventListener('keydown', trap);
            document.body.style.overflow = previousOverflow;
            previousFocus?.focus();
        };
    }, []);
    return <div ref={container}>{children}</div>;
}

function SeedsCatalogView({ establishmentID }) {
    const { establishment, productGroups, products, cart, setCart, selectedGroupID, setSelectedGroupID,
        justAddedId, catalogStatus, catalogError, retryCatalog, addToCart, removeFromCart } = useWhatsappCatalog(establishmentID);
    const [search, setSearch] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [cartOpen, setCartOpen] = useState(false);
    const [failedBrandImage, setFailedBrandImage] = useState(null);
    const brandImage = establishment?.ImageURL?.trim();
    const name = establishment?.EstablishmentName || 'Catálogo de sementes';
    const description = establishment?.Description;
    const selectedGroup = productGroups.find((group) => group.GroupID === selectedGroupID);
    const filteredProducts = useMemo(() => products.filter((product) =>
        (selectedGroupID === 'all' || product.GroupID === selectedGroupID)
        && normalize(`${product.ProductName || ''} ${product.Description || ''}`).includes(normalize(search.trim()))
    ), [products, selectedGroupID, search]);
    const counts = useMemo(() => cart.reduce((result, product) => {
        result[product.ProductID] = (result[product.ProductID] || 0) + 1;
        return result;
    }, {}), [cart]);
    const totalLabel = formatSeedsOrderTotal(cart);
    const ready = catalogStatus === 'ready';
    const goToProducts = () => {
        const section = document.getElementById('seeds-products');
        section?.focus({ preventScroll: true });
        section?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    };
    const chooseGroup = (id) => { setSelectedGroupID(id); };
    const clearFilters = () => { setSearch(''); setSelectedGroupID('all'); };
    const removeOne = (product) => {
        const index = cart.findIndex((item) => item.ProductID === product.ProductID);
        if (index !== -1) removeFromCart(index);
    };

    return (
        <main className="seeds-catalog">
            <Helmet><title>{name} | Catálogo de sementes</title><meta name="description" content={description || `Consulte os produtos de ${name}.`} /></Helmet>
            <a className="seeds-skip" href="#seeds-products">Ir para os produtos</a>
            <header className="seeds-header">
                <div className="seeds-header-main seeds-container">
                    <a className="seeds-brand" href="#seeds-home" aria-label={`Início de ${name}`}>
                        {brandImage && failedBrandImage !== brandImage ? (
                            <img
                                className="seeds-brand-image"
                                src={brandImage}
                                alt={`Logo de ${name}`}
                                width={48}
                                height={48}
                                onError={() => setFailedBrandImage(brandImage)}
                            />
                        ) : <SpaOutlined aria-hidden="true" />}
                        <span>{name}</span>
                    </a>
                    <div className="seeds-search">
                        <SearchRounded aria-hidden="true" />
                        <input type="search" aria-label="Buscar sementes, cultivares" placeholder="Buscar sementes, cultivares..."
                            value={search} onChange={(event) => setSearch(event.target.value)} />
                        {search && <button type="button" onClick={() => setSearch('')} aria-label="Limpar pesquisa">×</button>}
                    </div>
                    <button type="button" className="seeds-cart" onClick={() => setCartOpen(true)} disabled={!ready}
                        aria-label={`Abrir pedido com ${cart.length} itens`}>
                        <ShoppingBagOutlined aria-hidden="true" /><span>Meu pedido<strong>{totalLabel}</strong></span><b>{cart.length}</b>
                    </button>
                </div>
                <nav className="seeds-nav seeds-container" aria-label="Grupos do catálogo">
                    {productGroups.map((group) => <button type="button" key={group.GroupID} aria-pressed={selectedGroupID === group.GroupID}
                        onClick={() => { chooseGroup(group.GroupID); goToProducts(); }}>{group.GroupName}</button>)}
                </nav>
            </header>

            <div id="seeds-home">
                <section className="seeds-hero" aria-labelledby="seeds-title">
                    <div className="seeds-hero-copy"><span className="seeds-eyebrow">Catálogo de sementes e pastagens</span>
                        <h1 id="seeds-title">{name}</h1>
                        {description && <p>{description}</p>}
                        <button type="button" className="seeds-button seeds-button-gold" onClick={goToProducts}>Ver produtos <ArrowForwardRounded aria-hidden="true" /></button>
                    </div>

                </section>

                {ready && productGroups.length > 1 && <section className="seeds-groups seeds-container" aria-labelledby="seeds-groups-title">
                    <div className="seeds-sr-only"><h2 id="seeds-groups-title">Encontre por grupo</h2></div>
                    <div className="seeds-group-list">{productGroups.map((group) => <button type="button" key={group.GroupID}
                        className="seeds-group" aria-pressed={selectedGroupID === group.GroupID} onClick={() => { chooseGroup(group.GroupID); goToProducts(); }}>
                        <SpaOutlined className="seeds-group-leaf" aria-hidden="true" />
                        <span>{group.GroupName}<small>{selectedGroupID === group.GroupID ? 'Selecionado' : 'Ver produtos'}</small></span><ArrowForwardRounded aria-hidden="true" />
                    </button>)}</div>
                </section>}

                <section id="seeds-products" className="seeds-products seeds-container" tabIndex={-1} aria-labelledby="seeds-products-title" aria-busy={catalogStatus === 'loading'}>
                    <div className="seeds-section-title"><div><h2 id="seeds-products-title">{selectedGroupID === 'all' ? 'Todos os produtos' : selectedGroup?.GroupName}</h2></div>
                        {(search || selectedGroupID !== 'all') && <button className="seeds-clear" type="button" onClick={clearFilters}>Limpar filtros</button>}
                    </div>
                    {ready && <p className="seeds-results" role="status">{filteredProducts.length} {filteredProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}{search && <> para “{search}”</>}</p>}
                    {catalogStatus === 'loading' ? <div className="seeds-state" role="status"><SpaOutlined aria-hidden="true" /><h3>Carregando catálogo…</h3><p>Buscando os produtos do estabelecimento.</p></div>
                        : catalogError ? <div className="seeds-state" role="alert"><h3>{catalogStatus === 'not-found' ? 'Estabelecimento não encontrado' : 'Não foi possível carregar o catálogo'}</h3><p>{catalogStatus === 'not-found' ? 'Confira o endereço do catálogo e tente novamente.' : catalogError}</p><button type="button" className="seeds-button" onClick={retryCatalog}>Tentar novamente</button></div>
                        : filteredProducts.length === 0 ? <div className="seeds-state"><SpaOutlined aria-hidden="true" /><h3>{!products.length ? 'O catálogo ainda não possui produtos' : search ? 'Nenhum produto encontrado' : 'Este grupo ainda não possui produtos'}</h3><p>{!products.length ? 'Volte em breve para consultar o catálogo.' : 'Escolha outro grupo ou ajuste sua pesquisa.'}</p>{products.length > 0 && <button type="button" className="seeds-button" onClick={clearFilters}>Ver todos os produtos</button>}</div>
                        : <div className="seeds-product-grid">{filteredProducts.map((product) => {
                            const quantity = counts[product.ProductID] || 0;
                            const group = productGroups.find((item) => item.GroupID === product.GroupID);
                            return <article className={`seeds-product ${justAddedId === product.ProductID ? 'seeds-added' : ''}`} key={product.ProductID}>
                                <button type="button" className="seeds-product-image" onClick={() => setSelectedProduct(product)} aria-label={`Ver detalhes de ${product.ProductName}`}><ProductImage key={product.ImageURL || product.ProductID} product={product} /></button>
                                <div className="seeds-product-info">{group && <span className="seeds-product-group">{group.GroupName}</span>}<h3>{product.ProductName}</h3>{product.Description && <p>{product.Description}</p>}<strong className="seeds-price">{formatSeedsPrice(product)}</strong></div>
                                <div className="seeds-product-actions"><button type="button" className="seeds-details" onClick={() => setSelectedProduct(product)}>Ver detalhes</button>
                                    {quantity > 0 ? <div className="seeds-quantity" role="group" aria-label={`Quantidade de ${product.ProductName}`}><button type="button" onClick={() => removeOne(product)} aria-label={`Remover uma unidade de ${product.ProductName}`}>−</button><span aria-live="polite">{quantity}<small>no pedido</small></span><button type="button" onClick={() => addToCart(product)} aria-label={`Adicionar uma unidade de ${product.ProductName}`}>+</button></div>
                                        : <button type="button" className="seeds-button" onClick={() => addToCart(product)} aria-label={`Adicionar ${product.ProductName} ao pedido`}>Adicionar <span aria-hidden="true">+</span></button>}
                                </div>
                            </article>;
                        })}</div>}
                </section>
                <footer className="seeds-footer seeds-container"><span>{name}</span><a href="#seeds-home">Voltar ao início ↑</a></footer>
            </div>
            {ready && <button type="button" className="seeds-floating-cart" onClick={() => setCartOpen(true)}><ShoppingBagOutlined aria-hidden="true" /><span>Ver pedido ({cart.length})</span><strong>{totalLabel}</strong></button>}
            <span className="seeds-sr-only" role="status">{justAddedId !== null ? 'Produto adicionado ao pedido.' : ''}</span>
            {selectedProduct && <SeedsDialog><ProductCartModal product={selectedProduct} priceLabel={formatSeedsPrice(selectedProduct)} show onHide={() => setSelectedProduct(null)} onAddToCart={addToCart} renderImage={(product) => <ProductImage key={product.ImageURL || product.ProductID} product={product} />} /></SeedsDialog>}
            {cartOpen && <SeedsDialog><CartModalWhatsapp showDeliveryAddress={false} formatItemPrice={formatSeedsCartPrice} totalLabel={formatSeedsOrderTotal(cart, (amount) => `R$ ${amount.toFixed(2)}`)} cart={cart} setCart={setCart} onHide={() => setCartOpen(false)} onRemove={removeFromCart} establishment={establishment} /></SeedsDialog>}
        </main>
    );
}

export default function SeedsCatalog() {
    const { establishmentID } = useParams();
    return <SeedsCatalogView key={establishmentID} establishmentID={establishmentID} />;
}
