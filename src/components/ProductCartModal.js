import React from 'react';
import '../styles/Catalog.css';

const ProductCartModal = ({ product, show, onHide, onAddToCart }) => {
    if (!show) return null;

    return (
        <div className="product-cart-modal-overlay">
            <div className="product-cart-modal-content">
                <button className="product-cart-close-button" onClick={onHide}>×</button>
                <h2>{product.ProductName}</h2>
                <img
                    src={product.ImageURL}
                    alt={product.ProductName}
                    className="product-cart-image"
                />
                <p><strong>Descrição:</strong> {product.Description}</p>
                <p><strong>Preço:</strong> R$ {product.Price.toFixed(2)}</p>
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
