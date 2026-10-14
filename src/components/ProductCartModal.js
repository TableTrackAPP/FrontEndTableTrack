import ProductDescription from './ProductDescription';
import React, { useEffect } from 'react';
import '../styles/Catalog.css';

const ProductCartModal = ({ product, show, onHide, onAddToCart, renderImage, priceLabel }) => {
    useEffect(() => {
        if (!show) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === 'Escape') onHide();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onHide, show]);

    if (!show) return null;

    return (
        <div className="product-cart-modal-overlay">
            <div
                className="product-cart-modal-content"
                role="dialog"
                aria-modal="true"
                aria-labelledby="product-cart-modal-title"
            >
                <button className="product-cart-close-button" onClick={onHide} aria-label="Fechar detalhes">×</button>
                <h2 id="product-cart-modal-title">{product.ProductName}</h2>
                {renderImage ? renderImage(product) : <img
                    src={product.ImageURL}
                    alt={product.ProductName}
                    className="product-cart-image"
                />}
                <div><strong>Descrição:</strong><ProductDescription value={product.Description} /></div>
                <p><strong>Preço:</strong> {priceLabel ?? `R$ ${product.Price.toFixed(2)}`}</p>
                <button
                    className="product-cart-add-button"
                    onClick={() => {
                        onAddToCart(product);
                        onHide();
                    }}
                >
                    Adicionar ao Carrinho
                </button>
            </div>
        </div>
    );
};

export default ProductCartModal;
